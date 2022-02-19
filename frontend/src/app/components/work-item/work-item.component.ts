import { Component, Input, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ElementRef } from '@angular/core';

// Services
import { WorkItemService } from 'src/app/services/work-item.service';

// Models
import { WorkItem } from 'src/app/models/work-item';


@Component({
  selector: 'app-work-item',
  templateUrl: './work-item.component.html',
  styleUrls: ['./work-item.component.css']
})

export class WorkItemComponent implements OnInit {
  @Input() panelName!: string;

  workItemsOfPanel: WorkItem[] = [];

  allWorkItems: WorkItem[] = [];

  workItemsOfPanel_Names: string[] = [];

  constructor(public workItemService: WorkItemService, private elRef: ElementRef) { }

  ngOnInit(): void {
    this.getWorkItems();
  }

  // GET WorkItems
  getWorkItems() {
    this.workItemService.getWorkItems().subscribe(workItems => {
        // Le llegan todos los workitems, los guardamos
        this.allWorkItems = workItems;

        // Filtrar por el tablero que le corresponde y guardarlos
        this.workItemsOfPanel = this.filterWorkItems_ByPanelName(workItems, this.panelName);
        
        // Obtener los nombres de los workItems del Panel
        this.workItemsOfPanel_Names = this.getWorkItemsNames(this.workItemsOfPanel);
      }
    )
  }

  // PUT WorkItem
  updateWorkItem(workItem: WorkItem) {
    this.workItemService.updateWorkItem(workItem).subscribe(
      res => console.log(res),
      err => console.log(err)
    );
  }

  // Actualizar la posición del workItem cuyo nombre coincida
  updateWorkItem_Position(workItemName: string, newPosition: number) {
    this.workItemService.getWorkItems().subscribe(workItems => {
      let workItem = this.getWorkItemByName(workItems, workItemName);
      workItem.position = newPosition;
      this.updateWorkItem(workItem);
    })
  }

  // Actualizar la posición y el nombre de Panel del workItem cuyo nombre coincida
  updateWorkItem_PanelName_Position(workItemName: string, newPanelName: string, newPosition: number) {
    this.workItemService.getWorkItems().subscribe(workItems => {
      // Obtenemos el workItem
      let workItem = this.getWorkItemByName(workItems, workItemName);

      // Registrar fecha de entrada del workItem en el nuevo panel (si no existe para ese panel)
      workItem = this.registerEntryDate(workItem, newPanelName)

      // Cambiamos el nombre del panel (al que se mueve) y su nueva posición
      workItem.panel = newPanelName;
      workItem.position = newPosition;

      // Actualizamos el workItem en la base de datos
      this.updateWorkItem(workItem);
    })
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

  getWorkItemsNames(workItems: WorkItem[]): string[] {
    let workItemsNames: string[] = [];

    // Ordenar los workItems por el número de posición
    let sortedWorkItems_ByPosition = this.sortWorkItems(workItems);

    // Obtiene el nombre de cada workItem
    for(let workItem of sortedWorkItems_ByPosition) {
      workItemsNames.push(workItem.name);
    }

    return workItemsNames;
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
      let previousPanelNames = JSON.parse(JSON.stringify(this.workItemsOfPanel_Names));

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
      let movedWorkItemName = event.item.element.nativeElement.innerText;

      /* ESTADOS ANTERIORES de los Paneles */

      // Estado anterior (nombres de los workItems) de previousContainer (desde donde se mueve)
      let previous_previousContainerNames = JSON.parse(JSON.stringify(event.previousContainer.data));

      // Estado anterior (nombres de los workItems) de container (al que se mueve)
      let previous_containerNames = JSON.parse(JSON.stringify(event.container.data));

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      /* ESTADOS ACTUALES de los Paneles */

      // Estado actual (nombres de los workItems) de previousContainer (desde donde se mueve)
      let current_previousContainerNames = event.previousContainer.data;

      // Estado actual (nombres de los workItems) de container (al que se mueve)
      let current_containerNames = event.container.data;
      

      /* Actualizamos el panel del workItem que se ha movido */
      // Primero obtenemos el nombre del panel
      let containerPanelName = event.container.id;

      /* Actualizamos la posición de los workItems de los dos paneles */
      // Primer panel: previousContainer
      this.updateWorkItems_betweenPanels(current_previousContainerNames, previous_previousContainerNames, movedWorkItemName, containerPanelName);
      
      // Segundo panel: container
      this.updateWorkItems_betweenPanels(current_containerNames, previous_containerNames, movedWorkItemName, containerPanelName);
    }
  }

  /**
   * 
   * @param currentNames nombres del panel en el estado actual
   * @param previousNames nombres del panel en el estado anterior
   * @param movedWorkItemName nombre del workItem que se ha movido
   * @param movedPanelName nombre del panel hacia el que se ha movido el workItem
   */
  updateWorkItems_betweenPanels(currentNames: string[], previousNames: string[], movedWorkItemName: string, movedPanelName: string) {
    // Longitudes de los arrays
    let currentNames_length = currentNames.length;
    let previousNames_length = previousNames.length;

    // Al recorrer los arrays, podemos encontrarnos que el current tenga más workItems que el previous
    // Hay que controlarlo para que no haya desbordamiento
    let hayDesbordamiento = currentNames_length > previousNames_length;

    // Vamos actualizando la posición de los workItems, si ésta ha cambiado
    // es decir, en la posición que corresponda cambian los nombres
    for (let i = 0; i < currentNames_length; i++) {
      if (i == (currentNames_length - 1)  &&  hayDesbordamiento) {
        // Si hay desbordamiento y se ha alcanzado la última posición de currentNames
        // comprobamos si el currentName en la posición i es el que hemos movido
        if (currentNames[i] == movedWorkItemName) {
          // le cambiamos el nombre del panel y la posición
          this.updateWorkItem_PanelName_Position(currentNames[i], movedPanelName, i);
        } else {
          this.updateWorkItem_Position(currentNames[i], i);
        }
      } else {
        // comprobamos que el currentName en la posición i ha cambiado de posición con respecto a su estado anterior (previous)
        if (currentNames[i] != previousNames[i]) {
          // comprobamos si el currentName en la posición i es el que hemos movido
          if (currentNames[i] == movedWorkItemName) {
            // le cambiamos el nombre del panel y la posición
            this.updateWorkItem_PanelName_Position(currentNames[i], movedPanelName, i);
          } else {
            this.updateWorkItem_Position(currentNames[i], i);
          }
        }
      }
    }
  }

  getWorkItemByName(workItemList: WorkItem[], name: string): WorkItem {
    // Buscamos el workItem en la lista dada
    let workItem = workItemList.find(wI => wI.name == name)

    if (workItem) {
      return workItem;
    }
    else {
      let emptyWorkItem: WorkItem = {
        name: '',
        panel: '',
        position: 0,
        panelDateRegistry: [{
          panel: '',
          date: new Date()
        }]
      };
      
      return emptyWorkItem;
    }
  }

}
