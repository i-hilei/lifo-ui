import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InternalService } from 'src/app/services/internal.service';
import { CampaignDetail } from '@src/types/campaign';
import { InfluencerRecommendBody } from '@src/types/influencer';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-edit-notes',
    templateUrl: './edit-notes.component.html',
    styleUrls: ['./edit-notes.component.scss'],
})
export class EditNotesComponent implements OnInit {
    @Input() displayInfluencer: InfluencerRecommendBody;
    @Input() campaign: CampaignDetail;

    inputValue = '';
    isEdits = true;
    isSpinning = false;
    subscriptions: Subscription[] = [];

    constructor(
        private internalService: InternalService,
    ) { }

    ngOnInit() {
    }

    editNodtes() {
        this.inputValue = this.displayInfluencer['note'];
        this.isEdits = false;
    }

    cancelEdits() {
        this.isEdits = true;
    }

    async saveEdits() {
        this.isSpinning = true;
        const updateProduct = await this.internalService.saveNodtes(
            this.campaign.brand_campaign_id,
            this.displayInfluencer['account_id'],
            this.inputValue
        );

        this.subscriptions.push(
            updateProduct.subscribe(result => {
                this.isEdits = true;
                this.displayInfluencer['note'] = this.inputValue;
                this.isSpinning = false;
            })
        );
    }

}
