import { Component, OnInit, Input, ViewChild, ViewEncapsulation, AfterViewInit,
    Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { Influencer, InfluencerRecommendProfile, InfluencerStatus, InfluencerRecommendBody } from 'src/types/influencer';
import { OfferDetail, CampaignDetail } from 'src/types/campaign';
import { ToolbarService, LinkService, ImageService, HtmlEditorService,
    RichTextEditorComponent, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import { EmailEditorComponent } from 'src/app/shared/email-editor/email-editor.component';
import { MailTemplateModalComponent } from '@internal/mail-box-newui/mail-template-modal/mail-template-modal.component';
import { InternalService } from 'src/app/services/internal.service';
import { Subscription } from 'rxjs';

import { AlertType, NotificationService } from 'src/app/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { SaveTemplateDialogComponent } from '../mail-box/save-template-dialog/save-template-dialog.component';
import { CampaignService } from '@src/app/services/campaign.service';
import { PrepareContractComponent } from '../internal-brand-campaign/prepare-contract-dialog/prepare-contract-dialog';
import { HelloSignService } from '@src/app/services/hellosign.service';

@Component({
    selector: 'app-mail-box-newui',
    templateUrl: './mail-box-newui.component.html',
    styleUrls: ['./mail-box-newui.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService],
})
export class MailBoxNewuiComponent implements OnInit, OnDestroy, OnChanges {
    @Input() influencers: InfluencerRecommendBody[];
    @Input() campaign: CampaignDetail;
    @Input() influencerDetail: Influencer;
    @Input() mode = 'BRAND';
    @Input() view = 'outreach';

    @Output() onViewPerformance = new EventEmitter<any>();
    @Output() onContentReview = new EventEmitter<any>();
    @ViewChild('emailEditor') emailEditor: EmailEditorComponent;
    @ViewChild('emailModal') emailModal;
    @ViewChild('emailFullReport') emailFullReport;
    @ViewChild('mailHistory') mailHistory;

    panels = [
        {
            name: 'Influencer Outreach',
        },
        {
            name: 'Contract Preparing',
        },
        {
            name: 'Contract Signing',
        },
        {
            name: 'Declined',
        },
    ];

    constructor(
        private internalService: InternalService,
        private campaignService: CampaignService,
        private helloSignService: HelloSignService,
        private notification: NotificationService,
        private dialog: MatDialog,
    ) { }

    allInfluencerSelected = false;
    // influencers = [];
    toEmail = [];
    // selected influencer
    selectedInfluencer: InfluencerRecommendBody;
    selectedGroupInfluencers: InfluencerRecommendBody[] = [];

    emailTitle;
    emailContent = '';
    templates = [];
    templateArr = [];
    htmlContent = '';
    emailAuth = '';

    splitTop = 60;
    isMore = false;
    splitBottom = 40;

    isAuthorizeNylas = false;
    currentOfferDetail: OfferDetail;
    subscriptions: Subscription[] = [];
    historyAllInfo = [];
    isSearchDiscover = true;

    showAuthModal = false;
    isSelectAllInfluencer = false;

    ngOnChanges(change) {
        if (change.influencers) {
            if (this.influencers.length !== 0) {
                this.influencers.forEach(influencer => {
                    influencer.selected = false;
                });
                if (this.view === 'outreach') {
                    this.selectedGroupInfluencers = [];
                    this.selectOutReachInfluencer(this.influencers[0]);
                } else {
                    this.selectInfluencer(this.influencers[0]);
                }
            }
        }
    }

    selectAllInfluencer() {
        this.isSelectAllInfluencer = !this.isSelectAllInfluencer;
        this.influencers.forEach(inf => {
            if (inf.selected !== this.isSelectAllInfluencer) {
                inf.selected = !this.isSelectAllInfluencer;
                this.selectOutReachInfluencer(inf);
            }
        });
    }

    selectInfluencer(influencer) {
        this.selectedGroupInfluencers = [];
        for (const i of this.influencers) {
            if (i.account_id === influencer.account_id) {
                i.selected = true;
                this.selectedInfluencer = i;
                this.isMore = false;
                if (this.mode === 'AM') this.getHistoryMails(i['email']);
            } else {
                i.selected = false;
            }
        }
        this.updateInfluencerEmail(influencer);
    }

    selectOutReachInfluencer(influencer) {
        // Handle select self, if only one selected, skip
        if (this.selectedGroupInfluencers.length === 1 &&
            this.selectedGroupInfluencers[0].account_id === influencer.account_id) {
            return;
        }
        // Handle other
        this.influencers.forEach(inf => {
            if (!this.outreachInfluencer(inf)) {
                inf.selected = false;
            } else if (inf.account_id === influencer.account_id) {
                if (influencer.selected) {
                    const index = this.selectedGroupInfluencers.indexOf(influencer);
                    if (index >= -1) {
                        this.selectedGroupInfluencers.splice(index, 1);
                    }
                    if (this.selectedInfluencer === influencer) {
                        this.selectedInfluencer = this.selectedGroupInfluencers[0];
                    }
                    influencer.selected = false;
                } else {
                    const index = this.selectedGroupInfluencers.indexOf(influencer);
                    if (index < 0) {
                        this.selectedGroupInfluencers.push(influencer);
                    }
                    this.selectedInfluencer = influencer;
                    influencer.selected = true;
                    if (this.mode === 'AM') {
                        this.isMore = false;
                        this.getHistoryMails(influencer['email']);
                    }
                }
            }
        });
    }

    selectSelf() {

    }

    updateInfluencerEmail(influencer) {
        this.toEmail = [];
        if (influencer.selected && this.toEmail.indexOf(influencer.email) < 0) {
            this.toEmail.push(influencer.email);
        }
    }

    showEmailModals() {
        this.emailModal.templateArr = [...this.templates];
        if (this.emailModal.templateArr.length !== 0) {
            for (const item in this.emailModal.templateArr) {
                if (item === '0') {
                    this.emailModal.templateArr[0]['checked'] = true;
                } else {
                    this.emailModal.templateArr[item]['checked'] = false;
                }
            }
        }
        this.emailModal.isModalVisible = true;
    }

    showFullModals() {
        this.emailFullReport.isModalVisible = true;
    }

    ngOnInit() {
        this.subscriptions.push(
            this.internalService.getAllTemplateBrand('email_temp_library').subscribe(result => {
                this.templates = result;
            })
        );
        this.checkAuthorizeStatus();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    async sendEmailWithTemplate(isTest= true) {
        if (!this.selectedInfluencer) {
            this.notification.addMessage({
                type: AlertType.Error,
                title: 'No Influencer',
                message: 'No influencer selected.',
                duration: 3000,
            });
        }
        if (this.currentOfferDetail) {
            this.saveOfferDetail(this.selectedInfluencer);
        }
        this.sendEmailSingle(this.selectedInfluencer, isTest);
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

    async checkAuthorizeStatus() {
        const auth = await this.internalService.verifyNylasSatus();
        this.subscriptions.push(
            auth.subscribe(result => {
                this.emailAuth = result.email;
                this.isAuthorizeNylas = true;
            }, error => {
                console.warn(error);
            })
        );
    }

    async authorizeNylas() {
        const auth = await this.internalService.authorizeNylas();
        this.subscriptions.push(
            auth.subscribe(result => {
                this.showAuthModal = true;
                window.open(result, '_blank');
            })
        );
    }

    handleOk() {
        this.checkAuthorizeStatus();
        this.showAuthModal = false;
    }

    handleCancel() {
        this.showAuthModal = false;
    }

    dragEnd({ sizes }) {
        this.emailEditor.isHeight = `${560 * sizes[1] / 100 - 50}px`;
    }

    async getHistoryMails(email: string) {
        if (email !== '') {
            this.historyAllInfo = [];
            const emailHistory = await this.internalService.getHistoricalMailInfo(email);
            this.subscriptions.push(
                emailHistory.subscribe(result => {
                    this.historyAllInfo = result;
                })
            );
        } else {
            this.historyAllInfo = [];
        }
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
                // Add to the popup box
                this.historyAllInfo.splice(0, 0, {
                    body: this.getHtmlContent(),
                    subject: this.emailTitle,
                    from: [
                        {
                            email: this.emailAuth,
                        },
                    ],
                    to: [
                        {
                            email: realEmail,
                        },
                    ],
                    date: new Date().getTime() / 1000,
                });
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Email Sent',
                    message: `Email Sent to ${realEmail}.`,
                    duration: 3000,
                });

                // If first email:
                influencer.status = InfluencerStatus.OFFER_SENT;
            })
        );
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


    checkedBack(template) {
        this.emailTitle = template.subject;
        this.emailEditor.setHtmlContent(template.body);
        if (template.offerDetail) {
            this.currentOfferDetail = template.offerDetail;
        }
    }

    viewPerformance() {
        this.onViewPerformance.emit();
    }

    influencerContentReview(influencer) {
        this.onContentReview.emit(influencer);
    }

    // This is a general function to download contract.
    downloadContract(influencer) {
        this.subscriptions.push(
            this.campaignService.downloadContract(influencer.signature_request_id).subscribe(result => {
                // It is necessary to create a new blob object with mime-type explicitly set
                // otherwise only Chrome works like it should
                const newBlob = new Blob([result], { type: 'application/pdf' });

                // IE doesn't allow using a blob object directly as link href
                // instead it is necessary to use msSaveOrOpenBlob
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(newBlob);
                    return;
                }

                // For other browsers:
                // Create a link pointing to the ObjectURL containing the blob.
                const data = window.URL.createObjectURL(newBlob);

                const link = document.createElement('a');
                link.href = data;
                link.download = `contract_${influencer.signature_request_id}.pdf`;
                // this is necessary as link.click() does not work on the latest firefox
                link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                setTimeout(function () {
                    // For Firefox it is necessary to delay revoking the ObjectURL
                    window.URL.revokeObjectURL(data);
                    link.remove();
                }, 100);
            })
        );
    }

    prepareSignRequest(influencer) {
        const dialogRef = this.dialog.open(PrepareContractComponent, {
            width: 'calc(100% - 20px)',
            maxWidth: 'calc(100% - 20px)',
            height: 'calc(100% - 20px)',
            data: {
                influencer,
                campaign: this.campaign,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createSignRequest(result, influencer);
            }
        });
    }

    reviewContract(influencer) {
        const dialogRef = this.dialog.open(PrepareContractComponent, {
            width: 'calc(100% - 20px)',
            maxWidth: 'calc(100% - 20px)',
            height: 'calc(100% - 20px)',
            data: {
                influencer,
                campaign: this.campaign,
                contract_body: influencer.contract_data,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createSignRequest(result, influencer);
            }
        });
    }

    async createSignRequest(signRequest, influencer) {
        signRequest['brand_campaign_id'] = this.campaign.brand_campaign_id;
        const signRequestP = await this.campaignService.createContractSign(signRequest);
        this.subscriptions.push(
            signRequestP.subscribe(url => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Contract Created',
                    message: 'Contracts are ready to sign.',
                    duration: 3000,
                });
                for (let i = 0; i < this.influencers.length; i ++) {
                    if (this.influencers[i]['account_id'] === influencer.account_id) {
                        this.influencers[i].profile.influencer.status = InfluencerStatus.PENDING_CONTRACT_SEND;
                        this.influencers[i].contract_data = signRequest;
                    }
                }
            })
        );
    }

    async signContract(influencer: InfluencerRecommendBody) {
        this.subscriptions.push(
            this.campaignService.getSignUrlByEmail(this.campaign.brand_campaign_id, influencer.email).subscribe(url => {
                const embedUrl = url['embedded']['sign_url'];
                this.helloSignService.signContract(embedUrl, influencer, this.completeSign.bind(this));
            }, error => {
                this.notification.addMessage({
                    type: AlertType.Error,
                    title: 'Signup Failed',
                    message: error,
                    duration: 3000,
                });
            })
        );
    }

    async completeSign(signatureId, influencer: InfluencerRecommendBody) {
        const completeSign = await this.internalService.brandCompleteSign(this.campaign.brand_campaign_id, signatureId);

        this.subscriptions.push(
            completeSign.subscribe(result => {
                if (influencer.profile.influencer.status === InfluencerStatus.PENDING_SIGNING) {
                    influencer.profile.influencer.status = InfluencerStatus.PENDING_INFLUENCER_SIGNING;
                } else if (influencer.profile.influencer.status === InfluencerStatus.PENDING_BRAND_SIGNING) {
                    influencer.profile.influencer.status = InfluencerStatus.CONTRACT_SIGNED;
                }
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Contract Signed',
                    message: 'Your have signed your contract.',
                    duration: 3000,
                });
            })
        );
    }

    async sendContract(influencer) {
        this.emailTitle = 'Sign Contract';
        this.emailEditor.setHtmlContent(
            '<div><p>Hi $(receiver_name),</p><p><br></p>' +
            '<p>Your contract is ready. Please use the following link to sign the contract</p>' +
            '<p><a classname="e-rte-anchor" href="https://login.lifo.ai/sign-contract/$(brand_campaign_id)/$(receiver_name)" ' +
            'title="https://login.lifo.ai/sign-contract/$(brand_campaign_id)/$(receiver_name)">' +
            'http://login.lifo.ai/sign-contract/$(brand_campaign_id)/$(receiver_name) </a></p>' +
            '<p><br></p><p>Yours,</p><p>$(sender_name)</p></div>'
        );
    }

    outreachInfluencer(influencer: InfluencerRecommendBody) {
        return influencer.profile.influencer.status === InfluencerStatus.BRAND_CHOSEN ||
            influencer.profile.influencer.status === InfluencerStatus.OFFER_SENT;
    }

    countOutreachInfluencer() {
        let count = 0;
        this.influencers.forEach(influencer => {
            if (influencer.profile.influencer.status === InfluencerStatus.BRAND_CHOSEN ||
                influencer.profile.influencer.status === InfluencerStatus.OFFER_SENT) {
                count ++;
            }
        });
        return `Influencer Outreach (${count})`;
    }

    contractSigningInfluencer(influencer: InfluencerRecommendBody) {
        return influencer.profile.influencer.status === InfluencerStatus.OFFER_ACCEPTED ||
            influencer.profile.influencer.status === InfluencerStatus.PENDING_CONTRACT_SEND ||
            influencer.profile.influencer.status === InfluencerStatus.PENDING_BRAND_SIGNING ||
            influencer.profile.influencer.status === InfluencerStatus.PENDING_INFLUENCER_SIGNING ||
            influencer.profile.influencer.status === InfluencerStatus.PENDING_SIGNING ||
            influencer.profile.influencer.status === InfluencerStatus.CONTRACT_SIGNED ||
            influencer.profile.influencer.status === InfluencerStatus.SKIP_OFFER;
    }

    countContractSigningInfluencer() {
        let count = 0;
        this.influencers.forEach(influencer => {
            if (influencer.profile.influencer.status === InfluencerStatus.OFFER_ACCEPTED ||
                influencer.profile.influencer.status === InfluencerStatus.PENDING_CONTRACT_SEND ||
                influencer.profile.influencer.status === InfluencerStatus.PENDING_BRAND_SIGNING ||
                influencer.profile.influencer.status === InfluencerStatus.PENDING_INFLUENCER_SIGNING ||
                influencer.profile.influencer.status === InfluencerStatus.PENDING_SIGNING ||
                influencer.profile.influencer.status === InfluencerStatus.CONTRACT_SIGNED ||
                influencer.profile.influencer.status === InfluencerStatus.SKIP_OFFER) {
                count ++;
            }
        });
        return `Contract Signing (${count})`;
    }

    decliendInfluencer(influencer: InfluencerRecommendBody) {
        return influencer.profile.influencer.status === InfluencerStatus.OFFER_DECLIEND;
    }

    async skipOffer(influencer: InfluencerRecommendBody) {
        const skipOffer = await this.internalService.skipInfluencerOffer(
            this.campaign.brand_campaign_id,
            influencer.account_id,
        );
        this.subscriptions.push(
            skipOffer.subscribe(result => {
                influencer.profile.influencer.status = InfluencerStatus.SKIP_OFFER;
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Succeed',
                    message: 'Moved influencer to contract stage.',
                    duration: 3000,
                });
            })
        );
    }

    countDeclinedInfluencer() {
        let count = 0;
        this.influencers.forEach(influencer => {
            if (influencer.profile.influencer.status === InfluencerStatus.OFFER_DECLIEND) {
                count ++;
            }
        });
        return `Declined (${count})`;
    }
    // async sendEmailToBrand() {
    //     const sendEmail = await this.internalService.sendEmailToBrand(
    //         'Sign Contract',
    //         '<div><p>Hi $(receiver_name),</p><p><br></p><p>Your.
    // contract is ready. Please login to the console to sign the
    // contract</p><p><br></p><p>Yours,</p><p>$(sender_name)</p></div>',
    //         this.campaign.contact_email,
    //         this.campaign.contact_name,
    //         '',
    //         this.campaign.campaign_name,
    //         this.campaign.brand_campaign_id,
    //     );
    //     this.subscriptions.push(
    //         sendEmail.subscribe(result => {
    //             this.notification.addMessage({
    //                 type: AlertType.Success,
    //                 title: 'Contract Sent',
    //                 message: 'Contract has been sent to brand side.',
    //                 duration: 3000,
    //             });
    //         })
    //     );
    // }
}
