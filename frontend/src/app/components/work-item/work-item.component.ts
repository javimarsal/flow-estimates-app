import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';

// Models
import { WorkItem } from 'src/app/models/work-item';
import { Tag } from 'src/app/models/tag';

// Material
// MatDialog --> Servicio
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

// Servicios
import { ProjectService } from 'src/app/services/project.service';
import { WorkItemService } from 'src/app/services/work-item.service';
import { TagService } from 'src/app/services/tag.service';

// Componentes
import { WorkItemListComponent } from '../work-item-list/work-item-list.component';
import { WorkItemDialogComponent } from '../work-item-dialog/work-item-dialog.component';

// A Color Picker
import * as AColorPicker from 'a-color-picker';

@Component({
  selector: 'app-work-item',
  templateUrl: './work-item.component.html',
  styleUrls: ['./work-item.component.css']
})
export class WorkItemComponent implements OnInit, OnChanges {
  @Input() workItemIdNumber!: number;
  @Input() panelName: string = '';
  @Input() workItemListComponent!: WorkItemListComponent;
  // workItemIdNumber!: number;

  projectId: any = '';
  @Input() projectTags!: Tag[];
  @Input() projectWorkItems!: WorkItem[];

  @Output() onChange = new EventEmitter<WorkItem[]>();

  workItem!: WorkItem;

  // Tags
  workItemTagsNames: string[] = [];
  workItemTagsColors: any = [];
  workItemTagsFontColors: any = [];

  constructor(private projectService: ProjectService, private workItemService: WorkItemService, private tagService: TagService, private route: ActivatedRoute, private dialog: MatDialog) { }

  async ngOnInit() {
    this.getProjectId();

    try {
      let workItem = this.projectWorkItems.filter(wI => wI.idNumber == this.workItemIdNumber)[0];
      // console.log(this.projectWorkItems)

      // if (workItem) {
        this.workItem = workItem;
      // }
      // else {
      //   let workItems = await lastValueFrom(this.getWorkItemsOfProject());
      //   this.workItem = this.getWorkItemByIdNumber(workItems, this.workItemIdNumber);
      //   this.projectWorkItems = this.filterWorkItems_ByPanelName(workItems, this.panelName);
      // }
    }
    catch (error) {
      console.log(error);
    }

    await this.getWorkItemTagsProperties(this.workItem);
  }

  ngOnChanges(changes: any): void {
    if (changes.panelName) {
      this.panelName = changes.panelName.currentValue;
    }

    if (changes.projectWorkItems) {
      this.projectWorkItems = changes.projectWorkItems.currentValue;
    }
  }

  // INICIALIZAR EL COMPONENTE
  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  getWorkItemsOfProject(): Observable<WorkItem[]> {
    return this.projectService.getWorkItems(this.projectId);
  }

  getWorkItemByIdNumber(workItemList: WorkItem[], idNumber: number): WorkItem {
    return this.workItemService.getWorkItemByIdNumber(workItemList, idNumber);
  }

  async getWorkItemTagsProperties(workItem: WorkItem) {
    if (!workItem.tags?.length) return;
    
    // Obtenemos las tags del workItem (solo están las referencias)
    let tags = workItem.tags;

    // Borramos el contenido de los arrays
    this.workItemTagsNames = [];
    this.workItemTagsColors = [];
    this.workItemTagsFontColors = [];

    // Las recorremos para obtener los objetos Tag
    for (let tag of tags) {
      // let tagObject = await lastValueFrom(this.tagService.getTag(tag.tag.toString()));
      let tagObject = this.projectTags.filter(t => t._id == tag.tag.toString());
      let tagName = tagObject[0].name;
      let tagColor = tagObject[0].color;

      // Guardamos su nombre
      this.workItemTagsNames.push(tagName);

      // Guardamos su color
      this.workItemTagsColors[tagName] = tagColor;

      // Guardamos su color de texto
      this.workItemTagsFontColors[tagName] = this.setFontColor(tagColor);
    }
  }

  setFontColor(color: string) {
    let darkness = 0;

    let colorRGB: any = AColorPicker.parseColor(color, 'rgb');

    // Contar la percepción de luminosidad - human eye favors
    let luminance = (0.299 * colorRGB[0] + 0.587 * colorRGB[1] + 0.114 * colorRGB[2]) / 255;

    if (luminance > 0.5) darkness = 0; // bright colors - black font
    else darkness = 255; // dark colors - white font
                
    return `rgb(${darkness}, ${darkness}, ${darkness})`;
  }

  // Diálogo que se abre al pinchar en el workItem
  async openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.width = '800px';

    dialogConfig.data = {
      idNumber: this.workItemIdNumber,
      title: this.workItem.title,
      description: this.workItem.description,
      tags: this.workItem.tags,
      projectTags: this.projectTags
    }

