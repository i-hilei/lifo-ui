import { Component, OnInit, Input } from '@angular/core';
import { Influencer } from 'src/types/influencer';

@Component({
    selector: 'app-tiny-instagram-card',
    templateUrl: './tiny-instagram-card.component.html',
    styleUrls: ['./tiny-instagram-card.component.scss'],
})
export class TinyInstagramCardComponent implements OnInit {
    @Input() allowSelect: boolean;
    @Input() isSelected: boolean;
    @Input() influencer: Influencer;

    constructor() { }
    emailStatus = {
        'Brand chosen': ['In Negotiation', 'warning'],
        'Email sent': ['In Negotiation', 'warning'],
        'Offer Declined': ['In Negotiation', 'warning'],
        'Offer Accepted': ['In Negotiation', 'warning'],
        Recommended: ['In Negotiation', 'warning'],
        'Pending Signing': ['In Negotiation', 'warning'],
        'Contract Signed': ['In Negotiation', 'warning'],
        'Pending Influencer Signing': ['In Negotiation', 'warning'],
        'Pending Brand Signing': ['In Negotiation', 'warning'],
    };

    ngOnInit(): void {
    }

}
