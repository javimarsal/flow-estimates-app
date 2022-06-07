import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Models
import { Tag } from 'src/app/models/tag';
import { WorkItem } from 'src/app/models/work-item';

// Services
import { ProjectService } from 'src/app/services/project.service';
import { TagService } from 'src/app/services/tag.service';
import { UserService } from 'src/app/services/user.service';
import { CookieService } from 'ngx-cookie-service';

// A Color Picker
import * as AColorPicker from 'a-color-picker';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.css']
})

export class TagListComponent implements OnInit {
  // datos pasados desde el componente "panel" a través del atributo state del router
  historyProjectTags = history.state.projectTags;
  historyProjectWorkItems = history.state.projectWorkItems;

  userId: string = '';
  projectId: any = '';
  tagsOfProject: Tag[] = [];
  workItemsOfProject: WorkItem[] = [];

  // Formulario para crear una nueva Tag
  form!: FormGroup;
  invalidName = false;
  invalidColor = false;

  colorPicker: any;
  characterLimitName = 15;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private projectService: ProjectService, private tagService: TagService, private userService: UserService, private cookieService: CookieService, private router: Router) {
    this.form = this.fb.group({
      name: [''],
      color: ['#f5a475'],
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

    this.setButtonColor('#f5a475')
    this.createColorPicker();

    // Obtenemos las etiquetas (tags) del proyecto
    await this.getProjectTags();

    // Obtenemos los workItems del proyecto
    await this.getProjectWorkItems();

    return;
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
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
      if (this.historyProjectTags && this.historyProjectTags.length!=0) {
        this.tagsOfProject = this.historyProjectTags;
      }
      else if (!this.historyProjectTags || this.historyProjectTags.length==0) {
        this.tagsOfProject = await lastValueFrom(this.projectService.getTags(this.projectId));
      }
    }
    catch(error) {
      console.log(error);
    }
  }

  async getProjectWorkItems() {
    if (!this.projectId) return;

    if (this.historyProjectWorkItems && this.historyProjectWorkItems.length!=0) {
      this.workItemsOfProject = this.historyProjectWorkItems;
    }
    else if (!this.historyProjectWorkItems || this.historyProjectWorkItems.length==0) {
      try {
        this.workItemsOfProject = await lastValueFrom(this.projectService.getWorkItems(this.projectId));
      }
      catch (error) {
        console.log(error);
      }
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
      tagDB = await lastValueFrom(this.tagService.createTag(this.projectId, newTag));
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
    // this.tagsOfProject.unshift(tagDB);
    this.tagsOfProject.push(tagDB);
  }

}
