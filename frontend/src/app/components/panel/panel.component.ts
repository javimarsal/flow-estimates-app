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

  setPanelService_Panels(panels: Panel[]) {
    this.panelService.panels = panels;
  }

  getPanels() {
    this.panelService.getPanels().subscribe(
      res => {
        //this.panelService.panels = res;
        this.setPanelService_Panels(res);
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

  updateAffectedPanels(idMovedPanel: string | undefined, previousPosition: number, currentPosition: number): Panel[] {
    // Paneles que devolvemos para luego actualizar this.panelService.panels
    let updatedPanels: Panel[] = [];
    
    for(let p of this.panelService.panels) {
      // No vamos a actualizar el panel que hemos movido (porque ya está actualizado)
      if(p._id != idMovedPanel) {
        let panelToBeUpdated: Panel = {
          _id: p._id,
          name: p.name,
          position: p.position
        };

        // Si currentPosition > previousPosition (hay que restar --)
        if(currentPosition > previousPosition) {
          if(panelToBeUpdated.position>=previousPosition && panelToBeUpdated.position<=currentPosition) {
            panelToBeUpdated.position--;

            // Actualizamos el panel
            this.updatePanel(panelToBeUpdated);
          }
        }
        
        // Si currentPosition < previousPosition (hay que sumar ++)
        if(currentPosition < previousPosition) {
          if(panelToBeUpdated.position>=currentPosition && panelToBeUpdated.position<=previousPosition) {
            panelToBeUpdated.position++;

            // Actualizamos el panel
            this.updatePanel(panelToBeUpdated);
          }
        }

        updatedPanels.push(panelToBeUpdated);
      }

    }
    
    return updatedPanels;
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
      let updatedPanels = this.updateAffectedPanels(panel._id, previousPosition, currentPosition);

      updatedPanels.push(panel)

      // Actualizar this.panelService.panels
      this.setPanelService_Panels(updatedPanels);
      
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
        panel._id = p._id;
        panel.name = p.name;
        panel.position = p.position;

        // Cambiamos su posición por la nueva a la que va (p de this.panelService.panels también cambia su posición)
        panel.position = currentPosition;

        return panel;
      }
    }

    return panel;
  }

}
