import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { lastValueFrom } from 'rxjs';

// Models
import { Project } from 'src/app/models/project';

// Services
import { ProjectService } from 'src/app/services/project.service';
import { PanelService } from 'src/app/services/panel.service';
import { TagService } from 'src/app/services/tag.service';
import { WorkItemService } from 'src/app/services/work-item.service';
import { UserService } from 'src/app/services/user.service';

// Component
import { MyProjectItemDialogComponent } from '../my-project-item-dialog/my-project-item-dialog.component';

// Material
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-my-project-item',
  templateUrl: './my-project-item.component.html',
  styleUrls: ['./my-project-item.component.css']
})
export class MyProjectItemComponent implements OnInit {
  @Input() project!: Project;
  @Input() role!: string;
  @Input() userId!: string;

  @Output() onChangeUpdate = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  constructor(private dialog: MatDialog, private projectService: ProjectService, private panelService: PanelService, private tagService: TagService, private workItemService: WorkItemService, private userService: UserService) { }

  ngOnInit(): void {
  }

  async deleteProject() {
    let projectPanels: any = this.project.panels;
    let projectTags: any = this.project.tags;
    let projectWorkItems: any = this.project.workItems;
    // TODO
    console.log(this.project)
    // eliminar paneles
    if (projectPanels) {
      for (let panel of projectPanels) {
        try {
          await lastValueFrom(this.panelService.deletePanel(panel._id!));
        }
        catch (error) { console.log(error); }
      }
    }

    // eliminar tags
    if (projectTags) {
      for (let tag of projectTags) {
        try {
          await lastValueFrom(this.tagService.deleteTag(tag._id));
        }
        catch (error) { console.log(error); }
      }
    }

    // eliminar workItems
    if (projectWorkItems) {
      for (let workItem of projectWorkItems) {
        try {
          await lastValueFrom(this.workItemService.deleteWorkItem(workItem._id));
        }
        catch (error) { console.log(error); }
      }
    }

    // eliminar el project
    try {
      await lastValueFrom(this.projectService.deleteProject(this.project._id));
    }
    catch (error) { console.log(error); }

    // y eliminar la referencia del usuario
    try {
      await lastValueFrom(this.userService.deleteProject(this.userId, this.project._id!))
    }
    catch (error) { console.log(error); }

    // Ha salido bien, emitimos el cambio en el componente padre (my-projects)
    this.onDelete.emit(this.project._id);
  }

  async updateProject(project: Project) {
    try {
      // Copiamos el objeto project (panels, workItems, tags populated)
      let projectToBeUpdated: Project = JSON.parse(JSON.stringify(project));
      // Y le ponemos únicamente las referencias para que esté igual que en la bdd, ya que las listas (panels, workItems, tags) no deben estar populated
      projectToBeUpdated.panels = this.getArrayOfPanelReferences(projectToBeUpdated);

      await lastValueFrom(this.projectService.updateProject(projectToBeUpdated));
      this.onChangeUpdate.emit(this.project);
      
    }
    catch (error) {
      console.log(error);
    }
  }

  getArrayOfPanelReferences(project: any): any {
    let arrayOfPanelReferences = [];

    if (!project.panels) return [];

    for (let p of project.panels) {
      arrayOfPanelReferences.push({ panel: p._id });
    }

    return arrayOfPanelReferences;
  }

  getArrayOfWorkItemReferences(project: any): any {
    let arrayOfWorkItemReferences = [];

    if (!project.workItems) return [];

    for (let wI of project.workItems) {
      arrayOfWorkItemReferences.push({ workItem: wI._id });
    }

    return arrayOfWorkItemReferences;
  }

  getArrayOfTagReferences(project: any): any {
    let arrayOfTagReferences = [];

    if (!project.tags) return [];

    for (let t of project.tags) {
      arrayOfTagReferences.push({ tag: t._id });
    }

    return arrayOfTagReferences;
  }

  // Diálogo que se abre al pinchar en el botón "Editar" del proyecto
  async openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '800px';

    dialogConfig.data = {
      name: this.project.name,
      userId: this.userId
    }

    const dialogRef = this.dialog.open(MyProjectItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      async data => {
        // Si no llegan datos no se hace nada
        if (!data) return;

        // Si data es 'delete' eliminamos el Project
        if (data == 'delete') {
          this.deleteProject();
          return;
        }

        // Si llegan datos y no es 'delete' actualizamos el name
        this.project.name = data.name;
        await this.updateProject(this.project);
      }
    );
  }

}
