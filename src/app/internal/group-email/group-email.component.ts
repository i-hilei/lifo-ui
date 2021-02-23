import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { EmailEditorComponent } from '@src/app/shared/email-editor/email-editor.component';
import { environment } from '@src/environments/environment';
import { BrandUser } from '@src/types/brand';
import { CampaignDetail, EmailTemplate } from '@src/types/campaign';
import { InfluencerRecommendBody, InfluencerStatus } from '@src/types/influencer';
import { Subscription } from 'rxjs';
import { SaveTemplateDialogComponent } from '../mail-box/save-template-dialog/save-template-dialog.component';

@Component({
    selector: 'app-group-email',
    templateUrl: './group-email.component.html',
    styleUrls: ['./group-email.component.scss'],
})
export class GroupEmailComponent implements OnInit, OnDestroy {
    @Input() campaign: CampaignDetail;
    @Input() emailAuth;
    @Input() templates: EmailTemplate[];
    @Input() selectedInfluencers: InfluencerRecommendBody[];
    @Output() onAuthorizeNylas = new EventEmitter<any>();

    @ViewChild('sendOfferEditor') sendOfferEditor: EmailEditorComponent;

    emailTemplate: EmailTemplate;
    subscriptions: Subscription[] = [];

    showEmailSendingStatus = false;
    emailSendingStatus = 0;

    allTemplates: EmailTemplate[] = [];
    selectedTemplate: EmailTemplate;

    constructor(
        private internalService: InternalService,
        private notification: NotificationService,
        private auth: AngularFireAuth,
        private dialog: MatDialog,
    ) {}

    async ngOnInit() {
        const user = await this.auth.currentUser;
        let user_name = user.displayName;
        user.getIdTokenResult().then((user) => {
            if (user.claims && user.claims.store_account === true) {
                const brandUser = user.claims as BrandUser;
                user_name = brandUser.store_name;
            }

            if (this.templates.length > 0) {
                this.templates[0].body = this.templates[0].body
                    .replace(/\[NAME\]/g, user_name)
                    .replace(/\[BRAND NAME\]/g, this.campaign.contact_name);
                this.emailTemplate = this.templates[0];
            }
        });

        this.subscriptions.push(
            this.internalService.getAllTemplate().subscribe(result => {
                this.allTemplates = result;
                console.log(result);
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    sendSingleEmail(influencer, realEmail) {
        return this.internalService.sendEmailWithTemplatePromise(
            this.emailTemplate.subject,
            this.sendOfferEditor.getHtmlContent(),
            realEmail,
            influencer.account_id,
            '',
            this.campaign.campaign_name,
            this.campaign.brand_campaign_id,
            influencer.account_id
        );
    }

    delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    async sendEmail() {
        this.showEmailSendingStatus = true;
        this.emailSendingStatus = 0;
        // Turn on test mode for all production
        const isTest = !environment.production;
        for (let i = 0; i < this.selectedInfluencers.length; i ++) {
            const influencer = this.selectedInfluencers[i];
            const realEmail = isTest ? 'customer@lifo.ai' : influencer.email;
            if (!realEmail) {
                this.notification.addMessage({
                    type: AlertType.Error,
                    title: 'Email Missing',
                    message: `Email missing for ${influencer.account_id}.`,
                    duration: 3000,
                });
            } else {
                const request = await this.sendSingleEmail(influencer, realEmail).then(result => {
                    influencer.profile.influencer.status = InfluencerStatus.OFFER_SENT;
                    this.notification.addMessage({
                        type: AlertType.Success,
                        title: 'Email Sent',
                        message: `Email sent to ${realEmail}.`,
                        duration: 3000,
                    });
                }).catch(error => {
                    this.notification.addMessage({
                        type: AlertType.Error,
                        title: 'Email Failed to Send',
                        message: `Email failed to send to ${realEmail}.`,
                        duration: 3000,
                    });
                });
            }
            this.emailSendingStatus ++;
            // currently set to 1200 ms will change later
            await this.delay(1200);
            if (this.emailSendingStatus === this.selectedInfluencers.length) {
                this.cancelSendingBatchEmail();
            }
        }
    }

    cancelSendingBatchEmail() {
        this.showEmailSendingStatus = false;
    }

    authorizeNylas() {
        this.onAuthorizeNylas.emit();
    }

    selectTempalte(template) {
        this.emailTemplate = template;
        this.sendOfferEditor.setHtmlContent(template.body);
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

    async saveAsNewTemplate(templateName) {
        const saveTemplate = await this.internalService.createTemplateByName(
            templateName,
            {
                subject: this.emailTemplate.subject,
                body: this.sendOfferEditor.getHtmlContent(),
            },
            'emails',
        );

        this.subscriptions.push(
            saveTemplate.subscribe(result => {
                this.allTemplates = [...this.allTemplates, {
                    template_name: templateName,
                    subject: this.emailTemplate.subject,
                    body: this.sendOfferEditor.getHtmlContent(),
                }];
            })
        );
    }
}
