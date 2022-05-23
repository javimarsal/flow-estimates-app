import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { WorkItemService } from 'src/app/services/work-item.service';
import { ProjectService } from 'src/app/services/project.service';

// Models
import { WorkItem } from 'src/app/models/work-item';
import { Tag } from 'src/app/models/tag';


@Component({
  selector: 'app-work-item-list',
  templateUrl: './work-item-list.component.html',
  styleUrls: ['./work-item-list.component.css']
})

export class WorkItemListComponent implements OnInit {
  @Input() panelName!: string;

  workItemsOfPanel_IdNumbers: string[] = [];
  workItemsOfPanel: WorkItem[] = [];

  projectId: any = '';
  @Input() projectTags!: Tag[];

  constructor(private route: ActivatedRoute, private projectService: ProjectService, public workItemService: WorkItemService) { }

  ngOnInit(): void {
    this.getProjectId();
    this.getWorkItemsOfPanel();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  // GET WorkItems
  async getWorkItemsOfPanel() {
    try {
      let workItems = await lastValueFrom(this.projectService.getWorkItems(this.projectId));

      // Filtrar por el tablero que le corresponde y guardarlos
      let workItemsOfPanel = this.filterWorkItems_ByPanelName(workItems, this.panelName);
      this.workItemsOfPanel = workItemsOfPanel;
        
      // Obtener los ID de los workItems del Panel, también se ordenan los objetos workItems en el método sortWorkItems
      this.workItemsOfPanel_IdNumbers = this.getWorkItemsIdNumbers(workItemsOfPanel);
    }
    catch (error) {
      console.log(error)
    }
  }

  stringToNumber(s: string): number {
    return parseInt(s);
  }

  // PUT WorkItem
  async updateWorkItem(workItem: WorkItem) {
    try {
      let res = await lastValueFrom(this.workItemService.updateWorkItem(workItem));
      // console.log(res);
    }
    catch (error) {
      console.log(error)
    }
  }

  // Actualizar la posición del workItem cuyo nombre coincida
  async updateWorkItem_Position(workItemIdNumber: number, newPosition: number) {
    try {
      let workItems = await lastValueFrom(this.projectService.getWorkItems(this.projectId));

      let workItem = this.getWorkItemByIdNumber(workItems, workItemIdNumber);
      workItem.position = newPosition;
      this.updateWorkItem(workItem);
    }
    catch (error) {
      console.log(error);
    }
  }

  // Actualizar la posición y el nombre de Panel del workItem cuyo nombre coincida
  async updateWorkItem_PanelName_Position(workItemNumber: number, newPanelName: string, newPosition: number) {
    try {
      let workItems = await lastValueFrom(this.projectService.getWorkItems(this.projectId));

      // Obtenemos el workItem
      let workItem = this.getWorkItemByIdNumber(workItems, workItemNumber);

      // Registrar fecha de entrada del workItem en el nuevo panel (si no existe para ese panel)
      workItem = this.registerEntryDate(workItem, newPanelName)

      // Cambiamos el nombre del panel (al que se mueve) y su nueva posición
      workItem.panel = newPanelName;
      workItem.position = newPosition;

      // Actualizamos el workItem en la base de datos
      this.updateWorkItem(workItem);
    }
    catch (error) {
      console.log(error)
    }
  }

  // Registrar fecha de entrada del workItem en el nuevo panel
  registerEntryDate(workItem: WorkItem, newPanelName: string): WorkItem {
    // Registramos la fecha de entrada en el panel, si esta no existe
    if (!this.checkPanelEntryExist(workItem, newPanelName)) {
      workItem.panelDateRegistry.push({
        panel: newPanelName,
        date: new Date()
      });
    }

    // Tanto si añade la fecha al registro como si no, devolvemos el objeto workItem
    return workItem;
  }

  // Para añadir o no el panel al registro del workItem (cuando se mueve)
  checkPanelEntryExist(workItem: WorkItem, newPanelName: string) {
    let panelDateRegistry = workItem.panelDateRegistry;

    for (let panelRegistry of panelDateRegistry) {
      if (panelRegistry.panel == newPanelName) {
        // Si encuentra el panel, devolvemos el workItem
        return workItem
      }
    }
    // Si no encuentra el panel, devolvemos false (es decir, no existe el panel en el registro)
    return false
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName)
  }

  getWorkItemsIdNumbers(workItems: WorkItem[]): string[] {
    let workItemsIdNumbers: string[] = [];

    // Ordenar los workItems por el número de posición
    let sortedWorkItems_ByPosition = this.sortWorkItems(workItems);

    // Obtiene el idNumber de cada workItem
    for (let workItem of sortedWorkItems_ByPosition) {
      workItemsIdNumbers.push(workItem.idNumber.toString());
    }

    return workItemsIdNumbers;
  }

