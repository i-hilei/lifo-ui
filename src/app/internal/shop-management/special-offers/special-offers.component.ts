import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ShopifyService } from '@src/app/services/shopify.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FindValueSubscriber } from 'rxjs/internal/operators/find';

@Component({
  selector: 'app-special-offers',
  templateUrl: './special-offers.component.html',
  styleUrls: ['./special-offers.component.scss'],
})
export class SpecialOffersComponent implements OnInit {
  @Input() datas;
  subscriptions: Subscription[] = [];
  @Output() private childOuter = new EventEmitter();

  constructor(
    private shopifyService: ShopifyService,
    private message: NzMessageService
  ) { }

  dateFormat = 'dd/MM/yyy';
  increaseValue = '';
  isCommissionSwitch = false;
  commissionPicker = [];

  salesValue = '';
  salesPicker = [];
  isSalesSwitch = false;

  campaignIdValue = '';
  isCampaignSwitch = false;

  isEditionSwitch = false;

  sampleValue = '';
  isSampleSwitch = false;

  isCommissionEdit = true;
  isSalesEdit = true;
  isCampaignEdit = true;
  isSampleEdit = true;

  ngOnInit() {
    setTimeout(() => {
      this.defaultDatas();
    });
  }

  commissionSave(val, key) {
    let datas = {};
    if (val === 'commission') {
      const time01 = moment(this.commissionPicker[0]).valueOf();
      const time02 = moment(this.commissionPicker[1]).valueOf();
      datas = {
        product_id: this.datas.id,
        additional_commission: this.increaseValue,
        commission_offer_begin_time: time01,
        commission_offer_deadline: time02,
        commission_event: key,
      };
    } else if (val === 'sales') {
      const time03 = moment(this.salesPicker[0]).valueOf();
      const time04 = moment(this.salesPicker[1]).valueOf();
      datas = {
        product_id: this.datas.id,
        additional_discount: this.salesValue,
        discount_deadline: time03,
        discount_begin_time: time04,
        discount_event: key,
      };
    } else if (val === 'campaign') {
      datas = {
        product_id: this.datas.id,
        related_campaign_id: this.campaignIdValue,
        show_campaign_history: key,
      };
    }  else if (val === 'edition') {
      datas = {
        product_id: this.datas.id,
        promoted: key,
      };
    } else if (val === 'sample') {
      datas = {
        product_id: this.datas.id,
        sample_price: this.sampleValue,
        allow_sample: key,
      };
    }
    this.subscriptions.push(
        this.shopifyService.setSpecialOffers(datas).subscribe((result) => {
          this.message.create('success', 'Success!');
          this.isCommissionEdit = true;
          this.isSalesEdit = true;
          this.isCampaignEdit = true;
          this.isSampleEdit = true;
          this.childOuter.emit();
        }, err => {})
      );
  }

  defaultDatas() {
    this.increaseValue = String(this.datas.additional_commission);
    this.commissionPicker = [this.datas.commission_offer_begin_time ? new Date(this.datas.commission_offer_begin_time) :'', this.datas.commission_offer_deadline ? new Date(this.datas.commission_offer_deadline) :''];

    this.salesValue = String(this.datas.additional_discount);
    this.salesPicker = [this.datas.discount_begin_time ? new Date(this.datas.discount_begin_time) :'', this.datas.discount_deadline ? new Date(this.datas.discount_deadline) :''];

    this.campaignIdValue = this.datas.related_campaign_id;
    this.sampleValue = this.datas.sample_price;

    this.isCommissionSwitch = this.datas.commission_event;
    this.isSalesSwitch = this.datas.discount_event;
    this.isCampaignSwitch = this.datas.show_campaign_history;
    this.isEditionSwitch = this.datas.promoted;
    this.isSampleSwitch = this.datas.allow_sample;

  }


switchChange(val, e) {
    this.commissionSave(val, e);
}

}
