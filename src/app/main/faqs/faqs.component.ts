import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {CampaignService} from 'src/app/services/campaign.service';

@Component ({
    selector: 'app-faqs',
    templateUrl: './faqs.component.html',
    styleUrls: ['./faqs.component.scss'],
})
export class FaqsComponent implements OnInit {

    constructor(
        public campaignService: CampaignService,
    ) { }

    @ViewChild('Payment') Payment: ElementRef;
    @ViewChild('Shipping') Shipping: ElementRef;
    @ViewChild('Discovery') Discovery: ElementRef;
    @ViewChild('Content') Content: ElementRef;
    @ViewChild('Posting') Posting: ElementRef;

    radioData = [
        {
            name: 'Payment',
            value: 'Payment',
            type: 'credit-card',
            checked: true,
        },
        {
            name: 'Shipping',
            value: 'Shipping',
            type: 'shopping-cart',
            checked: false,
        },
        {
            name: 'Discovery',
            value: 'Discovery',
            type: 'file-search',
            checked: false,
        },
        {
            name: 'Content',
            value: 'Content',
            type: 'credit-card',
            checked: false,
        },
        {
            name: 'Posting',
            value: 'Posting',
            type: 'credit-card',
            checked: false,
        },
    ];
    faqList = [];

    ngOnInit() {
        this.getFaqAlls();
    }

    goDistance(val): void {
        console.log(val, 88);
        this[val].nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    }

    async getFaqAlls() {
        this.faqList = [];
        const user = await this.campaignService.getFaqAll();
        user.subscribe((result) => {
            for (const i of result) {
                i.checked = false;
                this.faqList.push(i);
            }
            console.log(this.faqList, 666);
        }
        );
    }

    isShowList(val) {
        val.checked = !val.checked;
    }

    selectClick() {
    // this.getFaqAlls();
    }

}
