import { Component, OnInit } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
declare var _: any;
@Component({
    selector: 'app-line-chart-friend-referral',
    templateUrl: './line-chart-friend-referral.component.html',
    styleUrls: ['./line-chart-friend-referral.component.scss'],
})
export class LineChartFriendReferralComponent implements OnInit {
    // Array of different segments in chart

    //Labels shown on the x-axis
    lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    // Define chart options
    lineChartOptions: ChartOptions = {
        responsive: true,
    };
    // Define colors of chart segments
    lineChartColors: Color[] = [
        {
            // Email
            backgroundColor: '#414bb2',
        },
        {
            // Instagram
            backgroundColor: '#f980ea',
          
        },
        {
            // web 
            backgroundColor: '#f2c94c',
         
        },
        {
            // Tiktok
            backgroundColor: '#0d023c',
           
        },
        {
            // Wechat
            backgroundColor: '#3bcc77',
         
        },
        {
            // Facebook
            backgroundColor: '#56ccf2',
           
        },
        {
            // Unknown
            backgroundColor: '#bdbdbd',
          
        },
    ];

    // Set true to show legends
    lineChartLegend = true;
    // Define type of chart
    lineChartType = 'line';
    lineChartPlugins = [];

    getReferral: any;
    getInstagram = [];
    getEmail = [];
    source_register_influcer = [];
    dynamicDate = [];
    invitaionType = [];
    lineChartData:ChartDataSets []=[]
  
    constructor(private internalService: InternalService) {}
    ngOnInit() {
        this.getReffral();
        this.getchartdata()
    }

    getchartdata(){
        this.lineChartData = [
            { data: [65, 59, 80, 81, 56, 55, 40], label: 'Email' },
            { data: [28, 48, 40, 19, 86, 27, 90], label: 'Instagram' },
            { data: [45, 68, 48, 18, 85, 27, 95], label: 'Web' },
            { data: [28, 44, 40, 188, 80, 22, 90], label: 'TikTok' },
            { data: [28, 48, 40, 19, 86, 27, 90], label: 'WeChat' },
            { data: [28, 48, 40, 19, 86, 27, 90], label: 'Facebook' },
            { data: [28, 48, 40, 19, 86, 27, 90], label: 'Unknown' },
        ];
    }

    getReffral() {
        this.internalService.getReferral().subscribe((res) => {
            this.getReferral = res;
            this.getinvitationSource();
        });
    }

    getinvitationSource() {
        const ordered = _.orderBy(this.getReferral, function (item) {
            return item.signed_up_at;
        });
        const arr = [
            ...new Set(
                ordered.map((item) => {
                    if (item.signed_up_at) {
                        var dt = new Date(item.signed_up_at);
                        return dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
                    } else {
                        return 'Date';
                    }
                })
            ),
        ];
        this.dynamicDate = arr;
        this.getInstagram = this.getCount([...ordered.filter((item) => item.invitation_source === 'instagram')]);
        // console.log('value', this.getInstagram);
        // console.log("date",this.dynamicDate)
        // this.getEmail = [...ordered.filter((item) => item.invitation_source === 'email')];
        // this.check_source_register_influcer();
    }

    getCount(arrayName) {
        const getdtimeIns: any = []; //getdate

        arrayName.forEach((item) => {
            if (item.signed_up_at) {
                var dt = new Date(item.signed_up_at);
                var getdt = dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
            } else {
                var getdt = 'Date';
            }

            getdtimeIns.push(getdt);
        });
        const counts = {};
        for (let i = 0; i < getdtimeIns.length; i++) {
            if (counts[getdtimeIns[i]]) {
                counts[getdtimeIns[i]] += 1;
            } else {
                counts[getdtimeIns[i]] = 1;
            }
        }
        console.log("instagram count",counts)
        // console.log("date",this.dynamicDate)
        var source_register_influcer = [];
        var key = []
        for (let prop in counts) {
          key.push(prop)  
            source_register_influcer.push(counts[prop]);
        }
        
        // let data: any
        this.dynamicDate.map((item) => {
            if (key.indexOf(item) === -1){
            
              key.push(item)
            }
        });
        console.log("key", key)
        // console.log('new data', data);
        return source_register_influcer;
    }
    // events
    chartClicked({ event, active }: { event: MouseEvent; active: {}[] }): void {
        // console.log(event, active);
    }

    chartHovered({ event, active }: { event: MouseEvent; active: {}[] }): void {
        // console.log(event, active);
    }
}
