import { Component, OnInit } from '@angular/core';
import {
  ColDef,
  IAggFuncParams,
  ICellRendererParams,
  IsRowSelectable,
  RowNode,
  RowSelectedEvent,
  ValueParserParams,
} from 'ag-grid-community';
import { HttpClient } from '@angular/common/http';
import { AgGridAngular } from 'ag-grid-angular';
import { LocationCellRendererComponent } from './location-cell-renderer.component';
import { BtnCellRendererComponent } from './btn-cell-renderer.component';
import { MyCellComponent } from './my-cell.component';

export interface Entry {
  id: number;
  comment: string;
  insuredObject: string;
  period: string;
  matchId: null | string;
  insuredObject_score: number;
  location: string;
  // val1?:
  // val2?:
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'test_ag_grid';

  api: AgGridAngular['api'];
  matchFilterType = 'all';

  getRowId = (params) => params.data.id;

  public columnDefs: ColDef[] = [
    {
      headerName: 'Period',
      field: 'period',
      showRowGroup: 'matchId',
      cellRenderer: 'agGroupCellRenderer',
      hide: true,
      pinned: 'left',
      checkboxSelection: true,
      cellRendererParams: {
        suppressCount: true,
        checkbox: true,
        innerRenderer: BtnCellRendererComponent,
      },
    },
    {
      headerName: 'Match Score',
      field: 'matchId',
      type: 'numberValue',
      sortable: true,
      cellRenderer: MyCellComponent,
      hide: true,
      rowGroup: true,
    },
    {
      headerName: 'Match Id',
      field: 'matchPercentage',
      type: 'numberValue',
      sortable: true,
      cellRenderer: MyCellComponent,
      hide: true,
    },
    {
      headerName: 'Insured Object',
      field: 'insuredObject',
      type: 'mergeColumn',
      // cellRenderer: this.insuredObjectCellRenderer,
      cellRenderer: MyCellComponent,
      hide: false,
    },
    {
      headerName: 'Comment',
      field: 'comment',
      type: 'mergeColumn',
      // cellRenderer: this.commentCellRenderer,
      cellRenderer: MyCellComponent,
      minWidth: 200,
    },
    {
      headerName: 'Total TSI',
      field: 'val1',
      type: 'numberValue',
      sortable: true,
      cellRenderer: MyCellComponent,
    },
    {
      field: 'val2',
      type: 'numberValue',
      cellRenderer: MyCellComponent,
    },
    { field: 'location', type: 'location' },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true,
    cellRenderer: MyCellComponent,
  };
  public autoGroupColumnDef: ColDef = {
    headerName: 'Period',
    field: 'period',
    pinned: 'left',
    minWidth: 200,
    cellRenderer: MyCellComponent,
    checkboxSelection: true,
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: BtnCellRendererComponent,
    },
  };
  public columnTypes: {
    [key: string]: ColDef;
  } = {
    mergeColumn: {
      aggFunc: 'merge',
      valueFormatter: (params) => params.value,
    },
    numberValue: {
      headerName: 'Match Score',
      enableValue: true,
      aggFunc: 'merge',
      editable: false,
      valueParser: this.numberParser,
      cellRenderer: MyCellComponent,
    },
    dimension: {
      enableRowGroup: true,
      enablePivot: true,
    },
    location: {
      cellRenderer: LocationCellRendererComponent,
    },
  };
  public rowData: any | null = [];
  public groupDefaultExpanded = 0;
  public rowSelection = 'multiple';
  public isRowSelectable: IsRowSelectable = function (node: RowNode) {
    return node.data ? node.data.matchId === null : false;
  };

  constructor(private httpClient: HttpClient) {}
  ngOnInit(): void {
    this.httpClient.get('assets/SampleData.json').subscribe((data) => {
      this.rowData = this.calculateMatchScore(data); // without cell renderer
      // this.rowData = data // if we implement cell renderer
    });
  }

  calculateMatchScore(data: any) {
    data.forEach((item: any, i: number) => {
      item.val1 = ((i + 13) * 17 * 33) % 1000;

      if (item.matchId !== null) {
        item.val2 = ((i + 23) * 33) % 1000;
        if (item.val2 > 99) item.val2 = item.val2 - (item.val2 - 100);
        item.matchPercentage = Math.floor(Math.random() * 101);
      } else {
        item.val2 = 'N/A';
      }
    });
    return data;
  }

  public aggFuncs = {
    merge: (params: IAggFuncParams) => {
      const periods = {
        old: params.rowNode.allLeafChildren.find(
          (item) => item?.data.period === 'Old'
        ),
        new: params.rowNode.allLeafChildren.find(
          (item) => item?.data.period === 'New'
        ),
      };

      const result: 'new' | 'old' = 'old'; //parseFromSettings(params);

      return periods[result]?.data[params.colDef.field];
    },
  };

  btnLinkEvent(event) {
    const now = new Date();
    const id = btoa(now.toISOString());
    // this.api.getSelectedNodes().forEach((item) => {
    //   item.updateData({...item.data, matchId: id, val2: "MM"})
    //   this.api.applyTransaction({update:[item.data]});
    // })
  }

  onRowSelected(event: RowSelectedEvent) {
    const selectedRows = this.api.getSelectedNodes();
    var selectionCounts = selectedRows.length;

    this.api.forEachNode((node) => {
      let selectable = true;

      if (selectedRows.length === 0) {
        selectable = true;
      }

      if (selectedRows.some((row) => row.rowIndex !== node.rowIndex)) {
        if (selectionCounts === 2) {
          selectable = false;
        } else {
          selectable = selectedRows[0]
            ? selectedRows[0]?.data?.period !== node?.data?.period
            : true;
        }
      }
      if (node?.data?.matchId) {
        selectable = false;
      }
      node.selectable = selectable;
    });
    this.api.refreshCells({ force: true });
  }

  sortGrid(event, field, sortDir) {
    const columnState = {
      state: [
        {
          colId: field,
          sort: sortDir,
        },
      ],
    };

    event.columnApi.applyColumnState(columnState);
  }

  onCellValueChanged(params) {
    let changedData = params.data;
    console.log('VALUE CHANED', params.data);
    params.api.applyTransaction({ update: [changedData] });
  }

  onGridReady(event) {
    //this.gridApi = params.api;
    console.log('The grid is now ready', event);
    this.api = event.api;

    this.sortGrid(event, 'val1', 'asc');
  }

  isExternalFilterPresent() {
    // console.log('isExternalFilterPresent');
    return this.matchFilterType != 'all';
  }

  doesExternalFilterPass(node: RowNode) {
    // console.log('doesExternalFilterPass');

    // console.log(this.matchFilterType);
    // console.log(this.matchFilterType);
    switch (this.matchFilterType) {
      case 'unmatchedonly': //OR CASE
        return node.data.matchId === null;
      case 'matchedonly': // AND CASE
        return node.data.matchId !== null;
      // case 'netherlandsOr2004': // OR CASE ACROSS DIFFERENT COLUMNS
      //   return node.data.country == 'Netherlands' || node.data.year == 2004;
      default:
        return true;
    }
  }

  onFilterTextBoxChanged() {
    // console.log('onFilterTextBoxChanged');

    this.api.setQuickFilter(
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  onPrintQuickFilterTexts() {
    // console.log('printQuickFilterTexts');
    this.api.forEachNode(function (rowNode, index) {
      console.log(
        'Row ' +
          index +
          ' quick filter text is ' +
          rowNode.quickFilterAggregateText
      );
    });
  }

  externalFilterChanged(filterType: string) {
    // console.log(filterType);
    // console.log('externalFilterChanged');
    // console.log(filterType);
    if (filterType === 'all') {
      this.matchFilterType = 'all';
    }
    if (filterType === 'unmatchedonly') {
      this.matchFilterType = 'unmatchedonly';
    }
    if (filterType === 'matchedonly') {
      this.matchFilterType = 'matchedonly';
    }

    this.api.onFilterChanged();
  }

  gridOptions = {
    columnDefs: this.columnDefs,
    defaultColDef: this.defaultColDef,
    autoGroupColumnDef: this.autoGroupColumnDef,
    columnTypes: this.columnTypes,
    rowData: this.rowData,
    groupDefaultExpanded: this.groupDefaultExpanded,
    rowSelection: this.rowSelection,
    isRowSelectable: this.isRowSelectable,
    animateRows: true,
    getRowId: this.getRowId.bind(this),
    aggFuncs: this.aggFuncs,
    onRowSelected: this.onRowSelected.bind(this),
    suppressAggFuncInHeader: true,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass.bind(this),
  };

  insuredObjectCellRenderer(params: ICellRendererParams) {
    if (params.value === undefined || params.value === null) {
      return '';
    } else {
      return params.value;
    }
  }
  numberParser(params: ValueParserParams) {
    return parseInt(params.newValue);
  }
  commentCellRenderer(params: ICellRendererParams) {
    if (params.value === undefined || params.value === null) {
      return '';
    } else {
      return params.value;
    }
  }
}
