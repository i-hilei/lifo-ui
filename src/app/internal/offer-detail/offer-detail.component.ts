import { Component, OnInit, ViewChild, ViewEncapsulation, Input, Inject, OnDestroy } from '@angular/core';
import { EmailEditorComponent } from 'src/app/shared/email-editor/email-editor.component';
import { InternalService } from 'src/app/services/internal.service';
import { CampaignService } from 'src/app/services/campaign.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { OfferDetail } from 'src/types/campaign';
import { Observable, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { NgTypeToSearchTemplateDirective } from '@ng-select/ng-select/lib/ng-templates.directive';
import { startWith, map, tap, finalize } from 'rxjs/operators';
import { SaveTemplateDialogComponent } from '../mail-box/save-template-dialog/save-template-dialog.component';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';

@Component({
    selector: 'app-offer-detail',
    templateUrl: './offer-detail.component.html',
    styleUrls: ['./offer-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class OfferDetailComponent implements OnInit, OnDestroy {
    @ViewChild('offerEditor') offerEditor: EmailEditorComponent;
    @ViewChild('productEditor') productEditor: EmailEditorComponent;
    offerDetailHtml = '';
    isEditingOfferDetail = false;

    productDetailHtml = '';
    productImageList = [];
    isEditingProductDetail = false;

    campaignId = '';
    accountId = '';
    imageList: any[];
    imageListOptions: Observable<any[]>;
    amazonLink = '';
    shopifyLink = '';
    linkOthers = '';

    shopName;
    productId;


    offerDetailTemplates = [];
    productDetailTemplates = [];
    selectedOfferDetailTemplate = '';
    selectedProductDetailTemplate = '';

    uploadTask: AngularFireUploadTask;
    snapshot: Observable<any>;

    subscriptions: Subscription[] = [];
    radioValue = 'freeStyle';
    uploadURL = '';

    constructor(
        private internalService: InternalService,
        private campaignService: CampaignService,
        private activatedRoute: ActivatedRoute,
        private dialog: MatDialog,
        private storage: AngularFireStorage,
        public dialogRef: MatDialogRef<OfferDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) {
        // this.campaignId = this.activatedRoute.snapshot.paramMap.get('campaignId');
        // this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId');
        if (data && data.offerDetail) {
            this.offerDetailHtml = data.offerDetail.compensation_message;
            this.productDetailHtml = data.offerDetail.product_message;
            this.productImageList = data.offerDetail.product_image_list;
            this.uploadURL = this.productImageList[0];
            this.shopifyLink = this.productImageList[1];
            this.amazonLink = this.productImageList[2];
        }
        if (data && data.campaign) {
            this.campaignId = data.campaign.brand_campaign_id;
            this.shopName = data.campaign.brand_id;
            if (data.campaign.product) {
                this.productId = data.campaign.product.id;
                // this.getProductInfo();
            }
        }
        this.getAllTemplates();
    }

    async ngOnInit() {}

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    async getAllTemplates() {
        this.subscriptions.push(
            this.internalService.getAllTemplate('offer').subscribe(templates => {
                this.offerDetailTemplates = templates;
            })
        );

        this.subscriptions.push(
            this.internalService.getAllTemplate('product').subscribe(templates => {
                this.productDetailTemplates = templates;
            })
        );
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    saveProductDetail() {
        const productDetail = this.productEditor.getHtmlContent();
        this.productDetailHtml = productDetail;
        this.isEditingProductDetail = false;
        this.productImageList = [this.uploadURL, this.shopifyLink, this.amazonLink];
    }

    // async getProductInfo() {
    //     const product = this.internalService.getShopifySingleProductInfo('meteneus.myshopify.com', this.productId);

    //     this.subscriptions.push(
    //         (await product).subscribe(result => {
    //             this.imageList = result.images;
    //             this.imageListOptions = this.mainImage.valueChanges
    //                 .pipe(
    //                     startWith(''),
    //                     map(value => this.gfilter(value))
    //                 );
    //         })
    //     );

    // }

    private gfilter(value: string): any[] {
        const filterValue = value.toLowerCase();

        return this.imageList.filter(option => option.src.toLowerCase().includes(filterValue));
    }

    editProductDetail() {
        this.isEditingProductDetail = true;
    }

    cancelEditProductDetail() {
        this.isEditingProductDetail = false;
    }

    saveOfferDetail() {
        const offerDetail = this.offerEditor.getHtmlContent();
        this.offerDetailHtml = offerDetail;
        this.isEditingOfferDetail = false;
    }

    editOfferDetail() {
        this.isEditingOfferDetail = true;
    }

    cancelEditOfferDetail() {
        this.isEditingOfferDetail = false;
    }

    cancel() {
        this.dialogRef.close();
    }

    confirm() {
        this.saveOfferDetail();
        this.saveProductDetail();
        const offerDetail: OfferDetail = {
            compensation_message: this.offerDetailHtml,
            product_message: this.productDetailHtml,
            product_image_list: this.productImageList,
        };
        this.dialogRef.close(offerDetail);
    }

    open(link) {
        if (link.indexOf('http') !== 0) {
            link = `http://${  link}`;
        }
        window.open(link, '_blank');
    }

    selectOfferDetailTemplate(template) {
        this.offerEditor.setHtmlContent(template.offerDetailHtml);
    }

    selectProductDetailTemplate(template) {
        this.productEditor.setHtmlContent(template.productDetailHtml);
        this.uploadURL = template.productImageList[0];
        this.shopifyLink = template.productImageList[1];
        this.amazonLink = template.productImageList[2];
    }

    async saveAsNewTemplate(templateName, body, type) {
        const saveTemplate = await this.internalService.createTemplateByName(
            templateName,
            body,
            type,
        );

        this.subscriptions.push(
            saveTemplate.subscribe(result => {
                if (type === 'product') {
                    this.productDetailTemplates = [...this.productDetailTemplates, body];
                }
                if (type === 'offer') {
                    this.offerDetailTemplates = [...this.offerDetailTemplates, body];
                }
            })
        );
    }

    saveProductDetailTemplate() {
        const dialogRef = this.dialog.open(SaveTemplateDialogComponent, {
            width: '600px',
        });

        const template = {
            productDetailHtml: this.productEditor.getHtmlContent(),
            productImageList: [this.uploadURL, this.shopifyLink, this.amazonLink],
        };

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.saveAsNewTemplate(result, template, 'product');
            }
        });
    }

    saveOfferDetailTemplate() {
        const dialogRef = this.dialog.open(SaveTemplateDialogComponent, {
            width: '600px',
        });

        const template = {
            offerDetailHtml: this.offerEditor.getHtmlContent(),
        };

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.saveAsNewTemplate(result, template, 'offer');
            }
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
}
