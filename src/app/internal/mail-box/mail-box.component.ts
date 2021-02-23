import { Component, OnInit, ViewChild, ViewEncapsulation, Input, Inject, OnDestroy } from '@angular/core';
import { InternalService } from 'src/app/services/internal.service';

import { ToolbarService, LinkService, ImageService, HtmlEditorService, RichTextEditorComponent, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { EmailEditorComponent } from 'src/app/shared/email-editor/email-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { SaveTemplateDialogComponent } from './save-template-dialog/save-template-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { OfferDetailComponent } from '../offer-detail/offer-detail.component';
import { OfferDetail, CampaignDetail } from 'src/types/campaign';
import { MatChipInputEvent } from '@angular/material/chips';
import { Influencer, InfluencerRecommendProfile } from 'src/types/influencer';
import { AlertType, NotificationService } from 'src/app/services/notification.service';
import { Subscription } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    selector: 'app-mail-box',
    templateUrl: './mail-box.component.html',
    styleUrls: ['./mail-box.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService],
})
export class MailBoxComponent implements OnInit, OnDestroy {
    @ViewChild('emailEditor') emailEditor: EmailEditorComponent;

    @Input() influencers: InfluencerRecommendProfile[];
    @Input() campaign: CampaignDetail;

    emailContent = '';
    toEmail = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    emailTitle;
    templateName;

    templates = [];
    selectedTemplate;

    currentOfferDetail: OfferDetail;
    isAuthorizeNylas = false;

    allInfluencerSelected = false;

    subscriptions: Subscription[] = [];
    allTemplateInfo = {
        template_name: 'alltemplate',
    };
    isModalVisible = false;
    templateArr = [];

    public maxLength = 1000;
    public textArea: HTMLElement;
    public myCodeMirror: any;


    ngAfterViewInit(): void {
    }

    constructor(
        private internalService: InternalService,
        private dialog: MatDialog,
        private notification: NotificationService,
        private modal: NzModalService,
        private message: NzMessageService,
    ) {
    }

