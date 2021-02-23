import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { ShopifyService } from '@src/app/services/shopify.service';
import { CampaignDetail, ShopifyProduct, ShopifyProductDetail } from '@src/types/campaign';
import { InfluencerRecommendBody } from '@src/types/influencer';
import { Subscription } from 'rxjs';
import * as dayjs from 'dayjs';

@Component({
    selector: 'app-influencer-operation',
    templateUrl: './influencer-operation.component.html',
    styleUrls: ['./influencer-operation.component.scss'],
})
export class InfluencerOperationComponent implements OnInit, OnDestroy {
    @Input() influencer: InfluencerRecommendBody;
    @Input() campaign: CampaignDetail;
    @Input() productList: ShopifyProductDetail[];
    selectProduct: ShopifyProductDetail;

    orderInfo;
    subscriptions: Subscription[] = [];

    trackingDetail;

    overwritePayment = false;
    paymentAmount = 0;

    showCreateOrderModal = false;
    showPaymentModal = false;
    isPaying = false;

    isCreatingOrder = false;

    shippingInfo;
    showShippingModal = false;

    showPayUpfrontModal = false;

    fastDeliverWindow = 0;

    showCreateCoupon = false;
    editCouponCode = '';

    isHistoryVisible = false;

    issuedCommission = [];
    pendingCommission = [];
    historyCommission = [];

    constructor(
        private shopifyService: ShopifyService,
        private internalService: InternalService,
        private notificationService: NotificationService,
        public router: Router,
    ) { }

    ngOnInit(): void {
        if (this.influencer.shipping_info) {
            this.parseTracking();
        }
        if (this.influencer.accept_commission) {
            const deliver_window = this.influencer.application_time ? this.campaign.discover_configuration.fast_deliver_window : this.campaign.configuration.fast_deliver_window;
            this.fastDeliverWindow = deliver_window;
            if (this.calculateContentUploadDiff > deliver_window) {
                this.paymentAmount = Number(this.influencer.accept_commission);
            } else {
                this.paymentAmount = Number(this.influencer.accept_commission) + Number(this.influencer.accept_bonus);
            }
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    cancelCreateOrder() {
        this.showCreateOrderModal = false;
    }

    startCreateOrder() {
        let selectProduct: ShopifyProductDetail;
        this.productList.forEach(product => {
            if (product.title === this.campaign.product_name) {
                selectProduct = product;
            }
        });
        this.selectProduct = selectProduct;
        this.orderInfo = {
            product_name: selectProduct ? selectProduct.title : '',
            variant_id: this.influencer.variant_id ? this.influencer.variant_id : '',
            product_price: this.campaign.product_price,
            first_name: this.influencer.inf_last_name ? this.influencer.inf_name : this.influencer.inf_name.split(' ')[0],
            last_name: this.influencer.inf_last_name ? this.influencer.inf_last_name : this.influencer.inf_name.split(' ').length > 1 ?
                this.influencer.inf_name.split(' ')[1] : this.influencer.inf_name.split(' ')[0],
            email: this.influencer.email,
            phone_number: this.influencer.inf_phone,
            address_line_1: this.influencer.influencer_address1,
            address_line_2: this.influencer.influencer_address2,
            city: this.influencer.influencer_city,
            province: this.influencer.influencer_province,
            country: this.influencer.influencer_country,
            zip: this.influencer.influencer_zip,
        };

        this.showCreateOrderModal = true;
    }

    validateOrder() {
        if (!this.orderInfo.product_name || !this.orderInfo.variant_id) {
            return 'Product name / Product type could not be empty!';
        }
        if (!this.orderInfo.first_name || !this.orderInfo.last_name) {
            return 'First name / Last name could not be empty!';
        }
        if (!this.orderInfo.address_line_1) {
            return 'Address could not be empty!';
        }
        return '';
    }

    createOrder() {
        this.isCreatingOrder = true;
        this.shopifyService.createOrder(
            this.campaign.brand_id,
            this.campaign.brand_campaign_id,
            this.influencer.account_id,
            this.orderInfo
        ).then(result => {
            if (result.errors) {
                // Show error
                this.notificationService.addMessage({
                    type: AlertType.Error,
                    title: 'Create Order Error',
                    message: JSON.stringify(result.errors),
                    duration: 3000,
                });
                this.isCreatingOrder = false;
                return;
            }

            this.influencer = {
                ...this.influencer,
                ...result,
            };
            this.showCreateOrderModal = false;
            this.isCreatingOrder = false;
            this.notificationService.addMessage({
                type: AlertType.Success,
                title: 'Create Order Succeed',
                message: 'Order created and now pending fulfillment.',
                duration: 3000,
            });
        });
    }

    viewOrder() {
        this.subscriptions.push(
            this.shopifyService.updateOrder(
                this.campaign.brand_id,
                this.campaign.brand_campaign_id,
                this.influencer.account_id
            ).subscribe(result => {
                if (result.order) {
                    this.notificationService.addMessage({
                        type: AlertType.Success,
                        title: 'Update Order Succeed',
                        message: 'Order created and now pending fulfillment.',
                        duration: 3000,
                    });

                    this.influencer = {
                        ...this.influencer,
                        ...result,
                    };
                }
            })
        );
    }

    startPayInfluencer() {
        this.showPaymentModal = true;
    }

    cancelPayInfluencer() {
        this.showPaymentModal = false;
    }

    payInfluencer() {
        this.isPaying = true;
        this.internalService.payCampaign(
            this.campaign.brand_campaign_id,
            this.influencer.account_id,
            this.influencer.user_id,
            Number(this.paymentAmount),
            this.campaign.product_name,
            this.influencer.email,
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
                this.influencer.commission_paid_amount = this.paymentAmount;
                this.influencer.commission_paid_time =  dayjs().unix();
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Paid',
                    message: 'Campaign paid for this influencer.',
                    duration: 3000,
                });
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

    markAsShppingArrived() {
        this.internalService.setShippingArrived(
            this.campaign.brand_campaign_id,
            this.influencer.account_id,
        ).then(result => {
            if (result['status'] === 'OK') {
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Success',
                    message: 'Marked as Delivered.',
                    duration: 3000,
                });
            }
        });
    }

