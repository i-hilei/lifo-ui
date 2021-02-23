import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';

@Component({
  selector: 'app-shipped-status',
  templateUrl: './shipped-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class ShippedStatusComponent implements OnInit, OnChanges {
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() shippedInfluencer = [];
  loading = true;
  allShippedChecked = false;
  shippedIndeterminate = false;
  showAddShippingIncident = false;
  shippingIncident;
  selectedInfluencer;

  constructor(
    private internalService: InternalService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    // this.internalService.getInflucnerByCampaignStatus('shipping').then(result => {
    //   const shipped = [];
    //   result.forEach(campaign => {
    //       const campaignConcise = this.getConciseCampaign(campaign);

    //       campaign.influencers.forEach(influencer => {
    //           influencer.campaign = campaignConcise;
    //           influencer.checked = false;

    //           if (influencer.shipping_info) {
    //             shipped.push(influencer);
    //           }
    //       });
    //   });
    //   this.shippedInfluencer = shipped;
    //   this.loading = false;
    //   console.log(result);
    // });
  }

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  showDetailModals(val) {
    this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
    this.campaignDetail.showModals();
  }

  batchMarkShippedArrived() {
    this.shippedInfluencer.forEach(influencer => {
        if (influencer.checked) {
            this.markShippedAsShppingArrived(influencer);
        }
    });
  }

  markShippedAsShppingArrived(influencer) {
    this.internalService.setShippingArrived(
        influencer.campaign.brand_campaign_id,
        influencer.account_id,
    ).then(result => {
        if (result['status'] === 'OK') {

            let index = -1;
            for (let i = 0; i < this.shippedInfluencer.length; i ++) {
                if (this.shippedInfluencer[i].account_id === influencer.account_id) {
                    index = i;
                }
            }
            this.shippedInfluencer.splice(index, 1);
            this.shippedInfluencer = [
                ...this.shippedInfluencer,
            ];

            this.notificationService.addMessage({
                type: AlertType.Success,
                title: 'Success',
                message: 'Marked as Delivered.',
                duration: 3000,
            });
        }
    });
  }

  checkAllShipped(value: boolean): void {
    this.shippedInfluencer.forEach(data => {
        if (!data.disabled) {
            data.checked = value;
        }
    });
    this.refreshShippedStatus();
  }

  refreshShippedStatus(): void {
    const validData = this.shippedInfluencer.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allShippedChecked = allChecked;
    this.shippedIndeterminate = !allChecked && !allUnChecked;
  }

  startAddShippingIncident(influencer) {
    this.shippingIncident = {
        incident_type: 'Shipping Overtime',
    };
    this.showAddShippingIncident = true;
    this.selectedInfluencer = influencer;
  }

  addShippingIncident(influencer) {
    this.internalService.addShippingIncident(
        influencer.campaign.brand_campaign_id,
        influencer.account_id,
        this.shippingIncident,
    ).then(result => {
        this.showAddShippingIncident = false;

        let index = -1;
        for (let i = 0; i < this.shippedInfluencer.length; i ++) {
            if (this.shippedInfluencer[i].account_id === influencer.account_id) {
                index = i;
            }
        }
        this.shippedInfluencer.splice(index, 1);
        this.shippedInfluencer = [
            ...this.shippedInfluencer,
        ];

        this.notificationService.addMessage({
            type: AlertType.Success,
            title: 'Success',
            message: 'Marked as Shipping Incident.',
            duration: 3000,
        });
    });
}

cancelAddShippingIncident() {
    this.showAddShippingIncident = false;
}

getConciseCampaign(campaign) {
  return {
      brand_campaign_id: campaign.brand_campaign_id,
      campaign_name: campaign.campaign_name,
      platform: campaign.platform,
      end_time: campaign.end_time,
      post_time: campaign.post_time,
      start_post_time: campaign.start_post_time,
      product_name: campaign.product_name,
      product_price: campaign.product_price,
      brand_id: campaign.brand_id,
      configuration: campaign.configuration,
  };
}

  get shippedChecked() {
    return this.shippedInfluencer.filter(inf => inf.checked).length;
  }

  ngOnChanges() {
    if (this.shippedInfluencer.length !== 0) {
      this.loading = false;
    }
  }

}
