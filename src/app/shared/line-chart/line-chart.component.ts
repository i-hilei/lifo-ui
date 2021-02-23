import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnInit {

    @Input() legend = '';
    @Input() data = [];
    @Input() labels = [];

    public lineChartData: ChartDataSets[] = [
        {
            data: [],
            label: 'Revenue',
            yAxisID: 'left-y-axis',
        },
    ];
    public lineChartLabels: Label[] = [];
    public lineChartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            yAxes: [{
                id: 'left-y-axis',
                type: 'linear',
                position: 'left',
            }],
        },
        tooltips: {
            intersect: false,
        },
    };
    public lineChartColors: Color[] = [
        {
            borderColor: 'rgb(123, 38, 218)',
            backgroundColor: 'rgb(123, 38, 218, 0.1)',
        },
        {
            borderColor: 'rgb(0, 113, 255)',
            backgroundColor: 'rgb(0, 113, 255, 0.1)',
        },
    ];
    public lineChartLegend = false;
    public lineChartType = 'line';
    public lineChartPlugins = [];


    constructor() { }

    ngOnInit(): void {
        this.lineChartData[0].data = this.data;
        this.lineChartData[0].label = this.legend;
        this.lineChartLabels = this.labels;
    }

}
