import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { WorkItem } from 'src/app/models/work-item';

// Servicios
import { ProjectService } from 'src/app/services/project.service';
import { WorkItemService } from 'src/app/services/work-item.service';
import { WorkItemListComponent } from '../work-item-list/work-item-list.component';

@Component({
  selector: 'app-work-item',
  templateUrl: './work-item.component.html',
  styleUrls: ['./work-item.component.css']
})
export class WorkItemComponent implements OnInit {
  editing: boolean = false;

  @Input() workItemName: string = '';
  @Input() panelName: string = '';
  @Input() workItemListComponent!: WorkItemListComponent;

  projectId: any = '';

  workItem!: WorkItem;

  workItemsOfPanel!: WorkItem[];

  constructor(private projectService: ProjectService, private workItemService: WorkItemService, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.getProjectId();

    try {
      let workItems = await lastValueFrom(this.getWorkItemsOfPanel());
      this.workItem = this.getWorkItemByName(workItems, this.workItemName);
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

  getWorkItemByName(workItemList: WorkItem[], name: string): WorkItem {
    return this.workItemService.getWorkItemByName(workItemList, name);
  }

  // EDITAR Y ELIMINAR WorkItem
  edit() {
    this.editing = true;
    
    // Necesitamos esperar unos instantes hasta que se crea el input en el DOM
    document.getElementById(this.workItem._id!)?.focus();
    setTimeout(() => {
      
    }, 1000);
    
  }

  async deleteWorkItem() {
    try {
      let workItems = await lastValueFrom(this.getWorkItemsOfPanel());
      this.workItem = this.getWorkItemByName(workItems, this.workItemName);
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
    document.getElementById(this.workItemName)!.parentElement!.parentElement!.style.display = "none";
  }

  async updateWorkItemName(input: HTMLInputElement) {
    // Obtenemos el workItem que se va a actualizar (por si ha sufrido alguna modificación antes)
    try {
      let workItems = await lastValueFrom(this.getWorkItemsOfPanel());
      this.workItem = this.getWorkItemByName(workItems, this.workItemName);
    }
    catch (error) {
      console.log(error)
    }

    this.editing = false;

    let value = input.value;
    // Creamos un nuevo WorkItem si value no está vacío
    if (value == '') {
      alert('El nombre de la tarea no puede estar vacío!');
      return;
    }

    // Eliminar espacios no deseados en el valor del input
    value = value.replace(/\s+/g,' ').trim();

    // Comprobamos que el nuevo nombre no es el mismo que el actual (no actualizamos)
    if (value == this.workItem.name) {
      return;
    }

    // Actualizar el nombre del workItem en la interfaz
    this.workItemName = value;

    // Actualizar el workItem en la bdd
    this.workItem.name = value;
    try {
      let res = await lastValueFrom(this.workItemService.updateWorkItem(this.workItem));
      console.log(res);
    }
    catch (error) {
      console.log(error)
    }
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName);
  }

}