    const dialogRef = this.dialog.open(WorkItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      async data => {
        // Si no le llegan datos no se hace nada
        if (!data) return;

        // Si data es 'delete' eliminamos el workItem
        if (data == 'delete') {
          this.deleteWorkItem();
          return;
        }

        // Si llegan datos y no es 'delete' actualizamos el title y description del componente
        await this.updateWorkItemTitleDescriptionTags(data.title, data.description, data.tags);
      }
    );
  }

  /* EDITAR Y ELIMINAR WorkItem */
  // Eliminar WorkItem
  async deleteWorkItem() {
    // Actualizar la lista de WorkItemListComponent
    let idNumbersOfList = this.workItemListComponent.workItemsOfPanel_IdNumbers;
    let lengthIdNumbers = this.workItemListComponent.workItemsOfPanel_IdNumbers.length;

    // buscamos el idNumber del workItem en la lista, y lo eliminamos
    for (let i = 0; i < lengthIdNumbers; i++) {
      if (parseInt(idNumbersOfList[i]) == this.workItem.idNumber) {
        idNumbersOfList.splice(i, 1);
        // break porque ahora idNumbersOfList.length es uno menos que lengthIdNumbers. En la última iteración, idNumbersOfList[i] sería undefined
        break;
      }
    }

    let workItemsOfPanel: WorkItem[] = []

    // Obtenemos los workItems que se van a actualizar (por si ha sufrido alguna modificación antes, como la posición)
    try {
      let workItems = await lastValueFrom(this.getWorkItemsOfProject());
      this.workItem = this.getWorkItemByIdNumber(workItems, this.workItemIdNumber);
      workItemsOfPanel = this.filterWorkItems_ByPanelName(workItems, this.panelName);
    }
    catch (error) {
      console.log(error)
    }

    // Reducir en 1 la posición de los workItems afectados
    let workItemPosition = this.workItem.position;
    for (let wI of workItemsOfPanel) {
      if (wI.position > workItemPosition) {
        // Reducir su posición en 1
        wI.position--;

        // Actualizar el workItem
        try {
          let res = await lastValueFrom(this.workItemService.updateWorkItem(wI));
          // console.log(res);
        }
        catch (error) {
          console.log(error)
        }
      }
    }

    // Id del workItem
    let workItemId = this.workItem._id;

    // Eliminar workItem de la bdd
    try {
      let res = await lastValueFrom(this.workItemService.deleteWorkItem(workItemId));
      // console.log(res);
    }
    catch (error) {
      console.log(error)
    }

    // Eliminar la referencia de la lista del proyecto
    try {
      let res = await lastValueFrom(this.projectService.removeWorkItem(this.projectId, workItemId));
      // console.log(res);
    }
    catch (error) {
      console.log(error)
    }

    // Actualizar el array projectWorkItems y enviárselo al padre (work-item-list)
    let workItemObject = this.projectWorkItems.filter(wI => wI.idNumber == this.workItem.idNumber)[0];
    let indexOfWorkItem = this.projectWorkItems.indexOf(workItemObject);
    this.projectWorkItems.splice(indexOfWorkItem, 1);
    this.onChange.emit(this.projectWorkItems);
  }

  // Editar WorkItem
  async updateWorkItemTitleDescriptionTags(title: string, description: string, tags: string[]) {
    // Obtenemos el workItem que se va a actualizar (por si ha sufrido alguna modificación antes, como la posición)
    let workItems: WorkItem[] = [];
    try {
      workItems = await lastValueFrom(this.getWorkItemsOfProject());
      this.workItem = this.getWorkItemByIdNumber(workItems, this.workItemIdNumber);
    }
    catch (error) {
      console.log(error)
    }

    // Eliminar espacios no deseados en el title
    let titleNoSpaces = title.replace(/\s+/g,' ').trim();

    // Actualizar el workItem
    this.workItem.title = titleNoSpaces;
    this.workItem.description = description;
    try {
      let res = await lastValueFrom(this.workItemService.updateWorkItem(this.workItem));
      // console.log(res);
    }
    catch (error) {
      console.log(error)
    }

    let tagsOfWorkItem: any = this.workItem.tags;
    let workItemId: any = this.workItem._id;
    // Eliminamos las etiquetas del workItem
    for (let tag of tagsOfWorkItem) {
      await lastValueFrom(this.workItemService.removeTag(workItemId, tag.tag));
    }

    // Añadimos las nuevas etiquetas al workItem
    for (let tagName of tags) {
      let tag = await this.getTagByName(tagName);
      await lastValueFrom(this.workItemService.addTag(workItemId, tag))
    }

    // Actualizar el workItem del componente
    let workItemsOfProject = await lastValueFrom(this.projectService.getWorkItems(this.projectId));
    this.workItem = this.workItemService.getWorkItemByIdNumber(workItemsOfProject, this.workItemIdNumber);

    // Para actualizar el array projectWorkItems y emitirlo al padre (work-item-list)
    let workItemObject = workItems.filter(wI => wI.idNumber == this.workItem.idNumber)[0];
    let indexOfWorkItem = workItems.indexOf(workItemObject);
    
    workItems[indexOfWorkItem] = this.workItem;
    this.projectWorkItems = workItems;

    this.onChange.emit(this.projectWorkItems);

    // Actualizar las etiquetas (visualmente, interfaz)
    await this.getWorkItemTagsProperties(this.workItem);
  }

  async getTagByName(tagName: string): Promise<Tag> {
    let tagsOfProject = await lastValueFrom(this.projectService.getTags(this.projectId))
    
    let tagFound!: Tag;

    for (let tag of tagsOfProject) {
      if (tag.name == tagName) {
        tagFound = tag;
        break;
      };
    }

    return tagFound;
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName);
  }

}
