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
    // Forma de acceder a un campo
    // console.log(this.form.value.description)
    // console.log(this.form.get('description')!.value)

    // Si el título está vacío, no hacer nada y warning
    if (this.form.get('title')!.value == "") {
      document.getElementById('warning')!.innerText = "El título no puede estar vacío";
      return;
    }

    // El título no está vacío
    document.getElementById('warning')!.innerText = "";
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }

}
