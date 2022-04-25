import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { ProjectService } from 'src/app/services/project.service';

// Models
import { WorkItem } from 'src/app/models/work-item';

// Material Events
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexAnnotations,
  ApexYAxis,
  ApexXAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexTooltip
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  annotations: ApexAnnotations;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-estimate-single',
  templateUrl: './estimate-single.component.html',
  styleUrls: ['./estimate-single.component.css']
})

export class EstimateSingleComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  projectId: any = '';

  workItemsOfProject: WorkItem[] = [];

  // Los paneles del tablero
  panelNames: string[] = [];

  // Panel inicial y final para obtener las fechas y calcular el tiempo de ciclo
  panelStart: string = '';
  panelEnd: string = '';
  // El valor de sus selectores
  panelStartSelectorValue: string = '';
  panelEndSelectorValue: string = '';

  // Para saber si el mostrar PBI Doing está marcado o no
  showPBIDoing: boolean = false;

  // Panel considerado como Doing
  panelDoing: string = '';

  // data de los workItems Hechos
  dataDone: any[] = [];
  // para guardar todos los datos, así no se ven afectados cuando filtramos por fechas
  allDataDone: any[] = [];

  // data de los workItems que se están haciendo
  dataDoing: any[] = [];

  // percentil para calcular
  percentile: number = 0;
  yValuePercentile: string = '';

  // boolean para mostrar el chart cuando esté ready
  isReady = false;

  // rango de fechas permitidas
  minDate!: Date;
  maxDate!: Date;

  // fechas con las que filtrar dataDone del gráfico
  startDate!: Date;
  endDate!: Date;

  constructor(private route: ActivatedRoute, private projectService: ProjectService) { }

  recalculate(newPercentile: number) {
    // Establecer el nuevo percentil
    this.setPercentile(newPercentile);

    // Calcular la línea de percentil indicada
    this.yValuePercentile = this.calculatePercentile().toString();
  
    // Iniciar el Gráfico con los datos obtenidos
    this.initChart();
  }

  async ngOnInit() {
    this.getProjectId();
    // Establecer los paneles (inicial y final)
    this.setPanelStart('Doing');
    this.setPanelEnd('Closed');
    this.panelStartSelectorValue = this.panelStart;
    this.panelEndSelectorValue = this.panelEnd;

    // Establecer el panel Doing
    this.setPanelDoing('Doing');

    // Establecer el percentil
    this.setPercentile(0.5);
    
    try {
      // Obtener los workItems del Proyecto
      await this.getWorkItemsOfProject();

      /* Obtenemos el conjunto de datos para el gráfico */
      // Datos de workItems que han sido completados
      this.dataDone = await this.getWorkItemsFinished();
      this.allDataDone = this.dataDone;

      // Calcular la línea de percentil indicada
      this.yValuePercentile = this.calculatePercentile().toString();
  
      // Iniciar el Gráfico con los datos obtenidos
      this.initChart();
    }
    catch(error) {
      console.log(error);
    }

    await this.getPanelNames();

    // establecer el rango de fechas según las fechas de los workItems
    this.setMinMaxDates();


    // TODO: si dataDone está vacío mostrar un mensaje (o reemplazar el mensaje de la estimación por ese mensaje)
  }

  async setDataForChart() {
    /* Obtenemos el conjunto de datos para el gráfico */
    // Datos de workItems que han sido completados
    let data = await this.getWorkItemsFinished();

    // filtrar los datos si hay un rango de fechas establecido
    if (this.startDate && this.endDate) {
      let dataInRange: any[] = [];

      for (let d of data) {
        if ((d[0] >= this.startDate) && (d[0] <= this.endDate)) {
          dataInRange.push(d);
        }
      }

      // Si el rango de fechas no contiene datos
      if (dataInRange.length == 0) {
        document.getElementById('warningDates')!.innerText = 'No hay datos que mostrar en ese rango de fechas';
        return;
      }

      // Limpiamos el warning
      document.getElementById('warningDates')!.innerText = '';

      this.dataDone = dataInRange;
    }
    else this.dataDone = data;

    // Asignamos todos los datos (teniendo en cuenta los paneles Start y End)
    this.allDataDone = data;

    // Calcular la línea de percentil indicada
    this.yValuePercentile = this.calculatePercentile().toString();

    // Iniciar el Gráfico con los datos obtenidos
    this.initChart();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  setPanelStart(panel: string) {
    this.panelStart = panel;
  }

  setPanelEnd(panel: string) {
    this.panelEnd = panel;
  }

  setPanelDoing(panel: string) {
    this.panelDoing = panel;

    if (this.showPBIDoing) {
      this.getWorkItemsDoing(true);
    }
  }

  setPanelStartSelector(event: any) {
    let panelName = event.value;
    this.panelStartSelectorValue = panelName;

    if (!this.panelEndSelectorValue) return;

    // El panel no puede tener un index mayor que el de End
    let indexOfPanelStart = this.getIndexFromPanelNamesArray(panelName);
    let indexOfPanelEnd = this.getIndexFromPanelNamesArray(this.panelEndSelectorValue);
    
    // Si el index es mayor
    if (indexOfPanelStart > indexOfPanelEnd) {
      document.getElementById('warningPanels')!.innerText = 'El panel de Inicio no puede estar a la derecha del panel de Fin';
      
      return;
    }

    // Si los paneles coinciden
    if (indexOfPanelStart == indexOfPanelEnd) {
      document.getElementById('warningPanels')!.innerText = 'Los paneles de Inicio y de Fin no pueden coincidir';
      
      return;
    }
    
    // El orden es correcto y no coinciden
    document.getElementById('warningPanels')!.innerText = '';

    // Establecemos el panelStart
    this.panelStart = this.panelStartSelectorValue;

    this.setDataForChart();
  }

  setPanelEndSelector(event: any) {
    let panelName = event.value;
    this.panelEndSelectorValue = panelName;

    if (!this.panelStartSelectorValue) return;

    // El panel no puede tener un index menor que el de Start
    let indexOfPanelStart = this.getIndexFromPanelNamesArray(this.panelStartSelectorValue);
    let indexOfPanelEnd = this.getIndexFromPanelNamesArray(panelName);
    
    // Si el index es mayor
    if (indexOfPanelEnd < indexOfPanelStart) {
      document.getElementById('warningPanels')!.innerText = 'El panel de Fin no puede estar a la izquierda del panel de Inicio';
      
      return;
    }

    // Si los paneles coinciden
    if (indexOfPanelStart == indexOfPanelEnd) {
      document.getElementById('warningPanels')!.innerText = 'Los paneles de Inicio y de Fin no pueden coincidir';
      
      return;
    }

    // El orden es correcto y no coinciden
    document.getElementById('warningPanels')!.innerText = '';

    // Establecemos el panelEnd
    this.panelEnd = this.panelEndSelectorValue;

    // establecer el rango de fechas según las fechas de los workItems
    this.setMinMaxDates();

    this.setDataForChart();
  }

  setPercentile(p: number) {
    this.percentile = p;
  }

  setStartDate(event: MatDatepickerInputEvent<Date>) {
    this.startDate = event.value!;
  }

  setEndDate(event: MatDatepickerInputEvent<Date>) {
    if (!event.value) {
      return;
    }

    this.endDate = event.value!;
    
    // Datos que entran dentro del rango de fechas
    let dataInRange: any[] = [];

    // Recorremos el array de dataDone y seleccionamos las que estén entre StartDate y EndDate
    for (let data of this.allDataDone) {
      if ((data.x >= this.startDate) && (data.x <= this.endDate)) {
        dataInRange.push(data);
      }
    }

    // Si el rango de fechas no contiene datos
    if (dataInRange.length == 0) {
      document.getElementById('warningDates')!.innerText = 'No hay datos que mostrar en ese rango de fechas';
      return;
    }

    // Limpiamos el warning
    document.getElementById('warningDates')!.innerText = '';

    // Nuevos datos dentro del rango de fechas
    this.dataDone = dataInRange;

    // Recalculamos el percentil
    this.yValuePercentile = this.calculatePercentile().toString();
    console.log(this.dataDone)

    // Volver a dibujar el gráfico
    this.initChart();
  }

  setMinMaxDates() {
    // Obtener las fechas del panel considerado como Done
    let dates = this.getDatesOfWorkItems();

    // Si no hay fechas (no hay workItems que hayan sido terminados)
    if (dates.length == 0) {
      return;
    }

    // Si hay fechas, establecemos los límites
    this.maxDate = this.getMaxDate(dates);
    this.minDate = this.getMinDate(dates);
  }

  getIndexFromPanelNamesArray(panelName: string) {
    let panelNames = this.panelNames;
    let lengthPanelNames = this.panelNames.length;

    for (let i = 0; i <  lengthPanelNames; i++) {
      if (panelNames[i] == panelName) return i;
    }

    // No se ha encontrado
    return -1;
  }

  getDatesOfWorkItems(): Date[] {
    // Array donde guardamos las fechas
    let dates = [];

    // Panel considerado como done/end
    let panelEnd = this.panelEnd;

    // los workItems del Project
    let workItem = this.workItemsOfProject;

    for (let wI of workItem) {
      // Recorremos el registro de paneles del workItem
      for (let registry of wI.panelDateRegistry) {
        if (registry.panel == panelEnd) {
          // Añadimos la fecha
          dates.push(this.getDateWithoutTime(registry.date));
        }
      }
    }

    // Devolvemos la lista de fechas
    return dates;
  }

  getMaxDate(dates: Date[]): Date {
    let auxDate = dates[0];

    // longitud del array de dates
    let lengthDates = dates.length;

    for (let i = 1; i < lengthDates; i++) {
      if (dates[i] > auxDate) {
        auxDate = dates[i];
      }
    }

    return auxDate;
  }

  getMinDate(dates: Date[]): Date {
    let auxDate = dates[0];

    // longitud del array de dates
    let lengthDates = dates.length;

    for (let i = 1; i < lengthDates; i++) {
      if (dates[i] < auxDate) {
        auxDate = dates[i];
      }
    }

    return auxDate;
  }

  async getWorkItemsOfProject() {
    this.workItemsOfProject = await lastValueFrom(this.projectService.getWorkItems(this.projectId));
  }

  // Obtener los workItems que han finalizado y su tiempo de ciclo (data puede estar vacío)
  getWorkItemsFinished(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Paneles inicial y final
      let panelStart = this.panelStart;
      let panelEnd = this.panelEnd;
  
      // Array donde se van guardando los datos
      let data: any[] = [];
  
      // Recorremos los workItems del Project
      for (let workItem of this.workItemsOfProject) {
        if (workItem.panel != panelEnd) continue;
        let panelDateRegistry = workItem.panelDateRegistry;

        // Título del workItem
        let title = workItem.title;

        // Descripción del workItem
        // limitar a 50 caracteres
        let description = workItem.description;
        let descriptionArray = description!.split('');

        if (description == '') description = '(sin descripción)';
        
        if (descriptionArray.length > 50) {
          descriptionArray.splice(49, descriptionArray.length - 50);
          description = `${this.arrayToString(descriptionArray)}...`;
        }

        // IdNumber del workItem
        let idNumber = workItem.idNumber;
  
        // Fechas de start y end
        let dateStart!: Date;
        let dateEnd!: Date;
  
        // Buscamos el panel
        // registry.date es un string
        for (let registry of panelDateRegistry) {
          if (registry.panel == panelStart) {
            // Obtener la fecha sin la hora
            dateStart = this.getDateWithoutTime(registry.date);
          }
  
          if (registry.panel == panelEnd) {
            // Obtener la fecha sin la hora
            dateEnd = this.getDateWithoutTime(registry.date);
          }
        }
  
        // Nos aseguramos de que ambas fechas no son null
        if (dateStart && dateEnd) {
          // calcular el tiempo de ciclo
          let cycleTime = this.getDaysBetween(dateEnd, dateStart);
  
          // añadir a data la dateEnd (x) y el cicleTime (y)
          data.push({x: dateEnd, y: cycleTime, title: title, description: description, id: idNumber});
        }

      }
      
      resolve(data);
    })

  }

  getWorkItemsDoing(isChecked: boolean) {
    if (!isChecked) {
      this.showPBIDoing = false;
      this.dataDoing = [];
      this.initChart();
      return;
    }

    // El checkbox está marcado
    this.showPBIDoing = true;

    // Panel considerado como Doing
    let panelDoing = this.panelDoing;

    // Datos de los workItems que se están haciendo
    let data: any[] = [];

    // Recorremos los WorkItems del Project
    for (let wI of this.workItemsOfProject) {
      // Panel actual del WorkItem
      let currentPanel = wI.panel;

      // Fecha en la que entró en el panel Doing
      let dateDoing!: Date;

      // Título del pbi
      let title = wI.title;

      // Descripción del workItem
      // limitar a 50 caracteres
      let description = wI.description;
      let descriptionArray = description!.split('');

      if (description == '') description = '(sin descripción)';
      
      if (descriptionArray.length > 50) {
        descriptionArray.splice(49, descriptionArray.length - 50);
        description = `${this.arrayToString(descriptionArray)}...`;
      }

      // IdNumber del workItem
      let idNumber = wI.idNumber;

      if (currentPanel == panelDoing) {
        /* Si el panel actual es el panel Doing, buscar la fecha en la que entró */
        // Recorrer el panelDateRegistry del WorkItem
        let panelDateRegistry = wI.panelDateRegistry;
        for (let registry of panelDateRegistry) {
          if (registry.panel == currentPanel) {
            // Guardamos la fecha en la que entró en Doing
            dateDoing = this.getDateWithoutTime(registry.date);
            break;
          }
        }

        // Calculamos el tiempo que lleva en el panel Doing (itemAge)
        let todayDate = this.getDateWithoutTime(new Date());
        let itemAge = this.getDaysBetween(todayDate, dateDoing);

        // Añadir los datos
        data.push({x: todayDate, y: itemAge, title: title, description: description, id: idNumber});
      }
    }

    // Establecemos los datos obtenidos
    this.dataDoing = data;
    this.initChart();
  }

  arrayToString(array: string[]) {
    let s = '';
    
    for (let a of array) {
      s += a;
    }

    return s;
  }

  async getPanelNames() {
    try {
      let panels = await lastValueFrom(this.projectService.getPanels(this.projectId));

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

  getDateWithoutTime(date: any): Date {
    let fullDate = new Date(date);
    return new Date(fullDate.toDateString());
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

  calculatePercentile(): Number {
    // Percentile a calcular
    let percentile = this.percentile;

    // No calcular el percentile si este es 0
    if (percentile == 0) {
      return 0;
    }

    // No calcular el percentile si no hay datos en dataDone
    if (this.dataDone.length == 0) return 0;

    /* ordenar los datos por fecha y cycleTime */
    // se ordena this.dataDone
    this.sortData_ByCycleTime(this.dataDone);

    // Número de puntos que hay en los datos
    let numberOfPoints = this.dataDone.length;

    /* Multiplicamos el percentil por el número de puntos */
    // Redondeamos
    let indexOfData = Number((numberOfPoints * percentile).toFixed()) - 1;

    // Devolver el tiempo de ciclo (cycleTime) del dato (punto) en la posición indexOfData
    return this.dataDone[indexOfData].y;
  }

  sortData_ByCycleTime(data: any[]): any[] {
    return data.sort(function (a, b) {
      return a.y - b.y
    })
  }

  initChart() {
    this.chartOptions = {
      series: [
        {
          name: 'Closed',
          data: this.dataDone,
          color: '#207cfc'
        },
        {
          name: 'Doing',
          data: this.dataDoing,
          color: '#fc9520'
        }
      ],

      title: {
        text: 'Tiempo de Ciclo de PBI hechos',
        align: 'center',
        style: {
          fontSize: '18px'
        }
      },

      chart: {
        height: 550,
        type: 'scatter',
        zoom: {
          type: 'xy'
        }
      },

      annotations: {
        yaxis: [
          {
            id: 'percentile',
            y: this.yValuePercentile,
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

      grid: {
        xaxis: {
          lines: {
            show: true
          }
        }
      },

      xaxis: {
        type: 'datetime',
        title: {
          text: 'Fecha',
          style: {
            fontSize: '15px'
          }
        },
        
        labels: {
          formatter: function(value) {
            return new Date(value).toDateString();
          },
          show: false
        }
      },

      yaxis: {
        title: {
          text: 'Tiempo de Ciclo (días)',
          style: {
            fontSize: '15px'
          }
        },
        tooltip: {
          enabled: true
        },
        crosshairs: {
          show: true
        }
      },

      tooltip: {
        custom: function({ seriesIndex, dataPointIndex, w }) {
          let data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];

          return '<div style="padding: 10px 10px;">' +
            '<div><b>ID:</b> #' + data.id + '</div>' +
            '<div><b>Fecha de Fin:</b> ' + data.x.toDateString() + '</div>' +
            '<div><b>Tiempo de Ciclo:</b> ' + data.y + '</div>' +
            '<div><b>Título:</b> ' + data.title + '</div>' +
            '<div><b>Descripción:</b> ' + data.description + '</div>' +
            '</div>';
        }
      }
    };

    this.isReady = true;
  }

}
