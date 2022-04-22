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
  title: string = '';

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<WorkItemDialogComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.title = data.title;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.title],
      description: []
    })
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }

}
