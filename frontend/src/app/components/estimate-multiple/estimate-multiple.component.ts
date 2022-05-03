import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

// Models
import { Panel } from 'src/app/models/panel';

// Services
import { ProjectService } from 'src/app/services/project.service';

// Material Events
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-estimate-multiple',
  templateUrl: './estimate-multiple.component.html',
  styleUrls: ['./estimate-multiple.component.css']
})

export class EstimateMultipleComponent implements OnInit {
  isReady = false;

  // Paneles considerados como done y backlog
  panelDone: string = '';
  panelBacklog: string = '';

  // El valor de sus selectores
  panelDoneSelector: string = '';
  panelBacklogSelector: string = '';

  projectId: any = '';
  panelNames: string[] = [];

  // Número de ejecuciones Simulación Monte Carlo
  numberOfExecutions: number = 10000;

  constructor(private route: ActivatedRoute, private projectService: ProjectService) { }

  async ngOnInit() {
    // obtenemos el id del proyecto para poder obtener sus datos
    this.getProjectId();

    // obtenemos el nombre de los paneles para poder hacer la selección
    await this.getPanelNames();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  async getPanelNames() {
    try {
      let panels = await this.getPanels();

      // Recorremos los paneles y guardamos los nombres
      let panelNames = [];
      for (let p of panels) {
        panelNames.push(p.name);
      }

      this.panelNames = panelNames;
    }
    catch (error) {
      console.log(error);
    }
  }

  async getPanels() {
    let panels: Panel[] = [];
    try {
      panels = await lastValueFrom(this.projectService.getPanels(this.projectId))
    }
    catch (error) {
      console.log(error)
    }

    return panels;
  }

  setStartDate(event: MatDatepickerInputEvent<Date>) {}

  setEndDate(event: MatDatepickerInputEvent<Date>) {}

  setPanelDoneSelector(event: any) {}

  setPanelBacklogSelector(event: any) {}

  recalculate(percentil: number) {}

  monteCarloSimulation() {}

}
