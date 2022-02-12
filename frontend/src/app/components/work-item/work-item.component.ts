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
  updateWorkItem(workItem?: WorkItem) {
    this.workItemService.updateWorkItem(workItem).subscribe();
  }

  // Actualizar el workItem cuyo nombre coincida
  updateWorkItem_Position(workItemName: string, newPosition: number) {
    this.workItemService.getWorkItem_ByName(workItemName).subscribe(workItem => {
      workItem.position = newPosition;
      this.updateWorkItem(workItem);
    })
  }

  updateAffectedWorkItems(idMovedWorkItem: string | undefined, previousPosition: number, currentPosition: number) {
    for (let wI of this.workItemsOfPanel) {
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

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName);
  }

  getWorkItemsNames(workItems: WorkItem[]): string[] {
    return this.workItemService.getWorkItemsNames(workItems);
  }


  drop(event: CdkDragDrop<string[]>) {
    //let workItemName = event.item.element.nativeElement.innerText;

    if(event.previousContainer === event.container) {
      // Hacemos una copia de this.workItemsOfPanel_Names (sin referencia) porque al realizarse "moveItemInArray" también cambia this.workItemsOfPanel_Names y queremos obtener el estado antes de realizar ningún movimiento
      let previousOrderNames = JSON.parse(JSON.stringify(this.workItemsOfPanel_Names));

      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // Debemos comprobar que el índice del workItem cambia para ejecutar la acción
      if (event.previousIndex != event.currentIndex) {
        // Estado actual del panel (nombres)
        let currentOrderNames = event.container.data;
        console.log(currentOrderNames)
  
        // Estado previo del panel (nombres)
        //let previousOrderNames = this.workItemsOfPanel_Names;
        console.log(previousOrderNames)
  
        // Longitud del array de nombres
        let orderNamesLength = currentOrderNames.length;
  
        for (let i = 0; i < orderNamesLength; i++) {
          if (currentOrderNames[i] != previousOrderNames[i]) {
            console.log('true')
            this.updateWorkItem_Position(currentOrderNames[i], i);
          }
        }
      }
    }

    else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      
      console.log(event.container.data)
      console.log(event.previousContainer.data)
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
    console.log(this.workItemsOfPanel)
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
    for (let wI of this.workItemsOfPanel) {
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
