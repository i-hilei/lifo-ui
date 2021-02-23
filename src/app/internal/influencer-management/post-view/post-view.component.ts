import { Component, OnInit, ViewChild } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import * as dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-post-view',
    templateUrl: './post-view.component.html',
    styleUrls: ['../application-view/application-view.component.scss'],
})
export class PostViewComponent implements OnInit {
    @ViewChild('postPending') postPending;
    @ViewChild('postOverdue') postOverdue;
    postPendingInfluencer = [];
    postOverdueInfluencer = [];
    constructor(
        private internalService: InternalService,
        private notificationService: NotificationService,
    ) { }

    ngOnInit(): void {
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
            this.postOverdueInfluencer = overdue;
            this.postPending.loading = false;
            this.postOverdue.loading = false;
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
