import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import * as dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-overdue-status',
  templateUrl: './post-overdue-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class PostOverdueStatusComponent implements OnInit, OnChanges {
  @ViewChild('performance') performance;
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  subscriptions: Subscription[] = [];
  @Input() postOverdueInfluencer = [];
  loading = true;
  allOverdueChecked = false;
  overdueIndeterminate = false;
  newRowData = [];
  constructor(
    private internalService: InternalService,
    private notificationService: NotificationService,
  ) { }

  batchSendReminderOverdue() {
    this.postOverdueInfluencer.forEach(influencer => {
        if (influencer.checked) {
            this.sendReminder(influencer);
        }
    });
  }

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

  checkAllOverdue(value: boolean): void {
    this.postOverdueInfluencer.forEach(data => {
        if (!data.disabled) {
            data.checked = value;
        }
    });
    this.refreshStatusOverdue();
  }

  addPerformance(msg) {
    const newData = {
        campaign_id: this.newRowData['campaign']['brand_campaign_id'],
        account_id: this.newRowData['account_id'],
        ...msg,
    };
    this.subscriptions.push(
        this.internalService.addPerformance(newData).subscribe((result) => {
        //   console.log(result, 'list');
          this.newRowData['performance_score'] = msg;
        }, err => {})
    );
  }

  calScore(val) {
    const newArr = Object.values(val);
    let sum = 0;
    for (let i = newArr.length - 1; i >= 0; i--) {
        sum += Number(newArr[i]);
    }
    const avg = (sum / 5).toFixed(1);
    return avg;
  }

  refreshStatusOverdue(): void {
    const validData = this.postOverdueInfluencer.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allOverdueChecked = allChecked;
    this.overdueIndeterminate = !allChecked && !allUnChecked;
  }

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
 }

  addPerformanceDefault(data) {
    this.performance.showModal();
    this.newRowData = data;
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
      this.postOverdueInfluencer = overdue;
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

  get overdueChecked() {
    return this.postOverdueInfluencer.filter(inf => inf.checked).length;
  }

  ngOnChanges() {
    if (this.postOverdueInfluencer.length !== 0) {
      this.loading = false;
    }
  }

}
