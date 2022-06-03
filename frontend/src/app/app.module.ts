// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './modules/app-routing/app-routing.module';
import { NgApexchartsModule } from 'ng-apexcharts';


// Material
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';

// Components
import { AppComponent } from './app.component';
import { PanelComponent } from './components/panel/panel.component';
import { WorkItemListComponent } from './components/work-item-list/work-item-list.component';
import { CreateWorkItemComponent } from './components/create-work-item/create-work-item.component';
import { LoginComponent } from './components/login/login.component';
import { MyProjectsComponent } from './components/my-projects/my-projects.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';
import { WorkItemComponent } from './components/work-item/work-item.component';
import { EstimateSingleComponent } from './components/estimate-single/estimate-single.component';
import { WorkItemDialogComponent } from './components/work-item-dialog/work-item-dialog.component';
import { EstimateMultipleComponent } from './components/estimate-multiple/estimate-multiple.component';
import { TagListComponent } from './components/tag-list/tag-list.component';
import { TagComponent } from './components/tag/tag.component';
import { TagDialogComponent } from './components/tag-dialog/tag-dialog.component';
import { EstimateMultipleHowManyComponent } from './components/estimate-multiple-how-many/estimate-multiple-how-many.component';
import { ConfirmationAccountComponent } from './components/confirmation-account/confirmation-account.component';
import { MyProjectItemComponent } from './components/my-project-item/my-project-item.component';

@NgModule({
  declarations: [
    AppComponent,
    PanelComponent,
    WorkItemListComponent,
    CreateWorkItemComponent,
    LoginComponent,
    MyProjectsComponent,
    NavbarComponent,
    HomeComponent,
    SignupComponent,
    WorkItemComponent,
    WorkItemDialogComponent,
    EstimateSingleComponent,
    EstimateMultipleComponent,
    TagListComponent,
    TagComponent,
    TagDialogComponent,
    EstimateMultipleHowManyComponent,
    ConfirmationAccountComponent,
    MyProjectItemComponent
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
    MatToolbarModule,
    MatCardModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    ScrollingModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgApexchartsModule
  ],
  entryComponents: [PanelComponent, WorkItemListComponent, WorkItemDialogComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
