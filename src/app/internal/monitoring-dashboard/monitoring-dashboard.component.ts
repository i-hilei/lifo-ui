import { ConstantPool } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import * as dayjs from 'dayjs';
import { truncate } from 'fs';
import { Subscription } from 'rxjs';
declare var _:any;
@Component({
    selector: 'app-monitoring-dashboard',
    templateUrl: './monitoring-dashboard.component.html',
    styleUrls: ['./monitoring-dashboard.component.scss'],
})

export class MonitoringDashboardComponent implements OnInit {
    currentDate: string;

    dateList;
    totalInfluencers;
    dailyInfluencers;
    dailyFollowers;
    totalFollowers;

    shopAllDateList;
    shopAllTotalVisits;
    shopByDateList;
    shopByTotalVisits;

    totalBrands = [];
    subscriptions: Subscription[] = [];
    dailyBrands = [];
    dailyTransaction = [5, 37, 13];
    dailyCampaign = [2, 2, 1];
    dailyGMV = [589, 3239, 1218];
    currentView = 'lifo_shop';
    radioValue = '100';
    calNumber = 0;
    datas: any;
    scale = [];
    chartView = 'all';
    isChecked = true;
    isByChecked = false;
    searchIds = '';
    ischartView = false;
    isChartSearch = false;
    isShowLoading = false;
    getReferral: any;
    getReferralLength: any;
    signUp: number;
    totalInvitation: number;
    getrefDate: any = [];
    getrefDailyCount: any = [];
    dailyReffraldata: any = [];
    totalReffralGet: any = [];
    totalReffraldata: any = [];
    getrefTotalDate: any = [];
    avgConRate: any = [];
    getavgDate: any = [];

    constructor(private internalService: InternalService) {
        // Generate a date list
        // const dateList = [];
        // for (let i = 30; i > 0; i --) {
        //     const today = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        //     dateList.push(today);
        // }
        // this.dateList = dateList;
    }

    ngOnInit(): void {
        this.internalService.getInfluencerStatistics().then((counters) => {
            const dateList = [];
            const totalInfluencers = [];
            const dailyInfluencers = [];
            const totalFollowers = [];
            const dailyFollowers = [];
            counters.forEach((counter) => {
                dateList.push(counter.date);
                totalInfluencers.push(counter.total_influencers);
                dailyInfluencers.push(counter.new_influencers);
                totalFollowers.push(counter.total_followers);
                dailyFollowers.push(counter.new_followers);
            });
            this.dateList = dateList;
            this.totalInfluencers = totalInfluencers;
            this.dailyInfluencers = dailyInfluencers;
            this.totalFollowers = totalFollowers;
            this.dailyFollowers = dailyFollowers;
        });
        this.dailyVisitsAll();
        this.getShopList();
        this.getReffral();
        this.getConversion();
    }

    getReffral() {
        this.internalService.getReferral().subscribe((res) => {
            this.getReferral = res;
            this.getReferralLength = res.length;
            this.dailyReffral();
            this.totalReffral();
        });
    }

    dailyReffral() {
        const getdtimerefdaily: any = [];
        const ordered = _.orderBy(this.getReferral, function (item) {
            return item.signed_up_at;
        });
        ordered.forEach((item) => {
            if (item.signed_up_at) {
                var dt = new Date(item.signed_up_at);
                var getdt = dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
            } else {
                var getdt = 'Date';
            }

            getdtimerefdaily.push(getdt);
        });

        let counts = {};
        for (let i = 0; i < getdtimerefdaily.length; i++) {
            if (counts[getdtimerefdaily[i]]) {
                counts[getdtimerefdaily[i]] += 1;
            } else {
                counts[getdtimerefdaily[i]] = 1;
            }
        }
        for (let prop in counts) {
            this.dailyReffraldata.push(counts[prop]);
        }
        // Sorting array with signed_up_at

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
        this.getrefDailyCount = arr;
    }

    totalReffral() {
        const getdtimerefTotal: any = [];
        const ordered = _.orderBy(this.getReferral, function (item) {
            return item.signed_up_at;
        });
        ordered.forEach((item) => {
            if (item.signed_up_at){
                var dt = new Date(item.signed_up_at);
                var getdt = dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
            }else{
                var getdt = "Date"                  
            }
            
            getdtimerefTotal.push(getdt);
        });

        const counts = {};
        for (let i = 0; i < getdtimerefTotal.length; i++) {
            if (counts[getdtimerefTotal[i]]) {
                counts[getdtimerefTotal[i]] += 1;
            } else {
                counts[getdtimerefTotal[i]] = 1;
            }
        }
        var new_array = []
        for (let prop in counts) {
            new_array.push(counts[prop]);
        }
        new_array.reduce((prev,cur,i) => this.totalReffraldata[i] = prev+cur, 0)
        
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

        this.getrefTotalDate = arr;
    }

