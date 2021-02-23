import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireFunctions } from '@angular/fire/functions';
import { CampaignDetail, OfferDetail, CampaignExtraInfo, CommissionType, ShopifyProduct, ShopifyProductDetail } from 'src/types/campaign';
import * as moment from 'moment';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import { UploadContractDialogComponent } from './upload-contract-dialog/upload-contract-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CampaignService } from 'src/app/services/campaign.service';
import { BrandService } from 'src/app/services/brand.service';
import { Observable, Subscription } from 'rxjs';
import { InternalService } from '@src/app/services/internal.service';
import { startWith, map, tap, finalize } from 'rxjs/operators';
import { EmailEditorComponent } from 'src/app/shared/email-editor/email-editor.component';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { environment } from '@src/environments/environment';
import { BrandUser } from '@src/types/brand';
import { ShopifyService } from '@src/app/services/shopify.service';

// import { default as _rollupMoment, Moment, MomentFormatSpecification, MomentInput } from 'moment';
// const moment = _rollupMoment || _moment;

@Component({
    selector: 'app-create-campaign',
    templateUrl: './create-campaign.component.html',
    styleUrls: ['./create-campaign.component.scss'],
})
export class CreateCampaignComponent implements OnInit, OnDestroy {
    @ViewChild('productEditor') productEditor: EmailEditorComponent;
    validateForm!: FormGroup;
    productDetailForm!: FormGroup;
    detailsValidateForm!: FormGroup;
    paymentForm: FormGroup;

    campaignData: CampaignDetail = {
        brand: '',
        campaign_name: '',
        campaign_type: 'image',
        commission_type: CommissionType.PRODUCT_FOR_POST,
        commission_dollar: 0,
        commission_percent: 0,
        contact_name: '',
        contact_email: '',
        content_concept: '',
        post_time: 1,
        end_time: 1,
        feed_back: '',
        image: '',
        video: '',
        milestones: [],
        requirements: [],
        shipping_address: '',
        tracking_number: '',
        extra_info: '',
        product_name: '',
        product_price: 100,
        product_image: '',
        product_url: '',
        product_id: -1,
        product_variants: [],
        unit_cost: 50,
        amazon_url: '',
        number_of_posts: 5,
        estimated_total_cost: 250,
        campaign_coupon_code: '',
        coupon_discount_percentage: 10,
        audience_detail: {},
    };

    defaultOfferDetail: OfferDetail = {
        compensation_message: '',
        product_message: '',
        product_image_list: [],
        content_format: '1 Post',
        post_tags: [],
        visual_content_guideline: 'Product must be visible',
        text_post_guideline: 'Must mention brand name',
        post_hastags: [],
        compensate_method: 'Free product',
        payment_platform: 'PayPal, we pay for the PayPal fee',
    };

    extraInfo: CampaignExtraInfo = {
        contracts: [],
    };

    brand = '';
    product = new FormControl();
    budget = 0;
    commissionDollar = 0;
    commissionPercent = 0;

    endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
    postDate = new Date();
    milestones = [];
    newMilestone = '';
    newRequirement = '';

    uploadedContract = [];
    currentOfferDetail: OfferDetail;

    platform = new FormControl([]);
    platformList: string[] = ['Youtube', 'Instagram', 'Weibo', 'Tiktok'];
    commissionType = new FormControl(CommissionType.ONE_TIME_PAY);

    commissionTypeList = Object.keys(CommissionType).map((key) => CommissionType[key]);

    productList: ShopifyProductDetail[] = [];
    brandInfo = {};

    isBrandView = false;
    viewPage = 0;

    audienceLocationOptions = [];
    interestOptions = [];
    languageOptions = [];
    genderOptions = ['MALE', 'FEMALE'];
    ageOptions = ['18-24', '25-34', '35-44', '45-64', '65-'];

    dateFormat = 'MM/dd/yyyy';
    productDetailHtml = '';
    productImageList = [];
    isEditingProductDetail = false;

    shopName = '';
    campaignId = '';
    accountId = '';
    imageList: any[];
    imageListOptions: Observable<any[]>;
    amazonLink = '';
    shopifyLink = '';
    linkOthers = '';
    uploadURL = '';
    subscriptions: Subscription[] = [];
    uploadTask: AngularFireUploadTask;
    snapshot: Observable<any>;

