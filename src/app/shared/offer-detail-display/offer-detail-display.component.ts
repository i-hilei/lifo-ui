import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { InternalService } from 'src/app/services/internal.service';
import { CampaignService } from 'src/app/services/campaign.service';
import { ActivatedRoute } from '@angular/router';
import { OfferDetail } from 'src/types/campaign';

@Component({
    selector: 'app-offer-detail-display',
    templateUrl: './offer-detail-display.component.html',
    styleUrls: ['./offer-detail-display.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class OfferDetailDisplayComponent implements OnInit {
    @Input() offerDetail: OfferDetail;
    @Input() offerDefaultDetail;
    @Input() isMobileView = false;

    constructor() {
    }

    async ngOnInit() {}

    open(link) {
        if (link.indexOf('http') !== 0) {
            link = `http://${link}`;
        }
        window.open(link, '_blank');
    }

    isStrings(val) {
        if (typeof val == 'string') {
            return true;
        } else {
            return false;
        }
    }
}
