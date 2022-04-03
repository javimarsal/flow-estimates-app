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
  ApexYAxis,
  ApexXAxis,
  ApexDataLabels,
  ApexGrid
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
};

@Component({
  selector: 'app-estimate-single',
  templateUrl: './estimate-single.component.html',
  styleUrls: ['./estimate-single.component.css']
})

export class EstimateSingleComponent implements OnInit {
  // https://apexcharts.com/javascript-chart-demos/scatter-charts/datetime/
  // https://apexcharts.com/docs/angular-charts/#
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  projectId: any = '';

  workItemsOfProject: WorkItem[] = [];

  // Panel inicial y final para obtener las fechas y calcular el tiempo de ciclo
  panelStart: string = '';
  panelEnd: string = '';

  // data de los workItems Hechos
  dataDone: any[] = []

  // boolean para mostrar el chart cuando esté ready
  isReady = false;

  constructor(private route: ActivatedRoute, private projectService: ProjectService) { }

  async ngOnInit() {
    this.getProjectId();
    // Establecer los paneles (inicial y final)
    this.setPanelStart('Doing');
    this.setPanelEnd('Closed');

    // Obtener los workItems del Proyecto
    await this.getWorkItemsOfProject();
    console.log(this.workItemsOfProject)
    this.dataDone = this.getWorkItemsFinished();
    console.log(this.dataDone)

    // TODO: si dataDone está vacío mostrar un mensaje (o reemplazar el mensaje de la estimación por ese mensaje)

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

  async getWorkItemsOfProject() {
    this.workItemsOfProject = await lastValueFrom(this.projectService.getWorkItems(this.projectId));
  }

  // Obtener los workItems que han finalizado y su tiempo de ciclo (data puede estar vacío)
  getWorkItemsFinished() {
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
    
    return data
  }

  // TODO
  getWorkItemsDoing() {

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

    return (milisecs + msecPerDay) / msecPerDay;
  }

  initChart() {
    this.chartOptions = {
      series: [
        {
          name: 'Closed',
          data: this.dataDone
        },
        // {
        //   name: 'Doing',
        //   data: this.generateDayWiseTimeSeries(new Date("11 Feb 2017 GMT").getTime(), 10, 
        //     {
        //       min: 10,
        //       max: 60
        //     }
        //   )
        // },
      ],

      chart: {
        height: 550,
        type: 'scatter',
        zoom: {
          type: 'xy'
        }
      },

      dataLabels: {
        enabled: false
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
        type: 'datetime'
      },

      // yaxis: {
      //   max: 70
      // }
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
