import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

// Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Services
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-panel-dialog',
  templateUrl: './panel-dialog.component.html',
  styleUrls: ['./panel-dialog.component.css']
})
export class PanelDialogComponent implements OnInit {
  form: FormGroup;
  name: string = '';
  backlog: boolean;
  characterLimitName = 20;

  projectId: any = '';

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<PanelDialogComponent>, @Inject(MAT_DIALOG_DATA) data: any, private projectService: ProjectService) {
    this.name = data.name;
    this.projectId = data.projectId;
    this.backlog = data.backlog;

    this.form = this.fb.group({
      name: [this.name],
      backlog: [this.backlog]
    });
  }

  ngOnInit(): void {
  }

  async save() {
    // Nombre del formulario
    let formName = this.form.value.name;
    let formBacklog = this.form.value.backlog;

    formName = this.deleteExtraSpaces(formName);

    let isNameCorrect = await this.checkNameIsCorrect(formName);

    // Si no cambia el nombre, no enviamos nada para actualizar
    if (this.name == formName && this.backlog == formBacklog) return this.dialogRef.close();

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

  async checkNameIsCorrect(name: string) {
    // Si el nombre está vacío, no hacer nada y warning
    if (name == "") {
      this.changeInnerText('warningName', 'El nombre no puede estar vacío');
      return false;
    }

    // Si cambia el nombre, comprobar que no coincida con uno ya existente, si es así no hacemos nada y warning
    if (this.name != name) {
      if (await this.checkNameExist(name)) {
        this.changeInnerText('warningName', 'El nombre no debe coincidir con el de un panel ya existente');
        return false;
      }
    }

    this.changeInnerText('warningName', '');
    return true;
  }

  async checkNameExist(name: string) {
    try {
      let projectPanels = await lastValueFrom(this.projectService.getPanels(this.projectId));

      // buscar si el name de algún panel coincide con el nombre que hemos puesto
      for (let panel of projectPanels) {
        if (panel.name.toLowerCase() == name.toLowerCase()) return true;
      }
    }
    catch (error) {
      console.log(error);
    }

    return false;
  }

  changeInnerText(elementId: string, message: string) {
    document.getElementById(elementId)!.innerText = message;
  }

  deleteExtraSpaces(s: string): string {
    return s.replace(/\s+/g,' ').trim();
  }

}