    async ngOnInit() {
        this.subscriptions.push(
            this.internalService.getAllTemplate().subscribe(result => {
                this.templates = result;
                this.templates.splice(0, 0, this.allTemplateInfo);
            })
        );

        this.checkAuthorizeStatus();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    filterTemplates(val, k) {
        for (const i in val) {
            if (val[i]['template_name'] === k['template_name']) {
                val.splice(Number(i), 1);
            }
        }
    }

    showModal(): void {
        this.templateArr = [...this.templates];
        this.templateArr.splice(0, 1);
        // this.templateArr = this.templates;
        // this.templateArr.splice(0,1);
        this.isModalVisible = true;
    }

    useTemplateInfo(val) {
        this.selectTempalte(val);
        this.isModalVisible = false;
    }

    handleOk(): void {
        this.isModalVisible = false;
    }

    handleCancel(): void {
        this.isModalVisible = false;
    }

    deleteTemplateInfo(val): void {
        const _that = this;
        this.modal.confirm({
            nzTitle: 'Are you sure delete this template?',
            //   nzContent: '<b style="color: red;">Some descriptions</b>',
            nzOkText: 'Yes',
            nzOkType: 'danger',
            nzOnOk: () => {
                const deleteConfirm = this.internalService.deleteTemplateByName(val.template_name, 'emails');
                deleteConfirm.subscribe(res => {
                    _that.templates = [];
                    this.templates.push(this.allTemplateInfo);
                    for (const i in _that.templateArr) {

                        if (_that.templateArr[i]['template_name'] === val['template_name']) {
                            _that.templateArr.splice(Number(i), 1);
                        } else {
                            _that.templates.push(_that.templateArr[i]);
                        }
                    }
                    this.message.create('success', 'Delete success!');
                });
            },
            nzCancelText: 'No',
            nzOnCancel: () => {
                this.message.create('error', 'Delete Cancel!');
            },
        });
    }

    async authorizeNylas() {
        const auth = await this.internalService.authorizeNylas();
        this.subscriptions.push(
            auth.subscribe(result => {
                window.open(result, '_blank');
            })
        );
    }

    async checkAuthorizeStatus() {
        const auth = await this.internalService.verifyNylasSatus();
        this.subscriptions.push(
            auth.subscribe(result => {
                this.isAuthorizeNylas = true;
            }, error => {
                console.warn(error);
            })
        );
    }

    async sendEmailSingle(influencer, isTest= true) {
        const realEmail = isTest ? 'customer@lifo.ai' : influencer.email;
        const sendEmail = await this.internalService.sendEmailWithTemplate(
            this.emailTitle,
            this.getHtmlContent(),
            realEmail,
            influencer.account_id,
            '',
            this.campaign.campaign_name,
            this.campaign.brand_campaign_id,
            influencer.account_id,
        );

        this.subscriptions.push(
            sendEmail.subscribe(result => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Email Sent',
                    message: `Email Sent to ${realEmail}.`,
                    duration: 3000,
                });
            })
        );
    }

    async saveOfferDetail(influencer) {
        const updateProduct = await this.internalService.updateProductMessage(
            this.campaign.brand_campaign_id,
            influencer.account_id,
            this.currentOfferDetail.product_message,
            this.currentOfferDetail.product_image_list,
        );

        this.subscriptions.push(
            updateProduct.subscribe(result => {
            })
        );

        const updateOffer = await this.internalService.updateOfferMessage(
            this.campaign.brand_campaign_id,
            influencer.account_id,
            this.currentOfferDetail.compensation_message,
        );

        this.subscriptions.push(
            updateOffer.subscribe(result => {
            })
        );
    }

    async sendEmailWithTemplate(isTest= true) {
        // if (!this.currentOfferDetail) {
        //     this.notification.addMessage({
        //         type: AlertType.Error,
        //         title: 'No Offer Detail',
        //         message: 'No offer detail attached.',
        //         duration: 3000,
        //     });
        //     return;
        // }

        const emailList = [];
        this.influencers.forEach(influencer => {
            if (influencer['selected']) {
                // Selected influencer & also in the toEmail list
                if (this.toEmail.indexOf(influencer.email) >= 0) {
                    emailList.push(influencer.email);
                    this.saveOfferDetail(influencer);
                    this.sendEmailSingle(influencer, isTest);
                } else {
                    this.notification.addMessage({
                        type: AlertType.Warning,
                        title: 'Influencer Email Missing',
                        message: `Selected influencer (${influencer.account_id}) is missing from the to email address.`,
                        duration: 3000,
                    });
                }
            }
        });
        // Send email to extraUser
        this.toEmail.forEach(email => {
            if (emailList.indexOf(email) < 0) {
                this.sendEmailSingle({
                    account_id: 'lifo',
                    email,
                }, isTest);
                emailList.push(email);
            }
        });

        if (emailList.length === 0) {
            this.notification.addMessage({
                type: AlertType.Error,
                title: 'No Influencer',
                message: 'No influencer selected.',
                duration: 3000,
            });
        }
    }

    async saveAsNewTemplate(templateName) {
        const saveTemplate = await this.internalService.createTemplateByName(
            templateName,
            {
                subject: this.emailTitle,
                body: this.emailEditor.getHtmlContent(),
            },
            'emails',
        );

        this.subscriptions.push(
            saveTemplate.subscribe(result => {
                this.templates = [...this.templates, {
                    template_name: templateName,
                    subject: this.emailTitle,
                    body: this.emailEditor.getHtmlContent(),
                }];
                this.templateArr = this.templates;
            })
        );
    }

    saveNewTemplate() {
        const dialogRef = this.dialog.open(SaveTemplateDialogComponent, {
            width: '600px',
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.saveAsNewTemplate(result);
            }
        });
    }

    getHtmlContent() {
        const rteValue: string = this.emailEditor.getHtmlContent();
        const content = rteValue.replace('@image', '<img src="cid:eawvfiitnhpo6kdr0oobjtrgj">');
        return content;
    }

    selectTempalte(template) {
        if (template['template_name'] !== 'alltemplate') {
            this.emailContent = template.body;
            this.emailTitle = template.subject;
            this.emailEditor.setHtmlContent(this.emailContent);
        }

    }

    selectInfluencer(influencer) {
        influencer.selected = influencer.selected ? false : true;
        this.updateInfluencerEmail(influencer);
    }

    updateInfluencerEmail(influencer) {
        if (influencer.selected && this.toEmail.indexOf(influencer.email) < 0) {
            this.toEmail.push(influencer.email);
        }
        if (!influencer.selected && this.toEmail.indexOf(influencer.email) >= 0) {
            this.removeToEmail(influencer.email);
        }
    }

    selectAllInfluencer() {
        this.influencers.forEach(inf => {
            inf['selected'] = !this.allInfluencerSelected;
            this.updateInfluencerEmail(inf);
        });
    }

    addOfferDetail() {
        const dialogRef = this.dialog.open(OfferDetailComponent, {
            width: '80%',
            data: {
                offerDetail: this.currentOfferDetail,
                campaign: this.campaign,
            },
        });

        dialogRef.afterClosed().subscribe(offerDetail => {
            if (offerDetail) {
                this.currentOfferDetail = offerDetail;
            }
        });
    }

    addToEmail(event: MatChipInputEvent) {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.toEmail.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    removeToEmail(email) {
        const index = this.toEmail.indexOf(email);

        if (index >= 0) {
            this.toEmail.splice(index, 1);
        }
    }
}
