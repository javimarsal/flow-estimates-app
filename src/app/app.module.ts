import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';

import { AppComponent } from './app.component';
import { PanelComponent } from './panel/panel.component';
import { WorkItemComponent } from './work-item/work-item.component';

@NgModule({
  declarations: [
    AppComponent,
    PanelComponent,
    WorkItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  entryComponents: [PanelComponent, WorkItemComponent],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
