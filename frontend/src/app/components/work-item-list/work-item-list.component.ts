import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { WorkItemService } from 'src/app/services/work-item.service';
import { ProjectService } from 'src/app/services/project.service';

// Models
import { WorkItem } from 'src/app/models/work-item';


@Component({
  selector: 'app-work-item-list',
  templateUrl: './work-item-list.component.html',
  styleUrls: ['./work-item-list.component.css']
})

export class WorkItemListComponent implements OnInit {
  @Input() panelName!: string;

  workItemsOfPanel: any = {};

  projectId: any = '';

  editing: boolean = false;

  constructor(private route: ActivatedRoute, private projectService: ProjectService, public workItemService: WorkItemService) { }

  ngOnInit(): void {
    this.getProjectId();
    this.getWorkItemsOfProject();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  // GET WorkItems
  async getWorkItemsOfProject() {
    try {
      let workItems = await lastValueFrom(this.projectService.getWorkItems(this.projectId));

      // Filtrar por el tablero que le corresponde y guardarlos
      this.workItemsOfPanel.workItems = this.filterWorkItems_ByPanelName(workItems, this.panelName);
        
      // Obtener los títulos de los workItems del Panel, también se ordenan los objetos workItems en el método sortWorkItems
      let workItemsOfPanel_Titles = this.getWorkItemsTitles(this.workItemsOfPanel.workItems);

      // Asignamos los nombres al array de workItems del Panel
      this.workItemsOfPanel.titles = workItemsOfPanel_Titles;
    }
    catch (error) {
      console.log(error)
    }
  }

  // PUT WorkItem
  async updateWorkItem(workItem: WorkItem) {
    try {
      let res = await lastValueFrom(this.workItemService.updateWorkItem(workItem));
      console.log(res);
    }
    catch (error) {
      console.log(error)
    }
  }

  // Actualizar la posición del workItem cuyo nombre coincida
  async updateWorkItem_Position(workItemTitle: string, newPosition: number) {
    try {
      let workItems = await lastValueFrom(this.projectService.getWorkItems(this.projectId));

      let workItem = this.getWorkItemByTitle(workItems, workItemTitle);
      workItem.position = newPosition;
      this.updateWorkItem(workItem);
    }
    catch (error) {
      console.log(error);
    }
  }

  // Actualizar la posición y el nombre de Panel del workItem cuyo nombre coincida
  async updateWorkItem_PanelName_Position(workItemTitle: string, newPanelName: string, newPosition: number) {
    try {
      let workItems = await lastValueFrom(this.projectService.getWorkItems(this.projectId));

      // Obtenemos el workItem
      let workItem = this.getWorkItemByTitle(workItems, workItemTitle);

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

  getWorkItemsTitles(workItems: WorkItem[]): string[] {
    let workItemsTitles: string[] = [];

    // Ordenar los workItems por el número de posición
    let sortedWorkItems_ByPosition = this.sortWorkItems(workItems);

    // Obtiene el nombre de cada workItem
    for (let workItem of sortedWorkItems_ByPosition) {
      workItemsTitles.push(workItem.title);
    }

    return workItemsTitles;
  }

  // Ordena los workItems según el número de posición
  sortWorkItems(workItems: WorkItem[]): WorkItem[] {
    return workItems.sort(function(a, b) {
      return a.position - b.position;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      // Hacemos una copia de this.workItemsOfPanel_Names (sin referencia) porque al realizarse "moveItemInArray" también cambia this.workItemsOfPanel_Names y queremos obtener el estado antes de realizar ningún movimiento
      let previousPanelNames = JSON.parse(JSON.stringify(event.container.data));

      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // Debemos comprobar que el índice del workItem cambia para ejecutar la acción
      if (event.previousIndex != event.currentIndex) {
        // Estado actual del panel (nombres)
        let currentPanelNames = event.container.data;
  
        // Longitud del array de nombres
        let panelNamesLength = currentPanelNames.length;
  
        // Vamos actualizando la posición de los workItems, si ésta ha cambiado
        // es decir, en la posición que corresponda cambian los nombres
        for (let i = 0; i < panelNamesLength; i++) {
          if (currentPanelNames[i] != previousPanelNames[i]) {
            this.updateWorkItem_Position(currentPanelNames[i], i);
          }
        }
      }
    }

    else {
      // Nombre del workItem que movemos
      let movedWorkItemTitle = event.item.element.nativeElement.innerText;

      /* ESTADOS ANTERIORES de los Paneles */

      // Estado anterior (títulos de los workItems) de previousContainer (desde donde se mueve)
      let previous_previousContainerTitles = JSON.parse(JSON.stringify(event.previousContainer.data));

      // Estado anterior (títulos de los workItems) de container (al que se mueve)
      let previous_containerTitles = JSON.parse(JSON.stringify(event.container.data));

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      /* ESTADOS ACTUALES de los Paneles */

      // Estado actual (títulos de los workItems) de previousContainer (desde donde se mueve)
      let current_previousContainerTitles = event.previousContainer.data;

      // Estado actual (títulos de los workItems) de container (al que se mueve)
      let current_containerTitles = event.container.data;
      

      /* Actualizamos el panel del workItem que se ha movido */
      // Primero obtenemos el nombre del panel
      let containerPanelName = event.container.id;

      /* Actualizamos la posición de los workItems de los dos paneles */
      // Primer panel: previousContainer
      this.updateWorkItems_betweenPanels(current_previousContainerTitles, previous_previousContainerTitles, movedWorkItemTitle, containerPanelName);
      
      // Segundo panel: container
      this.updateWorkItems_betweenPanels(current_containerTitles, previous_containerTitles, movedWorkItemTitle, containerPanelName);
    }
  }

  /**
   * 
   * @param currentTitles títulos de workItems que contiene el panel en el estado actual
   * @param previousTitles títulos de workItems que contiene el panel en el estado anterior
   * @param movedWorkItemTitle título del workItem que se ha movido
   * @param movedPanelName nombre del panel hacia el que se ha movido el workItem
   */
  updateWorkItems_betweenPanels(currentTitles: string[], previousTitles: string[], movedWorkItemTitle: string, movedPanelName: string) {
    // Longitudes de los arrays
    let currentTitles_length = currentTitles.length;
    let previousTitles_length = previousTitles.length;

    // Al recorrer los arrays, podemos encontrarnos que el current tenga más workItems que el previous
    // Hay que controlarlo para que no haya desbordamiento
    let hayDesbordamiento = currentTitles_length > previousTitles_length;

    // Vamos actualizando la posición de los workItems, si ésta ha cambiado
    // es decir, en la posición que corresponda cambian los títulos
    for (let i = 0; i < currentTitles_length; i++) {
      if (i == (currentTitles_length - 1)  &&  hayDesbordamiento) {
        // Si hay desbordamiento y se ha alcanzado la última posición de currentTitles
        // comprobamos si el currentTitle en la posición i es el que hemos movido
        if (currentTitles[i] == movedWorkItemTitle) {
          // le cambiamos el nombre del panel y la posición
          this.updateWorkItem_PanelName_Position(currentTitles[i], movedPanelName, i);
        } else {
          this.updateWorkItem_Position(currentTitles[i], i);
        }
      } else {
        // comprobamos que el currentTitle en la posición i ha cambiado de posición con respecto a su estado anterior (previous)
        if (currentTitles[i] != previousTitles[i]) {
          // comprobamos si el currentTitle en la posición i es el que hemos movido
          if (currentTitles[i] == movedWorkItemTitle) {
            // le cambiamos el nombre del panel y la posición
            this.updateWorkItem_PanelName_Position(currentTitles[i], movedPanelName, i);
          } else {
            this.updateWorkItem_Position(currentTitles[i], i);
          }
        }
      }
    }
  }

  getWorkItemByTitle(workItemList: WorkItem[], title: string): WorkItem {
    return this.workItemService.getWorkItemByTitle(workItemList, title);
  }

}
