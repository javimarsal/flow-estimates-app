import { Component, ViewChild, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
    this.initChart();
  }

  initChart() {
    this.chartOptions = {
      series: [
        {
          name: 'TEAM 1',
          data: this.generateDayWiseTimeSeries(new Date("11 Feb 2017 GMT").getTime(), 20, 
            {
              min: 10,
              max: 60
            }
          )
        },
        {
          name: 'TEAM 2',
          data: this.generateDayWiseTimeSeries(new Date("11 Feb 2017 GMT").getTime(), 20, 
            {
              min: 10,
              max: 60
            }
          )
        },
        {
          name: 'TEAM 3',
          data: this.generateDayWiseTimeSeries(new Date("11 Feb 2017 GMT").getTime(), 30, 
            {
              min: 10,
              max: 60
            }
          )
        },
        {
          name: 'TEAM 4',
          data: this.generateDayWiseTimeSeries(new Date("11 Feb 2017 GMT").getTime(), 10, 
            {
              min: 10,
              max: 60
            }
          )
        },
        {
          name: 'TEAM 5',
          data: this.generateDayWiseTimeSeries(new Date("11 Feb 2017 GMT").getTime(), 30, 
            {
              min: 10,
              max: 60
            }
          )
        },
      ],

      chart: {
        height: 350,
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

      yaxis: {
        max: 70
      }
    };
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
