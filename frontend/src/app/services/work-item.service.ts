import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkItem } from 'src/app/models/work-item';

@Injectable({
  providedIn: 'root'
})
export class WorkItemService {
  URL_API = 'http://localhost:4000/api/workitems';

  constructor(private http: HttpClient) { }

  getWorkItems() {
    return this.http.get<WorkItem[]>(this.URL_API);
  }

  updateWorkItem(workItem?: WorkItem) {
    return this.http.put(this.URL_API + `/${workItem?._id}`, workItem);
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    // array de WorkItem donde guardaremos los workItems, según el panelName
    let workItemsOfPanel: WorkItem[] = [];

    for(let workItem of workItems) {
      // Nombre del Panel que le corresponde al workItem
      let workItemPanel = workItem.panel;

      // Si el panel del workItem corresponde con panelName, lo guardamos
      if(workItemPanel == panelName) {
        workItemsOfPanel.push(workItem);
      }
    }

    return workItemsOfPanel;
  }

  getWorkItemsNames(workItems: WorkItem[]): string[] {
    let workItemsNames: string[] = [];

    // Ordenar los workItems por el número de posición
    let sortedWorkItems_ByPosition = this.sortWorkItems(workItems);

    // Obtiene el nombre de cada workItem
    for(let workItem of sortedWorkItems_ByPosition) {
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

}
