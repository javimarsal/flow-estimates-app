import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

// Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Services
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-my-project-item-dialog',
  templateUrl: './my-project-item-dialog.component.html',
  styleUrls: ['./my-project-item-dialog.component.css']
})
export class MyProjectItemDialogComponent implements OnInit {
  form!: FormGroup;
  name: string = '';
  nameTitleHTML: string = '';
  characterLimitName = 30;

  userId: any = '';

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<MyProjectItemDialogComponent>, @Inject(MAT_DIALOG_DATA) data: any, private userService: UserService) {
    this.name = data.name;
    this.nameTitleHTML = data.name;
    this.userId = data.userId;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.name]
    });
  }

  async save() {
    // Nombre del formulario
    let formName = this.form.value.name;
    formName = this.deleteExtraSpaces(formName);

    let isNameCorrect = await this.checkNameIsCorrect(formName);

    // Si no cambia el nombre, no enviamos nada para actualizar
    if (this.name == formName) return this.dialogRef.close();

    // Ha cambiado el nombre (y éste es válido), enviamos los datos para actualizar
    if (isNameCorrect) {
      return this.dialogRef.close(this.form.value);
    }
  }

  delete() {
    this.dialogRef.close('delete');
  }

  close() {
    this.dialogRef.close();
  }

  async checkNameExist(name: string) {
    try {
      let userProjects = await lastValueFrom(this.userService.getProjects(this.userId));

      // buscar si el name de algún proyecto coincide con el nombre que hemos puesto
      for (let project of userProjects) {
        if (project.name.toLowerCase() == name.toLowerCase()) return true;
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
        this.changeInnerText('warningName', 'El nombre no debe coincidir con el de un proyecto ya existente');
        return false;
      }
    }

    this.changeInnerText('warningName', '');
    return true;
  }

  changeInnerText(elementId: string, message: string) {
    document.getElementById(elementId)!.innerText = message;
  }

  deleteExtraSpaces(s: string): string {
    return s.replace(/\s+/g,' ').trim();
  }

}
