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
        console.log(this.panelService.panels)
      },
      err => console.log(err)
    )
  }

  updatePanel(panel: Panel) {
    this.panelService.updatePanel(panel).subscribe(
      res => console.log(res),
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

    // Actualizar la posición del panel si este cambia de posición
    if(event.previousIndex != event.currentIndex){
      // Necesitamos el panel que queremos actualizar      
      let panel: Panel;

      // Obtenemos la posición del panel (antes de moverse)
      let previousPosition = event.previousIndex;

      // Posición a la que se mueve el panel
      let currentPosition = event.currentIndex;
      
      // Buscamos el Objeto Panel en el array panelService.panels
      panel = this.getPanelByPosition(previousPosition, currentPosition);

      // Actualizamos el panel en la bbdd
      this.updatePanel(panel);
      
      // Actualizar la posición del resto de paneles que se ven afectados
      
    }

    
  }

  getPanelByPosition(previousPosition: number, currentPosition: number): Panel {
    // Panel que devolvemos
    let panel: Panel = {
      name: '',
      position: 0
    };

    // Buscamos el Objeto Panel en el array panelService.panels
    for(let p of this.panelService.panels) {
      // Si encontramos la misma posición es el panel que buscamos
      if(p.position == previousPosition) {
        // Hemos encontrado el Objeto Panel
        panel = p;

        // Cambiamos su posición por la nueva a la que va (p de this.panelService.panels también cambia su posición)
        panel.position = currentPosition;

        return panel;
      }
    }

    return panel;
  }

}
