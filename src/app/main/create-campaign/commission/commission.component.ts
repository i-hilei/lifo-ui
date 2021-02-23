import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, Subscription } from 'rxjs';
import { BrandUser, ShopifyApplicationCharge } from '@src/types/brand';
import * as moment from 'moment';
import { ShopifyService } from '@src/app/services/shopify.service';
import { environment } from '@src/environments/environment';
import { InternalService } from '@src/app/services/internal.service';
import { CampaignService } from 'src/app/services/campaign.service';
import { LoadingSpinnerService } from '../../..//services/loading-spinner.service';
import { CampaignDetail, OfferDetail, CampaignExtraInfo, CommissionType, ShopifyProduct } from 'src/types/campaign';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
    selector: 'app-commission',
    templateUrl: './commission.component.html',
    styleUrls: ['./commission.component.scss'],
})
export class CommissionComponent implements OnInit, OnDestroy {
    @ViewChild('preffered') preffered;
    @ViewChild('payCard') payCard;
    validateForm!: FormGroup;

    constructor(
        public router: Router,
        public route:ActivatedRoute,
        public auth: AngularFireAuth,
        public campaignService: CampaignService,
        private internalService: InternalService,
        private shopifyService: ShopifyService,
        public loadingService: LoadingSpinnerService,
        private i18n: TranslateService,
        private fb: FormBuilder
    ) {
        this.route.queryParams.subscribe(queryParam => {
            this.commissionType = new FormControl(queryParam.id);
        });
    }

    viewPage = 0;
    sliderBudgetValue: number;
    chooseBudgetValue = '';
    chooseProductValue: number;
    sliderBudgetCounts = 10;
    isNoChoose = true;
    product = new FormControl();
    sliderDisabled = false;
    isShowFreeProduct = false;
    languageOptions = [];
    genderOptions = ['MALE', 'FEMALE'];
    ageOptions = ['18-24', '25-34', '35-44', '45-64', '65-'];
    selectAudienceAge = [];
    selectAudienceInterest = '';
    selectAudienceLanguage = '';
    selectAudienceFollower = '';
    regionalSelectValue = [];
    influencerSelectValue = [];
    selectInfluencerLocation = [];
    radioValue = '10';
    customizeValue = '';
    checked = false;
    subscriptions: Subscription[] = [];
    brandUser: BrandUser;
    productAllList: ShopifyProduct[] = [];
    productList: ShopifyProduct[] = [];
    productListOptions: Observable<ShopifyProduct[]>;
    productViewList?: any;
    isShowProductViewList = false;
    estimatedAvgSize: number;
    setDates = new Date().setDate(new Date().getDate() + 14);
    estimatedReach1: number;
    estimatedReach2: number;
    estimatedReach = '';
    estimatedSales1: number;
    estimatedSales2: number;
    estimatedSales = '';
    estimatedContents1: number;
    estimatedContents2: number;
    estimatedContents = '';
    productPrices = 0;
    productImage = '';
    productTitle = '';
    productId = -1;
    productVariants = [];
    isViewList = true;
    calculateCommission: number;
    searchValue = '';
    searchShopifyValue = '';
    promoCodeValue = '';
    errorCouonCodeValue = false;
    commissionType = new FormControl();
    paymentValue = 'account';
    isTypeShopify = true;
    isSelectAmazon = false;
    isNoResult = false;
    accountType = '';
    mediaValue = 'Instagram';
    mediaSrc = 'instagram';
    contentValue = 'Photo';
    contentSrc = 'shortvideo';
    campaignName = '';
    isShowAmazonSearch = false;
    isShowUnpaid = true;
    campaignPrice = '';
    campaignId = '';
    isStatus = '';
    mediaList = [
        {
            title: 'Instagram',
            src: 'instagram',
            checked: true,
        },
        {
            title: 'TikTok',
            src: 'tiktok',
            checked: false,
        },
        {
            title: 'YouTube',
            src: 'youtube',
            checked: false,
        },
    ];
    contentList = {
        instagram: [
            {
                title: 'Photo',
                src: 'photo',
                checked: true,
            },
            {
                title: 'Short Video',
                src: 'shortvideo',
                checked: false,
            },
        ],
        tiktok: [
            {
                title: 'Short Video',
                src: 'shortvideo',
                checked: true,
            },
        ],
        youtube: [
            {
                title: 'Long Video',
                src: 'longvideo',
                checked: true,
            },
            {
                title: 'Live Video',
                src: 'livevideo',
                checked: false,
            },
        ],

    };
    paymentList = [
        {
            title: '',
            name: 'visamaster',
            checked: true,
        },
        // {
        //     title: '',
        //     name: 'stripe',
        //     checked: false,
        // },
        // {
        //     title: '',
        //     name: 'paypal',
        //     checked: false,
        // },
    ];
    // '0 (Free product only)'
    budgetList = [];
    productsList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    ngOnInit() {
        this.subscriptions.push(
            this.auth.idTokenResult.subscribe((user) => {
                if (user.claims && user.claims.store_account === true) {
                    this.brandUser = user.claims as BrandUser;
                    if (this.brandUser.from_shopify) {
                        this.accountType = 'Shopify';
                        this.getProductList();
                    } else {
                        this.accountType = 'Amazon';
                    }
                }
            })
        );
        this.buildList();
        this.validateForm = this.fb.group({
            store_email: [null, [Validators.email, Validators.required]],
            store_phone: [null, [Validators.required]],
            store_phone_prefix: ['+1'],
        });
    }

