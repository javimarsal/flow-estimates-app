import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Model
import { Tag } from 'src/app/models/tag';

// Services
import { ProjectService } from 'src/app/services/project.service';
import { TagService } from 'src/app/services/tag.service';

// A Color Picker
import * as AColorPicker from 'a-color-picker';

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
  invalidName = false;
  invalidColor = false;

  colorPicker: any;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private projectService: ProjectService, private tagService: TagService) { }

  async ngOnInit() {
    this.getProjectId();

    this.initForm();

    this.setButtonColor('#f5a475')
    this.createColorPicker();

    // Obtenemos las etiquetas (tags) del proyecto
    await this.getProjectTags();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  initForm() {
    this.form = this.fb.group({
      name: [''],
      color: ['#f5a475'],
    });
  }

  setButtonColor(color: string) {
    document.getElementById('colorButton')!.style.background = color;
  }

  createColorPicker() {
    let cPElement = document.getElementById('pickerColor');

    this.colorPicker = AColorPicker.createPicker(cPElement, {
      color: '#f5a475',
      showRGB: false,
      showHSL: false,
      palette: ['#fc3628', '#fc9a11', '#fcec11', '#b2fc14', '#2af913', '#13dff9', '#134cf7', '#6e13f7', '#e413f7', '#000000', '#fca1a1', '#fcd6a1', '#f9f395', '#ddfc99', '#9ff995', '#99f0fc', '#99b2fc', '#b78cf7', '#ee8cf7', '#ffffff']
    });

    this.colorPicker.on('change', (picker: any, color: string) => {
      // Cambiamos el color del botón
      this.setButtonColor(color);

      // Cambiamos el valor del input del color
      let colorInput = document.getElementById('color') as HTMLInputElement;
      colorInput.value = AColorPicker.parseColor(color, 'hex');

      // Cambiar el valor del color del formulario
      this.form.value.color = colorInput.value;
    });

    this.toggleColorPicker();
  }

  changeInnerText(elementId: string, message: string) {
    document.getElementById(elementId)!.innerText = message;
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

  toggleColorPicker() {
    this.colorPicker.toggle();
  }

  async createTag(formDirective: FormGroupDirective) {
    // Eliminar espacios no deseados
    let name = this.form.value.name.replace(/\s+/g,' ').trim();
    let color = this.form.value.color.replace(/\s+/g,' ').trim();

    if (!name) {
      return;
    }

    if (!color) {
      return;
    }
    
    // Crear el Tag
    let newTag: Tag = {
      name: name,
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
    // controlar que tagDB no sea undefine o similar
    if (!tagDB) {
      // si es undefine es porque no se ha podido crear debido a que existe otra etiqueta con el mismo nombre
      this.changeInnerText('warning', 'No se puede crear la etiqueta porque el nombre elegido ya está en uso.');
      return;
    };
    this.changeInnerText('warning', '');

    // Si tagDB no es undefine, significa que se ha podido crear y lo podemos añadir a la lista del proyecto
    try {
      await lastValueFrom(this.projectService.addTag(this.projectId, tagDB));
    }
    catch (error) {
      console.log(error);
    }

    // Si todo ha ido bien, reseteamos el contenido del formulario
    formDirective.resetForm();
    this.form.reset({
      name: '',
      color: '#f5a475',
    });
    this.setButtonColor('#f5a475');

    // y añadimos el nuevo Tag a la lista tagsOfProject
    // puede que el orden no se corresponda al cargar la página
    this.tagsOfProject.unshift(tagDB);
  }

}