  // Ordena los workItems según el número de posición
  sortWorkItems(workItems: WorkItem[]): WorkItem[] {
    return workItems.sort(function (a, b) {
      return a.position - b.position;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log(event.item.element.nativeElement.innerText)
    if (event.previousContainer === event.container) {
      // Hacemos una copia de event.container.data (sin referencia) porque al realizarse "moveItemInArray" también cambia event.container.data y queremos obtener el estado antes de realizar ningún movimiento
      let previousPanelIdNumbers = JSON.parse(JSON.stringify(event.container.data));
      
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // Debemos comprobar que el índice del workItem cambia para ejecutar la acción
      if (event.previousIndex != event.currentIndex) {
        // Estado actual del panel (idNumbers)
        let currentPanelIdNumbers = event.container.data;
  
        // Longitud del array de idNumbers
        let panelIdNumbersLength = currentPanelIdNumbers.length;
  
        // Vamos actualizando la posición de los workItems, si ésta ha cambiado
        // es decir, en la posición que corresponda cambian los idNumbers
        for (let i = 0; i < panelIdNumbersLength; i++) {
          if (currentPanelIdNumbers[i] != previousPanelIdNumbers[i]) {
            this.updateWorkItem_Position(parseInt(currentPanelIdNumbers[i]), i);
          }
        }
      }
    }

    else {
      /* ESTADOS ANTERIORES de los Paneles */
      //* los datos del event son strings

      // Estado anterior (idNumbers de los workItems) de previousContainer (desde donde se mueve)
      let previous_previousContainerIdNumbers = JSON.parse(JSON.stringify(event.previousContainer.data));

      // Estado anterior (idNumbers de los workItems) de container (al que se mueve)
      let previous_containerIdNumbers = JSON.parse(JSON.stringify(event.container.data));

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      /* ESTADOS ACTUALES de los Paneles */

      // Estado actual (idNumbers de los workItems) de previousContainer (desde donde se mueve)
      let current_previousContainerIdNumbers = event.previousContainer.data;

      // Estado actual (idNumbers de los workItems) de container (al que se mueve)
      let current_containerIdNumbers = event.container.data;

      // idNumber del workItem que movemos
      let movedWorkItemIdNumber = current_containerIdNumbers[event.currentIndex];
      

      /* Actualizamos el panel del workItem que se ha movido */
      // Primero obtenemos el nombre del panel
      let containerPanelName = event.container.id;

      /* Actualizamos los workItems de los dos paneles */
      // Primer panel: previousContainer
      this.updateWorkItems_betweenPanels(current_previousContainerIdNumbers, previous_previousContainerIdNumbers, movedWorkItemIdNumber, containerPanelName);
      
      // Segundo panel: container
      this.updateWorkItems_betweenPanels(current_containerIdNumbers, previous_containerIdNumbers, movedWorkItemIdNumber, containerPanelName);
    }
  }

  /**
   * 
   * @param currentIdNumbers idNumbers de workItems que contiene el panel en el estado actual
   * @param previousIdNumbers idNumbers de workItems que contiene el panel en el estado anterior
   * @param movedWorkItemIdNumber idNumber del workItem que se ha movido
   * @param movedPanelName nombre del panel hacia el que se ha movido el workItem
   */
  async updateWorkItems_betweenPanels(currentIdNumbers: string[], previousIdNumbers: string[], movedWorkItemIdNumber: string, movedPanelName: string) {
    // Longitudes de los arrays
    let currentIdNumbers_length = currentIdNumbers.length;
    let previousIdNumbers_length = previousIdNumbers.length;

    // Al recorrer los arrays, podemos encontrarnos que el current tenga más workItems que el previous
    // Hay que controlarlo para que no haya desbordamiento
    let hayDesbordamiento = currentIdNumbers_length > previousIdNumbers_length;

    // Vamos actualizando la posición de los workItems, si ésta ha cambiado
    // es decir, en la posición que corresponda cambian los idNumbers
    for (let i = 0; i < currentIdNumbers_length; i++) {
      // Si hay desbordamiento y se ha alcanzado la última posición de currentIdNumbers
      if (i == (currentIdNumbers_length - 1)  &&  hayDesbordamiento) {
        // comprobamos si el currentIdNumber en la posición i es el que hemos movido
        if (currentIdNumbers[i] == movedWorkItemIdNumber) {
          // le cambiamos el nombre del panel y la posición
          await this.updateWorkItem_PanelName_Position(parseInt(currentIdNumbers[i]), movedPanelName, i);
        } else {
          await this.updateWorkItem_Position(parseInt(currentIdNumbers[i]), i);
        }
      } else {
        // comprobamos que el currentIdNumber en la posición i ha cambiado de posición con respecto a su estado anterior (previous)
        if (currentIdNumbers[i] != previousIdNumbers[i]) {
          // comprobamos si el currentIdNumber en la posición i es el que hemos movido
          if (currentIdNumbers[i] == movedWorkItemIdNumber) {
            // le cambiamos el nombre del panel y la posición
            await this.updateWorkItem_PanelName_Position(parseInt(currentIdNumbers[i]), movedPanelName, i);
          } else {
            await this.updateWorkItem_Position(parseInt(currentIdNumbers[i]), i);
          }
        }
      }
    }
    await this.getWorkItemsOfPanel();
  }

  getWorkItemByIdNumber(workItemList: WorkItem[], idNumber: number): WorkItem {
    return this.workItemService.getWorkItemByIdNumber(workItemList, idNumber);
  }

}