    parseTracking() {
        this.subscriptions.push(
            this.internalService.trackShipping(
                this.influencer.shipping_info,
            ).subscribe(result => {
                this.trackingDetail = result;
            })
        );
    }

    reivewCampaign() {
        const influencerCampaignId = this.influencer.inf_campaign_id;
        window.open(`/image-review/${influencerCampaignId}`, '_blank');
    }

    createCouponCode() {
        if (!this.campaign.price_rule) {
            this.notificationService.addMessage({
                type: AlertType.Error,
                title: 'No Price Rule',
                message: 'You need to create a price rule first',
                duration: 3000,
            });
            return;
        }
        this.showCreateCoupon = true;
        this.editCouponCode = this.influencer.invitation?.default_coupon_code;
    }

    createCouponCodeReal() {
        this.subscriptions.push(
            this.shopifyService.createCouponCode(
                this.campaign.brand_id,
                this.campaign.brand_campaign_id,
                this.influencer.account_id,
                this.editCouponCode,
                this.campaign.price_rule.id,
            ).subscribe(result => {
                this.showCreateCoupon = false;
                if (result.errors) {
                    this.notificationService.addMessage({
                        type: AlertType.Error,
                        title: 'Error creating coupon code',
                        message: JSON.stringify(result.errors),
                        duration: 3000,
                    });
                    return;
                }
                this.influencer = {
                    ...this.influencer,
                    ...result,
                };
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Success',
                    message: 'Coupon code created.',
                    duration: 3000,
                });
            })
        );
    }

    cancelCreateCouponCode() {
        this.showCreateCoupon = false;
    }

    cancelAddShippingInfo() {
        this.showShippingModal = false;
    }

    startAddShippingInfo() {
        this.showShippingModal = true;
        if (this.influencer.shipping_info) {
            this.shippingInfo = {
                ...this.influencer.shipping_info,
            };
        } else {
            this.shippingInfo = {
                carrier: '',
                tracking_number: '',
            };
        }
    }

    addShippingInfo() {
        this.internalService.setShipping(
            this.campaign.brand_campaign_id,
            this.influencer.account_id,
            this.shippingInfo,
        ).then(result => {
            if (result['status'] === 'OK') {
                this.influencer.shipping_info = this.shippingInfo;
                this.showShippingModal = false;
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Success',
                    message: 'Marked as Shipped.',
                    duration: 3000,
                });
            }
        });
    }

    startUpfrontPayment() {
        this.showPayUpfrontModal = true;
    }

    cancelPayUpfrontCommission() {
        this.showPayUpfrontModal = false;
    }

    payUpfrontCommission() {
        this.internalService.payUpfrontCommission(
            this.campaign.brand_campaign_id,
            this.influencer.account_id,
            this.influencer.user_id,
            this.paymentAmount,
        ).then(result => {
            console.log(result);
            if (result['error']) {
                this.notificationService.addMessage({
                    type: AlertType.Error,
                    title: 'Not paid',
                    message: 'Error happend when trying to pay.',
                    duration: 3000,
                });
            } else {
                this.influencer.upfront_paid_amount = this.paymentAmount;
                this.influencer.upfront_paid_time =  dayjs().unix();
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Paid',
                    message: 'Upfront commission paid for this influencer.',
                    duration: 3000,
                });
            }
            this.showPayUpfrontModal = false;
        });
    }

    deleteCampaignInfluencer() {
        this.internalService.deleteCampaignInfluencer(
            this.campaign.brand_campaign_id,
            this.influencer.account_id,
        ).then(result => {
            this.notificationService.addMessage({
                type: AlertType.Success,
                title: 'Deleted',
                message: 'Campaign influencer deleted!',
                duration: 3000,
            });
        });
    }

    historyHandleCancel() {
        this.isHistoryVisible = false;
    }

    showHistoryModal(data) {
        console.log(data, 622);
        this.isHistoryVisible = true;
        this.subscriptions.push(
            this.internalService.showPaymentHistory(data.user_id).subscribe(result => {
                const issued = [];
                const pending = [];
                const history = [];
                for (const i of result) {
                    if (i.transaction_type === 'CAMPAIGN_PAY' && i.status === 'DONE') {
                        issued.push(i);
                    }
                    if (i.transaction_type === 'CAMPAIGN_PAY' && i.status === 'PENDING') {
                        pending.push(i);
                    }
                    if (i.transaction_type === 'CASH_OUT') {
                        history.push(i);
                    }
                }
                this.issuedCommission = issued;
                this.pendingCommission = pending;
                this.historyCommission = history;
                // this.trackingDetail = result;
            })
        );
    }

    get calculateContentUploadDiff() {
        const date1 = dayjs(this.influencer.content_submit_time * 1000);
        const date2 = dayjs(this.influencer.product_received_time * 1000);
        return date1.diff(date2, 'hour');
    }

    get fast_deliver_time() {
        return dayjs(this.influencer.product_received_time * 1000 + this.campaign.configuration.fast_deliver_window * 3600 * 1000).format('MMM D, HH:mm');
    }

    get content_deadline() {
        return dayjs(this.influencer.product_received_time * 1000 + this.campaign.configuration.delivery_deadline * 3600 * 1000).format('MMM D, HH:mm');
    }

    get post_deadline() {
        return this.campaign.post_time ?
            dayjs(this.campaign.post_time * 1000).format('MMM D, HH:mm') :
            dayjs(this.influencer.content_approve_time * 1000 + 24 * 3600 * 1000).format('MMM D, HH:mm');
    }
}
