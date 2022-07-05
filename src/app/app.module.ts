import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { LocationCellRendererComponent } from './location-cell-renderer.component';
import { BtnCellRendererComponent } from './btn-cell-renderer.component';
import { MyCellComponent } from './my-cell.component';

@NgModule({
  declarations: [
    AppComponent,
    LocationCellRendererComponent,
    BtnCellRendererComponent,
    MyCellComponent,
  ],
  imports: [BrowserModule, HttpClientModule, AgGridModule.withComponents([])],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
