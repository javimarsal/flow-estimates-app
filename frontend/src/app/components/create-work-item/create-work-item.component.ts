import { Component, OnInit, Input } from '@angular/core';
import { WorkItem } from 'src/app/models/work-item';
import { WorkItemService } from 'src/app/services/work-item.service';
import { WorkItemComponent } from '../work-item/work-item.component';

@Component({
  selector: 'app-create-work-item',
  templateUrl: './create-work-item.component.html',
  styleUrls: ['./create-work-item.component.css']
})

export class CreateWorkItemComponent implements OnInit {
  @Input() panelName!: string ;
  // Valor del input
  value = '';
  nameExist !: Boolean;

  allWorkItems!: WorkItem[];
  @Input() workItemComponent!: WorkItemComponent;

  constructor(public workItemService: WorkItemService) { }

  ngOnInit(): void {
  }

  async createWorkItem() {
    // Creamos un nuevo WorkItem si value no está vacío
    if (this.value == '') {
      return;
    }

    // Eliminar espacios no deseados en el valor del input
    this.value = this.value.replace(/\s+/g,' ').trim();

    /* Actualizamos la posición del resto de workItems del panel. Lo hacemos antes para que no afecte al nuevo workItem */
    // Obtenemos todos los workItems
    await this.getWorkItems();

    // Comprobar que el nombre del nuevo workItem no coincide con ninguno de los existentes
    if (this.checkPanelNameExist(this.allWorkItems, this.value)) {
      this.nameExist = true;
      return;
    }

    // Obtenemos los que pertenecen al panel actual
    let workItemsOfPanel = this.filterWorkItems_ByPanelName(this.allWorkItems, this.panelName);

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

    // Creamos el objeto en la bdd, y borramos el contenido de value (en finally)
    await this.workItemService.createWorkItem(newWorkItem).toPromise()
      .then(res => console.log(res))
      .catch(err => console.log(err))
      .finally(() => this.value = '');
    
    // Llamamos al método getWorkItems() del componente workItem para que actualice su lista
    this.workItemComponent.getWorkItems();
  }

  async getWorkItems() {
    try {
      this.allWorkItems = await this.workItemService.getWorkItems().toPromise();
    } catch (err) {
      console.log(err);
    }
  }

  async updateWorkItem(workItem: WorkItem) {
    await this.workItemService.updateWorkItem(workItem).toPromise()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName)
  }

  increasePositionByOne_ofWorkItems(workItems: WorkItem[]) {
    for (let wI of workItems) {
      // Incrementar en 1 su posición
      wI.position++;

      // Actualizarlo en la bdd
      this.updateWorkItem(wI);
    }
  }

  checkPanelNameExist(workItems: WorkItem[], workItemName: string) {
    for (let wI of workItems) {
      // Convertir los string a lowercase para también cubrir esa posibilidad
      let wINamelw = wI.name.toLowerCase();
      let workItemNamelw = workItemName.toLowerCase();

      if (wINamelw == workItemNamelw) {
        // Si encuentra el nombre
        return true
      }
    }
    // Si no encuentra el nombre, devolvemos false
    return false
  }

}
