import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

// Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Services
import { ProjectService } from 'src/app/services/project.service';


@Component({
  selector: 'app-tag-dialog',
  templateUrl: './tag-dialog.component.html',
  styleUrls: ['./tag-dialog.component.css']
})
export class TagDialogComponent implements OnInit {
  form!: FormGroup;
  name: string = '';
  color: string = '';

  projectId: any = '';

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<TagDialogComponent>, @Inject(MAT_DIALOG_DATA) data: any, private projectService: ProjectService) {
    this.name = data.name;
    this.color = data.color;
    this.projectId = data.projectId;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.name],
      color: [this.color]
    })
  }

  

  async save() {
    // Nombre y Color del formulario
    let formName = this.form.value.name;
    let formColor = this.form.value.color;

    let isNameCorrect = await this.checkNameIsCorrect(formName);
    let isColorCorrect = this.checkColorIsCorrect(formColor);

    // Si no cambia nada, no enviamos nada para actualizar
    if (this.name == formName  &&  this.color == formColor) return this.dialogRef.close();

    // Ha cambiado el Name o el Color (y ambos son válidos), enviamos los datos para actualizar
    if (isNameCorrect && isColorCorrect) {
      // Eliminamos espacios no deseados en el name
      this.form.value.name = this.deleteExtraSpaces(this.form.value.name);
      return this.dialogRef.close(this.form.value);
    }
  }

  delete() {
    this.dialogRef.close('delete');
  }

  close() {
    this.dialogRef.close();
  }

  changeInnerText(elementId: string, message: string) {
    document.getElementById(elementId)!.innerText = message;
  }

  deleteExtraSpaces(s: string): string {
    return s.replace(/\s+/g,' ').trim();
  }

  async checkNameExist(name: string) {
    try {
      let tagsOfProject = await lastValueFrom(this.projectService.getTags(this.projectId));

      // buscar si algún tag coincide con el nombre que hemos puesto
      for (let tag of tagsOfProject) {
        if (tag.name == name) return true;
      }
    }
    catch (error) {
      console.log(error);
    }

    return false;
  }

  async checkNameIsCorrect(name: string) {
    // Si el nombre está vacío, no hacer nada y warning
    if (name == "") {
      this.changeInnerText('warningName', 'El nombre no puede estar vacío');
      return false;
    }

    // Si cambia el nombre, comprobar que no coincida con uno ya existente, si es así no hacemos nada y warning
    if (this.name != name) {
      if (await this.checkNameExist(name)) {
        this.changeInnerText('warningName', 'El nombre no debe coincidir con el de una etiqueta ya existente');
        return false;
      }
    }

    this.changeInnerText('warningName', '');
    return true;
  }

  checkColorIsCorrect(color: string) {
    if (color == "") {
      this.changeInnerText('warningColor', 'El color no puede estar vacío');
      return false;
    }

    // TODO: Si cambia el nombre, comprobar que es un color válido

    this.changeInnerText('warningColor', '');
    return true;
  }

}
