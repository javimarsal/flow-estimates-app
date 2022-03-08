import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'src/app/components/login/login.component';
import { MyProjectsComponent } from 'src/app/components/my-projects/my-projects.component';
import { PanelComponent } from 'src/app/components/panel/panel.component';

const routes: Routes = [
  { path: '', redirectTo:'/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'my-projects', component: MyProjectsComponent },
  { path: 'project/:id', component: PanelComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
