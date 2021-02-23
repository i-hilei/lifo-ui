import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CampaignService } from 'src/app/services/campaign.service';
import { environment } from '@src/environments/environment';
import { CampaignDetail } from '@src/types/campaign';
import { Influencer, InfluencerRecommendBody, InfluencerStatus } from 'src/types/influencer';

@Component({
  selector: 'app-campaign-detail-modal',
  templateUrl: './campaign-detail-modal.component.html',
  styleUrls: ['./campaign-detail-modal.component.scss'],
})
export class CampaignDetailModalComponent implements OnInit {
  subscriptions: Subscription[] = [];
  isModalVisible = false;
  isShowSpin = true;
  spinHeight = `${document.documentElement.clientHeight - 103  }px`;
  campaignId = '';
  accountId = '';
  defalutInfluencer:any;
  campaign;

  constructor(
    private campaignService: CampaignService,
  ) { }

  setModalStyle = {
    position: 'relative',
    top: 0,
    bottom: 0,
    'padding-bottom': 0,
  };

  dailyVisitsByDay() {
    this.spinHeight = `${document.documentElement.clientHeight - 103  }px`;
    this.isModalVisible = true;
    this.isShowSpin = true;
    this.subscriptions.push(
        this.campaignService.getBrandCampaignDetail(this.campaignId).subscribe((result) => {
            this.campaign = result;
            this.isShowSpin = false;
        }, err => {})
      );
}

  showModals() {
    this.dailyVisitsByDay();
    // this.isModalVisible = true;
  }

  ngOnInit() {
  }

  isStrings(val) {
    if (typeof val == 'string') {
        return true;
    } else {
        return false;
    }
}

  handleOk(): void {
    this.isModalVisible = false;
  }

  handleCancel(): void {
      this.isModalVisible = false;
  }

}
