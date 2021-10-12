import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Services
import { PanelService } from 'src/app/services/panel.service';

// Models
import { Panel } from 'src/app/models/panel';


@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})

export class PanelComponent implements OnInit {

  panelNames: string[] = [];

  constructor(public panelService: PanelService) { }

  ngOnInit(): void {
    this.getPanels();
  }

  getPanels() {
    this.panelService.getPanels().subscribe(
      res => {
        this.panelService.panels = res;
        this.panelNames = this.getNames(res);
      },
      err => console.log(err)
    )
  }

  getNames(panels: Panel[]) {
    let panelNames: string[] = [];

    // Ordenar los paneles por el número de posición
    let sortedPanelsbyPosition = this.sortPanels(panels);

    // Obtiene el nombre de cada panel
    for(let panel of sortedPanelsbyPosition) {
      panelNames.push(panel.name);
    }

    return panelNames;
  }

  // Ordena los panels según el número de posición
  sortPanels(panels: Panel[]): Panel[] {
    return panels.sort(function(a, b) {
      return a.position - b.position;
    });
  }


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.panelNames, event.previousIndex, event.currentIndex);

    // Actualizar la posición del panel
  }
}
