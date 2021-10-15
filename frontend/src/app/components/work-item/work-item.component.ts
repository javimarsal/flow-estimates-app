import { Component, OnInit } from '@angular/core';
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
  
  workItemNames: string[] = [];

  panelName: string = '';

  constructor(public workItemService: WorkItemService, private elRef: ElementRef) { }

  ngOnInit(): void {
    this.panelName = this.elRef.nativeElement.parentElement.id;
    this.getWorkItems();
  }

  setWorkItemService_WorkItems(workItems: WorkItem[]) {
    this.workItemService.workItems = workItems;
    console.log(this.workItemService.workItems);
  }

  getWorkItems() {
    this.workItemService.getWorkItems().subscribe(
      res => {
        // Le llegan todos los workitems
        // Filtrar por el tablero que le corresponde y guardarlos
        let filteredWorkItems = this.filterWorkItems(res);
        console.log(filteredWorkItems)
        this.setWorkItemService_WorkItems(filteredWorkItems);
        this.workItemNames = this.getNames(filteredWorkItems);
        
        //this.workItemNames = this.workItemService.workItems.map(obj=>obj.name);
      },
      err => console.log(err)
    )
  }

  updateWorkItem(workItem: WorkItem) {
    this.workItemService.updateWorkItem(workItem).subscribe(
      res => console.log(res),
      err => console.log(err)
    )
  }

  updateAffectedWorkItems(idMovedWorkItems: string | undefined, previousPosition: number, currentPosition: number): WorkItem[] {
    // WorkItems que devolvemos para luego actualizar this.workItemService.panels
    let updatedWorkItems: WorkItem[] = [];
    
    for(let wI of this.workItemService.workItems) {
      // No vamos a actualizar el workItem que hemos movido (porque ya está actualizado)
      if(wI._id != idMovedWorkItems) {
        let workItemToBeUpdated: WorkItem = {
          _id: wI._id,
          name: wI.name,
          panel: wI.panel,
          position: wI.position
        };

        // Si currentPosition > previousPosition (hay que restar --)
        if(currentPosition > previousPosition) {
          if(workItemToBeUpdated.position>=previousPosition && workItemToBeUpdated.position<=currentPosition) {
            workItemToBeUpdated.position--;

            // Actualizamos el workItem
            this.updateWorkItem(workItemToBeUpdated);
          }
        }
        
        // Si currentPosition < previousPosition (hay que sumar ++)
        if(currentPosition < previousPosition) {
          if(workItemToBeUpdated.position>=currentPosition && workItemToBeUpdated.position<=previousPosition) {
            workItemToBeUpdated.position++;

            // Actualizamos el workItem
            this.updateWorkItem(workItemToBeUpdated);
          }
        }

        updatedWorkItems.push(workItemToBeUpdated);
      }

    }
    
    return updatedWorkItems;
  }

  filterWorkItems(workItems: WorkItem[]): WorkItem[] {
    // Nombre del id del panel en el que nos encontramos
    let panelName = this.panelName;

    // array de string donde guardaremos los nombres de los workItems
    let workItemsOfPanel: WorkItem[] = [];

    for(let workItem of workItems) {
      // Panel que le corresponde al workItem
      let workItemPanel = workItem.panel;

      // Si el panel del workItem corresponde con el que nos encontramos, lo guardamos
      if(workItemPanel == panelName) {
        workItemsOfPanel.push(workItem);
      }
    }

    return workItemsOfPanel;
  }

  getNames(workItems: WorkItem[]): string[] {
    let workItemsNames: string[] = [];

    // Ordenar los workItems por el número de posición
    let sortedWorkItemsbyPosition = this.sortWorkItems(workItems);

    // Obtiene el nombre de cada workItem
    for(let workItem of sortedWorkItemsbyPosition) {
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
    //! la lista está vacía
    console.log(this.workItemService.workItems)

    if(event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // Actualizar la posición del workItem
      // Comprobar que el workItem cambia de posición
      if(event.previousIndex != event.currentIndex) {
        // Necesitamos el workItem que queremos actualizar      
        let workItem: WorkItem;

        // Obtenemos la posición del workItem (antes de moverse)
        let previousPosition = event.previousIndex;

        // Posición a la que se mueve el workItem
        let currentPosition = event.currentIndex;
        
        // Buscamos el Objeto WorkItem en el array workItemService.workItems
        workItem = this.getWorkItemByPosition(previousPosition, currentPosition);

        // Actualizamos su posición
        workItem = this.changePosition(workItem, currentPosition);

        // Actualizamos el workItem en la bbdd
        this.updateWorkItem(workItem);
        
        // Actualizar la posición del resto de workItems que se ven afectados
        let updatedWorkItems = this.updateAffectedWorkItems(workItem._id, previousPosition, currentPosition);

        // Agregamos el workItem que movemos para...
        updatedWorkItems.push(workItem);

        // Actualizar this.workItemsService.workItems
        //!(le viene vacío)
        this.setWorkItemService_WorkItems(updatedWorkItems);
      }
    }

    else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      // Actualizar la posición y el panel del workItem
    }
    // PRUEBAS
    console.log(`PreviousContainer: ${event.previousContainer.id}`)
    console.log(`Container: ${event.container.id}`)
    console.log(`PreviousIndex: ${event.previousIndex}`);
    console.log(`CurrentIndex: ${event.currentIndex}`);
    
  }

  getWorkItemByPosition(previousPosition: number, currentPosition: number): WorkItem {
    // WorkItem que devolvemos
    let workItem: WorkItem = {
      name: '',
      panel: '',
      position: 0
    };

    // Buscamos el Objeto WorkItem en el array workItemService.workItems
    console.log(this.workItemService.workItems)
    for(let wI of this.workItemService.workItems) {
      // Si encontramos la misma posición es el workItem que buscamos
      if(wI.position == previousPosition) {
        console.log("true")
        // Hemos encontrado el Objeto WorkItem
        workItem._id = wI._id;
        workItem.name = wI.name;
        workItem.panel = wI.panel;
        workItem.position = wI.position;

        return workItem;
      }
    }

    return workItem;
  }

  changePosition(workItem: WorkItem, newPosition: number): WorkItem {
    workItem.position = newPosition;

    return workItem;
  }

  changePanel(workItem: WorkItem, newPanel: string): WorkItem {
    workItem.panel = newPanel;

    return workItem;
  }
}
