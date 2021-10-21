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
  private workItems: WorkItem[] = [];

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
        //console.log(filteredWorkItems)
        this.workItems = filteredWorkItems;
        console.log(this.workItems);
        //this.setWorkItemService_WorkItems(filteredWorkItems);
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

  updateAffectedWorkItems(idMovedWorkItem: string | undefined, previousPosition: number, currentPosition: number) {
    
    for (let wI of this.workItems) {
      // No vamos a actualizar el workItem que hemos movido (porque ya está actualizado)
      if (wI._id != idMovedWorkItem) {
        
        // Si currentPosition > previousPosition (hay que restar --)
        if (currentPosition > previousPosition) {
          if (wI.position>=previousPosition && wI.position<=currentPosition) {
            wI.position--;

            // Actualizamos el workItem
            this.updateWorkItem(wI);
          }
        }
        
        // Si currentPosition < previousPosition (hay que sumar ++)
        if (currentPosition < previousPosition) {
          if (wI.position>=currentPosition && wI.position<=previousPosition) {
            wI.position++;

            // Actualizamos el workItem
            this.updateWorkItem(wI);
          }
        }

      }

    }
    
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
    console.log(this.panelName)
    //console.log(this.workItemService.workItems)

    if(event.previousContainer === event.container) {
      console.log(this.workItems)
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
        workItem = this.getWorkItemByPosition(previousPosition);

        // Actualizamos su posición
        //workItem = this.changePosition(workItem, currentPosition);
        this.changePosition(workItem, currentPosition);

        // Actualizamos el workItem en la bbdd
        this.updateWorkItem(workItem);
        
        // Actualizar la posición del resto de workItems que se ven afectados
        //let updatedWorkItems = this.updateAffectedWorkItems(workItem._id, previousPosition, currentPosition);
        this.updateAffectedWorkItems(workItem._id, previousPosition, currentPosition);

        // Agregamos el workItem que movemos para...
        //updatedWorkItems.push(workItem);

        // Actualizar this.workItemService.workItems
        //!(le viene vacío)
        //this.setWorkItemService_WorkItems(updatedWorkItems);
        console.log(this.workItems)
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

  getWorkItemByPosition(previousPosition: number): WorkItem {
    // Buscamos el Objeto WorkItem que hemos movido en this.workItems
    for (let wI of this.workItems) {
      // Si encontramos la misma posición es el workItem que buscamos
      if (wI.position == previousPosition) {
        console.log("true")
        
        // Devolvemos el objeto
        return wI;
      }
    }

    // Si no encontrasemos el objeto, devolvemos un workItem vacío
    let emptyWorkItem: WorkItem = {
      name: '',
      panel: '',
      position: 0
    };
    
    return emptyWorkItem;
  }

  changePosition(workItem: WorkItem, newPosition: number) {
    workItem.position = newPosition;

    //return workItem;
  }

  changePanel(workItem: WorkItem, newPanel: string) {
    workItem.panel = newPanel;

    //return workItem;
  }
}
