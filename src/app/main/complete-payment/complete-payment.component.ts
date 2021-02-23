import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from '@src/app/services/campaign.service';
import { ShopifyService } from '@src/app/services/shopify.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-complete-payment',
    templateUrl: './complete-payment.component.html',
    styleUrls: ['./complete-payment.component.scss'],
})
export class CompletePaymentComponent implements OnInit, OnDestroy {
    showModal = false;
    campaignId: string;

    subscriptions: Subscription[] = [];
    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private shopifyService: ShopifyService,
        private campaignService: CampaignService,
    ) {

        this.campaignId = this.activatedRoute.snapshot.paramMap.get('id');
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    async ngOnInit(): Promise<void> {
        const brandCampaign = await this.campaignService.getBrandCampaignById(this.campaignId);
        this.subscriptions.push(
            brandCampaign.subscribe(brandCampaign => {
                const campaign = brandCampaign.brand_campaigns;
                this.subscriptions.push(
                    this.shopifyService.updateCampaignChargeInfo(campaign.brand_id, this.campaignId)
                        .subscribe(charge_info => {
                            if (charge_info.application_charge?.status === 'accepted') {
                                this.showModal = true;
                            }
                        })
                );
            })
        );

    }

    navigateToCampaign() {
        this.router.navigate([`/app/brand-campaign/${this.campaignId}`]);
    }

}
