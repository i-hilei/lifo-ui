import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { EmailEditorComponent } from '@src/app/shared/email-editor/email-editor.component';
import { BrandUser } from '@src/types/brand';
import { EmailTemplate } from '@src/types/campaign';
import { InfluencerRecommendBody, InfluencerStatus } from '@src/types/influencer';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-negotiation-steps',
    templateUrl: './negotiation-steps.component.html',
    styleUrls: ['./negotiation-steps.component.scss'],
})
export class NegotiationStepsComponent implements OnInit, OnChanges, OnDestroy {
    currentStep = 2;
    @Input() campaign;
    @Input() influencer: InfluencerRecommendBody;
    @Input() templates = [];
    @Input() emailAuth;

    @Output() onClickPrepareContract = new EventEmitter<any>();
    @Output() onClickReviewContract = new EventEmitter<any>();
    @Output() onClickSignContract = new EventEmitter<any>();
    @Output() onShowFullProfile = new EventEmitter<any>();
    @Output() onDownloadContract = new EventEmitter<any>();
    @Output() onSendContract = new EventEmitter<any>();
    @Output() onAuthorizeNylas = new EventEmitter<any>();
    @Output() onContentReview = new EventEmitter<any>();

    @ViewChild('sendOfferEditor') sendOfferEditor: EmailEditorComponent;
    @ViewChild('replyEmailEditor') replyEmailEditor: EmailEditorComponent;

    emailTemplate: EmailTemplate;
    subscriptions: Subscription[] = [];
    sendingOffer = false;
    sendingContract = false;

    shouldShowOfferEmailThread = false;
    offerEmailThread = [];
    shouldShowContractEmailThread = false;
    contractEmailThread = [];

    replyEmail = false;
    replyEmailContent = '';

    userName = '';

    constructor(
        private internalService: InternalService,
        private notification: NotificationService,
        private auth: AngularFireAuth,
    ) { }

