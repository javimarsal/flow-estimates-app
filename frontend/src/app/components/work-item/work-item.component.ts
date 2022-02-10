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
  // TODO: recibir el nombre del panel (componente padre)
  // @Input() panelName: string;

  private workItems: WorkItem[] = [];

  private allWorkItems: WorkItem[] = [];

  workItemNames: string[] = [];

  panelName: string = '';

  constructor(public workItemService: WorkItemService, private elRef: ElementRef) { }

  ngOnInit(): void {
    this.panelName = this.elRef.nativeElement.parentElement.id;
    this.getWorkItems();

    this.workItemService.getWorkItems$().subscribe(workItems => {
      this.allWorkItems = workItems;
      this.workItems = this.filterWorkItems(workItems);
    });
  }

  // GET WorkItems
  getWorkItems() {
    this.workItemService.getWorkItems().subscribe(
      res => {
        // Le llegan todos los workitems
        // Filtrar por el tablero que le corresponde y guardarlos
        let filteredWorkItems = this.filterWorkItems(res);

        this.workItems = filteredWorkItems;
        this.allWorkItems = res;

        this.workItemNames = this.getNames(filteredWorkItems);
      },
      err => console.log(err)
    )
  }

  // PUT WorkItem
  updateWorkItem(workItem?: WorkItem) {
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
    // Actualizar las dos variables
    // this.workItems = Parent.getworkItems()
    // this.allWorkItems = Parent.getAllWorkItems

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

      /* Obtener la lista de datos de los contenedores (después del movimiento) */
      // Lista desde donde movemos el workItem (primer panel)
      let fromList = event.previousContainer.data;

      // Lista hacia donde movemos el workItem (segundo panel)
      let toList = event.container.data;

      /* Nombre de los paneles */
      // Nombre del panel desde donde movemos el workItem
      let fromPanelName = event.previousContainer.id;

      // Nombre del panel hacia donde movemos el workItem
      let toPanelName = event.container.id;

      // Texto del workItem que movemos
      let movedWorkItemName = event.item.element.nativeElement.innerText;

      // console.log("fromList:")
      // console.log(fromPanelName)
      // console.log(fromList)
      // console.log("toList:")
      // console.log(toPanelName)
      // console.log(toList)

      /* Actualizar el panel del workItem que movemos */
      // Obtenemos el workItem
      let workItem = this.getWorkItemByName(this.allWorkItems, movedWorkItemName);
      
      // Cambiamos su panel
      this.changePanel(workItem, toPanelName);

      // Lo actualizamos en la bbdd
      this.updateWorkItem(workItem);
      

      /* Actualizar los workItems de los 2 paneles */
      // Actualizar los workItems del primer panel
      this.updateWorkItems_Position(this.allWorkItems, fromList);

      // Actualizar los workItems del segundo panel
      this.updateWorkItems_Position(this.allWorkItems, toList);

      console.log(this.allWorkItems);

      // this.wI$ = of(this.allWorkItems);

      this.workItemService.sendWorkItems(this.allWorkItems);
      
    }
    // PRUEBAS
    console.log(`PreviousContainer: ${event.previousContainer.id}`)
    console.log(`Container: ${event.container.id}`)
    console.log(`PreviousIndex: ${event.previousIndex}`);
    console.log(`CurrentIndex: ${event.currentIndex}`);
    console.log(this.allWorkItems)
    
    
  }

  // sendMessage(): void {
  //   // send message to subscribers via observable subject
  //   this.workItemService.sendMessage(this.allWorkItems);
  // }

  updateWorkItems_Position(workItemList: WorkItem[], workItemNamesList: string[]) {
    // Recorremos la lista de nombres de workItems
    for (let i=0; i<workItemNamesList.length; i++) {
      // Usamos el nombre (string) para encontrar el objeto WorkItem
      let workItem = workItemList.find(wI => wI.name == workItemNamesList[i]);
      
      // Si su posición ha cambiado actualizamos el objeto
      if (workItem?.position != i  &&  workItem) {
        // Cambiamos la posición del objeto
        workItem.position = i;

        // Actualizamos el objeto en la bbdd
        this.updateWorkItem(workItem);
      }
    }
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

  changePosition(workItem: WorkItem, newPosition: number) {
    workItem.position = newPosition;

    //return workItem;
  }

  changePanel(workItem: WorkItem, newPanel: string) {
    workItem.panel = newPanel;

    //return workItem;
  }
}
