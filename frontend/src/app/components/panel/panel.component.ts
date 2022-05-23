import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { CookieService } from 'ngx-cookie-service';
import { PanelService } from 'src/app/services/panel.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';

// Models
import { Panel } from 'src/app/models/panel';
import { Tag } from 'src/app/models/tag';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})

export class PanelComponent implements OnInit {
  panelNames: string[];
  panels: Panel[];

  projectId: any = '';
  projectName: string = '';

  projectTags: Tag[] = [];

  constructor(private route: ActivatedRoute, private projectService: ProjectService, public panelService: PanelService, private userService: UserService, private cookieService: CookieService) {
    this.panelNames = [];
    this.panels = [];
  }

  async ngOnInit() {
    this.getProjectId();
    
    // Obtener el nombre del proyecto para mostrarlo en la interfaz
    try {
      let project = await lastValueFrom(this.getProject(this.projectId));
      this.projectName = project.name;
    }
    catch (error) {
      console.log(error)
    }

    // Cuando el usuario abre el proyecto, registramos el id en la propiedad openedProject del usuario
    try {
      let res = await lastValueFrom(this.setOpenedProjectOfUser());
      console.log(res);
    }
    catch (error) {
      console.log(error)
    }
    
    await this.getPanelsOfProject();

    await this.getProjectTags();
  }

  async getProjectTags() {
    this.projectTags = await lastValueFrom(this.projectService.getTags(this.projectId));
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  getProject(projectId: string) {
    return this.projectService.getProject(projectId);
  }

  setOpenedProjectOfUser() {
    let uid = this.cookieService.get('uid');
    return this.userService.setOpenedProject(this.projectId, uid)
  }

  async getPanelsOfProject() {
    try {
      let panels = await lastValueFrom(this.projectService.getPanels(this.projectId));
      this.panels = panels;
      this.panelNames = this.getNames(panels);
    }
    catch (error) {
      console.log(error)
    }
  }

  async updatePanel(panel: Panel) {
    try {
      let res = await lastValueFrom(this.panelService.updatePanel(panel));
      console.log(res);
    }
    catch (error) {
      console.log(error)
    }
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
    return this.panelService.getNames(panels);
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
