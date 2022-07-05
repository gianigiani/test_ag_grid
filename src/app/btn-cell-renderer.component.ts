import { Component, OnDestroy } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-btn-cell-renderer',
  template: `
    <button *ngIf="params.node.hasChildren()" (click)="btnClickedHandler()">
      Unlink
    </button>
    <span *ngIf="!params.node.hasChildren()">{{
      params.node.data.period
    }}</span>
  `,
})
//  (click)="btnClickedHandler($event)
export class BtnCellRendererComponent
  implements ICellRendererAngularComp, OnDestroy
{
  params: ICellRendererParams;

  agInit(params: any): void {
    this.params = params;
  }

  refresh() {
    return true;
  }

  btnClickedHandler() {
    const ids = this.params.node.allLeafChildren.map((item) => item.id);
    ids.forEach((id) => {
      const row = this.params.api.getRowNode(id);
      row.setData({ ...row.data, matchId: null, val2: 'NA' });
      this.params.api.applyTransaction({ update: [{ ...row.data }] });
    });

    // this.params.api.refreshClientSideRowModel('group');
  }

  ngOnDestroy() {
    // no need to remove the button click handler
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }
}
