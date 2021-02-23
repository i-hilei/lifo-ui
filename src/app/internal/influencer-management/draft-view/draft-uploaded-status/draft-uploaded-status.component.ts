import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { CampaignService } from '@src/app/services/campaign.service';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import * as dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-draft-uploaded-status',
  templateUrl: './draft-uploaded-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class DraftUploadedStatusComponent implements OnInit, OnChanges {
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() draftUploadedInfluencer = [];
  loading = true;
  allUploadedChecked = false;
  uploadedIndeterminate = false;
  constructor(
    private internalService: InternalService,
    private campaignService: CampaignService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {

  }

  batchApproveCampaign() {
    this.draftUploadedInfluencer.forEach(influencer => {
        if (influencer.checked) {
            this.approveCampaign(influencer);
        }
    });
  }

  approveCampaign(influencer) {
    this.campaignService.approveCampaignContent(influencer.inf_campaign_id, 'latest').then((result) => {
        if (result['status'] && result['status'] === 'OK') {
            let index = -1;
            for (let i = 0; i < this.draftUploadedInfluencer.length; i ++) {
                if (this.draftUploadedInfluencer[i].account_id === influencer.account_id) {
                    index = i;
                }
            }
            this.draftUploadedInfluencer.splice(index, 1);
            this.draftUploadedInfluencer = [
                ...this.draftUploadedInfluencer,
            ];
            this.notificationService.addMessage({
                type: AlertType.Success,
                title: 'Contents Approved',
                message: 'Your have approved the contents for posting.',
                duration: 3000,
            });
        } else {
            this.notificationService.addMessage({
                type: AlertType.Error,
                title: 'Error',
                message: 'Error during campaign approval. Please try again.',
                duration: 3000,
            });
        }
    });
  }

  checkAllUploaded(value: boolean): void {
    this.draftUploadedInfluencer.forEach(data => {
        if (!data.disabled) {
            data.checked = value;
        }
    });
    this.refreshStatusUploaded();
  }

  refreshStatusUploaded(): void {
    const validData = this.draftUploadedInfluencer.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allUploadedChecked = allChecked;
    this.uploadedIndeterminate = !allChecked && !allUnChecked;
  }

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  showDetailModals(val) {
    this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
    this.campaignDetail.showModals();
  }

  reviewCampaign(influencer) {
    const influencerCampaignId = influencer.inf_campaign_id;
    window.open(`/image-review/${influencerCampaignId}`, '_blank');
  }

  rejectCampaign(influencer) {

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

  get uploadedChecked() {
    return this.draftUploadedInfluencer.filter(inf => inf.checked).length;
  }

  ngOnChanges() {
    if (this.draftUploadedInfluencer.length !== 0) {
      this.loading = false;
    }
  }

}
