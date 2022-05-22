import { Component, ViewChild, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

// Models
import { Panel } from 'src/app/models/panel';
import { WorkItem } from 'src/app/models/work-item';

// Services
import { ProjectService } from 'src/app/services/project.service';
import { WorkItemService } from 'src/app/services/work-item.service';

// Material Events
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexAnnotations,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexTooltip,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  annotations: ApexAnnotations;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-estimate-multiple-how-many',
  templateUrl: './estimate-multiple-how-many.component.html',
  styleUrls: ['./estimate-multiple-how-many.component.css']
})

export class EstimateMultipleHowManyComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  isReady = false;

  // Panel considerado como done
  panelDone: string = '';

  // Array de paneles para el panelThroughput
  panelList_ForSelectingPanelDone: string[] = [];

  // Condición para poder inicar la simulación, o no
  arePanelsRight: boolean = true;

  // Condiciones para deshabilitar o no los paneles backlog
  disabledPanels: any = [];
  // array donde se guarda el número de workItems de cada panel
  numberOfWorkItems_PerPanel: any = [];

  // fechas por las que filtrar los workItems para el cálculo del Throughput
  startDate!: Date;
  endDate!: Date;
  objectiveDate!: Date;

  todayDate!: Date;

  // fechas permitidas para el usuario
  permitedMinDate!: Date;
  permitedMaxDate!: Date;

  projectId: any = '';
  panelNames: string[] = [];

  // Datos para el gráfico
  dataChart: any[] = [];
  allData: number[] = [];

  // percentil
  percentile: number = 0;
  xValuePercentile: string = '';

  // Número de ejecuciones Simulación Monte Carlo
  numberOfExecutions: number = 10000;

  constructor(private route: ActivatedRoute, private location: Location, private projectService: ProjectService, private workItemService: WorkItemService) { }

  async ngOnInit() {
    // obtenemos el id del proyecto para poder obtener sus datos
    this.getProjectId();

    this.todayDate = new Date(new Date().toDateString());

    // obtenemos el nombre de los paneles para poder hacer la selección
    await this.getPanelNames();

    // Obtener el número de workItems que hay en cada panel y guardarlo en el array numberOfWorkItems_PerPanel
    await this.getNumberOfWorkItems_PerPanel(this.numberOfWorkItems_PerPanel);

    // inicializar array con las condiciones para deshabilitar o no los paneles backlog
    // numberOfWorkItems_PerPanel se utiliza para deshabilitar (true) el panel si numberOfWorkItems_PerPanel[pN] no tiene workItems
    this.initDisableArray(this.disabledPanels, this.numberOfWorkItems_PerPanel);

    // formar la lista de panel Throughput
    this.setPanelThroughputList(this.disabledPanels);

    // el percentil por defecto es el 50
    this.setPercentile(0.5);

    // inicializar el gráfico sin datos para que se muestre el hueco del gráfico
    this.initChart([]);
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  goBack() {
    this.location.back();
  }

  async getNumberOfWorkItems_PerPanel(listOfNumberOfWorkItems_PerPanel: any) {
    let panelNames = this.panelNames;

    if (panelNames.length == 0) return;

    for (let pN of panelNames) {
      let workItemsOfPanel = await this.getWorkItemsOfPanel(pN, '');

      if (workItemsOfPanel) {
        listOfNumberOfWorkItems_PerPanel[pN] = workItemsOfPanel.length;
      }
      // Si pasa por aquí es porque workItemsOfPanel es false (no tiene workItems)
      else listOfNumberOfWorkItems_PerPanel[pN] = 0;
    }
  }

  initDisableArray(disableArray: any, listOfWorkItemsPerPanel: any) {
    let panelNames = this.panelNames;

    if (panelNames.length == 0) return;

    for (let pN of panelNames) {
      if (listOfWorkItemsPerPanel[pN] > 0) {
        disableArray[pN] = false;
      }
      else disableArray[pN] = true;
    }
  }

  setPanelThroughputList(disabledPanels: any) {
    // Borrar el contenido de la lista
    this.panelList_ForSelectingPanelDone = [];

    // Establecer la lista
    for (let key in disabledPanels) {
      if (!disabledPanels[key]) this.panelList_ForSelectingPanelDone.push(key);
    }
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

  setPercentile(p: number) {
    this.percentile = p;
  }

  setStartDate(event: MatDatepickerInputEvent<Date>) {
    this.startDate = event.value!;
  }

  async setEndDate(event: MatDatepickerInputEvent<Date>) {
    if (!event.value) {
      return;
    }
    this.endDate = event.value!;

    // obtener workItems entre el rango de fechas, si no hay se muestra un warning
    let workItemsOfPanelDoneBetweenDates = await this.getPanelWorkItemsBetweenDates(this.panelDone, 'warningDates', this.startDate, this.endDate);

    if (!workItemsOfPanelDoneBetweenDates) return;

    // Borramos un posible warning, ocasionado por que el rango anterior no está permitido
    this.changeInnerText('warningDates', '');

  }

  setObjectiveDate(event: MatDatepickerInputEvent<Date>) {
    this.objectiveDate = event.value!;
    this.changeInnerText('warningDateObjective', '');
  }

  async setPanelDoneSelector(event: any, startDate: HTMLInputElement, endDate: HTMLInputElement) {
    // panelDone seleccionado anteriormente, para poner su disabled a false
    let previousPanelDone = this.panelDone;

    // Establecer el panel considerado para el cálculo del Throughput
    this.panelDone = event.value;

    // Actualizar array disabledPanels
    this.disabledPanels[previousPanelDone] = false;
    this.disabledPanels[this.panelDone] = true;
    
    // Obtenemos los workItems de ese panel (aunque está asegurado que tiene workItems)
    let workItemsOfPanel = await this.getWorkItemsOfPanel(this.panelDone, 'warningPanelDone');

    if (!workItemsOfPanel) return;
    this.changeInnerText('warningPanelDone', '');

    /* Establecer el rango de fechas permitido (para el usuario) */
    // obtener las fechas de los workItems
    let datesOfPanel = this.getDatesOfWorkItems(workItemsOfPanel, this.panelDone);

    // ordenamos las fechas quedando la más actual en la posición n-1, y la más antigua en la 0
    this.sortList(datesOfPanel);

    // obtener la fecha más antigua y la más actual de los workItems
    this.permitedMaxDate = datesOfPanel[datesOfPanel.length - 1];
    this.permitedMinDate = datesOfPanel[0];

    // Comprobar que el rango de fechas (seleccionado por el usuario) sigue estando bien
    if (this.startDate && this.endDate) {
      if (!this.checkDateRangeIsRight(this.startDate, this.endDate, this.permitedMinDate, this.permitedMaxDate)) {
        this.deleteDates(startDate, endDate);
        
        this.changeInnerText('warningDates', `Las fechas se han eliminado porque el rango que se había elegido ya no se corresponde con el rango permitido por el panel ${this.panelDone}`);

        return;
      }

      // el rango de fechas es correcto, comprobar si para el nuevo panel Done sigue habiendo workItems en el rango de fechas indicado
      let workItemsOfPanelDoneBetweenDates = await this.getPanelWorkItemsBetweenDates(this.panelDone, 'warningDates', this.startDate, this.endDate);
      
      if (!workItemsOfPanelDoneBetweenDates) return;

      // El rango está bien, y hay workItems en ese rango (borramos cualquier warning que pueda haber)
      this.changeInnerText('warningDates', '');
    }
  }

  getDatesOfWorkItems(workItems: WorkItem[], panelName: string): Date[] {
    let dates: Date[] = []

    // Recorremos los workItems
    for (let wI of workItems) {
      // Recorremos el array de registros
      let panelDateRegistry = wI.panelDateRegistry;
      for (let registry of panelDateRegistry) {
        // Si coincide con el panelName lo guardamos
        if (registry.panel == panelName) dates.push(new Date(new Date(registry.date).toDateString()));
      }
    }
    return dates;
  }

  sortList(list: any[]) {
    return list.sort((a, b) => a - b)
  }

  checkDateRangeIsRight(startDate: Date, endDate: Date, permitedMinDate: Date, permitedMaxDate: Date) {
    // Comprobar que las fechas Start y End siguen estando entre el rango permitido
    if (((startDate >= permitedMinDate) && (startDate <= permitedMaxDate))  &&  ((endDate >= permitedMinDate) && (endDate <= permitedMaxDate))) return true;

    return false;
  }

  async getWorkItemsOfPanel(panelName: string, elementId: string) {
    // Comprobamos que el panel se ha seleccionado (no debe ser '')
    if (!panelName) return false;

    let allWorkItems = await this.getWorkItems();
      
    // filtramos los workItems por el panel correspondiente
    let workItemsOfPanel = this.filterWorkItems_ByPanelName(allWorkItems, panelName);

    if (workItemsOfPanel.length == 0) {
      // Si el panel no tiene workItems, mostramos un warning
      if (elementId) this.changeInnerText(elementId, `No hay ninguna tarea en el panel "${panelName}"`);
      return false;
    }

    // tiene workItems
    return workItemsOfPanel;
  }

  async getPanelWorkItemsBetweenDates(panelName: string, elementId: string, startDate: Date, endDate: Date) {
    // Comprobamos que el panel se ha seleccionado (no debe ser '')
    if (!panelName) return false;

    let allWorkItems = await this.getWorkItems();
      
    // filtramos los workItems por el panel correspondiente
    let workItemsOfPanel = this.filterWorkItems_ByPanelName(allWorkItems, panelName);

    if (workItemsOfPanel.length == 0) return false;
    
    if (!startDate && !endDate) return false;

    // Filtramos los workItems del panel entre el rango de fechas
    let workItemsOfPanelBetweenDates = [];

    for (let wI of workItemsOfPanel) {
      let panelDateRegistry = wI.panelDateRegistry;
      for (let registry of panelDateRegistry) {
        // Buscamos el nombre del panel en el registro del workItem
        if (registry.panel == panelName) {
          let registryDate = new Date(new Date(registry.date).toDateString());
          // si la fecha está entre el rango de fechas, guardamos el workItem
          if ((registryDate >= startDate)  &&  (registryDate <= endDate)) {
            workItemsOfPanelBetweenDates.push(wI);
          }
        }
      }
    }

    if (workItemsOfPanelBetweenDates.length == 0) {
      if (elementId) this.changeInnerText(elementId, 'No se ha encontrado ninguna tarea en este rango de fechas');
      return false;
    }

    // tiene workItems
    return workItemsOfPanelBetweenDates;
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

  calculatePercentile(percentile: number) {
    // Establecer el percentil
    this.percentile = percentile;

    // No calcular el percentil si este es 0
    if (percentile == 0) return;

    // No calcular el percentil si no se ha realizado la simulación, es decir, allData está vacío
    if (this.allData.length == 0) return;
    
    // Número de puntos que hay en los datos
    let numberOfPoints = this.allData.length;

    /* Multiplicamos el percentil por el número de puntos */
    // Redondeamos (tenemos que darle la vuelta, por eso restamos por el numberOfPoints-1)
    let indexOfData = (numberOfPoints - 1) - (Number((numberOfPoints * percentile).toFixed()) - 1);
    

    // this.allData ya está ordenado de menor a mayor número
    // obtenemos el valor en el eje X, que es el valor de allData en la posición indexOfData
    this.xValuePercentile = this.allData[indexOfData].toString();

    // inicializamos el gráfico
    this.initChart(this.dataChart);
  }

  /**
   * Comprobamos si se han seleccionado los paneles, y si existen workItems en ambos paneles (comprobando si existe el rango de fechas en el caso del panel Done), también se comprueba que el número de ejecuciones sea correcto (un número sin puntos y sin comas)
   */
  async isSimulationReady(numberOfExecutions: string) {
    // Si falta el panel Done, noReady
    if (!this.panelDone) {
      this.changeInnerText('warningPanelDone', 'Se debe seleccionar el panel de tareas hechas');
      return false;
    }

    // Si falta la fecha objetivo, noReady
    if (!this.objectiveDate) {
      this.changeInnerText('warningDateObjective', 'Se debe seleccionar la fecha objetivo');
      return false;
    }

    if (this.startDate && this.endDate) {
      if (!await this.getPanelWorkItemsBetweenDates(this.panelDone, '', this.startDate, this.endDate)) return false;
    }

    // No se ha seleccionado el rango de fechas y el panel Done no tiene workItems, noReady
    if (!await this.getWorkItemsOfPanel(this.panelDone, '')) return false;

    // Comprobar que el número de ejecuciones es un número y que está escrito sin comas ni puntos
    // Si el valor está vacío, es 0 o no es un número, o contiene una coma, noReady
    if (!Number(numberOfExecutions)) {
      this.changeInnerText('warningExecutions', 'Número incorrecto. Éste debe ser mayor que 0 y debe ser entero (evita los puntos y las comas). Ejemplo número correcto: 100 (cien), 1000 (mil), 10000 (diez mil)');
      return false;
    }

    // Si el valor no es positivo, noReady
    if (Number(numberOfExecutions) < 0) {
      this.changeInnerText('warningExecutions', 'Número incorrecto. Éste debe ser mayor que 0 y debe ser entero (evita los puntos y las comas). Ejemplo número correcto: 100 (cien), 1000 (mil), 10000 (diez mil)');
      return false;
    }

    // Sabemos que el valor es un número, pero si no es entero, noReady
    if (!this.isInteger(numberOfExecutions)) {
      this.changeInnerText('warningExecutions', 'Número incorrecto. Éste debe ser mayor que 0 y debe ser entero (evita los puntos y las comas). Ejemplo número correcto: 100 (cien), 1000 (mil), 10000 (diez mil)');
      return false;
    }

    this.changeInnerText('warningExecutions', '');
    return true;
  }

  isInteger(number: string) {
    let regExpression = /^-?[0-9]+$/;

    // Si el número tiene comas, se reemplazan por puntos
    number = number.replace(',', '.');

    // Si el número (string) se corresponde con la expresión, es integer
    let result = regExpression.test(number);
    if (result) {
      return true;
    }
    
    return false;
  }

  async calculateDailyThroughput() {
    let dailyThroughput: number[] = [];

    /* Obtener los workItems */
    let workItems: any = []

    // considerar si se ha seleccionado un rango de fechas
    if (this.startDate && this.endDate) {
      workItems = await this.getPanelWorkItemsBetweenDates(this.panelDone, '', this.startDate, this.endDate);
    }
    else {
      workItems = await this.getWorkItemsOfPanel(this.panelDone, '');
    }

    // Obtener las fechas de los workItems
    let datesOfWorkItems = this.getDatesOfWorkItems(workItems, this.panelDone);

    // Ordenamos las fechas quedando la más actual en la posición n-1, y la más antigua en la 0
    this.sortList(datesOfWorkItems);

    // Fechas más antigua y actual
    let earliestDate = new Date(datesOfWorkItems[0]);
    let latestDate = new Date (datesOfWorkItems[datesOfWorkItems.length - 1]);

    // Obtener todas las fechas entre la más antigua y la más actual, y guardarlas en un array de clave (fecha) y valor (throughput)
    let allDatesBetweenEarliestAndLatest: any = [];
    // inicializamos con la fecha más antigua
    allDatesBetweenEarliestAndLatest[earliestDate.toString()] = 0;

    while (earliestDate.toString() != latestDate.toString()) {
      // incrementamos la fecha en un día
      earliestDate.setDate(earliestDate.getDate() + 1);

      // la incluimos en el array con throughput 0
      allDatesBetweenEarliestAndLatest[earliestDate.toString()] = 0;
    }

    // Contar la ocurrencia de cada fecha
    for (let date of datesOfWorkItems) {
      allDatesBetweenEarliestAndLatest[date.toString()] += 1;
    }

    // Quedarnos solo con el Throughput
    earliestDate = new Date(datesOfWorkItems[0]);
    dailyThroughput.push(allDatesBetweenEarliestAndLatest[earliestDate.toString()]);

    while (earliestDate.toString() != latestDate.toString()) {
      // incrementamos la fecha en un día
      earliestDate.setDate(earliestDate.getDate() + 1);

      // incluimos el throughput según la clave (fecha) en el array de dailyThroughput
      dailyThroughput.push(allDatesBetweenEarliestAndLatest[earliestDate.toString()]);
    }
    
    // Devolvemos el Throughput calculado
    return dailyThroughput;
  }

  async monteCarloSimulation(numberOfExecutions: string) {
    if (!await this.isSimulationReady(numberOfExecutions)) {
      return;
    }

    let dailyThroughput = await this.calculateDailyThroughput();

    // para seleccionar un número aleatorio
    let dTLength = dailyThroughput.length;

    // convertir numberOfExecutions a número para poder utilizarlo como tal
    let nExecutions = Number(numberOfExecutions);

    // Obtener el número de días desde todayDate hasta objectiveDate
    let nDays = this.getDaysBetween(this.objectiveDate, this.todayDate);

    // Lista donde guardamos el número de tareas obtenido en cada ejecución
    let nWorkItemsList: number[] = [];

    // Comenzamos con la Simulación, ejecutándole el número de veces que se ha especificado
    for (let i = 0; i < nExecutions; i++) {
      let nWorkItems = 0;

      for (let i = 0; i < nDays; i++) {
        // Elegimos un número aleatorio de la lista de daily Throughput
        let n = dailyThroughput[Math.floor(Math.random() * dTLength)];

        // sumamos el número aleatorio a nWorkItems, así tenemos el número de workItems que se van complentado en nDays
        nWorkItems += n;
      }

      // guardamos los días transcurridos en la lista de días
      nWorkItemsList.push(nWorkItems);
    }

    // Transformamos los datos para el gráfico
    this.dataChart = this.setChartData(nWorkItemsList);

    // Lista de número de workItems completados, obtenidos en cada ejecución (para calcular el percentil)
    this.allData = nWorkItemsList;
    
    // Calcular el percentil especificado por la variable this.percentile. También se inicializa el gráfico
    this.calculatePercentile(this.percentile);
  }

  getDaysBetween(dateEnd: any, dateStart: any): number {
    // tiempo transcurrido en milisegundos
    let daysInMiliseconds = dateEnd - dateStart;

    // transformas a días y sumarle 1
    return this.transformMsecToDays(daysInMiliseconds) + 1;
  }

  transformMsecToDays(milisecs: number): number {
    let msecPerMinute = 1000 * 60;
    let msecPerHour = msecPerMinute * 60;
    let msecPerDay = msecPerHour * 24;

    return Number((milisecs / msecPerDay).toFixed());
  }

  setChartData(nWorkItemsList: number[]) {
    // Datos para el gráfico
    let data: any[] = [];

    // Ordenar la lista del número de workItems
    this.sortList(nWorkItemsList);

    // Recorremos la lista, contamos los números que se repiten y lo guardamos en el array data junto el número de tareas hechas
    // primer número para comparar
    let num = nWorkItemsList[0];
    let nWorkItemsListLength = nWorkItemsList.length;
    // veces que se repite el número
    let occurrences = 0;

    for (let i = 0; i < nWorkItemsListLength; i++) {
      // guardar los datos de la última posición si num no ha cambiado
      if (nWorkItemsList[i] == num  &&  i == (nWorkItemsListLength - 1)) {
        
        if (occurrences != 0) {
          data.push(
            {
              x: `${num}`,
              y: occurrences + 1
            }
          );
        }
        else {
          data.push(
            {
              x: `${num}`,
              y: 1
            }
          );
        }
      }

      if (nWorkItemsList[i] != num) {
        data.push(
          {
            x: `${num}`,
            y: occurrences
          }
        );

        num = nWorkItemsList[i];
        occurrences = 0;

        // caso (6, 6, 7), 7 está en la última posición, hay que guardarlo
        if (i == (nWorkItemsListLength - 1)) {
          data.push(
            {
              x: `${num}`,
              y: 1
            }
          )
        }
      }

      // se incrementa al final para contar el num actual
      occurrences++;
    }

    return data;
  }

  initChart(data: any = undefined) {
    this.chartOptions = {
      series: [
        {
          name: 'Tareas completadas',
          data: data
        }
      ],

      title: {
        text: 'Posibles Tareas Completadas en la Fecha Objetivo',
        align: 'center',
        style: {
          fontSize: '18px'
        }
      },

      chart: {
        height: 650,
        width: 900,
        type: 'bar',
      },

      xaxis: {
        title: {
          text: 'Nº de Tareas Completadas en la Fecha Objetivo',
          style: {
            fontSize: '15px'
          }
        }
      },

      yaxis: {
        show: false
      },

      annotations: {
        xaxis: [
          {
            id: 'percentile',
            x: this.xValuePercentile,
            borderColor: '#e84c4c',
            strokeDashArray: 0,
            label: {
              borderColor: '#e84c4c',
              style: {
                color: '#fff',
                background: '#e84c4c',
                fontSize: '15',
              },
              text: `Percentil ${this.percentile * 100}`,
            }
          }
        ]
      },

      dataLabels: {
        enabled: false
      },

      tooltip: {
        custom: function({ seriesIndex, dataPointIndex, w }) {
          let data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];

          return '<div style="padding: 10px 10px;">' +
            '<div><b>Nº tareas completadas:</b> ' + data.x + '</div>' +
            '<div><b>Ocurrencias:</b> ' + data.y + '</div>' +
            '</div>';
        }
      }
    }

    this.isReady = true;
  }

}