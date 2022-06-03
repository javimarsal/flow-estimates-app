import { Component, Input, OnInit } from '@angular/core';
import { Project } from 'src/app/models/project';

@Component({
  selector: 'app-my-project-item',
  templateUrl: './my-project-item.component.html',
  styleUrls: ['./my-project-item.component.css']
})
export class MyProjectItemComponent implements OnInit {
  @Input() project!: Project;
  @Input() role!: string;

  constructor() { }

  ngOnInit(): void {
  }

}
