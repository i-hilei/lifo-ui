import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CampaignDetail, CampaignRecruit } from 'src/types/campaign';
import { CampaignService } from 'src/app/services/campaign.service';
import { ActivatedRoute, Router } from '@angular/router';

import HelloSign from 'hellosign-embedded';
import { InternalService } from 'src/app/services/internal.service';
import { Influencer, InfluencerRecommendBody, InfluencerStatus } from 'src/types/influencer';
import { NotificationService, AlertType } from 'src/app/services/notification.service';
import { forkJoin, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PrepareContractComponent } from './prepare-contract-dialog/prepare-contract-dialog';
import { UtilsService } from '@src/app/services/util.service';
import { ShopifyService } from '@src/app/services/shopify.service';
import { environment } from '@src/environments/environment';

import * as moment from 'moment';

@Component({
    selector: 'app-internal-brand-campaign',
    templateUrl: './internal-brand-campaign.component.html',
    styleUrls: ['./internal-brand-campaign.component.scss'],
})
export class InternalBrandCampaignComponent implements OnInit, OnDestroy {
    @ViewChild('influencerView') influencerView;

    currentView = 'operation';

    campaignId;
    platform = 'instagram';
    campaign: CampaignDetail;
    campaignInfluencer: InfluencerRecommendBody[];
    recommendedInfluencer: InfluencerRecommendBody[];
    outreachInfluencer: InfluencerRecommendBody[];
    contractInfluencer: InfluencerRecommendBody[];
    reviewInfluencer: InfluencerRecommendBody[];

    campaignRecruit: CampaignRecruit;
    selectedRecruitVersion;

    API_KEY = '1d21122d55d199d3a813b23eae0f14a8993fd65dc59b02ddb7161863e95fcd84';
    CLIENT_ID = 'ed13bd512148181319db3152c8749516';

    client = new HelloSign();

    subscriptions: Subscription[] = [];
    campaign_menu_list = [
        {name:'one-outreach', title: 'Invitation', type: 'file-search'},
        {name:'negotiation', title: 'Chatbox', type: 'mail'},
        {name:'outreach', title: 'Outreach', type: 'mail'},
        {name:'contract', title: 'Contract', type: 'file-protect'},
        {name:'operation', title: 'Operation', type: 'setting'},
        {name:'performance', title: 'Performance', type: 'bar-chart'},
    ];

    constructor(
        private internalService: InternalService,
        private campaignService: CampaignService,
        private shopifyService: ShopifyService,
        private utilService: UtilsService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private notification: NotificationService,
        private dialog: MatDialog
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('id');
    }

