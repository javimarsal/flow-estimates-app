import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Modelos
import { Panel } from '../models/panel';
import { WorkItem } from '../models/work-item';
import { Tag } from '../models/tag';
import { Project } from '../models/project';

@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  URL_API = `${environment.URL_API}/api/projects`;

  constructor(private http: HttpClient) { }

  getProject(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.URL_API}/${projectId}`);
  }

  updateProject(project: Project): Observable<any> {
    return this.http.put(`${this.URL_API}/${project._id}`, project);
  }

  createProject(uid: string, project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.URL_API}/${uid}`, project);
  }

  deleteProject(projectId?: string): Observable<any> {
    return this.http.delete(`${this.URL_API}/${projectId}`);
  }

  getPanels(projectId: string): Observable<Panel[]> {
    return this.http.get<Panel[]>(`${this.URL_API}/${projectId}/panels`);
  }

  getWorkItems(projectId: string): Observable<WorkItem[]> {
    return this.http.get<WorkItem[]>(`${this.URL_API}/${projectId}/workitems`);
  }

  getTags(projectId: string): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.URL_API}/${projectId}/tags`);
  }

  addPanel(projectId: string, panel: Panel) {
    return this.http.put(`${this.URL_API}/${projectId}/panels`, panel);
  }

  addWorkItem(projectId: string, workItem: WorkItem) {
    return this.http.put(`${this.URL_API}/${projectId}/workitems`, workItem);
  }

  addTag(projectId: string, tag: Tag) {
    return this.http.put(`${this.URL_API}/${projectId}/tags`, tag);
  }

  removePanel(projectId: string, panelId?: string) {
    return this.http.delete(`${this.URL_API}/${projectId}/panels/${panelId}`);
  }

  removeWorkItem(projectId: string, workItemId?: string) {
    return this.http.delete(`${this.URL_API}/${projectId}/workitems/${workItemId}`);
  }

  removeTag(projectId: string, tagId?: string) {
    return this.http.delete(`${this.URL_API}/${projectId}/tags/${tagId}`);
  }
}
