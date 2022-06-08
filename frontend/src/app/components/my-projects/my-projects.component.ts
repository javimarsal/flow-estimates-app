import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

// Services
import { UserService } from 'src/app/services/user.service';
import { ProjectService } from 'src/app/services/project.service';
import { PanelService } from 'src/app/services/panel.service';
import { CookieService } from 'ngx-cookie-service';

// Models
import { Project } from 'src/app/models/project';
import { Panel } from 'src/app/models/panel';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit {
  uid: string = '';
  userProjects: any[] = [];
  
  // Formulario para crear proyectos
  form: FormGroup;

  constructor(private userService: UserService, private projectService: ProjectService, private panelService: PanelService, private router: Router, private cookieService: CookieService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [''],
    });
  }

  async ngOnInit() {
    this.uid = this.cookieService.get('uid');

    if (!this.uid) {
      this.router.navigate(['/']);
    }

    this.userProjects = await this.getUserProjects();
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

    return userProjects;
  }

  cleanPanelArray(panelArray: any[]): any[] {
    let cleanPanelArray: any[] = [];

    for (let panel of panelArray) {
      cleanPanelArray.push(panel.panel);
    }

    return cleanPanelArray;
  }

  cleanTagArray(tagArray: any[]): any[] {
    let cleanTagArray: any[] = [];

    for (let tag of tagArray) {
      cleanTagArray.push(tag.tag);
    }

    return cleanTagArray;
  }

  cleanWorkItemArray(workItemArray: any[]): any[] {
    let cleanWorkItemArray: any[] = [];

    for (let workItem of workItemArray) {
      cleanWorkItemArray.push(workItem.workItem);
    }

    return cleanWorkItemArray;
  }

  async createProject(formDirective: FormGroupDirective) {
    // Eliminar espacios no deseados
    let name = this.form.value.name.replace(/\s+/g,' ').trim();

    if (!name) {
      return;
    }
    
    // Crear el Proyecto
    let newProject: Project = {
      name: name
    };

    // proyecto de la base de datos para añadirla a la lista del user
    let projectDB!: any;

    try {
      projectDB = await lastValueFrom(this.projectService.createProject(this.uid, newProject));
    }
    catch (error) {
      console.log(error);
    }

    // controlar que projectDB no sea undefine o similar
    if (!projectDB) {
      // si es undefine es porque no se ha podido crear debido a que existe otra etiqueta con el mismo nombre
      this.changeInnerText('warning', 'No se puede crear el proyecto porque el título ya está asignado en uno de tus proyectos.');
      return;
    };
    this.changeInnerText('warning', '');

    // Se ha creado el nuevo Proyecto
    let projectId: string = projectDB._id!;

    // Crear los cuatro paneles principales e incluirlos en la bdd
    let mainPanels = await this.createMainPanels(projectId);

    // añadir los paneles al proyecto
    await this.addPanelsToProject(projectId, mainPanels);

    // ya tenemos el proyecto creado con los cuatro paneles, lo incluimos en la lista del usuario
    try {
      await lastValueFrom(this.userService.addProject(this.uid, projectDB));
    }
    catch (error) {
      console.log(error);
    }

    // Si todo ha ido bien, reseteamos el contenido del formulario
    formDirective.resetForm();
    this.form.reset({
      name: '',
    });

    // volvemos a obtener los proyectos del usuario (con toda la información)
    this.userProjects = await this.getUserProjects();
  }

  updateProjectName(project: Project) {
    for (let p of this.userProjects) {
      // Buscamos el proyecto con el mismo id
      if (p.project._id == project._id) {
        // y le cambiamos el nombre por el del proyecto que se ha actualizado
        p.project.name = project.name;
      }
    }
  }

  deleteProjectFromListById(projectId: string) {
    let userProjects = this.userProjects;
    let userProjectsLength = userProjects.length;

    for (let i = 0; i < userProjectsLength; i++) {
      // Buscamos el proyecto con el mismo id
      if (userProjects[i].project._id == projectId) {
        userProjects.splice(i, 1);
        break;
      }
    }
  }

  async createMainPanels(projectId: string): Promise<any[]> {
    let mainPanels: any[] = [];

    mainPanels.push(await this.createPanel(projectId, 'ToDO', 0));
    mainPanels.push(await this.createPanel(projectId, 'Doing', 1));
    mainPanels.push(await this.createPanel(projectId, 'Done', 2));
    mainPanels.push(await this.createPanel(projectId, 'Closed', 3));

    return mainPanels;
  }

  async createPanel(projectId: string, panelName: string, position: number): Promise<Panel> {
    let newPanel: Panel = {
      name: panelName,
      position: position
    };

    return await lastValueFrom(this.panelService.createPanel(projectId, newPanel));
  }

  async addPanelsToProject(projectId: string, panels: Panel[]) {
    for (let panel of panels) {
      await lastValueFrom(this.projectService.addPanel(projectId, panel));
    }
  }

  changeInnerText(elementId: string, message: string) {
    document.getElementById(elementId)!.innerText = message;
  }
}
