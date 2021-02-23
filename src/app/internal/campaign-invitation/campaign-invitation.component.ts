import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OfferDetail } from 'src/types/campaign';
import { Subscription } from 'rxjs';
import { CampaignService } from '@src/app/services/campaign.service';

@Component({
    selector: 'app-campaign-invitation',
    templateUrl: './campaign-invitation.component.html',
    styleUrls: ['./campaign-invitation.component.scss'],
})
export class CampaignInvitationComponent implements OnInit, OnDestroy {
    campaignId;
    offerDetail: OfferDetail;
    offerDefaultDetail:any;

    subscriptions: Subscription[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private campaignService: CampaignService,
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('campaignId');
    }

    async ngOnInit() {
        const campaignDetail = await this.campaignService.getBrandCampaignById(this.campaignId);
        this.subscriptions.push(
            campaignDetail.subscribe(result => {
                if (result && result.brand_campaigns.offer_detail) {
                    this.offerDefaultDetail = result.brand_campaigns;
                    this.offerDetail = result.brand_campaigns.offer_detail;
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }
}
