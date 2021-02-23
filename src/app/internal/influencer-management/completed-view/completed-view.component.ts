import { Component, OnInit, ViewChild } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-completed-view',
    templateUrl: './completed-view.component.html',
    styleUrls: ['../application-view/application-view.component.scss'],
})
export class CompletedViewComponent implements OnInit {
    @ViewChild('campaignCompleted') campaignCompleted;
    @ViewChild('campaignUncompleted') campaignUncompleted;
    campaignCompletedInfluencer = [];
    campaignClosedInfluencer = [];
    constructor(
        private internalService: InternalService,
    ) { }

    ngOnInit(): void {
        this.internalService.getInflucnerByCampaignStatus('campaign_completed').then(result => {
            const influencerList = [];
            result.forEach(campaign => {
                const inf_campaign_dict = campaign.inf_campaign_dict;
                const campaignConcise = this.getConciseCampaign(campaign);

                campaign.influencers.forEach(influencer => {
                    influencer.inf_campaign_id = inf_campaign_dict[influencer.account_id];
                    influencer.campaign = campaignConcise;
                    influencer.checked = false;
                    influencerList.push(influencer);
                });
            });
            this.campaignCompletedInfluencer = influencerList;
            // this.newCampaignList = influencerList;
            this.campaignCompleted.loading = false;
        });

        this.internalService.getInflucnerByCampaignStatus('campaign_closed').then(result => {
            const influencerList = [];
            result.forEach(campaign => {
                const campaignConcise = this.getConciseCampaign(campaign);

                campaign.influencers.forEach(influencer => {
                    influencer.campaign = campaignConcise;
                    influencer.checked = false;
                    influencerList.push(influencer);
                });
            });
            this.campaignClosedInfluencer = influencerList;
            this.campaignUncompleted.loading = false;
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
