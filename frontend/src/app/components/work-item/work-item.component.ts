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

  getWorkItems() {
    this.workItemService.getWorkItems().subscribe(
      res => {
        // Le llegan todos los workitems
        // Filtrar por el tablero que le corresponde y guardarlos en this.workItemNames
        //this.workItemNames = this.filterWorkItems(res);
        
        this.workItemService.workItems = this.filterWorkItems(res);
        
        for(let item of this.workItemService.workItems) {
          this.workItemNames.push(item.name)
          //console.log(`id: ${item._id}, name: ${item.name}, panel: ${item.panel}`)
        }
        //this.workItemNames = this.workItemService.workItems.map(obj=>obj.name);
      },
      err => console.log(err)
    )
  }

  updatePanelOfWorkItem() {
    // hay que actualizar el panel del workItem

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


  drop(event: CdkDragDrop<string[]>) {
    if(event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // Actualizar la posición del workItem
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
}
