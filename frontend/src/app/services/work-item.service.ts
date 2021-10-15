import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkItem } from 'src/app/models/work-item';

@Injectable({
  providedIn: 'root'
})
export class WorkItemService {

  URL_API = 'http://localhost:4000/api/workitems';

  workItems: WorkItem[] = [];

  constructor(private http: HttpClient) { }

  getWorkItems() {
    return this.http.get<WorkItem[]>(this.URL_API);
  }

  updateWorkItem(workItem: WorkItem) {
    return this.http.put(this.URL_API + `/${workItem._id}`, workItem);
  }

}