    async ngOnInit() {
        this.getAllInflucners();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    async getShopInfo() {
        const shopName = 'meteneus.myshopify.com';
        const shop = await this.shopifyService.getShopifyShopInfo(shopName);
        const product = await this.shopifyService.getShopifyProductInfo(shopName);
        const customer = await this.shopifyService.getShopifyCustomerInfo(shopName);

        forkJoin([shop, product, customer]).subscribe((result) => {
            const [shopInfo, productInfo, customerInfoo] = result;
        });
    }

    async getAllInflucners() {
        const brandCampaign = await this.campaignService.getBrandCampaignById(this.campaignId);

        this.subscriptions.push(
            brandCampaign.subscribe(brandCampaign => {
                if (!environment.production) {
                    console.log(brandCampaign);
                }
                this.campaignInfluencer = brandCampaign.discovered_infs;

                // Get inf campaign
                let influencerCampaignDict = {};
                if (brandCampaign.brand_campaigns && brandCampaign.brand_campaigns.inf_campaign_dict) {
                    influencerCampaignDict = brandCampaign.brand_campaigns.inf_campaign_dict;
                }

                const recommendedInfluencer = [];
                const outreachInfluencer = [];
                const contractInfluencer = [];
                const reviewInfluencer = [];
                this.campaignInfluencer.forEach((influencer) => {
                    const status = this.utilService.getInfluencerStatus(influencer);
                    influencer.profile.influencer.status = status;

                    // Assign inf campaign id
                    if (influencerCampaignDict[influencer.account_id]) {
                        influencer.inf_campaign_id = influencerCampaignDict[influencer.account_id];
                    }
                    if (status === InfluencerStatus.RECOMMENDED) {
                        recommendedInfluencer.push(influencer);
                    } else if (
                        status === InfluencerStatus.BRAND_CHOSEN ||
                        status === InfluencerStatus.OFFER_DECLIEND ||
                        status === InfluencerStatus.OFFER_SENT
                    ) {
                        outreachInfluencer.push(influencer);
                    } else {
                        contractInfluencer.push(influencer);
                    }

                    if (status === InfluencerStatus.CONTRACT_SIGNED) {
                        reviewInfluencer.push(influencer);
                    }
                });
                this.recommendedInfluencer = recommendedInfluencer;
                this.outreachInfluencer = outreachInfluencer;
                this.contractInfluencer = contractInfluencer;
                this.reviewInfluencer = reviewInfluencer;

                const campaign = brandCampaign.brand_campaigns;
                const extraInfo = campaign['extra_info'];
                if (typeof extraInfo === 'string') {
                    campaign.extra_info = JSON.parse(extraInfo);
                }
                this.campaign = campaign;
                this.platform = campaign.platform.toLowerCase();
            })
        );

        this.subscriptions.push(
            this.internalService.getCampaignRecuritDetail(this.campaignId).subscribe(result => {
                this.campaignRecruit = result;
            })
        );
    }

    showNegotiation() {
        this.currentView = 'negotiation';
        this.getAllInflucners();
    }

    prepareSignRequest(influencer) {
        const dialogRef = this.dialog.open(PrepareContractComponent, {
            width: '850px',
            data: {
                influencer,
                campaign: this.campaign,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.createSignRequest(result, influencer);
            }
        });
    }

    async createSignRequest(signRequest, influencer) {
        signRequest['brand_campaign_id'] = this.campaignId;
        const signRequestP = await this.campaignService.createContractSign(signRequest);
        this.subscriptions.push(
            signRequestP.subscribe((url) => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Contract Created',
                    message: 'Contracts are ready to sign.',
                    duration: 3000,
                });
                for (let i = 0; i < this.campaignInfluencer.length; i++) {
                    if (this.campaignInfluencer[i]['account_id'] === influencer.account_id) {
                        this.campaignInfluencer[i].profile.influencer.status = InfluencerStatus.PENDING_SIGNING;
                    }
                }
            })
        );
    }

    async sendEmailToInf(influencer) {
        const sendEmail = await this.internalService.sendEmailWithTemplate(
            'Sign Contract',
            '<div><p>Hi $(receiver_name),</p><p><br></p><p>Your contract is ready. Please use the following link to sign the contract</p><p><a classname="e-rte-anchor" href="https://login.lifo.ai/sign-contract/$(brand_campaign_id)/$(receiver_name)" title="http://login.lifo.ai/sign-contract/$(brand_campaign_id)/$(receiver_name)">http://login.lifo.ai/sign-contract/$(brand_campaign_id)/$(receiver_name) </a></p><p><br></p><p>Yours,</p><p>$(sender_name)</p></div>',
            influencer.email,
            influencer.account_id,
            '',
            this.campaign.campaign_name,
            this.campaign.brand_campaign_id,
            influencer.account_id
        );
        this.subscriptions.push(
            sendEmail.subscribe((result) => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Contract Sent',
                    message: 'Contract has been sent to influencer side.',
                    duration: 3000,
                });
                this.sendEmailToBrand();
            })
        );
    }

    async sendEmailToBrand() {
        const sendEmail = await this.internalService.sendEmailToBrand(
            'Sign Contract',
            '<div><p>Hi $(receiver_name),</p><p><br></p><p>Your contract is ready. Please login to the console to sign the contract</p><p><br></p><p>Yours,</p><p>$(sender_name)</p></div>',
            this.campaign.contact_email,
            this.campaign.contact_name,
            '',
            this.campaign.campaign_name,
            this.campaign.brand_campaign_id
        );
        this.subscriptions.push(
            sendEmail.subscribe((result) => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Contract Sent',
                    message: 'Contract has been sent to brand side.',
                    duration: 3000,
                });
            })
        );
    }

    async signContract(influencer) {
        this.subscriptions.push(
            this.campaignService.getSignUrlByEmail(this.campaignId, influencer.inf_email).subscribe((url) => {
                const embedUrl = url['embedded']['sign_url'];

                this.client.open(embedUrl, {
                    clientId: this.CLIENT_ID,
                    skipDomainVerification: true,
                });

                this.client.on('sign', (data) => {
                    // console.log('The document has been signed!');
                    // console.log(`Signature ID: ${  data.signatureId}`);
                });
            })
        );
    }

    async refreshBrandInfo() {
        const shopName = 'meteneus.myshopify.com';
        const product = this.shopifyService.updateShopifyProductInfo(shopName);
        const customer = await this.shopifyService.updateShopifyCustomerInfo(shopName);

        forkJoin([product, customer]).subscribe((result) => {
            const [productInfo, customerInfoo] = result;
        });
    }

    goExploreTool() {
        this.router.navigate([`/internal/explore-tool/${this.campaignId}`]);
    }

    backToHome() {
        this.router.navigate(['/internal/home']);
    }

    viewPerformance() {
        this.currentView = 'performance';
    }

    influencerContentReview(influencer: InfluencerRecommendBody) {
        const influencerCampaignId = influencer.inf_campaign_id;
        this.router.navigate([`/internal/campaign/${influencerCampaignId}`]);
    }

    isShowDetails() {
        // console.log(this.campaignInfluencer, 5511111);
        this.influencerView.isModalVisible = true;
    }

    activatePayment() {
        this.shopifyService.activateCampaignPayment(this.campaign.brand_id, this.campaign.brand_campaign_id)
            .subscribe(result => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Payment Activated',
                    message: 'Campaign payment has been activated.',
                    duration: 3000,
                });
                this.campaign = {
                    ...this.campaign,
                    ...result,
                };
            });
    }

    selectRecruitVersion(version) {
        const inf_list = this.campaignRecruit.campaign.invitations[version].invited_ins_influencers;

        this.outreachInfluencer = this.campaignInfluencer.filter(inf => {
            if (inf_list.indexOf(inf.account_id) >= 0) {
                if (
                    inf.profile.influencer.status === InfluencerStatus.BRAND_CHOSEN ||
                    inf.profile.influencer.status === InfluencerStatus.OFFER_DECLIEND ||
                    inf.profile.influencer.status === InfluencerStatus.OFFER_SENT
                ) {
                    return true;
                }
            }
            return false;
        });
    }

    getRecruitDisplay(batch) {
        return `Batch on ${moment(batch.key * 1000).format('L')} (${batch.value.invited_ins_influencers.length} influencers)`;
    }
}