    async ngOnInit() {
        const user =  await this.auth.currentUser;
        let user_name = user.displayName;
        user.getIdTokenResult().then(user => {
            if (user.claims && user.claims.store_account === true) {
                const brandUser = user.claims as BrandUser;
                user_name = brandUser.store_name;
            }
            this.userName = user_name;
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    ngOnChanges(change) {
        if (change.influencer) {
            this.sendingOffer = false;
            this.sendingContract = false;
            //
            this.currentStep = this.checkStepForInfluencer(change.influencer.currentValue);
        }
    }

    async showOfferEmailThread() {
        this.shouldShowOfferEmailThread = true;
        if (this.influencer.inf_offer_thread) {
            const getThread = await this.internalService.getEmailByThreadId(this.influencer.inf_offer_thread);
            this.subscriptions.push(
                getThread.subscribe(threads => {
                    this.offerEmailThread = threads;
                })
            );
        }
    }

    async showContractEmailThread() {
        this.shouldShowContractEmailThread = true;
        if (this.influencer.inf_contract_thread) {
            const getThread = await this.internalService.getEmailByThreadId(this.influencer.inf_contract_thread);
            this.subscriptions.push(
                getThread.subscribe(threads => {
                    this.contractEmailThread = threads;
                })
            );
        }
    }

    async startToSendOffer() {
        this.sendingOffer = true;
        this.sendingContract = false;
        if (this.templates.length > 0) {
            this.templates[0].body = this.templates[0].body.replace(/\[NAME\]/g, this.userName)
                .replace(/\[BRAND NAME\]/g, this.campaign.contact_name);
            this.emailTemplate = this.templates[0];
        }
    }

    async sendSingleEmail(influencer, isTest= true) {
        const realEmail = isTest ? 'customer@lifo.ai' : influencer.email;
        const sendEmail = await this.internalService.sendEmailWithTemplate(
            this.emailTemplate.subject,
            this.emailTemplate.body,
            realEmail,
            influencer.account_id,
            '',
            this.campaign.campaign_name,
            this.campaign.brand_campaign_id,
            influencer.account_id,
        );

        this.subscriptions.push(
            sendEmail.subscribe(result => {
                this.offerEmailThread.push(result);
                this.influencer.profile.influencer.status = InfluencerStatus.OFFER_SENT;
                this.influencer.inf_offer_thread = result.thread_id;
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Email Sent',
                    message: `Email Sent to ${realEmail}.`,
                    duration: 3000,
                });
                this.sendingContract = false;
                this.sendingOffer = false;
            })
        );
    }

    sendOffer() {
        this.sendSingleEmail(this.influencer, false);
    }

    async startToSendContract() {
        this.sendingContract = true;
        this.sendingOffer = false;
        if (this.templates.length > 2) {
            this.templates[2].body = this.templates[2].body.replace(/\[NAME\]/g, this.userName)
                .replace(/\[BRAND NAME\]/g, this.campaign.contact_name);
            this.emailTemplate = this.templates[2];
        }
    }

    async sendContractReal(influencer, isTest= true) {
        const realEmail = isTest ? 'customer@lifo.ai' : influencer.email;
        const sendEmail = await this.internalService.sendEmailWithTemplate(
            this.emailTemplate.subject,
            this.emailTemplate.body,
            realEmail,
            influencer.account_id,
            '',
            this.campaign.campaign_name,
            this.campaign.brand_campaign_id,
            influencer.account_id,
            true,
        );

        this.subscriptions.push(
            sendEmail.subscribe(result => {
                this.contractEmailThread.push(result);
                this.influencer.profile.influencer.status = InfluencerStatus.PENDING_SIGNING;
                this.influencer.inf_contract_thread = result.thread_id;
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Email Sent',
                    message: `Email Sent to ${realEmail}.`,
                    duration: 3000,
                });
                this.sendingContract = false;
                this.sendingOffer = false;
            })
        );
    }

    sendContract() {
        this.sendContractReal(this.influencer, false);
    }

    startReplyEmail() {
        this.replyEmail = true;
    }

    async sendReplyEmail() {
        const receiver_email = this.influencer.email;
        const message_id = this.contractEmailThread[this.contractEmailThread.length - 1].id;
        const subject = this.contractEmailThread[this.contractEmailThread.length - 1].subject;
        const sendEmail = await this.internalService.sendEmailWithTemplate(
            subject,
            this.replyEmailEditor.getHtmlContent(),
            receiver_email,
            this.influencer.account_id,
            '',
            this.campaign.campaign_name,
            this.campaign.brand_campaign_id,
            this.influencer.account_id,
            false,
            message_id,
        );

        this.subscriptions.push(
            sendEmail.subscribe(result => {
                this.contractEmailThread.push(result);
                this.replyEmail = false;
                this.replyEmailContent = '';
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Email Sent',
                    message: `Email Sent to ${receiver_email}.`,
                    duration: 3000,
                });
                this.sendingOffer = false;
            })
        );
    }

    showProfile() {
        this.onShowFullProfile.emit();
    }

    prepareContract() {
        this.onClickPrepareContract.emit();
    }

    signContract() {
        this.onClickSignContract.emit();
    }

    downloadContract() {
        this.onDownloadContract.emit();
    }

    reviewContract() {
        this.onClickReviewContract.emit();
    }

    authorizeNylas() {
        this.onAuthorizeNylas.emit();
    }

    goContentReview() {
        this.onContentReview.emit();
    }

    get showOfferAccepted() {
        return this.influencer.profile.influencer.status === InfluencerStatus.OFFER_ACCEPTED ||
            this.allowViewContractInfo;
    }

    get showOfferDeclined() {
        return this.influencer.profile.influencer.status === InfluencerStatus.OFFER_DECLIEND;
    }

    get showSendInvite() {
        return this.influencer.profile.influencer.status === InfluencerStatus.BRAND_CHOSEN ||
            this.influencer.profile.influencer.status === InfluencerStatus.RECOMMENDED ;
    }

    get allowContentReview() {
        return this.influencer.profile.influencer.status === InfluencerStatus.CONTRACT_SIGNED &&
            this.influencer.inf_campaign_id;
    }

    get allowSignContract() {
        return this.influencer.profile.influencer.status === InfluencerStatus.PENDING_BRAND_SIGNING ||
            this.influencer.profile.influencer.status === InfluencerStatus.PENDING_SIGNING;
    }

    get completeSignContract() {
        return this.influencer.profile.influencer.status === InfluencerStatus.PENDING_INFLUENCER_SIGNING ||
            this.influencer.profile.influencer.status === InfluencerStatus.CONTRACT_SIGNED;
    }

    get allowDownloadContract() {
        return this.influencer.profile.influencer.status === InfluencerStatus.CONTRACT_SIGNED &&
            this.influencer.signature_request_id;
    }

    get allowViewContractInfo() {
        return this.influencer.contract_data;
    }

    get pendingInfuencerSign() {
        return this.influencer.profile.influencer.status === InfluencerStatus.PENDING_INFLUENCER_SIGNING;
    }

    get contractSent() {
        return this.influencer.profile.influencer.status === InfluencerStatus.PENDING_SIGNING ||
            this.influencer.profile.influencer.status === InfluencerStatus.PENDING_BRAND_SIGNING ||
            this.influencer.profile.influencer.status === InfluencerStatus.PENDING_INFLUENCER_SIGNING ||
            this.influencer.profile.influencer.status === InfluencerStatus.CONTRACT_SIGNED;
    }

    checkStepForInfluencer(influencer: InfluencerRecommendBody) {
        switch (influencer.profile.influencer.status) {
        case InfluencerStatus.OFFER_SENT:
        case InfluencerStatus.OFFER_DECLIEND:
            return 1;
        case InfluencerStatus.OFFER_ACCEPTED:
            if (influencer.contract_data) {
                return 2;
            } else {
                return 1;
            }
        case InfluencerStatus.PENDING_BRAND_SIGNING:
        case InfluencerStatus.PENDING_SIGNING:
        case InfluencerStatus.PENDING_INFLUENCER_SIGNING:
            return 3;
        case InfluencerStatus.CONTRACT_SIGNED:
            return 5;
        case InfluencerStatus.BRAND_CHOSEN:
        case InfluencerStatus.RECOMMENDED:
        default:
            return 0;
        }
    }


}
