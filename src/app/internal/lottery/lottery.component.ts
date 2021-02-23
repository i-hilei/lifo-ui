import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import * as moment from 'moment';
import { ShopifyService } from '@src/app/services/shopify.service';

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
  styleUrls: ['./lottery.component.scss'],
})
export class LotteryComponent implements OnInit {
  subscriptions: Subscription[] = [];

  constructor(
    private shopifyService: ShopifyService,
  ) { }

  lotteryValue = '';
  winnerData:any;
  referralData:any;
  referralLoading = false;
  winnerLoading = false;

  ngOnInit() {
    this.initReferralsList();
  }

  initReferralsList() {
    const referralData = [];
    this.referralLoading = true;
    this.subscriptions.push(
      this.shopifyService.getReferralsList('QlXJ1t2Y3Z24Wxrrke69').subscribe((result) => {
          for (const i of result) {
            referralData.push({
              instagram_id: i['instagram_id'] ? i['instagram_id'] : '',
              referee: '',
              status: i['status'] ? i['status'] : '',
              signed_up_at: i['signed_up_at'] ? moment(i['signed_up_at']).format('MM/DD') : '',
              invitation_source: i['influencer']['invitation_source'] ? i['influencer']['invitation_source'] : '',
            });
          }
          this.referralData = [...referralData];
          this.referralLoading = false;
      }, error => {
      })
    );
  }

  setLottery() {
    const user_id = [];
    this.winnerData = [];
    for (const i of this.referralData) {
      user_id.push(i.instagram_id);
    }
    // Math.round(Math.random() * user_id.length);
    const result = [];
    const ranNum = this.lotteryValue;
    for (let i = 0; i < Number(ranNum); i++) {
    const ran = Math.floor(Math.random() * (user_id.length - i));
    if (result.includes(user_id[ran])) {
                continue;
    }
    result.push(user_id[ran]);
    for (const j of this.referralData) {
      if (j.instagram_id === user_id[ran]) {
        this.winnerData.push(j);
      }
    }
    };
  }

}
