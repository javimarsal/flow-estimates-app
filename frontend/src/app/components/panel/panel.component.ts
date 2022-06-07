import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';

// Services
import { CookieService } from 'ngx-cookie-service';
import { PanelService } from 'src/app/services/panel.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';

// Models
import { Panel } from 'src/app/models/panel';
import { Tag } from 'src/app/models/tag';
import { WorkItem } from 'src/app/models/work-item';

// Material
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})

export class PanelComponent implements OnInit {
  userId: string = '';
  projectId: any = '';
  projectName: string = '';
  projectPanels: Panel[];
  panelNames: string[];
  projectTags: Tag[] = [];
  projectWorkItems: WorkItem[] = [];
  filteredProjectWorkItems: WorkItem[] = [];

  // utilizar el history para obtener los datos más rápido
  historyProjectName = history.state.projectName;
  historyProjectPanels = history.state.projectPanels;
  historyProjectTags = history.state.projectTags;
  historyProjectWorkItems = history.state.projectWorkItems;

  // Etiquetas
  separatorKeysCodes: number[] = [];
  filteredTags: Observable<string[]>;
  selectedTags: string[] = [];
  allTags: string[] = [];
  tagCtrl = new FormControl();

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  constructor(private route: ActivatedRoute, private projectService: ProjectService, public panelService: PanelService, private userService: UserService, private cookieService: CookieService, private router: Router) {
    this.panelNames = [];
    this.projectPanels = [];

    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) =>
        tag ? this._filter(tag) : this.allTags
      )
    );
  }

  async ngOnInit() {
    this.userId = this.cookieService.get('uid');

    // Si no ha usuario, volvemos a home y return
    if (!this.userId) {
      return this.router.navigate(['/']);
    }

    this.getProjectId();

    // Hay usuario, comprobar si le pertenece el proyecto
    let isAProjectOfUser = await this.userService.checkProjectExistInUserList(this.userId, this.projectId);

    if (!isAProjectOfUser) {
      return this.router.navigate(['/my-projects']);
    }
    
    // Obtener el nombre del proyecto para mostrarlo en la interfaz
    this.projectName = await this.getProjectName(this.projectId);

    // Cuando el usuario abre el proyecto, registramos el id en la propiedad openedProject del usuario
    try {
      await lastValueFrom(this.setOpenedProjectOfUser());
    }
    catch (error) {
      console.log(error)
    }
    
    // Obtenemos los paneles del proyecto
    this.projectPanels = await this.getProjectPanels(this.projectId);
    // y sacamos sus nombres
    this.panelNames = this.getNames(this.projectPanels);

    // Obtenemos los Tags del proyecto
    this.projectTags = await this.getProjectTags(this.projectId);

    // Obtenemos los workItems del proyecto
    this.projectWorkItems = await this.getProjectWorkItems(this.projectId);
    
    /* FILTRO DE ETIQUETAS */
    // copiamos la lista de workItems (que será modificada por el filtro)
    this.filteredProjectWorkItems = this.projectWorkItems.slice();
    // nos quedamos con los nombre de las etiquetas
    this.allTags = this.getTagsNamesOfProject(this.projectTags);

    return;
  }

  setProjectWorkItems(workItems: []) {
    this.projectWorkItems = workItems;
    this.filterProjectWorkItems(this.selectedTags);
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  getProject(projectId: string) {
    return this.projectService.getProject(projectId);
  }

  async getProjectName(projectId: string): Promise<string> {
    let projectName = '';

    if (this.historyProjectName) {
      projectName = this.historyProjectName;
    }
    else {
      try {
        let project = await lastValueFrom(this.getProject(projectId));
        projectName = project.name;
      }
      catch (error) {
        console.log(error);
      }
    }

    return projectName;
  }

  async getProjectPanels(projectId: string): Promise<Panel[]> {
    let projectPanels: Panel[] = [];

    if (this.historyProjectPanels && this.historyProjectPanels.length!=0) {
      projectPanels = this.historyProjectPanels;
    }
    else if (!this.historyProjectPanels || this.historyProjectPanels.length==0) {
      try {
        let panels = await lastValueFrom(this.projectService.getPanels(projectId));
        projectPanels = panels;
      }
      catch (error) {
        console.log(error);
      }
    }

    return projectPanels;
  }

  async getProjectTags(projectId: string): Promise<Tag[]> {
    let projectTags: Tag[] = [];

    if (this.historyProjectTags && this.historyProjectTags.length!=0) {
      projectTags = this.historyProjectTags;
    }
    else if (!this.historyProjectTags || this.historyProjectTags.length==0) {
      try {
        projectTags = await lastValueFrom(this.projectService.getTags(projectId));
      }
      catch (error) {
        console.log(error);
      }
    }

    return projectTags;
  }

  async getProjectWorkItems(projectId: string): Promise<WorkItem[]> {
    let projectWorkItems: WorkItem[] = [];

    if (this.historyProjectWorkItems && this.historyProjectWorkItems!=0) {
      projectWorkItems = this.historyProjectWorkItems;
    }
    else if (!this.historyProjectWorkItems || this.historyProjectWorkItems==0) {
      try {
        projectWorkItems = await lastValueFrom(this.projectService.getWorkItems(projectId));
      }
      catch (error) {
        console.log(error);
      }
    }

    return projectWorkItems;
  }

  setOpenedProjectOfUser() {
    let uid = this.cookieService.get('uid');
    return this.userService.setOpenedProject(this.projectId, uid)
  }

  async updatePanel(panel: Panel) {
    console.log(this.projectWorkItems)
    try {
      let res = await lastValueFrom(this.panelService.updatePanel(panel));
      // console.log(res);
    }
    catch (error) {
      console.log(error)
    }
  }

  updateAffectedPanels(idMovedPanel: string | undefined, previousPosition: number, currentPosition: number): Panel[] {
    // Paneles que devolvemos para luego actualizar this.panels
    let updatedPanels: Panel[] = [];
    
    for (let p of this.projectPanels) {
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
      this.projectPanels = updatedPanels;
    }

    
  }

  getPanelByPosition(targetPosition: number): Panel {
    // Objeto Panel vacío, por si no lo encontrase
    let panel: Panel = {
      name: '',
      position: 0
    };

    // Buscamos el Objeto Panel en el array this.panels
    for (let p of this.projectPanels) {
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

  /* ETIQUETAS */
  remove(tag: string): void {
    let index = this.selectedTags.indexOf(tag);

    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.allTags.push(tag);
    }

    this.filterProjectWorkItems(this.selectedTags);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let value = event.option.viewValue
    this.selectedTags.push(value);
    this.tagInput.nativeElement.value = '';
    
    this.tagCtrl.setValue(null);

    let indexOfValue = this.allTags.indexOf(value);
    this.allTags.splice(indexOfValue, 1);

    this.filterProjectWorkItems(this.selectedTags);
  }

  getTagsNamesOfProject(projectTags: Tag[]): string[] {
    let tagsNames: string[] = [];

    for (let tag of projectTags) {
      tagsNames.push(tag.name);
    }

    return tagsNames;
  }

  filterProjectWorkItems(selectedTagsNames: string[]) {
    // Comprobamos que se hayan seleccionado etiquetas
    if (selectedTagsNames.length == 0) {
      // Si no se ha seleccionado ninguna etiqueta el array filtrado es todo el conjunto de projectWorkItems
      this.filteredProjectWorkItems = this.projectWorkItems.slice();
      return;
    }
    
    let resultFilteredWorkItems: WorkItem[] = [];
    // Recorremos cada workItem del proyecto
    let projectWorkItems = this.projectWorkItems;
    for (let wI of projectWorkItems) {
      // Para comprobar si tiene todas las etiquetas seleccionadas
      let hasAllSelectedTags = true;

      let tagsOfwI: any = wI.tags;
      // Si el workItems no tiene etiquetas (undefined || length(0)) continuamos con la siguiente iteración 
      if (!tagsOfwI || tagsOfwI.length==0) continue;

      // Donde se van guardando las etiquetas seleccionadas que tiene el workItem
      let selectedTagsFound: string[] = [];

      for (let tag of tagsOfwI) {
        // Buscamos el _id de la etiqueta en el array projecTags
        let tagId = tag.tag.toString();
        // Ya tenemos el objeto Tag con todos sus parámetros
        let projectTag = this.projectTags.filter(t => t._id == tagId)[0];
        
        // Buscamos las etiquetas del wI en las etiquetas seleccionadas
        let selectedTagFound = selectedTagsNames.filter(t => t == projectTag.name)[0];
        
        // Guardamos la etiqueta que hemos encontrado
        if (selectedTagFound) selectedTagsFound.push(selectedTagFound);
      }

      // Si no están todas las etiquetas seleccionadas en el filtro en el workItem, no podemos añadirlo al resultado del filtro
      if (selectedTagsFound.length != selectedTagsNames.length) hasAllSelectedTags = false;

      // Si tiene todas las etiquetas seleccionadas, incluimos el workItem en el resultado del filtro
      if (hasAllSelectedTags) resultFilteredWorkItems.push(wI);
    }

    // Una vez tenemos las etiquetas filtradas, las asignamos a la variable
    // puede que no haya workItems filtrados
    this.filteredProjectWorkItems = resultFilteredWorkItems;
  }

  private _filter(value: string): string[] {
    let filterValue = value.toLowerCase();

    return this.allTags.filter((tag) => 
      tag.toLowerCase().includes(filterValue)
    );
  }

}
