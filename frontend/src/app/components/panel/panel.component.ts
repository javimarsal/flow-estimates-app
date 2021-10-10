import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PanelService } from 'src/app/services/panel.service';
import { Panel } from 'src/app/models/panel';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})

export class PanelComponent implements OnInit {

  panelNames: string[] = [];

  constructor(public panelService: PanelService) { }

  ngOnInit(): void {
    this.getPanels();
  }

  getPanels() {
    this.panelService.getPanels().subscribe(
      res => {
        this.panelService.panels = res;
        this.getNames(res);
      },
      err => console.log(err)
    )
  }

  getNames(panels: Panel[]) {
    for(let panel of panels) {
      this.panelNames.push(panel.name);
    }
  }


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.panelNames, event.previousIndex, event.currentIndex);
  }
}
