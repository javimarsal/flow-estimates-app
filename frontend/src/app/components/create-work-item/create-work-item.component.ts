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
  value = '';

  constructor(private workItemService: WorkItemService) { }

  ngOnInit(): void {
  }

  createWorkItem() {
    // Creamos un nuevo WorkItem si value no está vacío
    if (this.value == '') {
      return;
    }

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

    // Creamos el objeto en la bbdd
    this.workItemService.createWorkItem(newWorkItem).subscribe(res => {
        console.log(res);
        // Al final, borrar el contenido de value
        this.value = ''
      }
      // TODO: Actualizamos la posición del resto de workItems del panel
    );
  }

}
