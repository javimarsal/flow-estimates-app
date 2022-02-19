import { Component, OnInit, Input } from '@angular/core';
import { WorkItem } from 'src/app/models/work-item';
import { WorkItemService } from 'src/app/services/work-item.service';

@Component({
  selector: 'app-create-work-item',
  templateUrl: './create-work-item.component.html',
  styleUrls: ['./create-work-item.component.css']
})

export class CreateWorkItemComponent implements OnInit {
  @Input() panelName!: string ;
  // Valor del input
  value = '';

  allWorkItems: WorkItem[] = [];

  constructor(public workItemService: WorkItemService) { }

  ngOnInit(): void {
  }

  prueba() {
    this.getWorkItems();
    console.log(this.allWorkItems)
  }

  createWorkItem() {
    // Creamos un nuevo WorkItem si value no está vacío
    if (this.value == '') {
      return;
    }

    /* Actualizamos la posición del resto de workItems del panel. Lo hacemos antes para que no afecte al nuevo workItem */
    // Obtenemos todos los workItems
    this.getWorkItems();
    console.log(this.allWorkItems)

    // Obtenemos los que pertenecen al panel actual
    let workItemsOfPanel = this.filterWorkItems_ByPanelName(this.allWorkItems, this.panelName);
    console.log(workItemsOfPanel)

    // Incrementamos la posición de cada workItem en 1
    this.increasePositionByOne_ofWorkItems(workItemsOfPanel);

    // Nuevo objeto WorkItem
    let newWorkItem: WorkItem = {
      name: this.value,
      panel: this.panelName,
      position: 0,
      panelDateRegistry: [{
        panel: this.panelName,
        date: new Date()
      }]
    };

    // Creamos el objeto en la bdd
    this.workItemService.createWorkItem(newWorkItem).subscribe(res => {
        console.log(res);
        // Al final, borrar el contenido de value
        this.value = '';
      }
    );
  }

  getWorkItems() {
    this.workItemService.getWorkItems().subscribe(workItems => {
      this.allWorkItems = workItems;
    });
  }

  updateWorkItem(workItem: WorkItem) {
    this.workItemService.updateWorkItem(workItem).subscribe(
      res => console.log(res),
      err => console.log(err)
    );
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName)
  }

  increasePositionByOne_ofWorkItems(workItems: WorkItem[]) {
    for (let wI of workItems) {
      // Incrementar en 1 su posición
      console.log(wI.position)
      wI.position++;
      console.log(wI.position)

      // Actualizarlo en la bdd
      this.updateWorkItem(wI);
      break;
    }
  }

}
