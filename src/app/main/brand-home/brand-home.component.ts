import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CampaignDetail, CampaignPerformance, CommissionType, ShopifyProduct, ShopifyProductDetail } from 'src/types/campaign';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingSpinnerService } from 'src/app/services/loading-spinner.service';
import { ShopifyService } from '@src/app/services/shopify.service';
import { CampaignService } from 'src/app/services/campaign.service';
import { BrandService } from 'src/app/services/brand.service';
import { forkJoin, combineLatest, Subscription } from 'rxjs';
import { environment } from '@src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { InternalService } from 'src/app/services/internal.service';

import * as moment from 'moment';
import { BrandUser } from '@src/types/brand';

@Component({
    selector: 'app-brand-home',
    templateUrl: './brand-home.component.html',
    styleUrls: ['./brand-home.component.scss'],
})
export class BrandHomeComponent implements OnInit, OnDestroy {
    @ViewChild('changePass') changePass;
    @ViewChild('payCard') payCard;

    brandCampaigns: CampaignDetail[] = [];
    completeCampaigns: CampaignDetail[] = [];
    defaultLangs = 'English';

    statistic = {
        roi: 0,
        revenue: 0,
        total_commission: 0,
        visit: 0,
        influencer_count: 0,
    };

    chartData: any;
    campaignRevenue: any;
    campaignPerformance: CampaignPerformance;

    subscriptions: Subscription[] = [];

    brandUser: BrandUser;
    sliderDisabled = false;
    chooseBudgetValue = '';
    chooseProductValue: number;
    isShowFreeProduct = false;
    isNoChoose = true;
    estimatedAvgSize: number;
    calculateCommission: number;
    sliderBudgetCounts = 10;
    estimatedReach1: number;
    estimatedReach2: number;
    estimatedReach = '';
    estimatedContents1: number;
    estimatedContents2: number;
    estimatedContents = '';
    productPrices = 0;
    isShowProductViewList = false;
    productAllList: ShopifyProductDetail[] = [];
    productList: ShopifyProductDetail;
    productId = -1;
    productImage = '';
    productTitle = '';
    productVariants = [];
    campaignInfo = {
        campaignPrice: '',
        campaignName: '',
        paymentMessage: '',
    };
    perInfluencerPrice = 1;

    constructor(
        public auth: AngularFireAuth,
        public router: Router,
        private shopifyService: ShopifyService,
        public loadingService: LoadingSpinnerService,
        public campaignService: CampaignService,
        public brandService: BrandService,
        private internalService: InternalService,
        private i18n: TranslateService
    ) {}

