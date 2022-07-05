// import { Component, OnInit } from '@angular/core';
import { Component, OnDestroy } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-location-cell-renderer',
  template: `
    <div *ngIf="isLink">
      <div (click)="onLinkClicked($event)" style="cursor: pointer;">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Globe_icon.svg/420px-Globe_icon.svg.png"
          height="20px"
          width="20px"
        />
      </div>
    </div>
    <div *ngIf="isLink === false && rawValue !== ''">
      <span>{{ parsedCoordinates[0] }}</span>
      |
      <span>{{ parsedCoordinates[1] }}</span>
    </div>
  `,
})
export class LocationCellRendererComponent
  implements ICellRendererAngularComp, OnDestroy
{
  private params: ICellRendererParams;
  public rawValue: string = '';
  public isLink: boolean = false;
  public isChildren: boolean;
  public parsedCoordinates: string[] = [];

  agInit(params: any): void {
    this.params = params;

    this.isChildren = !params.node.hasChildren();

    if (this.isChildren) {
      this.rawValue = params.node?.data?.location;
    }

    if (this.isChildren && params.node?.data)
      this.isLink = this.rawValue.includes('https:') || false;

    if (this.isChildren && !this.isLink && params.node?.data) {
      this.parsedCoordinates = this.rawValue.split(',');
    }
  }

  onLinkClicked(event: any) {
    event.stopPropagation();
    window.open(this.params?.node?.data?.location || '#', '_blank').focus();
  }

  refresh() {
    return true;
  }

  ngOnDestroy() {
    // no need to remove the button click handler
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }
}
