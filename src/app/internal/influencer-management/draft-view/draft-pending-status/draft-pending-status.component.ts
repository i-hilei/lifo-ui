import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import * as dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-draft-pending-status',
  templateUrl: './draft-pending-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class DraftPendingStatusComponent implements OnInit, OnChanges {
  @ViewChild('performance') performance;
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() draftPendingInfluencer = [];
  loading = true;
  allPendingChecked = false;
  pendingIndeterminate = false;
  constructor(
    private internalService: InternalService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {

  }

  batchSendReminderPending() {
    this.draftPendingInfluencer.forEach(influencer => {
        if (influencer.checked) {
            this.sendReminder(influencer);
        }
    });
  }

  sendReminder(influencer) {
    this.internalService.sendDraftReminderEmail({
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

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  showDetailModals(val) {
    this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
    this.campaignDetail.showModals();
  }

  checkAllPending(value: boolean): void {
    this.draftPendingInfluencer.forEach(data => {
        if (!data.disabled) {
            data.checked = value;
        }
    });
    this.refreshStatusPending();
  }

  refreshStatusPending(): void {
    const validData = this.draftPendingInfluencer.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allPendingChecked = allChecked;
    this.pendingIndeterminate = !allChecked && !allUnChecked;
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
    return this.draftPendingInfluencer.filter(inf => inf.checked).length;
  }

  ngOnChanges() {
    if (this.draftPendingInfluencer.length !== 0) {
      this.loading = false;
    }
  }

}
