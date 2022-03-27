import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Modelos
import { Panel } from '../models/panel';
import { WorkItem } from '../models/work-item';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  URL_API = `${environment.URL_API}/api/projects`;

  constructor(private http: HttpClient) { }

  getProject(projectId: string): Observable<Panel> {
    return this.http.get<Panel>(`${this.URL_API}/${projectId}`);
  }

  getPanels(projectId: string): Observable<Panel[]> {
    return this.http.get<Panel[]>(`${this.URL_API}/${projectId}/panels`);
  }

  getWorkItems(projectId: string): Observable<WorkItem[]> {
    return this.http.get<WorkItem[]>(`${this.URL_API}/${projectId}/workitems`);
  }

  addWorkItem(projectId: string, workItem: WorkItem) {
    return this.http.put(`${this.URL_API}/${projectId}/workitems`, workItem);
  }

  removeWorkItem(projectId: string, workItemId?: string) {
    return this.http.delete(`${this.URL_API}/${projectId}/workitems/${workItemId}`);
  }
}
