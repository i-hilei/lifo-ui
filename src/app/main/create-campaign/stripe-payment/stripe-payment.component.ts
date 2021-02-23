import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ɵConsole } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StripeService, StripeCardNumberComponent, StripeCardComponent } from 'ngx-stripe';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
  PaymentIntent,
} from '@stripe/stripe-js';
import { BrandService } from '@src/app/services/brand.service';
import { LoadingSpinnerService } from '../../..//services/loading-spinner.service';
import { CampaignService } from '@src/app/services/campaign.service';

@Component({
    selector: 'app-stripe-payment',
    templateUrl: './stripe-payment.component.html',
    styleUrls: ['./stripe-payment.component.scss'],
})
export class StripePaymentComponent implements OnInit {
    @ViewChild(StripeCardComponent) card: StripeCardComponent;
    @Input() campaignPrice;
    @Input() campaignId;
    @Input() additionalMessage;

    @Output() onCompletePayment = new EventEmitter<any>();
    @Output() onCancelPayment = new EventEmitter<any>();

    elementsOptions: StripeElementsOptions = {
        locale: localStorage.getItem('langs') === 'zh-cn' ? 'zh' : 'en',
        fonts: [
            {
              cssSrc: 'https://fonts.googleapis.com/css?family=Roboto',
            },
        ],
    };

    cardOptions: StripeCardElementOptions = {
        iconStyle: 'solid',
        style: {
            base: {
                iconColor: '#0D053C',
                color: '#31325F',
                fontWeight: '400',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '16px',
                fontSmoothing: 'antialiased',
                ':-webkit-autofill': {
                    color: '#fce883',
                  },
                '::placeholder': {
                    color: '#CFD7E0',
                },
            },
            invalid: {
                iconColor: '#EB5757',
                color: '#EB5757',
              },
        },
    };

    stripeTest: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private stripeService: StripeService,
        private brandService: BrandService,
        private loadingService: LoadingSpinnerService,
        private campaignService: CampaignService,
    ) {}

    isVisible = false;
    validateForm!: FormGroup;
    detailsValidateForm: FormGroup;
    isVisibleTags = false;
    successInfo = 'Payment successful, the campaign will be launched soon.';
    value?: string;
    isShowInputPass = true;
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    submitDisabled = true;
    displayError = false;
    displayErrorInfo = '';
    isCardError = false;
    isShowPayFail = false;
    isShowPayInfo = '';
    isStatus = '';
    completeStatus = false;

    tags01 = [];
    tags02 = [];
    tags01_value = '';
    tags02_value = '';


    ngOnInit(): void {
        this.stripeTest = this.fb.group({
            // amount: [1001, [Validators.required, Validators.pattern(/\d+/)]],
            name: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            // zip: ['', [Validators.required]],
        });
        this.validateForm = this.fb.group({
            store_email: [null, [Validators.email, Validators.required]],
            store_phone: [null, [Validators.required]],
            store_phone_prefix: ['+1'],
        });
        this.detailsValidateForm = this.fb.group({
            tags01_value: [''],
            tags02_value: [''],
        });
    }

    async pay() {
        this.loadingService.show();
        if (this.stripeTest.valid) {
            const pi = await this.brandService.createPaymentIntent(
                this.campaignPrice * 100,
            ) as PaymentIntent;
            this.stripeService.confirmCardPayment(pi.client_secret, {
                payment_method: {
                    card: this.card.element,
                    billing_details: {
                        name: `${this.stripeTest.get('name').value} ${this.stripeTest.get('lastName').value}`,
                    },
                },
            }).subscribe((result) => {
                console.log(result);
                if (result.error) {
                    // Show error to your customer (e.g., insufficient funds)
                    this.loadingService.hide();
                    this.isShowPayInfo = result.error.message;
                } else {
                    // The payment has been processed!
                    this.loadingService.hide();
                    if (result.paymentIntent.status === 'succeeded') {
                        if (this.additionalMessage) {
                            this.isVisible = false;
                            this.isVisibleTags = true;
                            this.tagModals();
                        } else {
                            this.onCompletePayment.emit();
                        }
                    }
                }
            }, err => {
                this.isShowPayInfo = err.error.message;
            });
        } else {
            console.log(this.stripeTest);
            this.loadingService.hide();
            this.displayErrorInfo = 'Payment failed, please reconfirm the payment information';
        }
    }

    tagModals() {
        this.validateForm = this.fb.group({
            store_email: [null, [Validators.email, Validators.required]],
            store_phone: [null, [Validators.required]],
            store_phone_prefix: ['+1'],
        });
        this.detailsValidateForm = this.fb.group({
            tags01_value: [''],
            tags02_value: [''],
        });
    }

    changeCard(e) {
        const names = this.stripeTest.get('name').value;
        const lastName = this.stripeTest.get('lastName').value;
        if (e.error) {
            this.displayError = true;
            this.submitDisabled = true;
            this.displayErrorInfo = e.error.message;
        } else {
            this.displayError = false;
            this.displayErrorInfo = '';
        }
        if (e.complete) {
            this.completeStatus = true;
            if ( names !== '' && lastName !== '') {
                this.submitDisabled = false;
            }
        } else {
            this.completeStatus = false;
            this.submitDisabled = true;
        }
        if (e.empty) {
            this.submitDisabled = true;
        }
    }

    handleClose(tags, removedTag) {
        this[tags] = this[tags].filter(tag => tag !== removedTag);
    }

    handleInputConfirm(key, id) {
        const obj = this.detailsValidateForm.value;
        if (obj[key] && this[id].indexOf(obj[key]) === -1) {
            this[id] = [...this[id], obj[key]];
        }
        this.tags01_value = '';
        this.tags02_value = '';
    }

    cardholderChange(e) {
        const names = this.stripeTest.get('name').value;
        const lastName = this.stripeTest.get('lastName').value;
        if (names !== '' && lastName !== '') {
            this.isCardError = false;
            if (this.completeStatus) {
                this.submitDisabled = false;
            }
        } else {
            this.isCardError = true;
            this.submitDisabled = true;
        }
    }

    comfirmTags() {
        this.onCompletePayment.emit({
                tags01: this.tags01,
                tags02: this.tags02,
                mails: {
                    store_email: this.validateForm.value.store_email,
                    store_phone: this.validateForm.value.store_phone,
                    store_phone_prefix: this.validateForm.value.store_phone_prefix,
                },

        });
    }

    handleCancel(): void {
        this.onCancelPayment.emit();
    }
}