    offerDetailTemplates = [];
    productDetailTemplates = [];
    selectedOfferDetailTemplate = '';
    selectedProductDetailTemplate = '';

    content_format = '';
    post_tags = '';
    visual_content_guideline = '';
    text_post_guideline = '';
    post_hastags = '';
    compensate_method = '';
    payment_platform = '';
    radioValue = 'Instagram';
    formatterDollar = (value: number) => `$ ${value}`;
    parserDollar = (value: string) => value.replace('$ ', '');

    brandUser: BrandUser;

    constructor(
        public auth: AngularFireAuth,
        public router: Router,
        private fns: AngularFireFunctions,
        public loadingService: LoadingSpinnerService,
        public dialog: MatDialog,
        public campaignService: CampaignService,
        private brandService: BrandService,
        private internalService: InternalService,
        private shopifyService: ShopifyService,
        private storage: AngularFireStorage,
        private fb: FormBuilder
    ) {
        // this.createCampaign();
    }

    async ngOnInit() {
        this.subscriptions.push(
            this.auth.idTokenResult.subscribe((user) => {
                console.log(user, 555);
                if (user.claims && user.claims.store_account === true) {
                    this.isBrandView = true;
                    this.brand = user.claims.store_name;
                    this.campaignData.brand = user.claims.store_name;
                    this.campaignData.campaign_name = `${user.claims.store_name}_${moment().format('L')}`;
                    this.campaignData.contact_name = user.claims.store_name;
                    this.campaignData.contact_email = user.claims.store_email;
                    this.shopName = user.claims.user_id;
                    this.brandUser = user.claims as BrandUser;
                    if (this.brandUser.from_shopify) {
                        this.getProductList();
                    }
                }
                // this.brandInfo = {
                //     brand: user.uid,
                //     contactName: user.uid,
                //     contactEmail: user.email,
                // };
            })
        );
        this.validateForm = this.fb.group({
            campaign_name: [''],
            end_time: [moment().format('L')],
            selectAudienceLocation: [[]],
            selectAudienceAge: [[]],
            selectAudienceGender: [''],
            selectAudienceLanguage: [{}],
            platform: 'Instagram',
        });

        this.productDetailForm = this.fb.group({
            product_name: ['', [Validators.required]],
            number_of_posts: [5, [Validators.required]],
            product_price: [100, [Validators.required]],
            unit_cost: [50, [Validators.required]],
        });

        this.detailsValidateForm = this.fb.group({
            content_format: [''],
            post_tags: [''],
            visual_content_guideline: [''],
            text_post_guideline: [''],
            post_hastags: [''],
        });

        this.paymentForm = this.fb.group({
            compensate_method: [''],
            payment_platform: [''],
        });

        this.getAllTemplates();
        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('locations').subscribe(location => {
                this.audienceLocationOptions = location.locations;
            })
        );

        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('interests').subscribe(interest => {
                this.interestOptions = interest.interests;
            })
        );

        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('languages').subscribe(language => {
                this.languageOptions = language.languages;
            })
        );

    }

    showDetails() {
        console.log(this.validateForm.value, 444);
    }

    submitForm(): boolean {
        let isValid = true;
        for (const i in this.productDetailForm.controls) {
            this.productDetailForm.controls[i].markAsDirty();
            this.productDetailForm.controls[i].updateValueAndValidity();
            if (!this.productDetailForm.controls[i].valid) {
                isValid = false;
            }
        }
        return isValid;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    updataAudienceLocationOptions(term) {
        const searchTemr = term.term;
        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('locations', searchTemr).subscribe(result => {
                this.audienceLocationOptions = result.locations;
            })
        );
    }

    selectProductDetailTemplate(template) {
        this.productEditor.setHtmlContent(template.productDetailHtml);
        this.uploadURL = template.productImageList[0];
        this.shopifyLink = template.productImageList[1];
        this.amazonLink = template.productImageList[2];
    }

    getAllTemplates() {
        this.internalService.getAllTemplateBrand('product').subscribe(templates => {
            this.productDetailTemplates = templates;
        });
    }

    async getProductList() {
        this.subscriptions.push(
            this.shopifyService.updateShopifyProductInfo(this.shopName).subscribe((result) => {
                if (!environment.production) {
                    console.log(result);
                }
                if (result && result.products) {
                    this.productList = result.products;
                }
            }, error => {
            })
        );
    }

    onDrop(fileList: FileList) {
        const path = `influencer-offer/${this.campaignId}/${Date.now()}`;
        // Reference to storage bucket
        const ref = this.storage.ref(path);

        // The main task
        this.uploadTask = this.storage.upload(path, fileList[0]);

        this.uploadTask.percentageChanges();

        this.snapshot = this.uploadTask.snapshotChanges().pipe(
            tap(console.log),
            // The file's download URL
            finalize(async () => {
                const downloadURL = await ref.getDownloadURL().toPromise();
                this.uploadURL = downloadURL;
            })
        );

        this.subscriptions.push(
            this.snapshot.subscribe(result => {
            })
        );
    }

    selectShopifyItem(item: string) {
        this.productList.forEach(product => {
            if (product.title === item) {
                if (product.image) {
                    this.uploadURL = product.image.src;
                }
                this.campaignData.product_id = product.id;
                this.campaignData.product_variants = product.variants;
                if (product.body_html) {
                    this.productEditor.setHtmlContent(product.body_html);
                }
            }
        });
    }

    refreshProductList() {}

    brandChange(value) {
        this.campaignData.brand = value;
    }

    budgetChange(value) {
        this.campaignData.budget = value;
    }

    commissionDollarChange(value) {
        this.campaignData.commission_dollar = value;
    }

    commissionPercentChange(value) {
        this.campaignData.commission_percent = value;
    }

    commissionTypeChange() {
        this.commissionDollar = 0;
        this.commissionPercent = 0;
        this.campaignData.commission_dollar = 0;
        this.campaignData.commission_percent = 0;
    }

    showCommissionDollar() {
        return (
            this.commissionType.value === CommissionType.FIX_PAY_PLUS_PER_SALES || this.commissionType.value === CommissionType.ONE_TIME_PAY
        );
    }

    showCommissionPercent() {
        return (
            this.commissionType.value === CommissionType.FIX_PAY_PLUS_PER_SALES || this.commissionType.value === CommissionType.PER_SALES
        );
    }

    addMilestone() {
        this.campaignData.milestones.push(this.newMilestone);
        this.newMilestone = '';
    }

    milestoneChange(value) {
        this.newMilestone = value;
    }

    addRequirement() {
        this.campaignData.requirements.push(this.newRequirement);
        this.newRequirement = '';
    }

    requirementChange(value) {
        this.newRequirement = value;
    }

    getAudienceDetail() {
        return {
            audience: {
                location: this.validateForm.value.selectAudienceLocation,
                language: this.validateForm.value.selectAudienceLanguage,
                gender: this.validateForm.value.selectAudienceGender,
                age: this.validateForm.value.selectAudienceAge,
            },
        };
    }

    // For influencer, Legacy
    async createCampaign() {
        this.campaignData.commission_type = this.commissionType.value;
        this.campaignData.platform = this.platform.value;
        this.campaignData.post_time = Math.round(this.postDate.getTime() / 86400000) * 86400000;
        this.campaignData.end_time = Math.round(this.endDate.getTime() / 86400000) * 86400000;

        this.extraInfo.contracts = this.uploadedContract;
        this.campaignData.extra_info = JSON.stringify(this.extraInfo);

        this.loadingService.show();
        const campaign = await this.campaignService.createCamapaign(this.campaignData);
        this.subscriptions.push(
            campaign.subscribe((result) => {
                this.loadingService.hide();
                this.router.navigate([`/app/campaign/${result.campaign_id}`]);
            })
        );
    }

    omitNull(obj) {
        const keys = Object.keys(obj);
        const returnObj = {};
        for (const key of keys) {
            const value = obj[key];
            if (value !== null && value !== '' && value !== undefined) {
                returnObj[key] = value;
            }
        }
        return returnObj;
    }

    createProductOnlyCampaign() {
        const vals = {
            ...this.campaignData,
            product_image: this.uploadURL,
            ...this.omitNull(this.validateForm.value),
            ...this.omitNull(this.productDetailForm.value),
        };
        // vals.end_time = Math.round(this.endDate.getTime() / 86400000) * 86400000;
        vals.extra_info = JSON.stringify(this.extraInfo);
        vals.audience_detail = this.getAudienceDetail();

        const offerDetail: OfferDetail = {
            ...this.defaultOfferDetail,
            product_message: this.productDetailHtml,
            product_image_list: [this.uploadURL, this.shopifyLink, this.amazonLink, this.linkOthers],
            ...this.omitNull(this.detailsValidateForm.value),
            ...this.omitNull(this.paymentForm.value),
        };
        vals.offer_detail = offerDetail;

        if (!environment.production) {
            console.log(vals);
        }

        this.loadingService.show();
        this.subscriptions.push(
            this.campaignService.createBrandCampaign(vals).subscribe((result) => {
                const campaign_id = result.campaign_id;
                this.subscriptions.push(
                    this.internalService.discoverMore(campaign_id).subscribe(result => {
                        this.loadingService.hide();
                        this.router.navigate([`/app/brand-campaign/${campaign_id}`]);
                    }, error => {
                        console.warn(error);
                    })
                );
            })
        );
    }

    // Legacy code
    createBrandCampaign() {
        this.campaignData.commission_type = this.commissionType.value;
        this.campaignData.platform = this.platform.value;
        this.campaignData.post_time = Math.round(this.postDate.getTime() / 86400000) * 86400000;
        this.campaignData.end_time = Math.round(this.endDate.getTime() / 86400000) * 86400000;
        this.campaignData.product = this.findProduct(this.product.value);

        this.extraInfo.contracts = this.uploadedContract;
        this.campaignData.extra_info = JSON.stringify(this.extraInfo);

        this.loadingService.show();

        this.subscriptions.push(
            this.campaignService.createBrandCampaign(this.campaignData).subscribe((result) => {
                this.loadingService.hide();
                this.router.navigate(['/app/brand-home']);
            })
        );
    }

    private findProduct(productName): ShopifyProduct {
        let product;
        this.productList.forEach((item) => {
            if (item['title'] === productName) {
                product = item;
            }
        });
        return product;
    }
    removeFromList(list, i) {
        list.splice(i, 1);
    }

    uploadContract() {
        this.auth.user.subscribe((user) => {
            const dialogRef = this.dialog.open(UploadContractDialogComponent, {
                width: '600px',
                data: {
                    uploadPath: `contract/${user.uid}/`,
                },
            });

            dialogRef.afterClosed().subscribe((result) => {
                if (result && result['contract']) {
                    this.uploadedContract = result['contract'];
                }
            });
        });
    }

    productPriceChange(event) {
        if (!isNaN(event)) {
            this.campaignData.unit_cost = Math.round(event * 0.5);
            this.campaignData.estimated_total_cost = this.campaignData.unit_cost * this.campaignData.number_of_posts;
        }
    }

    unitCostChange() {
        if (!isNaN(this.productDetailForm.value['unit_cost'])) {
            this.campaignData.estimated_total_cost =
                this.productDetailForm.value['number_of_posts'] * this.productDetailForm.value['unit_cost'];
        }
    }

    numberPostChange() {
        if (!isNaN(this.productDetailForm.value['number_of_posts'])) {
            this.campaignData.estimated_total_cost =
                this.productDetailForm.value['number_of_posts'] * this.productDetailForm.value['unit_cost'];
        }
    }

    removeContract(index) {
        this.uploadedContract.splice(index, 1);
    }

    backToCampaign() {
        this.router.navigate(['/app/brand-home']);
    }

    pageTwoToThree() {
        this.productDetailHtml = this.productEditor.getHtmlContent();
        if (!this.submitForm()) {
            document.querySelector('mat-sidenav-content').scrollTop = 0;
            return;
        }
        this.viewPage = 2;
    }

    pageTwoToOne() {
        this.productDetailHtml = this.productEditor.getHtmlContent();
        this.viewPage = 0;
    }
}
