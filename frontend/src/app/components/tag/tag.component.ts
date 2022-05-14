import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Model
import { Tag } from 'src/app/models/tag';

// Services
import { TagService } from 'src/app/services/tag.service';
import { ProjectService } from 'src/app/services/project.service';

// Components
import { TagDialogComponent } from '../tag-dialog/tag-dialog.component';
import { TagListComponent } from '../tag-list/tag-list.component';

// Material
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.css']
})

export class TagComponent implements OnInit {
  @Input() tag!: Tag;
  @Input() tagListComponent!: TagListComponent;
  projectId: any = '';

  constructor(private dialog: MatDialog, private tagService: TagService, private projectService: ProjectService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getProjectId();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  async deleteTag() {
    // TODO: Eliminamos la referencia de la etiqueta en los WorkItems que la tengan
    alert('Si elimina esta etiqueta, también desaparecerá de las tareas correspondientes');

    let tagId = this.tag._id;
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
        await this.updateTag(this.tag);
      }
    );
  }

}
