import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { InfluencerRecommendBody, InfluencerStatus } from '@src/types/influencer';

@Component({
    selector: 'app-mail-status',
    templateUrl: './mail-status.component.html',
    styleUrls: ['./mail-status.component.scss'],
})
export class MailStatusComponent implements OnInit {
    @Input() influencer: InfluencerRecommendBody;
    @Input() mode = 'BRAND';
    @Output() onClickPrepareContract = new EventEmitter<any>();
    @Output() onClickSignContract = new EventEmitter<any>();
    @Output() showFullModals = new EventEmitter<any>();
    @Output() onDownloadContract = new EventEmitter<any>();
    @Output() onSendContract = new EventEmitter<any>();
    @Output() onViewPerformance = new EventEmitter<any>();

    constructor(
        private router: Router,
    ) { }

    isVisible = false;
    emailUserName = '';
    emailStatus = {
        'Brand chosen': 'In Negotiation',
        'Email sent': 'In Negotiation',
        'Offer Declined': 'In Negotiation',
        'Offer Accepted': 'In Negotiation',
        Recommended: 'In Negotiation',
        'Pending Signing': 'In Negotiation',
        'Contract Signed': 'In Negotiation',
        'Pending Influencer Signing': 'In Negotiation',
        'Pending Brand Signing': 'In Negotiation',
    };

    ngOnInit() {

    }

    prepareContract() {
        this.onClickPrepareContract.emit();
    }

    signContract() {
        this.onClickSignContract.emit();
    }

    showModals() {
        this.showFullModals.emit();
    }
    downloadContract() {
        this.onDownloadContract.emit();
    }

    sendContract() {
        this.onSendContract.emit();
    }

    viewContractInfo() {

    }

    viewPerformance() {
        this.onViewPerformance.emit();
    }

    createContent() {
        const influencerCampaignId = this.influencer.inf_campaign_id;
        this.router.navigate([`/internal/campaign/${influencerCampaignId}`]);
    }

    reviewContent() {
        const influencerCampaignId = this.influencer.inf_campaign_id;
        this.router.navigate([`/image-review/${influencerCampaignId}`]);
    }

    get allowContentReview() {
        return this.influencer.profile.influencer.status === InfluencerStatus.CONTRACT_SIGNED &&
            this.influencer.inf_campaign_id;
    }

    get allowSignContract() {
        return this.influencer.profile.influencer.status === InfluencerStatus.PENDING_BRAND_SIGNING ||
            this.influencer.profile.influencer.status === InfluencerStatus.PENDING_SIGNING;
    }

    get allowDownloadContract() {
        return this.influencer.profile.influencer.status === InfluencerStatus.CONTRACT_SIGNED &&
            this.influencer.signature_request_id;
    }

    get allowViewPerformance() {
        return this.influencer.profile.influencer.status === InfluencerStatus.CONTRACT_SIGNED;
    }

    get allowViewContractInfo() {
        return this.influencer.contract_data;
    }
}
