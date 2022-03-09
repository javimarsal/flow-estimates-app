import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';

// Services
import { PanelService } from 'src/app/services/panel.service';
import { ProjectService } from 'src/app/services/project.service';

// Models
import { Panel } from 'src/app/models/panel';


@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})

export class PanelComponent implements OnInit {
  panelNames: string[];
  panels: Panel[];

  projectId: any = '';

  constructor(private route: ActivatedRoute, private projectService: ProjectService, public panelService: PanelService) {
    this.panelNames = [];
    this.panels = [];
  }

  ngOnInit(): void {
    this.getProjectId();
    this.getPanelsOfProject();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  getPanelsOfProject() {
    this.projectService.getPanels(this.projectId).toPromise()
      .then(panels => {
        this.panels = panels;
        this.panelNames = this.getNames(panels);
      })
      .catch(error => console.log(error));
  }

  updatePanel(panel: Panel) {
    this.panelService.updatePanel(panel).toPromise()
      .then(res => console.log(res))
      .catch(error => console.log(error));
  }

  updateAffectedPanels(idMovedPanel: string | undefined, previousPosition: number, currentPosition: number): Panel[] {
    // Paneles que devolvemos para luego actualizar this.panels
    let updatedPanels: Panel[] = [];
    
    for (let p of this.panels) {
      // No vamos a actualizar el panel que hemos movido (porque ya está actualizado)
      if (p._id != idMovedPanel) {
        let panelToBeUpdated: Panel = {
          _id: p._id,
          name: p.name,
          position: p.position
        };

        // Si currentPosition > previousPosition (hay que restar --)
        if (currentPosition > previousPosition) {
          if (panelToBeUpdated.position>=previousPosition && panelToBeUpdated.position<=currentPosition) {
            panelToBeUpdated.position--;

            // Actualizamos el panel
            this.updatePanel(panelToBeUpdated);
          }
        }
        
        // Si currentPosition < previousPosition (hay que sumar ++)
        if (currentPosition < previousPosition) {
          if (panelToBeUpdated.position>=currentPosition && panelToBeUpdated.position<=previousPosition) {
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


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.panelNames, event.previousIndex, event.currentIndex);

    // Actualizar la posición del panel si este cambia de posición
    if (event.previousIndex != event.currentIndex){
      // Necesitamos el panel que queremos actualizar      
      let panel: Panel;

      // Obtenemos la posición del panel (antes de moverse)
      let previousPosition = event.previousIndex;

      // Posición a la que se mueve el panel
      let currentPosition = event.currentIndex;
      
      // Buscamos el Objeto Panel en el array this.panels
      panel = this.getPanelByPosition(previousPosition);

      // Actualizamos la posición del panel
      panel = this.changePosition(panel, currentPosition);

      // Actualizamos el panel en la bbdd
      this.updatePanel(panel);
      
      // Actualizar la posición del resto de paneles que se ven afectados
      let updatedPanels = this.updateAffectedPanels(panel._id, previousPosition, currentPosition);

      // Agregamos el panel que movemos para...
      updatedPanels.push(panel);

      // Actualizar this.panels
      this.panels = updatedPanels;
    }

    
  }

  getPanelByPosition(targetPosition: number): Panel {
    // Objeto Panel vacío, por si no lo encontrase
    let panel: Panel = {
      name: '',
      position: 0
    };

    // Buscamos el Objeto Panel en el array this.panels
    for (let p of this.panels) {
      // Si encontramos la misma posición es el panel que buscamos
      if (p.position == targetPosition) {
        // Hemos encontrado el Objeto Panel y lo devolvemos
        return p;
      }
    }

    return panel;
  }

  changePosition(panel: Panel, newPosition: number): Panel {
    panel.position = newPosition;

    return panel;
  }

}
