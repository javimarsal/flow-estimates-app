import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { ProjectService } from 'src/app/services/project.service';

// Models
import { WorkItem } from 'src/app/models/work-item';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexAnnotations,
  ApexYAxis,
  ApexXAxis,
  ApexGrid,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { MatCheckboxChange } from '@angular/material/checkbox';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  annotations: ApexAnnotations;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-estimate-single',
  templateUrl: './estimate-single.component.html',
  styleUrls: ['./estimate-single.component.css']
})

export class EstimateSingleComponent implements OnInit {
  // https://apexcharts.com/javascript-chart-demos/scatter-charts/datetime/
  // https://apexcharts.com/docs/angular-charts/#
  // https://apexcharts.com/docs/annotations/

  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  projectId: any = '';

  workItemsOfProject: WorkItem[] = [];

  // Panel inicial y final para obtener las fechas y calcular el tiempo de ciclo
  panelStart: string = '';
  panelEnd: string = '';
  // Panel considerado como Doing
  panelDoing: string = '';

  // data de los workItems Hechos
  dataDone: any[] = [];

  // data de los workItems que se están haciendo
  dataDoing: any[] = [];

  // percentil para calcular
  percentile: number = 0;
  yValuePercentile: string = '';

  // boolean para mostrar el chart cuando esté ready
  isReady = false;

  constructor(private route: ActivatedRoute, private projectService: ProjectService) { }

  recalculate(newPercentile: number) {
    // Establecer el nuevo percentil
    this.setPercentile(newPercentile);

    // Calcular la línea de percentil indicada
    this.yValuePercentile = this.calculatePercentile().toString();
  
    // Iniciar el Gráfico con los datos obtenidos
    this.initChart();
    // this.chart.clearAnnotations();
    // this.chart.addYaxisAnnotation({
    //   y: this.yValuePercentile,
    //   borderColor: '#e84c4c',
    //   strokeDashArray: 0,
    //   label: {
    //     borderColor: '#e84c4c',
    //     style: {
    //       color: '#fff',
    //       background: '#e84c4c',
    //       fontSize: '15',
    //     },
    //     text: `Percentil ${this.percentile * 100}`,
    //   }
    // })
    // this.chart.render();
  }

  async ngOnInit() {
    this.getProjectId();
    // Establecer los paneles (inicial y final)
    this.setPanelStart('Doing');
    this.setPanelEnd('Closed');

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

      // Calcular la línea de percentil indicada
      this.yValuePercentile = this.calculatePercentile().toString();
  
      // Iniciar el Gráfico con los datos obtenidos
      this.initChart();
    }
    catch(error) {
      console.log(error);
    }

    // TODO: si dataDone está vacío mostrar un mensaje (o reemplazar el mensaje de la estimación por ese mensaje)
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
  }

  setPercentile(p: number) {
    this.percentile = p;
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
        let panelDateRegistry = workItem.panelDateRegistry;
  
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
          data.push([dateEnd, cycleTime]);
        }

      }
      
      resolve(data);
    })

  }

  getWorkItemsDoing(event: MatCheckboxChange) {
    if (!event.checked) {
      this.dataDoing = [];
      this.initChart();
      return
    }

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
        data.push([todayDate, itemAge]);
      }
    }

    // Establecemos los datos obtenidos
    this.dataDoing = data;
    this.initChart();
  }

  // TODO
  // Para poder elegir panel inicial y final
  // Solo los paneles en los que haya habido workItems??
  getPanelNames() {

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

    /* ordenar los datos por fecha y cycleTime */
    // se ordena this.dataDone
    this.sortData_ByCycleTime(this.dataDone);

    // Número de puntos que hay en los datos
    let pointsNumber = this.dataDone.length;

    /* Multiplicamos el percentil por el número de puntos */
    // Redondeamos
    let indexOfData = Number((pointsNumber * percentile).toFixed()) - 1;

    // Devolver el tiempo de ciclo (cycleTime) del dato (punto) en la posición indexOfData
    return this.dataDone[indexOfData][1];
  }

  sortData_ByCycleTime(data: any[]): any[] {
    return data.sort(function (a, b) {
      return a[1] - b[1]
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
        },
        yaxis: {
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
        }
      }
    };

    this.isReady = true;
  }

  public generateDayWiseTimeSeries(baseval: number, count: number, yrange: any): number[] {
    var i = 0;
    var series: any[] = [];
    while (i < count) {
      var y: number =
        Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
      
      series.push([baseval, y]);
      baseval += 86400000;
      i++;
    }
    return series;
  }

}
