import { Component, OnInit, Input } from '@angular/core';
import { CampaignDetail, CampaignData, CommissionType } from 'src/types/campaign';

import * as moment from 'moment';
import { UtilsService } from 'src/app/services/util.service';
import { Subscription } from 'rxjs';
import { CampaignService } from '@src/app/services/campaign.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { LoadingSpinnerService } from '@src/app/services/loading-spinner.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-campaign-overview',
    templateUrl: './campaign-overview.component.html',
    styleUrls: ['./campaign-overview.component.scss'],
})
export class CampaignOverviewComponent implements OnInit {
    @Input() influencer;
    @Input() payments;
    showDetail = false;
    isShowMails = false;

    validateForm: FormGroup;

    constructor(
        private utilService: UtilsService,
        private campaignService: CampaignService,
        private notification: NotificationService,
        private loadingService: LoadingSpinnerService,
        private fb: FormBuilder,
    ) { }

    subscriptions: Subscription[] = [];

    ngOnInit(): void {
        this.validateForm = this.fb.group({
            store_email: [null, [Validators.email, Validators.required]],
            store_phone: [null, [Validators.required]],
            store_phone_prefix: ['+1'],
        });
    }


    displayTime(end_time) {
        const endTime = moment(end_time).format('MMMM Do YYYY');
        return endTime;
    }

    displayCommission(campaign: CampaignDetail) {
        return this.utilService.displayCommission(campaign);
    }

    getContactEmail(contact: string) {
        return contact.split('<')[1].split('>')[0];
    }

    getContactName(contact: string) {
        return contact.split(' ')[0];
    }

    showDetailToggle() {
        this.showDetail = !this.showDetail;
    }

    bookDemo() {
        this.loadingService.show();
        const contact_info = this.validateForm.value;
        this.campaignService.updateCommonCampaign({
            contact_info,
        }, this.influencer.brand_campaign_id).then(next => {
            const demo_info = {
                name: this.influencer.brand,
                email: contact_info.store_email,
                phone_number: contact_info.store_phone,
            };
            this.subscriptions.push(
                this.campaignService.bookDemo(demo_info).subscribe((result) => {
                    this.notification.addMessage({
                        type: AlertType.Success,
                        title: 'Demo Request Received',
                        message: 'We have received your request, our account manager will reach out to you shortly',
                        duration: 3000,
                    });
                    this.influencer.contact_info = contact_info;
                    this.loadingService.hide();
                }, err => {
                    this.loadingService.hide();
                })
            );
        });
    }

    isStrings(val) {
        if (typeof val == 'string') {
            return true;
        } else {
            return false;
        }
    }

    get getPlatform() {
        return this.influencer.platform ? this.influencer.platform : this.influencer.extra_info['platform'];
    }

    get getPostTime() {
        return this.influencer.post_time ? this.influencer.post_time : this.influencer.extra_info['post_time'];
    }

    get getCampaignType() {
        return this.influencer.campaign_type ? this.influencer.campaign_type : this.influencer.extra_info['type'];
    }
}
