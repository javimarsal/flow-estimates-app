import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkItem } from 'src/app/models/work-item';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Models
import { Tag } from '../models/tag';

@Injectable({
  providedIn: 'root'
})

export class WorkItemService {
  URL_API = `${environment.URL_API}/api/workitems`;

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

  deleteWorkItem(id?: string): Observable<any> {
    return this.http.delete(`${this.URL_API}/${id}`);
  }

  getTags(workItemId: string): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.URL_API}/${workItemId}/tags`);
  }

  addTag(workItemId: string, tag: Tag) {
    return this.http.put(`${this.URL_API}/${workItemId}/tags`, tag);
  }

  removeTag(workItemId: string, tagId?: string) {
    return this.http.delete(`${this.URL_API}/${workItemId}/tags/${tagId}`);
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

  getWorkItemByIdNumber(workItemList: WorkItem[], idNumber: number): WorkItem {
    // Buscamos el workItem en la lista dada
    let workItem = workItemList.find(wI => wI.idNumber == idNumber)

    if (workItem) {
      return workItem;
    }
    else {
      let emptyWorkItem: WorkItem = {
        idNumber: 0,
        title: '',
        panel: '',
        position: 0,
        panelDateRegistry: [{
          panel: '',
          date: new Date()
        }]
      };
      
      return emptyWorkItem;
    }
  }

}