    getConversion() {
        const getdtimerefdaily : any = [];
        this.internalService.getConversion().subscribe((res) => {
            this.totalInvitation = res.length;
            this.signUp = res.filter((signUpAt: any) => signUpAt.signed_up_at != null).length;
            const ordered = _.orderBy(res, function (item) {
                return item.signed_up_at;
            });
            ordered.forEach((item) => {
                if (item.signed_up_at) {
                    var dt = new Date(item.signed_up_at);
                    var getdt = dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
                    getdtimerefdaily.push(getdt);
                } 
            });
    
           
            const counts = {};
            for (let i = 0; i < this.getavgDate.length; i++) {
                if (counts[this.getavgDate[i]]) {
                    counts[this.getavgDate[i]] += 1;
                } else {
                    counts[this.getavgDate[i]] = 1;
                }
            }
            console.log("counts are",counts)
            for (let prop in counts) {
                if (counts[prop] >= 1) {
                    this.avgConRate.push(counts[prop]);
                }
                
            }
            

            const arr = [
                ...new Set(
                    ordered.map((item) => {
                        if (item.signed_up_at){
                            var dt = new Date(item.signed_up_at);
                            return dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
                        }
                        
                    })
                ),
            ];
            this.getavgDate = arr;
            console.log(this.getavgDate)
        });
    }

    dailyVisitsAll() {
        this.subscriptions.push(
            this.internalService.shopVisitAll().subscribe(
                (result) => {
                    const shopAllDateList = [];
                    const shopAllTotalVisits = [];
                    result.forEach((counter) => {
                        shopAllDateList.push(counter.event_date);
                        shopAllTotalVisits.push(counter.total_visits);
                    });
                    this.shopAllDateList = shopAllDateList;
                    this.shopAllTotalVisits = shopAllTotalVisits;
                },
                (err) => {}
            )
        );
    }

    dailyVisitsByDay(shopId) {
        this.ischartView = false;
        this.chartView = 'by_store';
        this.isShowLoading = true;
        this.subscriptions.push(
            this.internalService.shopVisitByDay(shopId).subscribe(
                (result) => {
                    this.isShowLoading = false;
                    const shopByDateList = [];
                    const shopByTotalVisits = [];
                    result.forEach((counter) => {
                        shopByDateList.push(counter.event_date);
                        shopByTotalVisits.push(counter.total_visits);
                    });
                    this.shopByDateList = shopByDateList;
                    this.shopByTotalVisits = shopByTotalVisits;
                    // console.log(' this.shopByTotalVisits', this.shopByTotalVisits);
                    this.ischartView = true;
                },
                (err) => {
                    this.shopByDateList = [];
                    this.shopByTotalVisits = [];
                    this.isShowLoading = false;
                    this.ischartView = true;
                }
            )
        );
    }

    checkoutVisit(val) {
        // this.chartView = val;
        if (val === 'all') {
            this.chartView = val;
            this.isChecked = true;
            this.isByChecked = false;
            this.isChartSearch = false;
            this.ischartView = false;
            this.dailyVisitsAll();
        } else {
            this.isChecked = false;
            this.isByChecked = true;
            this.isChartSearch = true;
        }
    }

    searchByStore() {
        this.dailyVisitsByDay(this.searchIds);
    }

    calTopVisited() {
        const a1 = Math.max.apply(
            Math,
            this.datas.top_shop_visits.map((item) => {
                return item.total_visits;
            })
        );
        this.calNumber = Math.ceil(a1 / 100) * 100;
        const a2 = this.calNumber / 5;
        const a3 = [];
        for (let i = 0; i <= this.calNumber; i += a2) {
            a3.push(i);
        }
        this.scale = a3;
    }

    calPercent(val) {
        const sum = (val.total_visits / this.calNumber) * 100;
        return `${sum}%`;
    }

    getShopList() {
        this.subscriptions.push(
            this.internalService.getShopKPI().subscribe(
                (result) => {
                    result.top_shop_visits = result.top_shop_visits.filter((shop) => shop);
                    this.datas = result;
                    this.calTopVisited();
                },
                (err) => {}
            )
        );
    }

    calCompare(property, desc) {
        return function (a, b) {
            const value1 = a[property];
            const value2 = b[property];
            if (desc) {
                return value1 - value2;
            } else {
                return value2 - value1;
            }
        };
    }
}
