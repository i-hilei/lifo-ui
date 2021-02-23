import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireFunctions } from '@angular/fire/functions';
import { CampaignDetail, OfferDetail, CampaignExtraInfo, CommissionType, ShopifyProduct, ShopifyProductDetail } from 'src/types/campaign';
import * as moment from 'moment';
import { LoadingSpinnerService } from '../../../services/loading-spinner.service';
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

@Component({
    selector: 'app-create-invitation',
    templateUrl: './create-invitation.component.html',
    styleUrls: ['./create-invitation.component.scss'],
})
export class CreateInvitationComponent implements OnInit, OnDestroy {
    @ViewChild('productEditor') productEditor: EmailEditorComponent;
    constructor(
        public router: Router,
        public auth: AngularFireAuth,
        public route:ActivatedRoute,
        private shopifyService: ShopifyService,
        private campaignService: CampaignService,
        private storage: AngularFireStorage,
        public loadingService: LoadingSpinnerService,
        private internalService: InternalService,
        private fb: FormBuilder
    ) {
        this.route.queryParams.subscribe(queryParam => {
            this.campaignId = queryParam.id;
        });
    }
    campaignData = {
        unit_cost: 0,
        // product_variants: [],
    };

    detailsValidateForm: FormGroup;
    paymentForm: FormGroup;

    viewPage = 1;
    campaignId;
    campaign: CampaignDetail;
    subscriptions: Subscription[] = [];

    productDetailHtml = '';
    productImageList = [];
    amazonLink = '';
    shopifyLink = '';
    linkOthers = '';
    uploadURL = '';

    offerDetailTemplates = [];
    productDetailTemplates = [];
    selectedOfferDetailTemplate = '';
    selectedProductDetailTemplate = '';

    tags01 = [];
    tags02 = [];
    tags01_value = '';
    tags02_value = '';

    uploadTask: AngularFireUploadTask;
    snapshot: Observable<any>;

    productList: ShopifyProductDetail[];

    async ngOnInit() {
        const brandCampaign = await this.campaignService.getBrandCampaignById(this.campaignId);
        this.subscriptions.push(
            brandCampaign.subscribe(brandCampaign => {
                this.campaign = brandCampaign.brand_campaigns;
                if (!environment.production) {
                    console.log(this.campaign);
                }
                if (this.campaign.offer_detail) {
                    this.uploadURL = this.campaign.offer_detail.product_image_list[0];
                    this.shopifyLink = this.campaign.offer_detail.product_image_list[1];
                    this.amazonLink = this.campaign.offer_detail.product_image_list[2];
                    this.linkOthers = this.campaign.offer_detail.product_image_list[3];
                    setTimeout(() => {
                        this.productEditor.setHtmlContent(this.campaign.offer_detail.product_message);
                    }, 500);
                }
                if (this.campaign.product_image) {
                    this.uploadURL = this.campaign.product_image;
                }
                if (this.campaign.unit_cost) {
                    this.campaignData.unit_cost = this.campaign.unit_cost;
                }

                if (!this.shopifyLink) {
                    this.subscriptions.push(
                        this.shopifyService.updateShopifyProductInfo(this.campaign.brand_id).subscribe(products => {
                            this.productList = products.products as ShopifyProductDetail[];
                            this.productList.forEach(product => {
                                if (product.id === this.campaign.product_id) {
                                    console.log(product);
                                    this.shopifyLink = `https://${this.campaign.brand_id}/products/${product.handle}`;
                                }
                            });
                        })
                    );
                }
            })
        );
        this.detailsValidateForm = this.fb.group({
            content_format: [''],
            visual_content_guideline: [''],
            text_post_guideline: [''],
            tags01_value: [''],
            tags02_value: [''],
        });
        this.paymentForm = this.fb.group({
            compensate_method: [''],
            payment_platform: [''],
        });

        this.getAllTemplates();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
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

    backToCampaign() {
        this.router.navigate([`/internal/brand-campaign/${ this.campaign.brand_campaign_id}`]);
    }

    createProductOnlyCampaign() {
        const defaultOfferDetail: OfferDetail = {
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
        const offerDetail = {
            ...defaultOfferDetail,
            product_message: this.productDetailHtml,
            product_image_list: [this.uploadURL, this.shopifyLink, this.amazonLink, this.linkOthers],
            ...this.omitNull(this.detailsValidateForm.value),
            ...this.omitNull(this.paymentForm.value),
            post_tags: this.tags01,
            post_hastags: this.tags02,
        };

        const vals = {
            ...this.campaignData,
            product_image: this.uploadURL,
            offer_detail: offerDetail,
        };
        if (!environment.production) {
            console.log(vals);
        }
        this.loadingService.show();
        this.campaignService.updateCommonCampaign(vals, this.campaign.brand_campaign_id).then((result) => {
            this.loadingService.hide();
            this.router.navigate([`/internal/brand-campaign/${this.campaign.brand_campaign_id}`]);
        });
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

    pageTwoToThree() {
        this.productDetailHtml = this.productEditor.getHtmlContent();
        this.detailsValidateForm = this.fb.group({
            content_format: [this.campaign['offer_detail'] ? this.campaign['offer_detail']['content_format'] :''],
            post_tags: [this.campaign['offer_detail'] ? this.campaign['offer_detail']['post_tags'] :[]],
            visual_content_guideline: [this.campaign['offer_detail'] ? this.campaign['offer_detail']['visual_content_guideline'] :''],
            text_post_guideline: [this.campaign['offer_detail'] ? this.campaign['offer_detail']['text_post_guideline'] :''],
            post_hastags: [this.campaign['offer_detail'] ? this.campaign['offer_detail']['post_hastags'] :[]],
            tags01_value: [''],
            tags02_value: [''],
        });
        // Handle tags
        if (this.campaign.offer_detail && this.campaign.offer_detail.post_tags) {
            // Legacy post tags
            if (typeof this.campaign.offer_detail.post_tags === 'string') {

            } else {
                this.tags01 = this.campaign.offer_detail.post_tags;
            }
        } else if (this.campaign.post_tags) {
            this.tags01 = this.campaign.post_tags;
        }
        // Handle tags
        if (this.campaign.offer_detail && this.campaign.offer_detail.post_hastags) {
            // Legacy post tags
            if (typeof this.campaign.offer_detail.post_hastags === 'string') {

            } else {
                this.tags02 = this.campaign.offer_detail.post_hastags;
            }
        } else if (this.campaign.post_hastags) {
            this.tags02 = this.campaign.post_hastags;
        }
        this.viewPage = 2;
    }

    pageTwoToOne() {
        this.productDetailHtml = this.productEditor.getHtmlContent();
        this.viewPage = 1;
    }

    showPageThree() {
        this.paymentForm = this.fb.group({
            compensate_method: [this.campaign['offer_detail'] ? this.campaign['offer_detail']['compensate_method'] :''],
            payment_platform: [this.campaign['offer_detail'] ? this.campaign['offer_detail']['payment_platform'] :''],
        });
        this.viewPage = 3;
    }

}
