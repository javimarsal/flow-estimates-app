import { Component, Input, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ElementRef } from '@angular/core';
import { Observable, of, Subject, Subscription } from 'rxjs';

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
    this.workItemService.updateWorkItem(workItem).subscribe();
  }

  // Actualizar la posición del workItem cuyo nombre coincida
  updateWorkItem_Position(workItemName: string, newPosition: number) {
    this.workItemService.getWorkItems().subscribe(workItems => {
      let workItem = this.getWorkItemByName(workItems, workItemName);
      workItem.position = newPosition;
      this.updateWorkItem(workItem);
    })
  }

  // Actualizar la posición del workItem cuyo nombre coincida
  updateWorkItem_PanelName_Position(workItemName: string, newPanelName: string, newPosition: number) {
    this.workItemService.getWorkItems().subscribe(workItems => {
      let workItem = this.getWorkItemByName(workItems, workItemName);
      workItem.panel = newPanelName;
      workItem.position = newPosition;
      this.updateWorkItem(workItem);
    })
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName);
  }

  getWorkItemsNames(workItems: WorkItem[]): string[] {
    return this.workItemService.getWorkItemsNames(workItems);
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

      // Estado anterior y longitud (nombres de los workItems) de previousContainer (desde donde se mueve)
      let previous_previousContainerNames = JSON.parse(JSON.stringify(event.previousContainer.data));
      let previous_previousContainerNames_length = previous_previousContainerNames.length;

      // Estado anterior y longitud (nombres de los workItems) de container (al que se mueve)
      let previous_containerNames = JSON.parse(JSON.stringify(event.container.data));
      let previous_containerNames_length = previous_containerNames.length;

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      /* ESTADOS ACTUALES de los Paneles */

      // Estado actual y longitud (nombres de los workItems) de previousContainer (desde donde se mueve)
      let current_previousContainerNames = event.previousContainer.data;
      let current_previousContainerNames_length = current_previousContainerNames.length;

      // Estado actual y longitud (nombres de los workItems) de container (al que se mueve)
      let current_containerNames = event.container.data;
      let current_containerNames_length = current_containerNames.length;
      

      /* Actualizamos el panel del workItem que se ha movido */
      // Primero obtenemos el nombre del panel
      let containerPanelName = event.container.id;

      /* Actualizamos la posición de los workItems de los dos paneles */
      // Primer panel: previousContainer
      
      // Al recorrer los arrays, podemos encontrarnos que el current tenga más workItems que el previous
      // Hay que controlarlo para que no haya desbordamiento
      let hayDesbordamiento = current_previousContainerNames_length > previous_previousContainerNames_length;

      // Vamos actualizando la posición de los workItems, si ésta ha cambiado
      // es decir, en la posición que corresponda cambian los nombres
      for (let i = 0; i < current_previousContainerNames_length; i++) {
        if (i == (current_previousContainerNames_length - 1)  &&  hayDesbordamiento) {
          // Si hay desbordamiento y se ha alcanzado la última posición de current
          if (current_previousContainerNames[i] == movedWorkItemName) {
            this.updateWorkItem_PanelName_Position(current_previousContainerNames[i], containerPanelName, i);
          } else {
            this.updateWorkItem_Position(current_previousContainerNames[i], i);
          }
        } else {
          if (current_previousContainerNames[i] != previous_previousContainerNames[i]) {
            if (current_previousContainerNames[i] == movedWorkItemName) {
              this.updateWorkItem_PanelName_Position(current_previousContainerNames[i], containerPanelName, i);
            } else {
              this.updateWorkItem_Position(current_previousContainerNames[i], i);
            }
          }
        }
      }

      // !DUPLICADO
      hayDesbordamiento = current_containerNames_length > previous_containerNames_length;

      // Vamos actualizando la posición de los workItems, si ésta ha cambiado
      // es decir, en la posición que corresponda cambian los nombres
      for (let i = 0; i < current_containerNames_length; i++) {
        if (i == (current_containerNames_length - 1)  &&  hayDesbordamiento) {
          // Si hay desbordamiento y se ha alcanzado la última posición de current
          if (current_containerNames[i] == movedWorkItemName) {
            this.updateWorkItem_PanelName_Position(current_containerNames[i], containerPanelName, i);
          } else {
            this.updateWorkItem_Position(current_containerNames[i], i);
          }
        } else {
          if (current_containerNames[i] != previous_containerNames[i]) {
            if (current_containerNames[i] == movedWorkItemName) {
              this.updateWorkItem_PanelName_Position(current_containerNames[i], containerPanelName, i);
            } else {
              this.updateWorkItem_Position(current_containerNames[i], i);
            }
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
        position: 0
      };
      
      return emptyWorkItem;
    }
  }
  
}
