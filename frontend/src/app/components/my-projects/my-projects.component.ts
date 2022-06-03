import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';

// Services
import { UserService } from 'src/app/services/user.service';
import { CookieService } from 'ngx-cookie-service';

// Models
import { Project } from 'src/app/models/project';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit {
  uid: string = '';
  userProjects: any[] = [];

  constructor(private userService: UserService, private cookieService: CookieService) { }

  async ngOnInit() {
    this.uid = this.cookieService.get('uid')
    this.userProjects = await this.getUserProjects();
    console.log(this.userProjects);
  }

  async getUserProjects(): Promise<any[]> {
    let userProjects: any[] = [];
    
    // Obtener los proyectos del usuario
    try {
      let user = await lastValueFrom(this.userService.getUser(this.uid));
      userProjects = user.projects;
    }
    catch (error) {
      console.log(error);
      return [];
    }

    // Limpiar panels, tags y workItems de _id
    for (let project of userProjects) {
      project.project.panels = this.cleanPanelArray(project.project.panels);

      project.project.tags = this.cleanTagArray(project.project.tags);

      project.project.workItems = this.cleanWorkItemArray(project.project.workItems);
    }

    console.log(userProjects)

    return userProjects;
  }

  cleanPanelArray(panelArray: any[]): any[] {
    let cleanPanelArray: any[] = [];

    for (let panel of panelArray) {
      // console.log(panel.panel);
      cleanPanelArray.push(panel.panel);
    }
    // console.log(cleanPanelArray)
    return cleanPanelArray;
  }

  cleanTagArray(tagArray: any[]): any[] {
    let cleanTagArray: any[] = [];

    for (let tag of tagArray) {
      // console.log(panel.panel);
      cleanTagArray.push(tag.tag);
    }
    // console.log(cleanPanelArray)
    return cleanTagArray;
  }

  cleanWorkItemArray(workItemArray: any[]): any[] {
    let cleanWorkItemArray: any[] = [];

    for (let workItem of workItemArray) {
      // console.log(panel.panel);
      cleanWorkItemArray.push(workItem.workItem);
    }
    // console.log(cleanPanelArray)
    return cleanWorkItemArray;
  }
}
