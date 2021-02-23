import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import * as dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-pending-status',
  templateUrl: './post-pending-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class PostPendingStatusComponent implements OnInit, OnChanges {
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() postPendingInfluencer = [];
  allPendingChecked = false;
  loading = true;
  pendingIndeterminate = false;
  constructor(
    private internalService: InternalService,
    private notificationService: NotificationService,
  ) { }

  sendReminder(influencer) {
    this.internalService.sendPostReminderEmail({
        email: influencer.email,
        account_id: influencer.account_id,
        product_name: influencer.campaign.product_name,
        campaign_id: influencer.campaign.brand_campaign_id,
    }).then(result => {
        this.notificationService.addMessage({
            type: AlertType.Success,
            title: 'Email Sent',
            message: 'Email reminder sent to influencer.',
            duration: 3000,
        });
    });
  }

  batchSendReminderPending() {
      this.postPendingInfluencer.forEach(influencer => {
          if (influencer.checked) {
              this.sendReminder(influencer);
          }
      });
  }

  refreshStatusPending(): void {
    const validData = this.postPendingInfluencer.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allPendingChecked = allChecked;
    this.pendingIndeterminate = !allChecked && !allUnChecked;
  }

  checkAllPending(value: boolean): void {
      this.postPendingInfluencer.forEach(data => {
          if (!data.disabled) {
              data.checked = value;
          }
      });
      this.refreshStatusPending();
  }

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  showDetailModals(val) {
      this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
      this.campaignDetail.showModals();
  }

  ngOnInit() {
    this.internalService.getInflucnerByCampaignStatus('post').then(result => {
      const pending = [];
      const overdue = [];
      result.forEach(campaign => {
          const campaignConcise = this.getConciseCampaign(campaign);

          campaign.influencers.forEach(influencer => {
              influencer.campaign = campaignConcise;
              influencer.checked = false;
              influencer.post_deadline = influencer.content_approve_time + 24 * 3600;
              if (influencer.post_deadline > dayjs().unix()) {
                  pending.push(influencer);
              } else {
                  overdue.push(influencer);
              }

          });
      });
      this.postPendingInfluencer = pending;
      this.loading = false;
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
    return this.postPendingInfluencer.filter(inf => inf.checked).length;
  }

  ngOnChanges() {
    if (this.postPendingInfluencer.length !== 0) {
      this.loading = false;
    }
  }

}
