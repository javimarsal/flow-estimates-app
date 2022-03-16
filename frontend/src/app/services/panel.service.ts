import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Panel } from 'src/app/models/panel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PanelService {

  URL_API = `${environment.URL_API}/api/panels`;

  constructor(private http: HttpClient) { }

  getPanels() {
    return this.http.get<Panel[]>(this.URL_API);
  }

  updatePanel(panel: Panel) {
    return this.http.put(this.URL_API + `/${panel._id}`, panel);
  }

}
