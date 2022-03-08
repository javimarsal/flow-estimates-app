import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Panel } from '../models/panel';

// Services
import { PanelService } from './panel.service';
import { WorkItemService } from './work-item.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  URL_API = 'http://localhost:4000/api/projects';

  constructor(private http: HttpClient) { }

  getPanels(projectId: string): Observable<Panel[]> {
    return this.http.get<Panel[]>(`${this.URL_API}/${projectId}/panels`);
  }
}