    async ngOnInit() {
        // Get User Info
        const user =  await this.auth.currentUser;
        user.getIdTokenResult().then(user => {
            if (!environment.production) {
                console.log(user);
            }
            if (user.claims && user.claims.store_account === true) {
                this.brandUser = user.claims as BrandUser;
                this.getProductList();
                this.getPerformance();
                // Load performance
                this.loadCampaignPerformance(this.brandUser.user_id);
            }
        });

        const lang = localStorage.getItem('langs');
        if (lang === 'zh-CN') {
            this.defaultLangs = 'Chinese';
        } else {
            this.defaultLangs = 'English';
        }

        this.loadBrandCampaign();

        // Load performance
        this.loadCampaignPerformance(user.uid);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
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
                        this.productAllList = result.products;
                        if (this.productAllList.length > 0) {
                            const counts = Math.floor(Math.random() * result.products.length);
                            this.productList = result.products[counts];
                            this.isShowProductViewList = true;
                            this.onSearch(result.products[counts]);
                            this.calculateAvg();
                        }
                    }
                },
                (error) => {}
            )
        );
    }

    async getPerformance() {
        const performance = await this.internalService.getBrandPerformanceById(this.brandUser.store_name);
        this.subscriptions.push(
            performance.subscribe((result) => {
                if (result && result.all_inf_perfs) {
                    if (!environment.production) {
                        console.log(result);
                    }
                    this.campaignPerformance = result;
                }
            })
        );
    }

    onSearch(value): void {
        this.productId = value.id;
        this.productImage = value.image['src'];
        this.productTitle = value.title;
        this.productPrices = value['variants'][0]['price'];
        this.productVariants = value['variants'];
    }

    calculateAvg() {
        this.estimatedReach1 = 10 * this.sliderBudgetCounts;
        this.estimatedReach2 = 30 * this.sliderBudgetCounts;
        this.estimatedReach = `${Math.round(this.estimatedReach1)}K ~ ${Math.round(this.estimatedReach2)}K`;
        this.estimatedContents1 = this.sliderBudgetCounts;
        this.estimatedContents2 = Math.round(1.3 * this.sliderBudgetCounts);
        this.estimatedContents = `${Math.round(this.estimatedContents1)} ~ ${Math.round(this.estimatedContents2)}`;

        this.perInfluencerPrice = this.productPrices >= 50 ? 10 : this.productPrices >= 30 ? 20 : 30;
        this.campaignInfo.campaignPrice = String(this.estimatedContents2 * this.perInfluencerPrice);
    }

    loadCampaignPerformance(userId) {
        this.subscriptions.push(
            this.campaignService.getBrandCampaignPerformance(userId).subscribe(result => {
                this.campaignPerformance = result;
            })
        );
    }

    setLangs(val) {
        if (val === 'English') {
            this.i18n.setDefaultLang('en-US');
            this.i18n.use('en-US');
            localStorage.setItem('langs', 'en-US');
        } else {
            this.i18n.setDefaultLang('zh-CN');
            this.i18n.use('zh-CN');
            localStorage.setItem('langs', 'zh-CN');
        }
    }

    loadBrandCampaign() {
        this.subscriptions.push(
            this.campaignService.getBrandCampaign().subscribe(result => {
                this.brandCampaigns = result;
                if (!environment.production) {
                    console.log('brand campaigns', this.brandCampaigns);
                }
                this.loadingService.hide();
            })
        );
    }

    async loadBrandStats() {
        combineLatest([
            this.brandService.getBrandROI(),
            this.brandService.getBrandTrack(),
            this.brandService.getBrandInfluencer(),
        ]).subscribe(data => {
            const roiData = data[0];
            const trackData = data[1];
            const influencerData = data[2];
            this.statistic['roi'] = roiData['ROI'];
            this.statistic['total_commission'] = roiData['total_commission'];
            this.statistic['revenue'] = roiData['revenue']['shop_revenue'];
            this.statistic['influencer_count'] = influencerData['influencer_counts'];
            this.statistic['visit'] = trackData['visit_counts'];

            this.campaignRevenue = roiData['revenue']['campaign_revenue'];
            // daily_visit: {2020-06-09: 3, 2020-06-15: 4}
            const visitTimeseries = trackData['daily_visit'];
            const revenueTs = roiData['revenue']['revenue_ts'];
            const revenueTimeseries = {};
            revenueTs.forEach(point => {
                // daily_revenue: 146 order_date: "Mon, 15 Jun 2020 00:00:00 GMT"
                const date = moment(point['order_date']).format('YYYY-MM-DD');
                revenueTimeseries[date] = point['daily_revenue'];
            });

            this.chartData = {
                revenue: revenueTimeseries,
                visit: visitTimeseries,
            };
        });
    }

    deleteCampaign(campaign: CampaignDetail) {
        this.loadingService.show();
        this.subscriptions.push(
            this.campaignService.deleteBrandCampaignById(campaign.brand_campaign_id).subscribe(result => {
                let index = -1;
                for (let i = 0; i < this.brandCampaigns.length; i ++) {
                    if (campaign.brand_campaign_id === this.brandCampaigns[i].brand_campaign_id) {
                        index = i;
                        break;
                    }
                }
                this.brandCampaigns.splice(index, 1);
                this.loadingService.hide();
            })
        );
    }

    showPasswordModal() {
        this.changePass.oldPassword = '';
        this.changePass.newPassword = '';
        this.changePass.confirmPassword = '';
        this.changePass.isShowInputPass = true;
        this.changePass.isVisible = true;
    }

    createCampaign() {
        this.router.navigate(['/app/create-campaign']);
    }

    createCampaignCommission(key) {
        this.router.navigate(['/app/create-campaign-commission'], {
            queryParams: {
                id: key,
            },
        });
    }

    paySmartCampaign() {
        this.campaignInfo.paymentMessage = this.i18n.instant('SMART_CAMPAIGN_MESSAGE', {
            total: this.campaignInfo.campaignPrice,
            single: this.perInfluencerPrice,
            count: this.estimatedContents2,
        });
        this.campaignInfo.campaignPrice = environment.production ? this.campaignInfo.campaignPrice : '1';
        this.payCard.isVisible = true;
    }

    cancelSmartCampaign() {
        this.payCard.isVisible = false;
    }

    createProductOnlyCampaign(msg) {
        this.campaignInfo.campaignName = `${this.brandUser.store_name}_${moment().format('L')}_$${this.campaignInfo.campaignPrice}`;
        const vals = {
            brand: this.brandUser.store_name,
            campaign_name: this.campaignInfo.campaignName,
            end_time: moment().add(14, 'day').format(),
            platform: 'instagram',
            content_type: 'shortvideo',
            // Product related
            product_name: this.productTitle,
            product_price: this.productPrices,
            product_image: this.productImage,
            product_id: this.productId,
            product_variants: this.productVariants,
            post_tags: msg.tags01,
            post_hastags: msg.tags02,
            // Budget
            budget: this.campaignInfo.campaignPrice,
            commission_type: CommissionType.Brand_Awareness,
            number_of_posts: this.sliderBudgetCounts,
            estimated_total_cost: this.campaignInfo.campaignPrice,
            estimatedReach: this.campaignInfo.campaignPrice ? this.estimatedReach : '',
            estimatedContents: this.campaignInfo.campaignPrice ? this.estimatedContents : '',
            // Audience
            new_audience_detail: {},
            // Promo code related
            campaign_coupon_code: '',
            coupon_discount_percentage: '',
            contact_info: msg['mails'],
            // Application charge
            application_charge: {
                status: 'accepted',
            },
        };

        if (!environment.production) {
            console.log(vals);
        }
        this.loadingService.show();
        this.subscriptions.push(
            this.campaignService.createBrandCampaign(vals).subscribe((result) => {
                const campaign_id = result.campaign_id;
                this.subscriptions.push(
                    this.internalService.discoverMore(campaign_id).subscribe(
                        (result) => {
                            this.loadingService.hide();
                            this.router.navigate([`/app/brand-campaign/${campaign_id}`]);
                        },
                        (error) => {
                            console.warn(error);
                        }
                    )
                );
            })
        );
    }
}
