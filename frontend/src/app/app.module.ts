// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Material
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';

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
    DragDropModule,
    MatExpansionModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    FormsModule,
    HttpClientModule
  ],
  entryComponents: [PanelComponent, WorkItemComponent],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
