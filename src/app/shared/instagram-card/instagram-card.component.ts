import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { Influencer, InfluencerRecommendBody, InfluencerStatus } from 'src/types/influencer';
import { InternalService } from 'src/app/services/internal.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-instagram-card',
    templateUrl: './instagram-card.component.html',
    styleUrls: ['./instagram-card.component.scss'],
})
export class InstagramCardComponent implements OnInit, OnDestroy {

    @Input() influencer: InfluencerRecommendBody;
    @Input() influencerName: string;
    @Input() mode;
    @Input() influencerDetail: Influencer;

    showDetail = false;
    selected = false;
    subscriptions: Subscription[] = [];

    @Output() onSignContract = new EventEmitter<null>();
    @Output() onPrepareContract = new EventEmitter<null>();
    @Output() onRecommendInfluencer = new EventEmitter<Influencer>();
    @Output() onChooseInfluencer = new EventEmitter<Influencer>();
    @Output() onDownloadContract = new EventEmitter<InfluencerRecommendBody>();
    @Output() onSendContract = new EventEmitter<Influencer>();

    constructor(
        private internalService: InternalService,
        private router: Router,
    ) { }


    async ngOnInit() {
        if (this.influencerName && !this.influencerDetail) {
            const profileGet = await this.internalService.getInfluencerProfile(this.influencerName);

            this.subscriptions.push(
                profileGet.subscribe(profile => {
                    this.influencerDetail = profile;
                    this.influencer = profile;
                })
            );
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    async viewDetail() {
        if (!this.influencerDetail.stats) {
            const profileGet = await this.internalService.getInfluencerProfile(this.influencerDetail.profile.username);

            this.subscriptions.push(
                profileGet.subscribe(profile => {
                    this.influencerDetail = profile;
                    this.showDetail = !this.showDetail;
                })
            );
        } else {
            this.showDetail = !this.showDetail;
        }
    }

    prepareContract() {
        event.stopPropagation();
        this.onPrepareContract.emit();
    }

    signContract() {
        event.stopPropagation();
        this.onSignContract.emit();
    }

    recommendInfluencer() {
        event.stopPropagation();
        this.onRecommendInfluencer.emit(this.influencerDetail);
    }

    chooseInfluencer() {
        event.stopPropagation();
        this.onChooseInfluencer.emit(this.influencerDetail);
    }

    downloadContract() {
        event.stopPropagation();
        this.onDownloadContract.emit(this.influencer);
    }

    displayNumber(number) {
        if (number >= 1000000) {
            return `${Math.round((number * 10) / 1000000) / 10} M`;
        } else if (number >= 1000) {
            return `${Math.round((number * 10) / 1000) / 10} K`;
        }
    }

    sendContract() {
        event.stopPropagation();
        this.onSendContract.emit(this.influencerDetail);
    }

    openInsPage() {
        event.stopPropagation();
        window.open(this.influencerDetail.profile.url, '_blank');
    }

    goToReview() {
        const influencerCampaignId = this.influencer.inf_campaign_id;
        this.router.navigate([`/app/image-review/${influencerCampaignId}`]);
    }

    goToCreateContent() {
        const influencerCampaignId = this.influencer.inf_campaign_id;
        this.router.navigate([`/internal/campaign/${influencerCampaignId}`]);
    }

    get hasContentReview() {
        return this.mode === 'BRAND' && this.influencerDetail.status ===
        InfluencerStatus.CONTRACT_SIGNED && this.influencer.inf_campaign_id;
    }

    get hasCreateReview() {
        return this.mode === 'AM' && this.influencerDetail.status === InfluencerStatus.CONTRACT_SIGNED && this.influencer.inf_campaign_id;
    }

    get showPrepareContract() {
        // AM role and status is 'selected'
        return this.mode === 'AM' && this.influencerDetail.status === InfluencerStatus.OFFER_ACCEPTED;
    }

    get showSignContract() {
        return this.mode === 'BRAND' &&
            (this.influencerDetail.status === InfluencerStatus.PENDING_SIGNING
                 || this.influencerDetail.status ===
                 InfluencerStatus.PENDING_BRAND_SIGNING);
    }

    get showRecommend() {
        // Only show this in discover mode
        return this.mode === 'DISCOVER';
    }

    get showChooseInfluencer() {
        return this.mode === 'BRAND' && this.influencerDetail.status === InfluencerStatus.RECOMMENDED;
    }

    get showNegotiation() {
        return this.influencerDetail.status === InfluencerStatus.BRAND_CHOSEN;
    }

    get showContract() {
        return this.influencerDetail.status === InfluencerStatus.CONTRACT_SIGNED;
    }

    get showSendContract() {
        return this.mode === 'AM' && this.influencerDetail.status === InfluencerStatus.PENDING_SIGNING;
    }
}
