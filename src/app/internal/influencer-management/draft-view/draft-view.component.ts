import { Component, OnInit, ViewChild } from '@angular/core';
import { CampaignService } from '@src/app/services/campaign.service';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import * as dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-draft-view',
    templateUrl: './draft-view.component.html',
    styleUrls: ['../application-view/application-view.component.scss'],
})
export class DraftViewComponent implements OnInit {
    @ViewChild('draftPending') draftPending;
    @ViewChild('draftUploaded') draftUploaded;
    @ViewChild('draftOverdue') draftOverdue;
    draftPendingInfluencer = [];
    draftUploadedInfluencer = [];
    draftOverdueInfluencer = [];

    constructor(
        private internalService: InternalService,
        private campaignService: CampaignService,
        private notificationService: NotificationService,
    ) { }

    ngOnInit(): void {
        this.internalService.getInflucnerByCampaignStatus('draft').then(result => {
            const pending = [];
            const upload = [];
            const overdue = [];
            result.forEach(campaign => {
                const inf_campaign_dict = campaign.inf_campaign_dict;
                const campaignConcise = this.getConciseCampaign(campaign);

                campaign.influencers.forEach(influencer => {
                    influencer.campaign = campaignConcise;
                    influencer.checked = false;
                    influencer.draft_deadline = influencer.product_received_time + campaign.configuration.delivery_deadline * 3600;

                    if (influencer.content_submit_time) {
                        influencer.inf_campaign_id = inf_campaign_dict[influencer.account_id];
                        upload.push(influencer);
                    } else if (influencer.draft_deadline > dayjs().unix()) {
                        pending.push(influencer);
                    } else {
                        overdue.push(influencer);
                    }

                });
            });
            this.draftPendingInfluencer = pending;
            this.draftUploadedInfluencer = upload;
            this.draftOverdueInfluencer = overdue;
            this.draftPending.loading = false;
            this.draftUploaded.loading = false;
            this.draftOverdue.loading = false;
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
}
