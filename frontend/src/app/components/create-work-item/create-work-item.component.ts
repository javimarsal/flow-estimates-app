import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, lastValueFrom } from 'rxjs';

// Services
import { WorkItemService } from 'src/app/services/work-item.service';
import { ProjectService } from 'src/app/services/project.service';

// Components
import { WorkItemListComponent } from '../work-item-list/work-item-list.component';

// Models
import { WorkItem } from 'src/app/models/work-item';

@Component({
  selector: 'app-create-work-item',
  templateUrl: './create-work-item.component.html',
  styleUrls: ['./create-work-item.component.css']
})

export class CreateWorkItemComponent implements OnInit {
  @Input() panelName!: string ;
  // Valor del input
  value = '';

  allWorkItems!: WorkItem[];
  @Input() workItemListComponent!: WorkItemListComponent;

  projectId: any = '';

  constructor(private route: ActivatedRoute, private projectService: ProjectService, public workItemService: WorkItemService) { }

  ngOnInit(): void {
    this.getProjectId();

    // Evento para el botón Crear
    var input = document.getElementById("title");
    input!.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("create")!.click();
      }
    });
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  async createWorkItem() {
    // Creamos un nuevo WorkItem si value no está vacío
    if (this.value == '') {
      return;
    }

    // Eliminar espacios no deseados en el valor del input
    this.value = this.value.replace(/\s+/g,' ').trim();

    // idNumber del nuevo workItem
    let idNumber = 0;

    /* Actualizamos la posición del resto de workItems del panel. Lo hacemos antes para que no afecte al nuevo workItem */
    // Obtenemos todos los workItems
    try {
      let workItems = await lastValueFrom(this.getWorkItems());
      this.allWorkItems = workItems;
      // también obtenemos el número del workItem para establecer su idNumber
      // este debe ser el mayor idNumber + 1
      idNumber = this.getMaxIdNumber(workItems) + 1;
    }
    catch (error) {
      console.log(error)
    }

    // Obtenemos los workItems que pertenecen al panel actual
    let workItemsOfPanel = this.filterWorkItems_ByPanelName(this.allWorkItems, this.panelName);

    // Incrementamos la posición de cada workItem en 1
    this.increasePositionByOne_ofWorkItems(workItemsOfPanel);

    // Nuevo objeto WorkItem
    let newWorkItem: WorkItem = {
      idNumber: idNumber,
      title: this.value,
      description: '',
      panel: this.panelName,
      position: 0,
      panelDateRegistry: [{
        panel: this.panelName,
        date: new Date()
      }]
    };

    // Creamos el objeto en la bdd, y borramos el contenido de value
    let workItemOfDB!: WorkItem;

    try {
      let res = await lastValueFrom(this.workItemService.createWorkItem(newWorkItem));
      // console.log(res);
      workItemOfDB = res;
    }
    catch (error) {
      console.log(error)
    }
    
    this.value = '';
    
    // Añadimos el nuevo workItem en la lista del proyecto
    try {
      let res = await lastValueFrom(this.projectService.addWorkItem(this.projectId, workItemOfDB));
      // console.log(res);
    }
    catch (error) {
      console.log(error)
    }

    // Llamamos al método getWorkItems() del componente workItem para que actualice su lista
    this.workItemListComponent.workItemsOfPanel_IdNumbers.unshift(idNumber.toString());
  }

  getMaxIdNumber(workItems: WorkItem[]) {
    let maxNumber = workItems[0].idNumber;
    let lengthWorkItems = workItems.length;

    for (let i = 1; i < lengthWorkItems; i++) {
      if (workItems[i].idNumber > maxNumber) maxNumber = workItems[i].idNumber;
    }

    return maxNumber;
  }

  getWorkItems(): Observable<WorkItem[]> {
    return this.projectService.getWorkItems(this.projectId);
  }

  async updateWorkItem(workItem: WorkItem) {
    try {
      let res = await lastValueFrom(this.workItemService.updateWorkItem(workItem));
      // console.log(res);
    }
    catch (error) {
      console.log(error)
    }
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName)
  }

  increasePositionByOne_ofWorkItems(workItems: WorkItem[]) {
    for (let wI of workItems) {
      // Incrementar en 1 su posición
      wI.position++;

      // Actualizarlo en la bdd
      this.updateWorkItem(wI);
    }
  }

}
