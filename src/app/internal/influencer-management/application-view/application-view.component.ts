import { Component, OnInit, ViewChild } from '@angular/core';
import { ShopifyService } from '@src/app/services/shopify.service';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';

@Component({
    selector: 'app-application-view',
    templateUrl: './application-view.component.html',
    styleUrls: ['./application-view.component.scss'],
})
export class ApplicationViewComponent implements OnInit {
    // influencerDatas: InfluencerRecommendBody;
    @ViewChild('applied') applied;
    @ViewChild('orderPending') orderPending;
    brand_campaign_id = '';
    account_id = '';

    appliedInfluencers = [];
    orderPendingInfluencers = [];

    constructor(
        private internalService: InternalService,
    ) { }

    ngOnInit(): void {
        this.internalService.getInflucnerByCampaignStatus('discover').then(result => {
            console.log(result, 'res');
            const influencerList = [];
            result.forEach(campaign => {
                const campaignConcise = this.getConciseCampaign(campaign);
                campaign.influencers.forEach(influencer => {
                    if (influencer.profile.influencer?.profile) {
                        influencer.checked = false;
                        influencer.campaign = campaignConcise;
                        influencerList.push(influencer);
                    }
                });
            });
            this.appliedInfluencers = influencerList;
            this.applied.appliedTableLoading = false;
        });
        this.internalService.getInflucnerByCampaignStatus('application').then(result => {
            const influencerList = [];
            result.forEach(campaign => {
                const campaignConcise = this.getConciseCampaign(campaign);
                campaign.influencers.forEach(influencer => {
                    if (influencer.profile.influencer?.profile) {
                        influencer.checked = false;
                        influencer.campaign = campaignConcise;
                        influencerList.push(influencer);
                    }
                });
            });
            this.orderPendingInfluencers = influencerList;
            this.orderPending.orderPendingTableLoading = false;
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
