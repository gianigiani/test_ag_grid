import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, CellClassParams } from 'ag-grid-community';

@Component({
  selector: 'app-my-cell',
  template: `<div [ngClass]="this.cellClass()">
    <span>{{ this.value }}</span>
  </div>`,
})
export class MyCellComponent implements OnInit, ICellRendererAngularComp {
  value: any;
  cellRenderer: any;
  cellClass: any = [];

  agInit(params: ICellRendererParams): void {
    this.cellClass = (row: CellClassParams) => {
      let resultClass = [];
      // console.log(params.node.data.matchId)

      if (params.node.isSelected()) {
        resultClass.push('color-initial');
      }

      if (params.node.data?.matchId === null) {
        resultClass.push('color-red');
      }

      if (params.node.data?.matchId !== null) {
        resultClass.push('color-green');
      }

      if (params.node.data?.period === 'New') {
        resultClass.push('bold-element');
      }

      // if (!params.node.selectable) {
      //   resultClass.push('color-grey');
      // }

      //color based on match score
      if (params.node.hasChildren()) {
        const children = params.node.allLeafChildren[1];

        if (children?.data[`${params.colDef.field}_score`] > 60) {
          resultClass.push('color-yellow');
        }
        if (children?.data[`${params.colDef.field}_score`] > 90) {
          resultClass.push('color-orange');
        }
        if (children?.data[params.colDef.field] === '') {
          resultClass.push('color-white');
        }
      } else if (params.node?.data && params.node.data?.matchId) {
        if (params.node?.data[`${params.colDef.field}_score`] > 60) {
          resultClass.push('color-yellow');
        }
        if (params.node?.data[`${params.colDef.field}_score`] > 90) {
          resultClass.push('color-orange');
        }

        if (params.node?.data[params.colDef.field] === '') {
          resultClass.push('color-white');
        }
      }

      return resultClass;
    };

    if (params.value === undefined || params.value === null) {
      this.value = '';
    } else {
      this.value = params.value;
    }
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
  ngOnInit(): void {}
}