    phoneNumberChange(e) {
        // This is not correct for us phones
        // this.codeVerification(e);
    }

    codeVerification(phone) {
        const phoneCodeVerification = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (phoneCodeVerification.test(phone)) {
            this.isStatus = '';
        } else {
            this.isStatus = 'error';
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    buildList() {
        for (let i = 100; i <= 5000; i++) {
            if (i === 0) {
                this.budgetList.push(`${i} ${this.campaignService.translates('(Free product only)')}`);
            } else {
                if ( i % 100 === 0) {
                    this.budgetList.push(`$${i}`);
                }
            }
        }
    }

    async getProductList() {
        this.subscriptions.push(
            this.shopifyService.updateShopifyProductInfo(this.brandUser.user_id).subscribe(
                (result) => {
                    if (!environment.production) {
                        console.log(result);
                    }
                    if (result && result.products) {
                        for (const i of result.products) {
                            i.checked = false;
                        }
                        this.productList = result.products;
                        this.productAllList = result.products;
                        this.isShowProductViewList = true;
                    }
                },
                (error) => {}
            )
        );
    }

    isSelecet(val) {
        for (const i of this.paymentList) {
            if (i.name === val) {
                i.checked = true;
                this.paymentValue = i.name;
            } else {
                i.checked = false;
            }
        }
    }

    isChooseMedia(val, key) {
        if (key === 'meida') {
            for (const i of this.mediaList) {
                i.checked = false;
                if (i.src === val) {
                    i.checked = true;
                    this.mediaValue = i.title;
                    this.mediaSrc = i.src;
                    this.contentValue = this.contentList[this.mediaSrc][0].title;
                    this.contentSrc = this.contentList[this.mediaSrc][0].src;
                }
            }
        } else {
            for (const i of this.contentList[this.mediaSrc]) {
                i.checked = false;
                if (i.src === val) {
                    i.checked = true;
                    this.contentValue = i.title;
                    this.contentSrc = i.src;
                }

            }
        }

    }

    onSearch(value): void {
        for (const i of this.productAllList) {
            if (i.id === value.id) {
                this.productViewList = value;
                this.productId = value.id;
                this.productImage = value.image.src;
                this.productTitle = value.title;
                this.productPrices = value['variants'][0]['price'];
                this.productVariants = value['variants'];
                this.isViewList = false;
                i['checked'] = true;
            } else {
                i['checked'] = false;
            }
        }
    }

    searchAmazon() {
        this.productViewList = [];
        this.isSelectAmazon = false;
        this.isViewList = true;
        this.isNoResult = false;
        this.isShowAmazonSearch = false;
        this.loadingService.show();
        const searchId = this.getIdFromUrl(this.searchValue);
        this.subscriptions.push(
            this.campaignService.searchAmazonValue(searchId).subscribe((result) => {
                this.productViewList = result;
                this.productImage = result.images[0];
                this.productTitle = result.brand;
                this.productPrices = result.prices.current_price;
                this.isShowAmazonSearch = true;
                this.isSelectAmazon = true;
                this.isViewList = false;
                this.isNoResult = false;
                this.loadingService.hide();
            }, err => {
                this.isNoResult = true;
                this.loadingService.hide();
            })
        );
    }

    getIdFromUrl(url: string) {
        const firstQuestionMarkPos = url.indexOf('?');
        let path = '';
        if (firstQuestionMarkPos === -1) {
            path = url;
        } else {
            path = url.slice(0, firstQuestionMarkPos);
        }
        const pathItemArr = path.split('/');
        return pathItemArr.pop();
    }

    onSelectAmazon() {
        this.isSelectAmazon = true;
        this.isViewList = false;
    }

    calculateAvg() {
        // X -> sliderBudgetCounts, Z -> sliderBudgetValue
        // Y -> productPrices, C -> max(100 - Y, 0)

        // M -> Round(Z / 10 / X) * 1000
        this.sliderBudgetCounts = Math.round(this.sliderBudgetValue / 100);
        this.estimatedAvgSize = Math.round(this.sliderBudgetValue / 10 / this.sliderBudgetCounts) * 1000;
        this.estimatedReach1 = 0.7 * this.estimatedAvgSize * this.sliderBudgetCounts;
        this.estimatedReach2 = 1.3 * this.estimatedAvgSize * this.sliderBudgetCounts;
        this.estimatedReach = `${Math.round(this.estimatedReach1 / 1000)}K ~ ${Math.round(this.estimatedReach2 / 1000)}K`;
        this.estimatedSales1 = this.estimatedReach1 * 0.0001 * this.productPrices * 1;
        this.estimatedSales2 = this.estimatedReach2 * 0.0001 * this.productPrices * 3;
        this.estimatedSales = `$ ${this.estimatedSales1} ~ $ ${this.estimatedSales2}`;
        this.estimatedContents1 = 0.7 * this.sliderBudgetCounts;
        this.estimatedContents2 = 1.3 * this.sliderBudgetCounts;
        this.estimatedContents = `${Math.round(this.estimatedContents1)} ~ ${Math.round(this.estimatedContents2)}`;
    }

    get estimateAmountDue(): number {
        // X * (C + Y)
        // const C = Math.max(100 - this.productPrices, 0);
        // return this.sliderBudgetCounts * (C + Number(this.productPrices)) * 1.1 + 30 * this.sliderBudgetCounts;
        return this.sliderBudgetValue;
    }

    sliderBudgetValueChange(e) {
        if (this.chooseBudgetValue.startsWith('$')) {
            this.sliderBudgetValue = Number(this.chooseBudgetValue.substr(1));
            this.chooseProductValue = 0;
            this.isShowFreeProduct = false;
            this.isNoChoose = false;
            this.calculateAvg();
            this.calculateCommission = this.estimateAmountDue;
        } else {
            this.isShowFreeProduct = true;
            this.isNoChoose = true;
            this.sliderBudgetValue = 0;
            this.sliderBudgetCounts = 0;
        }
    }

    productValueChange(e) {
        this.sliderBudgetValue = 0;
        // this.calculateAvg();
        this.isNoChoose = false;
    }

    nextClick(val) {
        if (val === 1) {
            this.calculateAvg();
            this.subscriptions.push(
                this.internalService.getInfluencerSearchOptions('languages').subscribe((language) => {
                    this.languageOptions = language.languages;
                })
            );
        } else if (val === 2) {
            if (isNaN(Number(this.customizeValue)) || Number(this.customizeValue) < 0 || Number(this.customizeValue) > 100) {
                this.customizeValue = '10';
            }
            this.selectAudienceAge = this.preffered.selectAudienceAge;
            this.selectAudienceInterest = this.preffered.selectAudienceInterest;
            this.selectAudienceLanguage = this.preffered.selectAudienceLanguage;
            this.selectAudienceFollower = this.preffered.selectAudienceFollower;
            this.regionalSelectValue = this.preffered.regionalSelectValue;
            this.influencerSelectValue = this.preffered.influencerSelectValue;
            this.selectInfluencerLocation = this.preffered.selectInfluencerLocation;
            this.calculateCommission = this.estimateAmountDue;
            this.campaignName = `${this.brandUser.store_name}_${moment().format('L')}_$${this.calculateCommission}`;
        }
        this.viewPage = val;
    }

    getNewAudienceDetail() {
        return {
            language: this.selectAudienceLanguage,
            gender: this.selectAudienceInterest,
            age: this.selectAudienceAge,
            min_follower: this.selectAudienceFollower,
            region: this.selectInfluencerLocation,
            interest: this.influencerSelectValue,
        };
    }

    createProductOnlyCampaign() {
        const vals = {
            brand: this.brandUser.store_name,
            campaign_name: this.campaignName,
            end_time: moment(this.setDates).format(),
            platform: this.mediaSrc,
            content_type: this.contentValue,
            contact_info: this.validateForm.value,
            // Product related
            product_name: this.productTitle,
            product_price: this.productPrices,
            product_image: this.productImage,
            product_id: this.productId,
            product_variants: this.productVariants,
            // Budget
            budget: this.sliderBudgetValue,
            commission_type: this.commissionType.value,
            number_of_posts: this.sliderBudgetCounts,
            estimated_total_cost: this.sliderBudgetValue,
            estimatedSales: this.estimatedSales,
            estimatedReach: this.sliderBudgetValue !== 0 ? this.estimatedReach : '',
            estimatedContents: this.sliderBudgetValue !== 0 ? this.estimatedContents : '',
            // Audience
            new_audience_detail: this.getNewAudienceDetail(),
            // Promo code related
            campaign_coupon_code: this.promoCodeValue,
            coupon_discount_percentage: Number(this.radioValue === 'customizeValue' ? this.customizeValue : this.radioValue),
            // Application charge
            application_charge: {
                status: this.sliderBudgetValue !== 0 ? 'pending' : 'accepted',
            },
        };

        if (!environment.production) {
            console.log(vals);
        }
        this.loadingService.show();

        this.subscriptions.push(
            this.campaignService.createBrandCampaign(vals).subscribe((result) => {
                const campaign_id = result.campaign_id;
                this.campaignPrice = environment.production ? String(this.sliderBudgetValue) : '1';
                this.campaignId = result.campaign_id;
                this.subscriptions.push(
                    this.shopifyService
                        .createPriceRule(
                            this.brandUser.user_id,
                            this.campaignId ,
                            vals.coupon_discount_percentage,
                            vals.product_id,
                            'all'
                        ).subscribe((result) => {
                        })
                );
                this.subscriptions.push(
                    this.internalService.discoverMore(campaign_id).subscribe(
                        (result) => {
                            this.loadingService.hide();
                            if (this.sliderBudgetValue === 0) {
                                this.router.navigate([`/app/brand-campaign/${campaign_id}`]);
                            } else {
                                this.payCard.isVisible = true;
                            }
                        },
                        (error) => {
                            console.warn(error);
                        }
                    )
                );
            })
        );
    }

    cancelPayment() {
        this.router.navigate([`/app/brand-campaign/${this.campaignId}`]);
        this.payCard.isVisible = false;
    }

    completePayment() {
        // Show a success message to your customer
        this.campaignService.updateCommonCampaign({
            application_charge: {
                status: 'accepted',
            },
        }, this.campaignId).then(next => {
            this.router.navigate([`/app/brand-campaign/${this.campaignId}`]);
            this.payCard.isVisible = false;
        });
    }

    payCards() {
        this.payCard.isVisible = true;
    }

    searchProduct() {
        this.productList = [];
        this.productAllList = [];
        this.productViewList = [];
        this.isShowProductViewList = false;
        this.loadingService.show();
        if (this.searchShopifyValue !== '') {
            this.isNoResult = false;
            this.subscriptions.push(
                this.campaignService.searchShopifyValue(this.brandUser.sub, this.searchShopifyValue).subscribe((result) => {
                    result['products'][0]['checked'] = true;
                    this.productList = result.products;
                    this.productAllList = result.products;
                    this.productViewList = result.products;
                    this.isShowProductViewList = true;
                    this.productId = result.products[0]['id'];
                    this.productImage = result.products[0]['image']['src'];
                    this.productTitle = result.products[0]['title'];
                    this.productPrices = result.products[0]['variants'][0]['price'];
                    this.productVariants = result.products[0]['variants'];
                    this.isViewList = false;
                    this.isNoResult = false;
                    this.loadingService.hide();
                }, err => {
                    this.isNoResult = true;
                    this.loadingService.hide();
                })
            );
        } else {
            this.getProductList();
            this.loadingService.hide();
        }
    }

    isSetCustomizeValue(e) {
        if (!isNaN(Number(this.customizeValue)) && Number(this.customizeValue) >= 0 && Number(this.customizeValue) <= 100) {
            this.errorCouonCodeValue = false;
        } else {
            this.errorCouonCodeValue = true;
        }
    }

    backToCampaign() {
        this.router.navigate(['/app/brand-home']);
    }
}
