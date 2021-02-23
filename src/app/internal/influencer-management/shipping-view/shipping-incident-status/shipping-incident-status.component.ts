import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';

@Component({
  selector: 'app-shipping-incident-status',
  templateUrl: './shipping-incident-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class ShippingIncidentStatusComponent implements OnInit, OnChanges {
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() shipIncidentInfluencer = [];
  shipPendingInfluencer = [];
  loading = true;
  allIncidentChecked = false;
  shippedInfluencer = [];
  allShippedChecked = false;
  shippedIndeterminate = false;
  showShippingModal = false;
  selectedInfluencer;
  shippingInfo;
  campaignEndReason = '';
  showEndCampaignModal = false;

  constructor(
    private internalService: InternalService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    // this.internalService.getInflucnerByCampaignStatus('shipping').then(result => {
    //   const incident = [];
    //   result.forEach(campaign => {
    //       const campaignConcise = this.getConciseCampaign(campaign);

    //       campaign.influencers.forEach(influencer => {
    //           influencer.campaign = campaignConcise;
    //           influencer.checked = false;

    //           if (influencer.shipping_incident) {
    //               incident.push(influencer);
    //           }
    //       });
    //   });
    //   this.shipIncidentInfluencer = incident;
    //   this.loading = false;
    //   console.log(result);
    // });
  }

  checkAllIncident(value: boolean): void {
    this.shipIncidentInfluencer.forEach(data => {
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

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  showDetailModals(val) {
    this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
    this.campaignDetail.showModals();
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

  startEndCampaign(influencer) {
    this.showEndCampaignModal = true;
    this.selectedInfluencer = influencer;
  }

  cancelEndCampaign() {
    this.showEndCampaignModal = false;
  }

  endCampaign(influencer) {
    this.internalService.endCampaign(
        influencer.campaign.brand_campaign_id,
        influencer.account_id,
        {
            campaign_close_reason: this.campaignEndReason,
        },
    ).then(result => {
        this.showEndCampaignModal = false;

        let index = -1;
        for (let i = 0; i < this.shipIncidentInfluencer.length; i ++) {
            if (this.shipIncidentInfluencer[i].account_id === influencer.account_id) {
                index = i;
            }
        }
        this.shipIncidentInfluencer.splice(index, 1);
        this.shipIncidentInfluencer = [
            ...this.shipIncidentInfluencer,
        ];

        this.notificationService.addMessage({
            type: AlertType.Success,
            title: 'Success',
            message: 'End campaign.',
            duration: 3000,
        });
    });
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

  get incidentChecked() {
    return this.shipIncidentInfluencer.filter(inf => inf.checked).length;
  }

  ngOnChanges() {
    if (this.shipIncidentInfluencer.length !== 0) {
      this.loading = false;
    }
  }


}
