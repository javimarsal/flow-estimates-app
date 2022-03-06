import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkItem } from 'src/app/models/work-item';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WorkItemService {
  URL_API = 'http://localhost:4000/api/workitems';

  constructor(private http: HttpClient) { }

  getWorkItems(): Observable<WorkItem[]> {
    return this.http.get<WorkItem[]>(this.URL_API);
  }

  updateWorkItem(workItem: WorkItem): Observable<any> {
    return this.http.put(this.URL_API + `/${workItem._id}`, workItem);
  }

  createWorkItem(workItem: WorkItem): Observable<any> {
    return this.http.post(this.URL_API, workItem);
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    // array de WorkItem donde guardaremos los workItems, según el panelName
    let workItemsOfPanel: WorkItem[] = [];

    for(let workItem of workItems) {
      // Nombre del Panel que le corresponde al workItem
      let workItemPanel = workItem.panel;

      // Si el panel del workItem corresponde con panelName, lo guardamos
      if (workItemPanel == panelName) {
        workItemsOfPanel.push(workItem);
      }
    }

    return workItemsOfPanel;
  }

}
