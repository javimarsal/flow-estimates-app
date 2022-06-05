import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { lastValueFrom } from 'rxjs';

// Models
import { Project } from 'src/app/models/project';

// Services
import { ProjectService } from 'src/app/services/project.service';

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

  constructor(private dialog: MatDialog, private projectService: ProjectService) { }

  ngOnInit(): void {
  }

  async deleteProject() {
    // TODO
  }

  async updateProject(project: Project) {
    try {
      // Copiamos el objeto project
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
