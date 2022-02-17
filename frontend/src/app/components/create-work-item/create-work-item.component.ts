import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-work-item',
  templateUrl: './create-work-item.component.html',
  styleUrls: ['./create-work-item.component.css']
})
export class CreateWorkItemComponent implements OnInit {
  value = '';

  constructor() { }

  ngOnInit(): void {
  }

  createWorkItem() {
    // Al final, borrar el contenido de value
    // this.value = '';
  }

}
