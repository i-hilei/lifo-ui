import { Component, OnChanges, OnInit, ViewChild, Input } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import * as dayjs from 'dayjs';

@Component({
    selector: 'app-commission-pending-status',
    templateUrl: './commission-pending-status.component.html',
    styleUrls: ['../../application-view/application-view.component.scss'],
})
export class CommissionPendingStatusComponent implements OnInit, OnChanges {
    @ViewChild('influencerProfile') influencerProfile;
    @ViewChild('campaignDetail') campaignDetail;
    @Input() commissionPendingInfluencer = [];

    loading = true;
    allChecked = false;
    indeterminate = false;

    showPaymentModal = false;
    isPaying = false;
    payingInfluencer;
    paymentAmount = 0;
    overwritePayment = false;

    constructor(
        private internalService: InternalService,
        private notificationService: NotificationService,
    ) { }

    ngOnInit(): void {

    }

    viewPost(influencer) {
        window.open(influencer.post_url, '_blank');
    }

    startPayInfluencer(influencer) {
        this.payingInfluencer = influencer;
        this.paymentAmount = this.getPaymentAmount();
        this.showPaymentModal = true;
    }

    cancelPayInfluencer() {
        this.showPaymentModal = false;
    }

    payInfluencer(influencer) {
        this.isPaying = true;
        this.internalService.payCampaign(
            influencer.campaign.brand_campaign_id,
            influencer.account_id,
            influencer.user_id,
            Number(this.paymentAmount),
            influencer.campaign.product_name,
            influencer.email,
        ).then(result => {
            console.log(result);
            this.isPaying = false;
            if (result['error']) {
                this.notificationService.addMessage({
                    type: AlertType.Error,
                    title: 'Not paid',
                    message: 'Error happend when trying to pay.',
                    duration: 3000,
                });
            } else {
                influencer.commission_paid_amount = this.paymentAmount;
                influencer.commission_paid_time = dayjs().unix();
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Paid',
                    message: 'Campaign paid for this influencer.',
                    duration: 3000,
                });

                let index = -1;
                for (let i = 0; i < this.commissionPendingInfluencer.length; i ++) {
                    if (this.commissionPendingInfluencer[i].account_id === influencer.account_id) {
                        index = i;
                    }
                }
                this.commissionPendingInfluencer.splice(index, 1);
                this.commissionPendingInfluencer = [
                    ...this.commissionPendingInfluencer,
                ];
            }
            this.showPaymentModal = false;
        }).catch(error => {
            this.isPaying = false;
            this.notificationService.addMessage({
                type: AlertType.Error,
                title: 'Not paid',
                message: 'Error happend when trying to pay.',
                duration: 3000,
            });
        });
    }

    batchPayCommission() {
        this.commissionPendingInfluencer.forEach(influencer => {
            if (influencer.checked) {
                this.payingInfluencer = influencer;
                this.paymentAmount = this.getPaymentAmount();
                this.payInfluencer(influencer);
            }
        });
    }

    get calculateContentUploadDiff() {
        const date1 = dayjs(this.payingInfluencer.content_submit_time * 1000);
        const date2 = dayjs(this.payingInfluencer.product_received_time * 1000);
        return date1.diff(date2, 'hour');
    }

    get fastDeliverWindow() {
        return dayjs(this.payingInfluencer.product_received_time * 1000 + this.payingInfluencer.campaign.configuration.fast_deliver_window * 3600 * 1000).format('MMM D, HH:mm');
    }

    getPaymentAmount() {
        const deliver_window = this.payingInfluencer.campaign.configuration.fast_deliver_window;
        if (this.calculateContentUploadDiff > deliver_window) {
            return Number(this.payingInfluencer.accept_commission);
        } else {
            return Number(this.payingInfluencer.accept_commission) + Number(this.payingInfluencer.accept_bonus);
        }
    }

    getConciseCampaign(campaign) {
        return {
            brand_campaign_id: campaign.brand_campaign_id,
            campaign_name: campaign.campaign_name,
            platform: campaign.platform,
            end_time: campaign.end_time,
            post_time: campaign.post_time,
            start_post_time: campaign.start_post_time,
            product_name: campaign.product_name,
            product_price: campaign.product_price,
            brand_id: campaign.brand_id,
            configuration: campaign.configuration,
        };
    }

    showFullModals(val) {
        this.influencerProfile.influencer = val;
        this.influencerProfile.showModals();
     }

    showDetailModals(val) {
        this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
        this.campaignDetail.showModals();
    }

    refreshStatus(): void {
        const validData = this.commissionPendingInfluencer.filter(value => !value.disabled);
        const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
        const allUnChecked = validData.every(value => !value.checked);
        this.allChecked = allChecked;
        this.indeterminate = !allChecked && !allUnChecked;
    }

    checkAll(value: boolean): void {
        this.commissionPendingInfluencer.forEach(data => {
            if (!data.disabled) {
                data.checked = value;
            }
        });
        this.refreshStatus();
    }

    get checkedInf() {
        return this.commissionPendingInfluencer.filter(inf => inf.checked).length;
    }

    ngOnChanges() {
        if (this.commissionPendingInfluencer.length !== 0) {
          this.loading = false;
        }
      }

}

