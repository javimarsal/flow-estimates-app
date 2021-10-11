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
  panelNames: string[] = [];

  constructor(public workitemService: WorkItemService, private elRef: ElementRef) { }

  ngOnInit(): void {
    this.getWorkItems();
  }

  getWorkItems() {
    this.workitemService.getWorkItems().subscribe(
      res => {
        // Le llegan todos los workitems
        // Filtrar por el tablero que le corresponde y guardarlos en this.workItemNames
        this.workItemNames = this.filterWorkItems(res);
      },
      err => console.log(err)
    )
  }

  filterWorkItems(workItems: WorkItem[]): string[] {
    // Nombre del id del panel en el que nos encontramos
    let panelName = this.elRef.nativeElement.parentElement.id;

    // array de string donde guardaremos los nombres de los workItems
    let workItemNames: string[] = [];

    for(let workItem of workItems) {
      // Panel que le corresponde al workItem
      let workItemPanel = workItem.panel;

      // Si el panel del workItem corresponde con el que nos encontramos, lo guardamos
      if(workItemPanel == panelName) {
        workItemNames.push(workItem.name);
      }
    }

    return workItemNames;
  }


  drop(event: CdkDragDrop<string[]>) {
    if(event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
    // PRUEBAS
    console.log(`PreviousContainer: ${event.previousContainer.data}`)
    console.log(`Container: ${event.container.id}`)
    console.log(`PreviousIndex: ${event.previousIndex}`);
    console.log(`CurrentIndex: ${event.currentIndex}`);
  }
}
