import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Model
import { Tag } from 'src/app/models/tag';

// Services
import { ProjectService } from 'src/app/services/project.service';
import { TagService } from 'src/app/services/tag.service';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.css']
})

export class TagListComponent implements OnInit {
  projectId: any = '';
  tagsOfProject: Tag[] = [];

  // Formulario para crear una nueva Tag
  form!: FormGroup;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private projectService: ProjectService, private tagService: TagService) { }

  async ngOnInit() {
    this.getProjectId();

    this.initForm();

    // Obtenemos las etiquetas (tags) del proyecto
    await this.getProjectTags();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  initForm() {
    this.form = this.fb.group({
      name: [''],
      description: [''],
      color: ['#ffffff'],
    });
  }

  async getProjectTags() {
    if (!this.projectId) {
      return;
    }

    try {
      this.tagsOfProject = await lastValueFrom(this.projectService.getTags(this.projectId));
    }
    catch(error) {
      console.log(error);
    }
  }

  // TODO
  async createTag() {
    // Eliminar espacios no deseados
    let name = this.form.value.name.replace(/\s+/g,' ').trim();
    let description = this.form.value.description.replace(/\s+/g,' ').trim();
    let color = this.form.value.color.replace(/\s+/g,' ').trim();

    console.log(this.form.value)
    
    // Crear el Tag
    let newTag: Tag = {
      name: name,
      description: description,
      color: color
    }

    // tag de la base de datos para añadirla a la lista del proyecto
    let tagDB!: Tag;

    try {
      tagDB = await lastValueFrom(this.tagService.createTag(newTag));
    }
    catch (error) {
      console.log(error);
    }

    // Añadir el Tag a la lista del proyecto
    // TODO: controlar que tagDB no sea undefine o similar
    try {
      let res = await lastValueFrom(this.projectService.addTag(this.projectId, tagDB));
    }
    catch (error) {
      console.log(error);
    }

    // Si todo ha ido bien, reseteamos el contenido del formulario
    // this.initForm();
    this.form.reset({
      name: [''],
      description: [''],
      color: ['#ffffff'],
    })

    // y añadimos el nuevo Tag a la lista tagsOfProject
    // TODO: puede que el orden no se corresponda al cargar la página
    this.tagsOfProject.unshift(tagDB);
  }

}
