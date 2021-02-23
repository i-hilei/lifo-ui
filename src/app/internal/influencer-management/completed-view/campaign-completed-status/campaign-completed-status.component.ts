import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-campaign-completed-status',
  templateUrl: './campaign-completed-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class CampaignCompletedStatusComponent implements OnInit, OnChanges {
  @ViewChild('performance') performance;
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() campaignCompletedInfluencer = [];
  subscriptions: Subscription[] = [];
  loading = true;
  newRowData = {};
  newCampaignList = [];
  campaignClosedInfluencer = [];
  constructor(
    private internalService: InternalService,
  ) { }

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  showDetailModals(val) {
      this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
      this.campaignDetail.showModals();
  }

  viewPost(influencer) {
    window.open(influencer.post_url, '_blank');
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
  ngOnChanges() {
    if (this.campaignCompletedInfluencer.length !== 0) {
      this.loading = false;
    }
  }

}
