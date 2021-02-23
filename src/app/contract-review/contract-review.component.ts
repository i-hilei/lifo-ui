import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import HelloSign from 'hellosign-embedded';

@Component({
    selector: 'app-contract-review',
    templateUrl: './contract-review.component.html',
    styleUrls: ['./contract-review.component.scss']
})
export class ContractReviewComponent implements OnInit {

    campaignId: string;

    signUrl: string = 'https://app.hellosign.com/editor/embeddedSign?signature_id=f5776a282c19399684a9869e62aeafd5&token=5368167f2c7c37ef13448f90704c804a';
    API_KEY = '1d21122d55d199d3a813b23eae0f14a8993fd65dc59b02ddb7161863e95fcd84';
    CLIENT_ID = '27cc85a78ccb5e4aececed072ac31fd1';

    client = new HelloSign();
    constructor(
        private activatedRoute: ActivatedRoute,
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('campaignId');
    }

    ngOnInit(): void {
        
    }

    openSignUrl() {
        this.client.open(this.signUrl, {
            clientId: this.CLIENT_ID,
            skipDomainVerification: true,
        });
    }
}
