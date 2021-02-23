import { Component, OnInit, Input, EventEmitter, Output, OnChanges, ViewChild, OnDestroy } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { CampaignDetail } from '@src/types/campaign';
import { InfluencerRecommendBody } from '@src/types/influencer';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-influencer-discovery-list',
    templateUrl: './influencer-discovery-list.component.html',
    styleUrls: ['./influencer-discovery-list.component.scss'],
})
export class InfluencerDiscoveryListComponent implements OnInit, OnChanges, OnDestroy {
    @Input() recommendedInfluencer: InfluencerRecommendBody[];
    @Input() campaign: CampaignDetail;
    @Output() onAddToChatbox = new EventEmitter<InfluencerRecommendBody[]>();
    @ViewChild('discoveryModal') discoveryModal;
    @ViewChild('influencerView') influencerView;

    displayInfluencer: InfluencerRecommendBody[];
    allChecked = false;
    indeterminate = false;
    isSearchDiscover = true;
    subscriptions: Subscription[] = [];
    discoverToolTips = 'Need to collab with more influencers? Or no one has responded you yet? Click this button and Lifo’s algorithm will match more influencers for you. ';

    constructor(
        private internalService: InternalService,
    ) { }

    ngOnInit(): void {
        this.recommendedInfluencer.forEach(inf => {
            inf.checked = false;
            inf.expanded = false;
        });
        this.displayInfluencer = this.recommendedInfluencer.sort((inf_a, inf_b) => {
            return inf_a.profile.highlyRecommend ? inf_b.profile.highlyRecommend ? 0 : -1 : 1;
        });
        // console.log(this.displayInfluencer, 123);
        if (this.campaign.discovery_status === 'Need more influencers') {
            this.isSearchDiscover = false;
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    ngOnChanges(changes) {
        if (changes.recommendedInfluencer) {
            this.update(changes.recommendedInfluencer.currentValue);
        }
    }
    update(recommendedInfluencer) {
        this.displayInfluencer = [...recommendedInfluencer];
    }

    refreshStatus(): void {
        const allChecked = this.displayInfluencer.length > 0 && this.displayInfluencer.every(value => value['checked']);
        const allUnChecked = this.displayInfluencer.every(value => !value['checked']);
        this.allChecked = allChecked;
        this.indeterminate = !allChecked && !allUnChecked;
    }

    checkAll(value: boolean): void {
        this.displayInfluencer.forEach(data => {
            if (!data['disabled']) {
                data['checked'] = value;
            }
        });
        this.refreshStatus();
    }

    openInsPage(influencer) {
        event.stopPropagation();
        window.open(influencer.profile.url, '_blank');
    }

    addToCheckBox() {
        const selectedInfluencer = this.displayInfluencer.filter(inf => {
            return inf.checked;
        });
        this.onAddToChatbox.emit(selectedInfluencer);
    }


    showDiscoveryModals() {
        this.subscriptions.push(
            this.internalService.discoverMore(this.campaign.brand_campaign_id).subscribe(result => {
                this.isSearchDiscover = false;
                this.discoveryModal.isModalVisible = true;
            }, error => {
                console.warn(error);
            })
        );
    }

    get countLifoRecommended() {
        return this.displayInfluencer.filter(inf => {
            return inf.profile.highlyRecommend;
        }).length;
    }

}
