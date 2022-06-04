import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Models
import { Panel } from 'src/app/models/panel';

@Injectable({
  providedIn: 'root'
})

export class PanelService {

  URL_API = `${environment.URL_API}/api/panels`;

  constructor(private http: HttpClient) { }

  getPanels() {
    return this.http.get<Panel[]>(this.URL_API);
  }

  createPanel(panel: Panel): Observable<Panel> {
    return this.http.post<Panel>(this.URL_API, panel);
  }

  updatePanel(panel: Panel) {
    return this.http.put(this.URL_API + `/${panel._id}`, panel);
  }

  deletePanel(panelId: string) {
    return this.http.delete(`${this.URL_API}/${panelId}`);
  }

  getNames(panels: Panel[]): string[] {
    let panelNames: string[] = [];

    // Ordenar los paneles por el número de posición
    let sortedPanels_byPosition = this.sortPanels(panels);

    // Obtiene el nombre de cada panel
    for (let panel of sortedPanels_byPosition) {
      panelNames.push(panel.name);
    }

    return panelNames;
  }

  // Ordena los panels según el número de posición
  sortPanels(panels: Panel[]): Panel[] {
    return panels.sort(function (a, b) {
      return a.position - b.position;
    });
  }

}
