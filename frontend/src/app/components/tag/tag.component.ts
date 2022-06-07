import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Models
import { Tag } from 'src/app/models/tag';
import { WorkItem } from 'src/app/models/work-item';

// Services
import { TagService } from 'src/app/services/tag.service';
import { ProjectService } from 'src/app/services/project.service';
import { WorkItemService } from 'src/app/services/work-item.service';

// Components
import { TagDialogComponent } from '../tag-dialog/tag-dialog.component';
import { TagListComponent } from '../tag-list/tag-list.component';

// Material
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

// A Color Picker
import * as AColorPicker from 'a-color-picker';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.css']
})

export class TagComponent implements OnInit {
  @Input() tag!: Tag;
  @Input() tagListComponent!: TagListComponent;
  @Input() workItemsOfProject: WorkItem[] = [];
  projectId: any = '';

  @ViewChild('tagName') pElement!: ElementRef;

  constructor(private dialog: MatDialog, private tagService: TagService, private projectService: ProjectService, private workItemService: WorkItemService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getProjectId();
    console.log(this.workItemsOfProject)
  }

  ngAfterViewInit() {
    let tagColor = this.tag.color;

    // Cambiar el background-color del elemento HTML
    this.setBackgroundColor(tagColor)

    this.setFontColor(tagColor);
  }

  setBackgroundColor(color: string) {
    this.pElement.nativeElement.style.backgroundColor = color;
  }

  setFontColor(color: string) {
    let darkness = 0;

    let colorRGB: any = AColorPicker.parseColor(color, 'rgb');

    // Contar la percepción de luminosidad - human eye favors
    let luminance = (0.299 * colorRGB[0] + 0.587 * colorRGB[1] + 0.114 * colorRGB[2]) / 255;

    if (luminance > 0.5) darkness = 0; // bright colors - black font
    else darkness = 255; // dark colors - white font
                
    this.pElement.nativeElement.style.color = `rgb(${darkness}, ${darkness}, ${darkness})`
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  async deleteTag() {
    alert('La etiqueta eliminada también ha sido quitado de las tareas correspondientes');
    
    let tagId = this.tag._id!;
    // Eliminamos la etiqueta
    try {
      await lastValueFrom(this.tagService.deleteTag(tagId));
    }
    catch (error) {
      console.log(error);
    }

    // Eliminamos la referencia de la etiqueta del Proyecto
    try {
      await lastValueFrom(this.projectService.removeTag(this.projectId, tagId));
    }
    catch (error) {
      console.log(error);
    }
    
    // Eliminamos la referencia de la etiqueta en los WorkItems que la tengan
    try {
      await this.deleteReferenceInWorkItemsDB(tagId);
    }
    catch (error) {
      console.log(error);
    }
    

    // también eliminamos el Tag de la lista de tagListComponent
    let tagsOfProject = this.tagListComponent.tagsOfProject;
    let tagsLength = tagsOfProject.length;
    
    for (let i = 0; i < tagsLength; i++) {
      if (tagsOfProject[i]._id == tagId) {
        tagsOfProject.splice(i, 1);
        // break porque ahora tagsOfProject.length es uno menos que tagsLength. En la última iteración, tagsOfProject[i] sería undefined
        break;
      }
    }
    
  }

  async updateTag(tag: Tag) {
    try {
      await lastValueFrom(this.tagService.updateTag(tag));
    }
    catch (error) {
      console.log(error);
    }
  }

  async deleteReferenceInWorkItemsDB(tagId: string) {
    let workItems = this.workItemsOfProject;
    for (let wI of workItems) {
      await lastValueFrom(this.workItemService.removeTag(wI._id!, tagId))
    }
  }

  // Diálogo que se abre al pinchar en el Tag
  async openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '800px';

    dialogConfig.data = {
      name: this.tag.name,
      color: this.tag.color,
      projectId: this.projectId
    }

    const dialogRef = this.dialog.open(TagDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      async data => {
        // Si no llegan datos no se hace nada
        if (!data) return;

        // Si data es 'delete' eliminamos el Tag
        if (data == 'delete') {
          this.deleteTag();
          return;
        }

        // Si llegan datos y no es 'delete' actualizamos el name y color del Tag
        this.tag.name = data.name;
        this.tag.color = data.color;
        this.setBackgroundColor(this.tag.color);
        this.setFontColor(this.tag.color);
        await this.updateTag(this.tag);
      }
    );
  }

}
