import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { InternalService } from '@src/app/services/internal.service';
import * as dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-applied-status',
  templateUrl: './applied-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class AppliedStatusComponent implements OnInit, OnChanges {
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() appliedInfluencers = [];
  subscriptions: Subscription[] = [];
  acceptInfluencer;
  showAcceptApplication = false;
  appliedTableLoading = true;

  allAppliedChecked = false;
  appliedIndeterminate = false;
  showSkipApplication = false;

  constructor(
    private internalService: InternalService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {

  }

  batchAcceptApplication() {
    this.appliedInfluencers.forEach(influencer => {
        if (influencer.checked) {
            this.acceptInfluencer = influencer;
            this.acceptApplication();
        }
    });
  }

  batchSkipApplication() {
      this.appliedInfluencers.forEach(influencer => {
          if (influencer.checked) {
              this.acceptInfluencer = influencer;
              this.skipApplication();
          }
      });
  }

  startSkipApplication(influencer) {
    this.showSkipApplication = true;
    this.acceptInfluencer = influencer;
  }

  skipApplication() {
    this.internalService.skipCampaignApplication(
        this.acceptInfluencer.campaign.brand_campaign_id,
        this.acceptInfluencer.account_id,
    ).then(result => {
        this.showSkipApplication = false;
        this.acceptInfluencer.application_decline_time = dayjs().unix();
        this.notificationService.addMessage({
            type: AlertType.Success,
            title: 'Skip Application',
            message: 'Application skiped for this influencer.',
            duration: 3000,
        });
    });
}

  acceptApplication() {
    this.internalService.acceptCampaignApplication(
        this.acceptInfluencer.campaign.brand_campaign_id,
        this.acceptInfluencer.account_id,
        this.acceptInfluencer.campaign.product_name,
        this.acceptInfluencer.email
    ).then(result => {
        this.showAcceptApplication = false;

        let index = -1;
        for (let i = 0; i < this.appliedInfluencers.length; i ++) {
            if (this.appliedInfluencers[i].account_id === this.acceptInfluencer.account_id) {
                index = i;
            }
        }
        this.appliedInfluencers.splice(index, 1);
        this.appliedInfluencers = [
            ...this.appliedInfluencers,
        ];

        this.notificationService.addMessage({
            type: AlertType.Success,
            title: 'Accept Application',
            message: 'Application accepted for this influencer.',
            duration: 3000,
        });
    });
  }

  checkAllApplied(value: boolean): void {
    this.appliedInfluencers.forEach(data => {
        if (!data.disabled) {
            data.checked = value;
        }
    });
      this.refreshAppliedStatus();
  }

  refreshAppliedStatus(): void {
    const validData = this.appliedInfluencers.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allAppliedChecked = allChecked;
    this.appliedIndeterminate = !allChecked && !allUnChecked;
  }

  showDetailModals(val) {
    this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
    this.campaignDetail.showModals();
  }

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  startAcceptApplication(influencer) {
    this.showAcceptApplication = true;
    this.acceptInfluencer = influencer;
  }

  cancelAcceptApplication() {
    this.showAcceptApplication = false;
  }

  cancelSkipApplication() {
    this.showSkipApplication = false;
  }

  get appliedChecked() {
    return this.appliedInfluencers.filter(inf => inf.checked).length;
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
  ngOnChanges() {
    if (this.appliedInfluencers.length !== 0) {
      this.appliedTableLoading = false;
    }
  }

}
