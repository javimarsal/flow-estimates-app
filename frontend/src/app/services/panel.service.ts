import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Panel } from 'src/app/models/panel';

@Injectable({
  providedIn: 'root'
})

export class PanelService {

  URL_API = 'http://localhost:4000/api/panels';

  panels: Panel[] = [];

  constructor(private http: HttpClient) { }

  getPanels() {
    return this.http.get<Panel[]>(this.URL_API);
  }

  updatePanel(panel: Panel) {
    return this.http.put(this.URL_API + `/${panel._id}`, panel);
  }

}
