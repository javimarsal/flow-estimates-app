import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

// Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Services
import { ProjectService } from 'src/app/services/project.service';

// A Color Picker
import * as AColorPicker from 'a-color-picker';


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

  colorPicker: any;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<TagDialogComponent>, @Inject(MAT_DIALOG_DATA) data: any, private projectService: ProjectService) {
    this.name = data.name;
    this.color = data.color;
    this.projectId = data.projectId;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.name],
      color: [this.color]
    });

    // Poner el color del Tag en el botón y en el título
    this.setButtonColor('btnColor', this.color);
    this.setButtonColor('title', this.color);
    // Poner color de la letra del título según el color
    this.setFontColor(this.color);

    this.createColorPicker();
  }

  setButtonColor(elementId: string, color: string) {
    document.getElementById(elementId)!.style.background = color;
  }

  createColorPicker() {
    let cPElement = document.getElementById('colorPicker');

    this.colorPicker = AColorPicker.createPicker(cPElement, {
      color: this.color,
      showRGB: false,
      showHSL: false,
      palette: ['#5c0ed1']
    });

    this.colorPicker.on('change', (picker: any, color: string) => {
      // Cambiamos el color del botón
      this.setButtonColor('btnColor', color);
      this.setButtonColor('title', color);
      // y el de la letra del título
      this.setFontColor(color);

      // Cambiamos el valor del input del color
      let colorInput = document.getElementById('colorInput') as HTMLInputElement;
      colorInput.value = AColorPicker.parseColor(color, 'hex');

      // Cambiar el valor del color del formulario
      this.form.value.color = colorInput.value;
    });

    this.toggleColorPicker();
  }

  setFontColor(color: string) {
    let darkness = 0;

    let colorRGB: any = AColorPicker.parseColor(color, 'rgb');

    // Contar la percepción de luminosidad - human eye favors
    let luminance = (0.299 * colorRGB[0] + 0.587 * colorRGB[1] + 0.114 * colorRGB[2]) / 255;

    if (luminance > 0.5) darkness = 0; // bright colors - black font
    else darkness = 255; // dark colors - white font
                
    document.getElementById('title')!.style.color = `rgb(${darkness}, ${darkness}, ${darkness})`;
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

    this.changeInnerText('warningColor', '');
    return true;
  }

  toggleColorPicker() {
    this.colorPicker.toggle();
  }

}
