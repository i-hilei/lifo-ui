import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CampaignService } from '../services/campaign.service';
import { InternalService } from '../services/internal.service';
import { AlertType, NotificationService } from '../services/notification.service';
import { InfluencerInfo } from 'src/types/influencer';
import { MatDialog } from '@angular/material/dialog';
import { AcceptInfoDialogComponent } from './accept-info-dialog/accpet-info-dialog.component';
import { DeclineInfoDialogComponent } from './decline-info-dialog/decline-info-dialog.component';
import { OfferDetail } from 'src/types/campaign';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-campaign-influencer',
    templateUrl: './campaign-influencer.component.html',
    styleUrls: ['./campaign-influencer.component.scss'],
})
export class CampaignInfluencerComponent implements OnInit {
    campaignId;
    accountId;

    campaign;
    productInfo;

    completeForm = false;

    influencer: InfluencerInfo = {
        inf_email: '',
        inf_phone: '',
        inf_name: '',
        influencer_address1: '',
        influencer_address2: '',
    };

    offerDetail: OfferDetail;

    subscriptions: Subscription[] = [];

    // For mobile view
    isMobileView = true;
    showDeclineOfferMobile = false;
    showAcceptOfferMobile = false;
    decline_type: string;
    decline_text_reason: string;

    constructor(
        private activatedRoute: ActivatedRoute,
        private campaignService: CampaignService,
        private internalService: InternalService,
        private notification: NotificationService,
        private dialog: MatDialog
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('campaignId');
        this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId');
    }

    async ngOnInit() {
        const campaignDetail = await this.campaignService.getInfluencerCampaignDetail(this.campaignId, this.accountId);
        this.subscriptions.push(
            campaignDetail.subscribe((result) => {
                if (result && result['influencer_public_profile']) {
                    this.offerDetail = {
                        compensation_message: result['influencer_public_profile']['compensation_message'],
                        product_message: result['influencer_public_profile']['product_message'],
                        product_image_list: result['influencer_public_profile']['product_image_list'],
                        ...result['influencer_public_profile']['offer_detail'],
                    };
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    saveInfoReal(inf) {
        this.subscriptions.push(
            this.campaignService.inputInfluencerInfo(this.campaignId, this.accountId, inf).subscribe((result) => {
                this.completeForm = true;
                this.showAcceptOfferMobile = false;
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Contact Info Saved',
                    message: 'An email with your contract will be sent to you shortly.',
                    duration: 3000,
                });
            })
        );
    }

    async saveInfo() {
        const dialogRef = this.dialog.open(AcceptInfoDialogComponent, {
            width: '600px',
            data: {
                influencer: this.influencer,
            },
        });

        dialogRef.afterClosed().subscribe((inf) => {
            if (inf) {
                this.saveInfoReal(inf);
            }
        });
    }

    async declientOfferReal(reason) {
        this.subscriptions.push(
            this.campaignService
                .declineInfluencerOffer(this.campaignId, this.accountId, reason.decline_type, reason.decline_text_reason)
                .subscribe((result) => {
                    this.completeForm = true;
                    this.showDeclineOfferMobile = false;
                    this.notification.addMessage({
                        type: AlertType.Success,
                        title: 'Feedback Received',
                        message: "Let's Keep in touch!",
                        duration: 3000,
                    });
                })
        );
    }

    async declineOffer() {
        const dialogRef = this.dialog.open(DeclineInfoDialogComponent, {
            width: '600px',
            data: {
                influencer: this.influencer,
            },
        });

        dialogRef.afterClosed().subscribe((inf) => {
            if (inf) {
                this.declientOfferReal(inf);
            }
        });
    }

    declientOfferRealMobile() {
        this.declientOfferReal({
            decline_type: this.decline_type,
            decline_text_reason: this.decline_text_reason,
        });
    }

    acceptOfferRealMobile() {
        this.saveInfoReal(this.influencer);
    }

    declineOfferMobile() {
        this.showDeclineOfferMobile = true;
    }

    acceptOfferMobile() {
        this.showAcceptOfferMobile = true;
    }

    backToOffer() {
        this.showDeclineOfferMobile = false;
        this.showAcceptOfferMobile = false;
    }
}
