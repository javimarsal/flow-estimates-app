import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

// Models
import { Panel } from 'src/app/models/panel';
import { WorkItem } from 'src/app/models/work-item';

// Services
import { ProjectService } from 'src/app/services/project.service';
import { WorkItemService } from 'src/app/services/work-item.service';

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

  // fechas por las que filtrar los workItems para el cálculo del Throughput
  startDate!: Date;
  endDate!: Date;

  // fechas permitidas para el usuario
  permitedMinDate!: Date;
  permitedMaxDate!: Date;

  projectId: any = '';
  panelNames: string[] = [];

  // Número de ejecuciones Simulación Monte Carlo
  numberOfExecutions: number = 10000;

  constructor(private route: ActivatedRoute, private projectService: ProjectService, private workItemService: WorkItemService) { }

  async ngOnInit() {
    // obtenemos el id del proyecto para poder obtener sus datos
    this.getProjectId();

    // obtenemos el nombre de los paneles para poder hacer la selección
    await this.getPanelNames();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  filterWorkItems_ByPanelName(workItems: WorkItem[], panelName: string): WorkItem[] {
    return this.workItemService.filterWorkItems_ByPanelName(workItems, panelName)
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

  async getWorkItems() {
    let workItems: WorkItem[] = [];
    try {
      workItems = await lastValueFrom(this.projectService.getWorkItems(this.projectId));
    }
    catch (error) {
      console.log(error);
    }

    return workItems;
  }

  setStartDate(event: MatDatepickerInputEvent<Date>) {
    console.log(event.value)
  }

  setEndDate(event: MatDatepickerInputEvent<Date>) {
    console.log(event.value)
  }

  async setPanelDoneSelector(event: any) {
    // Establecer el panel considerado para el cálculo del Throughput
    this.panelDone = event.value;

    /* Obtenemos los workItems de ese panel */
    // obtenemos todos los workItems
    let allWorkItems = await this.getWorkItems();
    
    // filtramos los workItems por el panel correspondiente
    let workItemsOfPanel = this.filterWorkItems_ByPanelName(allWorkItems, this.panelDone);

    if (workItemsOfPanel.length == 0) {
      document.getElementById('warningPanel')!.innerText = `No hay ningún PBI en el panel "${this.panelDone}"`;
      return;
    }
    document.getElementById('warningPanel')!.innerText = '';

    /* Establecer el rango de fechas permitido (para el usuario) */
    // obtener las fechas de los workItems
    let datesOfPanel = this.getDatesOfWorkItems(workItemsOfPanel, this.panelDone);

    // ordenamos las fechas quedando la más actual en la posición 0, y la más antigua en la n-1
    this.sortDates(datesOfPanel);

    // obtener la fecha más antigua y la más actual de los workItems
    this.permitedMaxDate = datesOfPanel[0];
    this.permitedMinDate = datesOfPanel[datesOfPanel.length - 1];
  }

  setPanelBacklogSelector(event: any) {}

  getDatesOfWorkItems(workItems: WorkItem[], panelName: string): Date[] {
    let dates: Date[] = []

    // Recorremos los workItems
    for (let wI of workItems) {
      // Recorremos el array de registros
      let panelDateRegistry = wI.panelDateRegistry;
      for (let registry of panelDateRegistry) {
        // Si coincide con el panelName lo guardamos
        if (registry.panel == panelName) dates.push(registry.date);
      }
    }
    return dates;
  }

  sortDates(dates: any[]) {
    return dates.sort(function (a, b) {
      return a - b;
    })
  }

  calculatePercentile(percentil: number) {}

  calculateThroughput() {
  }

  monteCarloSimulation() {}

}
