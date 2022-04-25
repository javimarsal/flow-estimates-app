import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { WorkItem } from 'src/app/models/work-item';

// Material
// MatDialog --> Servicio
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

// Servicios
import { ProjectService } from 'src/app/services/project.service';
import { WorkItemService } from 'src/app/services/work-item.service';

// Componentes
import { WorkItemListComponent } from '../work-item-list/work-item-list.component';
import { WorkItemDialogComponent } from '../work-item-dialog/work-item-dialog.component';

@Component({
  selector: 'app-work-item',
  templateUrl: './work-item.component.html',
  styleUrls: ['./work-item.component.css']
})
export class WorkItemComponent implements OnInit {
  @Input() workItemTitle: string = '';
  @Input() panelName: string = '';
  @Input() workItemListComponent!: WorkItemListComponent;
  workItemIdNumber!: number;

  projectId: any = '';

  workItem!: WorkItem;

  workItemsOfPanel!: WorkItem[];

  constructor(private projectService: ProjectService, private workItemService: WorkItemService, private route: ActivatedRoute, private dialog: MatDialog) { }

  async ngOnInit() {
    this.getProjectId();

    try {
      let workItems = await lastValueFrom(this.getWorkItemsOfPanel());
      this.workItem = this.getWorkItemByTitle(workItems, this.workItemTitle);
      this.workItemIdNumber = this.workItem.idNumber;
      this.workItemsOfPanel = this.filterWorkItems_ByPanelName(workItems, this.panelName);
    }
    catch (error) {
      console.log(error);
    }
  }

  // INICIALIZAR EL COMPONENTE
  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  getWorkItemsOfPanel(): Observable<WorkItem[]> {
    return this.projectService.getWorkItems(this.projectId);
  }

  getWorkItemByTitle(workItemList: WorkItem[], title: string): WorkItem {
    return this.workItemService.getWorkItemByTitle(workItemList, title);
  }

  // Diálogo que se abre al pinchar en el workItem
  openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.width = '800px';

    dialogConfig.data = {
      idNumber: this.workItemIdNumber,
      title: this.workItemTitle,
      description: this.workItem.description
    }

    const dialogRef = this.dialog.open(WorkItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        // Si no le llegan datos no se hace nada
        if (!data) return;

        // Si data es 'delete' eliminamos el workItem
        if (data == 'delete') {
          this.deleteWorkItem();
          return;
        }

        // Si llegan datos y no es 'delete' actualizamos el title y description del componente
        this.updateWorkItemTitleDescription(data.title, data.description);
      }
      // acceder a una propiedad de data --> data.title
    );
  }

  // EDITAR Y ELIMINAR WorkItem
  async deleteWorkItem() {
    try {
      let workItems = await lastValueFrom(this.getWorkItemsOfPanel());
      this.workItem = this.getWorkItemByTitle(workItems, this.workItemTitle);
      this.workItemsOfPanel = this.filterWorkItems_ByPanelName(workItems, this.panelName);
    }
    catch (error) {
      console.log(error)
    }

    // Reducir en 1 la posición de los workItems afectados
    let workItemPosition = this.workItem.position;
    for (let wI of this.workItemsOfPanel) {
      if (wI.position > workItemPosition) {
        // Reducir su posición en 1
        wI.position--;

        // Actualizar el workItem
        try {
          let res = await lastValueFrom(this.workItemService.updateWorkItem(wI));
          console.log(res);
        }
        catch (error) {
          console.log(error)
        }
      }
    }

    // Id del workItem
    let workItemId = this.workItem._id;

    // Eliminar workItem de la bdd
    try {
      let res = await lastValueFrom(this.workItemService.deleteWorkItem(workItemId));
      console.log(res);
    }
    catch (error) {
      console.log(error)
    }

    // Eliminar la referencia de la lista del proyecto
    try {
      let res = await lastValueFrom(this.projectService.removeWorkItem(this.projectId, workItemId));
      console.log(res);
    }
    catch (error) {
      console.log(error)
    }

    // Asegurarnos de que la interfaz se comporta bien
    document.getElementById(this.workItemTitle)!.parentElement!.parentElement!.style.display = "none";
  }

  async updateWorkItemTitleDescription(t: string, description: string) {
    // Obtenemos el workItem que se va a actualizar (por si ha sufrido alguna modificación antes)
    try {
      let workItems = await lastValueFrom(this.getWorkItemsOfPanel());
      this.workItem = this.getWorkItemByTitle(workItems, this.workItemTitle);
    }
    catch (error) {
      console.log(error)
    }

    // Eliminar espacios no deseados en el title
    let title = t.replace(/\s+/g,' ').trim();

    // Actualizar el nombre del workItem en la interfaz
    this.workItemTitle = title;

    // Actualizar el workItem en la bdd
    this.workItem.title = title;
    this.workItem.description = description;
    try {
      let res = await lastValueFrom(this.workItemService.updateWorkItem(this.workItem));
      console.log(res);
    }
    catch (error) {
      console.log(error)
    }

    console.log(this.workItemsOfPanel);

    // Actualizar la lista de WorkItemListComponent
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName);
  }

}
