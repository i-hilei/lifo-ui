import { Component, OnInit, ViewChild } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';

@Component({
    selector: 'app-shipping-view',
    templateUrl: './shipping-view.component.html',
    styleUrls: ['../application-view/application-view.component.scss'],
})
export class ShippingViewComponent implements OnInit {
    @ViewChild('shipmentPending') shipmentPending;
    @ViewChild('shippedStatus') shippedStatus;
    @ViewChild('shippingIncident') shippingIncident;
    shipPendingInfluencer = [];
    shippedInfluencer = [];
    shipIncidentInfluencer = [];
    constructor(
        private internalService: InternalService,
        private notificationService: NotificationService,
    ) { }

    ngOnInit(): void {

        this.internalService.getInflucnerByCampaignStatus('shipping').then(result => {
            const pending = [];
            const shipped = [];
            result.forEach(campaign => {
                const campaignConcise = this.getConciseCampaign(campaign);

                campaign.influencers.forEach(influencer => {
                    influencer.campaign = campaignConcise;
                    influencer.checked = false;

                    if (influencer.shipping_incident) {
                        // Skip
                    } else if (influencer.shipping_info) {
                        shipped.push(influencer);
                    } else {
                        pending.push(influencer);
                    }
                });
            });
            this.shipPendingInfluencer = pending;
            this.shippedInfluencer = shipped;
            this.shipmentPending.loading = false;
            this.shippedStatus.loading = false;

            console.log(result);
        });

        this.internalService.getInflucnerByCampaignStatus('shipping_incident').then(result => {
            const incident = [];
            result.forEach(campaign => {
                const campaignConcise = this.getConciseCampaign(campaign);

                campaign.influencers.forEach(influencer => {
                    influencer.campaign = campaignConcise;
                    influencer.checked = false;

                    incident.push(influencer);
                });
            });
            this.shipIncidentInfluencer = incident;
            this.shippingIncident.loading = false;
            console.log(result);
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
