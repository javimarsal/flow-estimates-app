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
import { MatDatepickerInputEvent, MatDateRangeInput } from '@angular/material/datepicker';

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
    this.startDate = event.value!;
    console.log('startDate', event.value);
  }

  setEndDate(event: MatDatepickerInputEvent<Date>) {
    if (!event.value) {
      return;
    }
    this.endDate = event.value!;
    console.log('endDate', event.value);

    // Borramos un posible warning, ocasionado por que el rango anterior no está permitido
    this.changeInnerText('warningDates', '');

    // TODO: enseñar mensaje si entre las fechas no hay workItems
  }

  async setPanelDoneSelector(event: any, startDate: HTMLInputElement, endDate: HTMLInputElement) {
    // Controlar que no coincida con el panelBacklog
    if (this.checkPanelsAreEqual(this.panelDone, this.panelBacklog, 'warningPanelDone', 'El panel no puede coincidir con el panel Backlog')) return;

    // Borrar cualquier mensaje de warning que puediera haber
    this.changeInnerText('warningPanelDone', '');
    // también borramos el warning del PanelBacklog, por si es ahí dónde apareció
    this.changeInnerText('warningPanelBacklog', '');

    // Si en el panel Backlog seleccionado no hay workItems, volvemos a poner el mensaje de Warning
    await this.getPanelWorkItems(this.panelBacklog, 'warningPanelBacklog');

    // Establecer el panel considerado para el cálculo del Throughput
    this.panelDone = event.value;

    // Obtenemos los workItems de ese panel
    let workItemsOfPanel = await this.getPanelWorkItems(this.panelDone, 'warningPanelDone');

    if (!workItemsOfPanel) return;
    this.changeInnerText('warningPanelDone', '');

    /* Establecer el rango de fechas permitido (para el usuario) */
    // obtener las fechas de los workItems
    let datesOfPanel = this.getDatesOfWorkItems(workItemsOfPanel, this.panelDone);

    // ordenamos las fechas quedando la más actual en la posición 0, y la más antigua en la n-1
    this.sortDates(datesOfPanel);

    // obtener la fecha más antigua y la más actual de los workItems
    this.permitedMaxDate = datesOfPanel[0];
    this.permitedMinDate = datesOfPanel[datesOfPanel.length - 1];

    // Comprobar que el rango de fechas (seleccionado por el usuario) sigue estando bien
    if (this.startDate && this.endDate) {
      if (!this.checkDateRangeIsRight(this.startDate, this.endDate, new Date(new Date(this.permitedMinDate).toDateString()), new Date(new Date(this.permitedMaxDate).toDateString()))) {
        this.deleteDates(startDate, endDate);
        
        this.changeInnerText('warningDates', `Las fechas se han eliminado porque el rango que se había elegido ya no se corresponde con el rango permitido por el panel ${this.panelDone}`);

        return;
      }
      this.changeInnerText('warningDates', '');
    }
  }

  async setPanelBacklogSelector(event: any) {
    // Controlar que no coincida con el panelDone
    if (this.checkPanelsAreEqual(this.panelDone, this.panelBacklog, 'warningPanelBacklog', 'El panel no puede coincidir con el panel de tareas hechas')) return;

    // Borrar cualquier mensaje de warning que puediera haber
    this.changeInnerText('warningPanelBacklog', '');
    // también borramos el warning del PanelDone, por si es ahí dónde apareció
    this.changeInnerText('warningPanelDone', '');

    // Si en el panel Done seleccionado no hay workItems, volvemos a poner el mensaje de Warning
    this.getPanelWorkItems(this.panelDone, 'warningPanelDone');

    // Establecer el panel considerado como Backlog para la Simulación Monte Carlo
    this.panelBacklog = event.value;

    // Si el panel no tiene workItems, se enseña un warning
    await this.getPanelWorkItems(this.panelBacklog, 'warningPanelBacklog');
  }

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

  checkDateRangeIsRight(startDate: Date, endDate: Date, permitedMinDate: Date, permitedMaxDate: Date) {
    // Comprobar que las fechas Start y End siguen estando entre el rango permitido
    if (((startDate >= permitedMinDate) && (startDate <= permitedMaxDate))  &&  ((endDate >= permitedMinDate) && (endDate <= permitedMaxDate))) return true;

    return false;
  }

  /**
   * Comprueba si el nombre de los paneles Done y Backlog son iguales, si es el caso pone un mensaje en el elemento HTML indicado
   * @param panelDone nombre del panel Done
   * @param panelBacklog nombre del panel Backlog
   * @param elementId elemento HTML donde poner el warning
   * @param message mensaje del warning
   * @returns true si coinciden, false si no coinciden
   */
  checkPanelsAreEqual(panelDone: string, panelBacklog: string, elementId: string, message: string) {
    if (!panelDone && !panelBacklog) return false;

    if (panelDone == panelBacklog) {
      this.changeInnerText(elementId, message);
      return true;
    }

    return false;
  }

  async getPanelWorkItems(panelName: string, elementId: string) {
    // Comprobamos que el panel se ha seleccionado (no debe ser '')
    if (!panelName) return false;

    let allWorkItems = await this.getWorkItems();
      
    // filtramos los workItems por el panel correspondiente
    let workItemsOfPanel = this.filterWorkItems_ByPanelName(allWorkItems, panelName);

    if (workItemsOfPanel.length == 0) {
      // Si el panel no tiene workItems, mostramos un warning
      this.changeInnerText(elementId, `No hay ningún PBI en el panel "${panelName}"`);
      return false;
    }

    // tiene workItems
    return workItemsOfPanel;
  }

  deleteDates(startDate: HTMLInputElement, endDate: HTMLInputElement) {
    // Las fechas
    this.startDate = undefined!;
    this.endDate = undefined!;
    
    // Inputs en la interfaz
    startDate.value = '';
    endDate.value = '';
  }

  /**
   * 
   * @param elementId id del elemento HTML
   * @param message mensaje que queremos poner en el innerText
   */
  changeInnerText(elementId: string, message: string) {
    document.getElementById(elementId)!.innerText = message;
  }

  calculatePercentile(percentil: number) {}

  calculateThroughput() {
  }

  monteCarloSimulation() {}

}
