// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Components
import { AppComponent } from './app.component';
import { PanelComponent } from './components/panel/panel.component';
import { WorkItemComponent } from './components/work-item/work-item.component';
import { CreateWorkItemComponent } from './components/create-work-item/create-work-item.component';

@NgModule({
  declarations: [
    AppComponent,
    PanelComponent,
    WorkItemComponent,
    CreateWorkItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    HttpClientModule
  ],
  entryComponents: [PanelComponent, WorkItemComponent],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
