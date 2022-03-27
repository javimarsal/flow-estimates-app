import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { WorkItem } from 'src/app/models/work-item';

// Servicios
import { ProjectService } from 'src/app/services/project.service';
import { WorkItemService } from 'src/app/services/work-item.service';

@Component({
  selector: 'app-work-item',
  templateUrl: './work-item.component.html',
  styleUrls: ['./work-item.component.css']
})
export class WorkItemComponent implements OnInit {
  editing: boolean = false;

  @Input() workItemName: string = '';

  projectId: any = '';

  // Obtener el id del workItem (para pasárselo al componente update-delete)
  workItem!: WorkItem;

  constructor(private projectService: ProjectService, private workItemService: WorkItemService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getProjectId();
    this.getWorkItemsOfProject();
  }

  // INICIALIZAR EL COMPONENTE
  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  getWorkItemsOfProject() {
    this.projectService.getWorkItems(this.projectId).toPromise()
      .then(workItems => {
        this.workItem = this.getWorkItemByName(workItems, this.workItemName);
      })
      .catch(error => console.log(error));
  }

  getWorkItemByName(workItemList: WorkItem[], name: string): WorkItem {
    return this.workItemService.getWorkItemByName(workItemList, name);
  }

  // EDITAR Y ELIMINAR WorkItem
  edit() {
    this.editing = true;
  }

}
