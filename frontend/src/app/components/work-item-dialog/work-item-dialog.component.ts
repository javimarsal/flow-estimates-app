import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

// Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-work-item-dialog',
  templateUrl: './work-item-dialog.component.html',
  styleUrls: ['./work-item-dialog.component.css']
})
export class WorkItemDialogComponent implements OnInit {
  form!: FormGroup;
  idNumber: number = 0;
  title: string = '';
  description: string = '';

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<WorkItemDialogComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.idNumber = data.idNumber;
    this.title = data.title;
    this.description = data.description;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.title],
      description: [this.description]
    })
  }

  save() {
    // Title y Description del formulario
    let formTitle = this.form.value.title;
    let formDescription = this.form.value.description;

    // Si el título está vacío, no hacer nada y warning
    if (this.form.get('title')!.value == "") {
      document.getElementById('warning')!.innerText = "El título no puede estar vacío";
      return;
    }

    // El título no está vacío
    document.getElementById('warning')!.innerText = "";

    // Si no cambia nada, no enviamos nada para actualizar
    if (this.title == formTitle  &&  this.description == formDescription) return this.dialogRef.close();

    // Ha cambiado el title o el description, enviamos los datos para actualizar
    this.dialogRef.close(this.form.value);
  }

  delete() {
    this.dialogRef.close('delete');
  }

  close() {
    this.dialogRef.close();
  }

}
