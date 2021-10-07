import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PanelService } from 'src/app/services/panel.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})

export class PanelComponent implements OnInit {

  constructor(private panelService: PanelService) { }

  ngOnInit(): void {
    
  }

  getPanels() {
    this.panelService.getPanels().subscribe(
      res => {
        this.panelService.panels = res;
      },
      err => console.log(err)
    )
  }

  panelNames = [
    'ToDO',
    'Doing',
    'Done',
    'Close'
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.panelNames, event.previousIndex, event.currentIndex);
  }
}
