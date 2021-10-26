import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkItem } from 'src/app/models/work-item';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkItemService {
  workItems: WorkItem[];
  workItems$: Subject<WorkItem[]>;


  URL_API = 'http://localhost:4000/api/workitems';

  //workItems: WorkItem[] = [];

  constructor(private http: HttpClient) {
    this.workItems = [];
    this.workItems$ = new Subject();
  }

  sendWorkItems(workItems: WorkItem[]) {
    this.workItems$.next(workItems);
  }

  getWorkItems$(): Observable<WorkItem[]> {
    return this.workItems$.asObservable();
  }

  getWorkItems() {
    return this.http.get<WorkItem[]>(this.URL_API);
  }

  updateWorkItem(workItem?: WorkItem) {
    return this.http.put(this.URL_API + `/${workItem?._id}`, workItem);
  }

}
