import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, map, Observable, startWith } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';

// Services
import { CookieService } from 'ngx-cookie-service';
import { PanelService } from 'src/app/services/panel.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { WorkItemService } from 'src/app/services/work-item.service';

// Models
import { Panel } from 'src/app/models/panel';
import { Tag } from 'src/app/models/tag';
import { WorkItem } from 'src/app/models/work-item';

// Components
import { PanelDialogComponent } from '../panel-dialog/panel-dialog.component';

// Material
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

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

  // Límite de caracteres para el título de un nuevo panel
  characterLimitName: number;
  // Formulario para crear un nuevo panel
  form: FormGroup;

  // lista (diccionario) para saber qué panel es backlog
  backlogList: any = [];

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  constructor(private route: ActivatedRoute, private projectService: ProjectService, public panelService: PanelService, private userService: UserService, private workItemService: WorkItemService, private cookieService: CookieService, private router: Router, private fb: FormBuilder, private dialog: MatDialog) {
    this.panelNames = [];
    this.projectPanels = [];

    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) =>
        tag ? this._filter(tag) : this.allTags
      )
    );

    this.characterLimitName = 20;

    this.form = this.fb.group({
      name: ['']
    });
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

    // Obtener listado de backlog
    this.getBacklogList(this.projectPanels);

    return;
  }

  getBacklogList(panels: Panel[]) {
    for (let p of panels) {
      this.backlogList[p.name] = p.backlog;
    }
  }

  setProjectWorkItems(workItems: []) {
    console.log(workItems)
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
          position: p.position,
          backlog: p.backlog
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
      position: 0,
      backlog: false
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

  /* CREAR PANEL */
  async createPanel(formDirective: FormGroupDirective) {
    // Eliminar espacios no deseados
    let name = this.form.value.name.replace(/\s+/g,' ').trim();

    if (!name) return;

    // Crear el Panel
    let newPanel: Panel = {
      name: name,
      position: this.projectPanels.length,
      backlog: false
    }

    // panel de la base de datos para añadirlo a la lista del proyecto
    let panelDB!: Panel;

    try {
      panelDB = await lastValueFrom(this.panelService.createPanel(this.projectId, newPanel));
    }
    catch (error) {
      console.log(error);
    }

    // controlar que panelDB no sea undefine o similar
    if (!panelDB) {
      // si es undefine es porque no se ha podido crear debido a que existe otro panel con el mismo nombre
      this.changeInnerText('warning', 'No se puede crear el panel porque el nombre elegido ya está en uso.');
      return;
    }
    this.changeInnerText('warning', '');

    // Si panelDB no es undefine, significa que se ha podido crear y lo podemos añadir a la lista del proyecto
    try {
      await lastValueFrom(this.projectService.addPanel(this.projectId, panelDB));
    }
    catch (error) {
      console.log(error);
    }
    
    // Si todo ha ido bien, reseteamos el contenido del formulario
    formDirective.resetForm();
    this.form.reset({
      name: ''
    });

    this.projectPanels.push(panelDB);
    this.panelNames.push(name);

    // Añadir panel a la lista backlog
    this.backlogList[name] = false;
  }

  /* ELIMINAR PANEL */
  async deletePanel(panelId: string, panelName: string, panelPosition: number) {
    let projectId = this.projectId;
    /* Eliminamos el panel */
    await lastValueFrom(this.panelService.deletePanel(panelId));

    // Eliminamos el nombre de panelNames
    let panelNamesLength = this.panelNames.length;
    for (let i = 0; i < panelNamesLength; i++) {
      if (this.panelNames[i] == panelName) {
        this.panelNames.splice(i, 1);
      }
    }

    // Eliminamos el panel de projectPanels
    let projectPanelsLength = this.projectPanels.length;
    for (let i = 0; i < projectPanelsLength; i++) {
      if (this.projectPanels[i]._id = panelId) {
        this.projectPanels.splice(i, 1);
        break;
      }
    }

    // Eliminamos la referencia panel del project
    await lastValueFrom(this.projectService.removePanel(projectId, panelId));

    /* Eliminamos los workItems del panel en el project */
    // tenemos los workItems del proyecto
    let projectWorkItems = this.projectWorkItems;

    // Obtenemos los workItems que están en el panelName
    let projectWorkItemsInPanel = projectWorkItems.filter(wI => wI.panel == panelName);

    // recorremos los workItems del panel
    let projectWIPlength = projectWorkItemsInPanel.length;
    for (let i = 0; i < projectWIPlength; i++) {
      // y los eliminamos
      await lastValueFrom(this.workItemService.deleteWorkItem(projectWorkItemsInPanel[i]._id));
      // también eliminamos la referencias workItems del project
      await lastValueFrom(this.projectService.removeWorkItem(projectId, projectWorkItemsInPanel[i]._id));
      
      // eliminamos los wI de projectWorkItems para actualizar los datos que enviamos a los gráficos
      let indexOfWI = projectWorkItems.indexOf(projectWorkItemsInPanel[i])
      projectWorkItems.splice(indexOfWI, 1);

      this.filterProjectWorkItems(this.selectedTags);
    }

    /* Actualizar la posición de los paneles afectados */
    projectPanelsLength = this.projectPanels.length;
    for (let i = 0; i < projectPanelsLength; i++) {
      // si la position del panel es mayor al del eliminado
      if (this.projectPanels[i].position > panelPosition) {
        // hace position --
        this.projectPanels[i].position--;

        // actualizarlo en la bdd
        await lastValueFrom(this.panelService.updatePanel(this.projectPanels[i]));
      }
    }

    // Quitar el valor y la key de la lista backlog
    delete this.backlogList[panelName];
  }

  /* ACTUALIZAR PANEL */
  // Actualizar también panelNames y projectPanels
  async updatePanelAndMore(panel: Panel, newName: string, previousName: string, backlog: boolean) {
    // Actualizamos el nombre del panel
    if (newName != previousName) {
      panel!.name = newName
      // y eliminamos la entrada de la lista backlog del previousName
      delete this.backlogList[previousName];
    }

    // Actualizar backlog del panel
    panel.backlog = backlog;

    // cambiarlo en la lista backlog (o se creará una nueva entrada si el nombre ha cambiado)
    this.backlogList[newName] = backlog;

    // si backlog es true, la propiedad del resto de Panels se vuelve a false
    // actualizar objetos en la bdd
    if (backlog) {
      for (let panel of this.projectPanels) {
        if (panel.name != newName  &&  panel.backlog) {
          this.backlogList[panel.name] = false;
          panel.backlog = false;
          await lastValueFrom(this.panelService.updatePanel(panel));
          // porque solo debe haber un panel con backlog true
          break;
        }
      }
    }

    // si backlog es false, no hacer nada más

    // Actualizar el Panel en la bdd
    await lastValueFrom(this.panelService.updatePanel(panel));

    // Actualizamos el nombre en la lista panelNames
    let panelNamesLength = this.panelNames.length;
    for (let i = 0; i < panelNamesLength; i++) {
      if (this.panelNames[i] == previousName) this.panelNames[i] = newName;
    }

    // Actualizamos la propiedad panel de los workItems afectados
    // obtenemos los wI cuyo panel sea previousName
    let panelWorkItems = this.projectWorkItems;

    let panelWorkItemsLength = panelWorkItems.length;
    for (let i = 0; i < panelWorkItemsLength; i++) {
      // Actualizamos el panel del workItem si es igual a previousName
      if (panelWorkItems[i].panel == previousName) panelWorkItems[i].panel = newName;

      // También debemos actualizar el nombre del panel si existe en el registro de fechas de paneles del workItem (en todos)
      let panelDateRegistry = panelWorkItems[i].panelDateRegistry;
      let panelDRlength = panelDateRegistry.length;
      for (let j = 0; j < panelDRlength; j++) {
        if (panelDateRegistry[j].panel == previousName) {
          // console.log(newName)
          panelDateRegistry[j].panel = newName;
        }
      }

      // Actualizamos el workItem en la bdd
      await lastValueFrom(this.workItemService.updateWorkItem(panelWorkItems[i]));
    }

    // Volver a filtrar
    this.filterProjectWorkItems(this.selectedTags);
  }

  openDialog(buttonElement: HTMLButtonElement) {
    let panelName = buttonElement.value;
    let panel = this.projectPanels.find(panel => panel.name == panelName)!;
    let panelId = panel!._id!;
    let panelPosition = panel!.position;
    let panelBacklog = panel.backlog;

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '800px';

    dialogConfig.data = {
      name: panelName,
      projectId: this.projectId,
      backlog: panelBacklog
    }

    const dialogRef = this.dialog.open(PanelDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      async data => {
        // Si no llegan datos no se hace nada
        if (!data) return;

        // Si data es 'delete' eliminamos el Panel
        if (data == 'delete') {
          await this.deletePanel(panelId, panelName, panelPosition);
          return;
        }

        // Si llegan datos y no es 'delete' actualizamos el name
        await this.updatePanelAndMore(panel, data.name, panelName, data.backlog);
      }
    );
  }

  changeInnerText(elementId: string, message: string) {
    document.getElementById(elementId)!.innerText = message;
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
