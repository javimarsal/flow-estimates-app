import { Component, Input, OnInit } from '@angular/core';
import { WorkItem } from 'src/app/models/work-item';

@Component({
  selector: 'app-work-item',
  templateUrl: './work-item.component.html',
  styleUrls: ['./work-item.component.css']
})
export class WorkItemComponent implements OnInit {
  editing: boolean = false;

  @Input() workItemName: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
