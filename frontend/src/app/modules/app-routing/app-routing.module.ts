import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/components/home/home.component';
import { LoginComponent } from 'src/app/components/login/login.component';
import { MyProjectsComponent } from 'src/app/components/my-projects/my-projects.component';
import { PanelComponent } from 'src/app/components/panel/panel.component';
import { SignupComponent } from 'src/app/components/signup/signup.component';
import { EstimateSingleComponent } from 'src/app/components/estimate-single/estimate-single.component';
import { EstimateMultipleComponent } from 'src/app/components/estimate-multiple/estimate-multiple.component';
import { TagListComponent } from 'src/app/components/tag-list/tag-list.component';

const routes: Routes = [
  { path: '', redirectTo:'/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'my-projects', component: MyProjectsComponent },
  { path: 'project/:id', component: PanelComponent },
  { path: 'project/:id/estimate-single', component: EstimateSingleComponent },
  { path: 'project/:id/estimate-multiple', component: EstimateMultipleComponent },
  { path: 'project/:id/tags', component: TagListComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
