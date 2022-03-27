import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkItem } from 'src/app/models/work-item';

// Servicios
import { ProjectService } from 'src/app/services/project.service';
import { WorkItemService } from 'src/app/services/work-item.service';

@Component({
  selector: 'app-work-item',
  templateUrl: './work-item.component.html',
  styleUrls: ['./work-item.component.css']
})
export class WorkItemComponent implements OnInit {
  editing: boolean = false;

  @Input() workItemName: string = '';

  projectId: any = '';

  // Obtener el id del workItem (para pasárselo al componente update-delete)
  workItem!: WorkItem;

  constructor(private projectService: ProjectService, private workItemService: WorkItemService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getProjectId();
    this.getWorkItemsOfProject();
  }

  // INICIALIZAR EL COMPONENTE
  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  getWorkItemsOfProject() {
    this.projectService.getWorkItems(this.projectId).toPromise()
      .then(workItems => {
        this.workItem = this.getWorkItemByName(workItems, this.workItemName);
      })
      .catch(error => console.log(error));
  }

  getWorkItemByName(workItemList: WorkItem[], name: string): WorkItem {
    return this.workItemService.getWorkItemByName(workItemList, name);
  }

  // EDITAR Y ELIMINAR WorkItem
  edit() {
    this.editing = true;
    
    // Necesitamos esperar unos instantes hasta que se crea el input en el DOM
    setTimeout(() => {
      document.getElementById(this.workItemName)?.focus();
    }, 100);
    
  }

  updateWorkItem(input: HTMLInputElement) {
    this.editing = false;

    let value = input.value;
    // Creamos un nuevo WorkItem si value no está vacío
    if (value == '') {
      alert('El nombre de la tarea no puede estar vacío!');
      return;
    }

    // Eliminar espacios no deseados en el valor del input
    value = value.replace(/\s+/g,' ').trim();

    // Actualizar el nombre del workItem en la interfaz
    this.workItemName = value;

    // Actualizar el workItem en la bdd
    this.workItem.name = value;
    this.workItemService.updateWorkItem(this.workItem).toPromise()
      .then(res => console.log(res))
      .catch(error => console.log(error));
  }

}
