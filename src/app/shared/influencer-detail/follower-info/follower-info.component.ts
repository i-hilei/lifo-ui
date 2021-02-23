import { Component, OnInit, Input } from '@angular/core';
import { InfluencerDetailComponent } from '../influencer-detail.component';
import { Influencer } from 'src/types/influencer';
import { ChartType, ChartOptions, ChartDataSets, ChartColor } from 'chart.js';
import { MultiDataSet, Label, Color } from 'ng2-charts';


import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
    selector: 'app-follower-info',
    templateUrl: './follower-info.component.html',
    styleUrls: ['./follower-info.component.scss'],
})
export class FollowerInfoComponent implements OnInit {
    @Input() influencer;
    tooltips = {
        follower: 'Does this influencer have a real audience? More than 20% of fake followers is typically a sign of fraud.',
        gender: 'What gender categories does the influencer reach?',
        ageGender: 'A breakdown of the age and gender an influencer reaches.',
        locationByCountry: 'This indicates the countries the influencer’s audience is located in.',
        locationByCity: 'This indicates the cities the influencer’s audience is located in.',
        sponsoredPost: '',
        tags: 'These are the hashtags and other users that are frequently adding to their content.',
    };
    isSetHeight = false;

    public genderChartLabels: Label[] = ['Male', 'Female'];
    public genderChartColors: Color[] =  [
        {
            borderColor: [
                '#63B3B8',
                '#0D053C',
            ],
            backgroundColor: [
                '#63B3B8',
                '#0D053C',
            ],
        },
    ];
    public genderChartData: MultiDataSet = [
        [25, 75],
    ];
    public genderChartOptions: ChartOptions = {
        legend: {
            display: false,
        },
        maintainAspectRatio: false,
        cutoutPercentage: 80,
    };
    public genderChartType: ChartType = 'doughnut';

    public genderAgeChartOptions: ChartOptions = {
        responsive: true,
        legend: {
            display: false,
        },
        layout: {
            padding: {
                top: 20,
            },
        },
        maintainAspectRatio: false,
        plugins: {
            // datalabels: {
            //     anchor: 'end',
            //     align: 'end',
            //     formatter(value, context) {
            //         return `${Math.round(value * 100)  }%`;
            //     },
            // },
        },
        scales: {
            xAxes: [
                {
                    gridLines: {
                        display: false,
                    },
                },
            ],
            yAxes: [
                {
                    ticks: {
                        display: false,
                    },
                    gridLines: {
                        display: false,
                    },
                },
            ],
        },
    };
    public genderAgeChartLabels: Label[] = [];
    public genderAgeChartColors: Color[] = [
        {
            borderColor: '#0D053C',
            backgroundColor: '#0D053C',
        },
        {
            borderColor: '#4B57C5',
            backgroundColor: '#4B57C5',
        },
    ];
    public genderAgeChartType: ChartType = 'bar';

    public genderAgeChartData: ChartDataSets[] = [
        { data: [], label: 'Male', barPercentage: 0.5 },
        { data: [], label: 'Female', barPercentage: 0.5 },
    ];
    public barChartPlugins = [];

    constructor() { }

    prepareData() {
        const genderAgeLabel = [];
        const maleData = [];
        const femaleData = [];
        setTimeout(() => {
            this.influencer?.audience?.gendersPerAge.forEach(item => {
                genderAgeLabel.push(item.code);
                maleData.push(item.male);
                femaleData.push(item.female);
            });
            this.genderAgeChartLabels = genderAgeLabel;
            this.genderAgeChartData[0].data = maleData;
            this.genderAgeChartData[1].data = femaleData;
        }, 200);

    }

    ngOnInit(): void {
        this.prepareData();

    }

}
