import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { EmailEditorComponent } from '@src/app/shared/email-editor/email-editor.component';
import { EmailTemplate } from '@src/types/campaign';
import { InfluencerRecommendBody, InfluencerStatus } from '@src/types/influencer';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-single-email',
    templateUrl: './single-email.component.html',
    styleUrls: ['./single-email.component.scss'],
})
export class SingleEmailComponent implements OnInit, OnChanges, OnDestroy {
    currentStep = 2;
    @Input() campaign;
    @Input() influencer: InfluencerRecommendBody;
    @Input() templates = [];
    @Input() emailAuth;

    @Output() onShowFullProfile = new EventEmitter<any>();
    @Output() onAuthorizeNylas = new EventEmitter<any>();
    @Output() onSkipOffer = new EventEmitter<any>();

    @ViewChild('sendOfferEditor') sendOfferEditor: EmailEditorComponent;
    @ViewChild('replyEmailEditor') replyEmailEditor: EmailEditorComponent;

    emailTemplate: EmailTemplate;
    subscriptions: Subscription[] = [];
    sendingOffer = false;

    shouldShowOfferEmailThread = false;
    offerEmailThread = [];
    replyEmailContent = '';
    replyEmail = false;

    constructor(
        private internalService: InternalService,
        private notification: NotificationService,
        private auth: AngularFireAuth,
    ) { }

    ngOnInit(): void {

    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    ngOnChanges(change) {
        if (change.influencer) {
            this.sendingOffer = false;
            this.showOfferEmailThread();
        }
    }

    async showOfferEmailThread() {
        this.shouldShowOfferEmailThread = true;
        if (this.influencer && this.influencer.inf_offer_thread) {
            const getThread = await this.internalService.getEmailByThreadId(this.influencer.inf_offer_thread);
            this.subscriptions.push(
                getThread.subscribe(threads => {
                    this.offerEmailThread = threads;
                })
            );
        }
    }

    async startToSendOffer() {
        this.sendingOffer = true;
        if (this.templates.length > 0) {
            const user =  await this.auth.currentUser;
            this.templates[0].body = this.templates[0].body.replace(/\[NAME\]/g, user.displayName)
                .replace(/\[BRAND NAME\]/g, this.campaign.contact_name);
            this.emailTemplate = this.templates[0];
        }
    }

    async sendSingleEmail(influencer, isTest= true) {
        const realEmail = isTest ? 'customer@lifo.ai' : influencer.email;
        const sendEmail = await this.internalService.sendEmailWithTemplate(
            this.emailTemplate.subject,
            this.sendOfferEditor.getHtmlContent(),
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
                this.sendingOffer = false;
            })
        );
    }

    startReplyEmail() {
        this.replyEmail = true;
    }

    async sendReplyEmail() {
        const receiver_email = this.influencer.email;
        const message_id = this.offerEmailThread[this.offerEmailThread.length - 1].id;
        const subject = this.offerEmailThread[this.offerEmailThread.length - 1].subject;
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
                this.offerEmailThread.push(result);
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

    skipOffer() {
        this.onSkipOffer.emit();
    }

    sendOffer() {
        this.sendSingleEmail(this.influencer, false);
    }

    showProfile() {
        this.onShowFullProfile.emit();
    }

    authorizeNylas() {
        this.onAuthorizeNylas.emit();
    }

    get showSendInvite() {
        return this.influencer.profile.influencer.status === InfluencerStatus.BRAND_CHOSEN ||
            this.influencer.profile.influencer.status === InfluencerStatus.RECOMMENDED ;
    }

    get showOfferDeclined() {
        return this.influencer.profile.influencer.status === InfluencerStatus.OFFER_DECLIEND;
    }

}
