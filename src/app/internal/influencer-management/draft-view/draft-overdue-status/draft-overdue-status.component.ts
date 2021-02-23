import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { CampaignService } from '@src/app/services/campaign.service';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import * as dayjs from 'dayjs';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-draft-overdue-status',
  templateUrl: './draft-overdue-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class DraftOverdueStatusComponent implements OnInit, OnChanges {
  @ViewChild('performance') performance;
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() draftOverdueInfluencer = [];
  loading = true;
  allOverdueChecked = false;
  overdueIndeterminate = false;
  newRowData = [];
  subscriptions: Subscription[] = [];

  constructor(
    private internalService: InternalService,
    private campaignService: CampaignService,
    private notificationService: NotificationService,
  ) { }

  batchSendReminderOverdue() {
    this.draftOverdueInfluencer.forEach(influencer => {
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

  checkAllOverdue(value: boolean): void {
    this.draftOverdueInfluencer.forEach(data => {
        if (!data.disabled) {
            data.checked = value;
        }
    });
    this.refreshStatusOverdue();
  }

  refreshStatusOverdue(): void {
    const validData = this.draftOverdueInfluencer.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allOverdueChecked = allChecked;
    this.overdueIndeterminate = !allChecked && !allUnChecked;
  }

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  showDetailModals(val) {
    this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
    this.campaignDetail.showModals();
  }

  addPerformanceDefault(data) {
    this.performance.showModal();
    this.newRowData = data;
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

  ngOnInit() {

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
    return this.draftOverdueInfluencer.filter(inf => inf.checked).length;
  }

  ngOnChanges() {
    if (this.draftOverdueInfluencer.length !== 0) {
      this.loading = false;
    }
  }

}
