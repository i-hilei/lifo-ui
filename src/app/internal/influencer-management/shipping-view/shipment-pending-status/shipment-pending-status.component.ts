import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';

@Component({
  selector: 'app-shipment-pending-status',
  templateUrl: './shipment-pending-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class ShipmentPendingStatusComponent implements OnInit, OnChanges {
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() shipPendingInfluencer = [];
  loading = true;
  allPendingChecked = false;
  pendingIndeterminate = false;
  showShippingModal = false;
  selectedInfluencer;
  shippingInfo;

  constructor(
    private internalService: InternalService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    // this.internalService.getInflucnerByCampaignStatus('shipping').then(result => {
    //   const pending = [];
    //   result.forEach(campaign => {
    //       const campaignConcise = this.getConciseCampaign(campaign);

    //       campaign.influencers.forEach(influencer => {
    //           influencer.campaign = campaignConcise;
    //           influencer.checked = false;

    //           if (!influencer.shipping_incident && !influencer.shipping_info) {
    //             pending.push(influencer);
    //           }
    //       });
    //   });
    //   this.shipPendingInfluencer = pending;
    //   this.loading = false;
    //   console.log(result);
    // });
  }

  batchMarkShipPendingArrived() {
    this.shipPendingInfluencer.forEach(influencer => {
        if (influencer.checked) {
            this.markPendingAsShppingArrived(influencer);
        }
    });
  }

  checkAllPending(value: boolean): void {
    this.shipPendingInfluencer.forEach(data => {
        if (!data.disabled) {
            data.checked = value;
        }
    });
    this.refreshPendingStatus();
  }

  refreshPendingStatus(): void {
    const validData = this.shipPendingInfluencer.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allPendingChecked = allChecked;
    this.pendingIndeterminate = !allChecked && !allUnChecked;
  }

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  showDetailModals(val) {
    this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
    this.campaignDetail.showModals();
  }

  cancelAddShippingInfo() {
    this.showShippingModal = false;
  }

  addShippingInfo(influencer) {
    this.internalService.setShipping(
        influencer.campaign.brand_campaign_id,
        influencer.account_id,
        this.shippingInfo,
    ).then(result => {
        if (result['status'] === 'OK') {
            influencer.shipping_info = this.shippingInfo;

            let index = -1;
            for (let i = 0; i < this.shipPendingInfluencer.length; i ++) {
                if (this.shipPendingInfluencer[i].account_id === influencer.account_id) {
                    index = i;
                }
            }
            this.shipPendingInfluencer.splice(index, 1);
            this.shipPendingInfluencer = [
                ...this.shipPendingInfluencer,
            ];

            this.showShippingModal = false;
            this.notificationService.addMessage({
                type: AlertType.Success,
                title: 'Success',
                message: 'Marked as Shipped.',
                duration: 3000,
            });
        }
    });
  }

  startAddShippingInfo(influencer) {
    this.showShippingModal = true;
    this.selectedInfluencer = influencer;
    if (influencer.shipping_info) {
        this.shippingInfo = {
            ...influencer.shipping_info,
        };
    } else {
        this.shippingInfo = {
            carrier: '',
            tracking_number: '',
        };
    }
  }

  markPendingAsShppingArrived(influencer) {
    this.internalService.setShippingArrived(
        influencer.campaign.brand_campaign_id,
        influencer.account_id,
    ).then(result => {
        if (result['status'] === 'OK') {

            let index = -1;
            for (let i = 0; i < this.shipPendingInfluencer.length; i ++) {
                if (this.shipPendingInfluencer[i].account_id === influencer.account_id) {
                    index = i;
                }
            }
            this.shipPendingInfluencer.splice(index, 1);
            this.shipPendingInfluencer = [
                ...this.shipPendingInfluencer,
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

  get pendingChecked() {
    return this.shipPendingInfluencer.filter(inf => inf.checked).length;
  }

  ngOnChanges() {
    if (this.shipPendingInfluencer.length !== 0) {
      this.loading = false;
    }
  }

}
