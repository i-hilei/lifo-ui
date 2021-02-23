import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CampaignService } from 'src/app/services/campaign.service';
import { LoadingSpinnerService } from 'src/app/services/loading-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignDetail } from 'src/types/campaign';
import { AngularFireAuth } from '@angular/fire/auth';
import { NotificationService, AlertType } from 'src/app/services/notification.service';
import { Influencer, InfluencerRecommendProfile, InfluencerRecommendBody, InfluencerStatus } from 'src/types/influencer';

import HelloSign from 'hellosign-embedded';
import { InternalService } from 'src/app/services/internal.service';
import { forkJoin, Subscription } from 'rxjs';
import { UtilsService } from '@src/app/services/util.service';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { environment } from '@src/environments/environment';
import { ShopifyService } from '@src/app/services/shopify.service';
import { ShopifyApplicationCharge } from '@src/types/brand';

@Component({
    selector: 'app-brand-campaign',
    templateUrl: './brand-campaign.component.html',
    styleUrls: ['./brand-campaign.component.scss'],
})
export class BrandCampaignComponent implements OnInit, OnDestroy {
    campaignId;
    campaign: CampaignDetail;
    isBrandView: boolean;
    campaignInfluencer: InfluencerRecommendBody[];
    recommendedInfluencer: InfluencerRecommendBody[];
    outreachInfluencer: InfluencerRecommendBody[];
    contractInfluencer: InfluencerRecommendBody[];
    reviewInfluencer: InfluencerRecommendBody[];

    selectedInfluencer: InfluencerRecommendBody[] = [];
    selectedReviewInfluencer: InfluencerRecommendBody;

    API_KEY = '1d21122d55d199d3a813b23eae0f14a8993fd65dc59b02ddb7161863e95fcd84';
    CLIENT_ID = 'ed13bd512148181319db3152c8749516';

    client = new HelloSign();

    chartData: any;

    currentView = 'discovery';
    currentViewCommons = 'overview';

    subscriptions: Subscription[] = [];

    infCampaignId = '';
    pendingCampaignPayment = false;

    constructor(
        private loadingService: LoadingSpinnerService,
        private campaignService: CampaignService,
        private internalService: InternalService,
        private shopifyService: ShopifyService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private auth: AngularFireAuth,
        private notification: NotificationService,
        private utilService: UtilsService,
        private analytics: AngularFireAnalytics,
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('id');
        this.analytics.logEvent('load_brand_campaign');
    }

    async ngOnInit() {
        this.loadingService.show();

        this.subscriptions.push(
            this.auth.idTokenResult.subscribe(idToken => {
                if (idToken && idToken.claims && idToken.claims.store_account === true) {
                    this.isBrandView = true;
                } else {
                    this.isBrandView = false;
                }
            })
        );

        const brandCampaign = await this.campaignService.getBrandCampaignById(this.campaignId);
        this.subscriptions.push(
            brandCampaign.subscribe(brandCampaign => {
                if (!environment.production) {
                    console.log(brandCampaign);
                }
                this.campaignInfluencer = brandCampaign.discovered_infs.filter(inf => JSON.stringify(inf.profile.influencer) !== '{}');

                // Get inf campaign
                let influencerCampaignDict = {};
                if (brandCampaign.brand_campaigns && brandCampaign.brand_campaigns.inf_campaign_dict) {
                    influencerCampaignDict = brandCampaign.brand_campaigns.inf_campaign_dict;
                }
                const recommendedInfluencer = [];
                const outreachInfluencer = [];
                const contractInfluencer = [];
                const reviewInfluencer = [];
                this.campaignInfluencer.forEach(influencer => {
                    const status = this.utilService.getInfluencerStatus(influencer);
                    influencer.profile.influencer.status = status;

                    // Assign inf campaign id
                    if (influencerCampaignDict[influencer.account_id]) {
                        influencer.inf_campaign_id = influencerCampaignDict[influencer.account_id];
                    }
                    if (status === InfluencerStatus.RECOMMENDED) {
                        recommendedInfluencer.push(influencer);
                    } else if (
                        status === InfluencerStatus.BRAND_CHOSEN || status === InfluencerStatus.OFFER_DECLIEND ||
                        status === InfluencerStatus.OFFER_SENT) {
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
                if (campaign.application_charge) {
                    if (campaign.application_charge.status !== 'accepted') {
                        this.pendingCampaignPayment = true;
                    }
                }
                this.campaign = campaign;
                this.loadingService.hide();
            })
        );

        // const brandROI = await this.brandService.getRoiPerInfluencer(this.campaignId);
        // brandROI.subscribe(result => {
        //     this.chartData = {
        //         revenue: {},
        //         visit: {},
        //     }
        // });
    }

    ngOnDestroy() {
        this.client.close();
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    async signupCampaign() {
        this.loadingService.show();
        const signupCampaign = await this.campaignService.signupCampaign(this.campaign);
        this.subscriptions.push(
            signupCampaign.subscribe(result => {
                this.loadingService.hide();
                if (result && result['campaign_id']) {
                    this.notification.addMessage({
                        type: AlertType.Success,
                        title: 'Signup Succeed',
                        message: 'Your have signed up for this campaign.',
                        duration: 3000,
                    });
                    // campaign_id
                    this.router.navigate([`/app/campaign/${result['campaign_id']}`]);
                } else if (result['status'] && result['status'] === 'already signed up') {
                    this.notification.addMessage({
                        type: AlertType.Warning,
                        title: 'Signup Failed',
                        message: 'Your have signed up for this campaign before.',
                        duration: 3000,
                    });
                }
            })
        );
    }

    async signContract(influencer) {
        this.subscriptions.push(
            this.campaignService.getSignUrlByEmail(this.campaignId, influencer.email).subscribe(url => {
                const embedUrl = url['embedded']['sign_url'];
                this.client.open(embedUrl, {
                    clientId: this.CLIENT_ID,
                    skipDomainVerification: true,
                });

                this.client.on('sign', (data) => {
                    // console.log('The document has been signed!');
                    // console.log(`Signature ID: ${  data.signatureId}`);
                    this.completeSign(data.signatureId, influencer);
                });
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

    async completeSign(signatureId, influencer) {
        const completeSign = await this.internalService.brandCompleteSign(this.campaignId, signatureId);

        this.subscriptions.push(
            completeSign.subscribe(result => {
                // let index = 0;
                // let moveInfluencer;

                // for (let i = 0; i < this.signingInfluencer.length; i ++) {
                //     if (this.signingInfluencer[i]['account_id'] === influencer.account_id) {
                //         index = i;
                //         moveInfluencer = this.signingInfluencer[i];
                //         if (moveInfluencer['inf_signing_status'] === 'pending contract signing') {
                //             moveInfluencer.profile.influencer.status = InfluencerStatus.PENDING_INFLUENCER_SIGNING;
                //         } else {
                //             moveInfluencer.profile.influencer.status = InfluencerStatus.CONTRACT_SIGNED;
                //         }
                //     }
                // }
                // this.signingInfluencer.splice(index, 1);
                // this.signedInfluencer.push(moveInfluencer);

                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Contract Signed',
                    message: 'Your have signed your contract.',
                    duration: 3000,
                });
            })
        );
    }

    async selectInfluencer(influencer: InfluencerRecommendBody) {
        let found = false;
        this.selectedInfluencer.forEach(inf => {
            if (inf.account_id === influencer.account_id) {
                found = true;
            }
        });
        if (!found) {
            this.selectedInfluencer.push(influencer);
        }
    }

    async getInfluencerObservable(influencer) {
        return;
    }

    chooseBatchInfluencer(influencers: InfluencerRecommendBody[]) {
        influencers.forEach(inf => {
            this.chooseInfluencer(inf);
        });
        this.currentView = 'outreach';
    }

    async chooseInfluencer(influencer) {
        const chooseInfluencer = await this.internalService.chooseInfluencer(this.campaignId, influencer.account_id);
        this.subscriptions.push(
            chooseInfluencer.subscribe(result => {
                let index = 0;
                let moveInfluencer;

                for (let i = 0; i < this.recommendedInfluencer.length; i ++) {
                    if (this.recommendedInfluencer[i]['account_id'] === influencer.account_id) {
                        index = i;
                        moveInfluencer = this.recommendedInfluencer[i];
                        moveInfluencer.profile.influencer.status = InfluencerStatus.BRAND_CHOSEN;
                    }
                }
                this.recommendedInfluencer.splice(index, 1);
                this.outreachInfluencer.push(moveInfluencer);
            })
        );
    }

    async chooseInfluencerAll() {
        this.selectedInfluencer.forEach(influencer => {
            this.chooseInfluencer(influencer);
        });

        this.notification.addMessage({
            type: AlertType.Success,
            title: 'Influencer Selected',
            message: 'Your have selected the influencer.',
            duration: 3000,
        });
        this.selectedInfluencer = [];
    }

    async downloadContract(influencer) {
        const download = await this.campaignService.downloadContract(influencer.brand_signature_id);

        this.subscriptions.push(
            download.subscribe(result => {
            })
        );
    }

    influencerContentReview(influencer: InfluencerRecommendBody) {
        this.currentView = 'review';
        this.selectedReviewInfluencer = influencer;
        this.infCampaignId = influencer.inf_campaign_id;
    }

    backToCampaign() {
        this.router.navigate(['/app/brand-home']);
    }

    viewPerformance() {
        this.currentView = 'performance';
    }

    payCampaign() {
        if (this.campaign.application_charge) {
            if (this.campaign.application_charge.confirmation_url) {
                window.location.href = this.campaign.application_charge?.confirmation_url;
            } else {
                this.subscriptions.push(
                    this.shopifyService.createCampaignPayment(
                        this.campaign.brand_id,
                        this.campaign.brand_campaign_id,
                        this.campaign.budget,
                    ).subscribe(result => {
                        if (result.application_charge) {
                            const applicationCharge = result.application_charge as ShopifyApplicationCharge;
                            if (!environment.production) {
                                console.log(applicationCharge);
                            }
                            window.location.href = applicationCharge.confirmation_url;
                        }
                    })
                );
            }
        }
    }

    get computeTotalValue() {
        let minPrice = 0;
        let maxPrice = 0;
        this.selectedInfluencer.forEach(inf => {
            minPrice += Number(inf.profile.minPrice);
            maxPrice += Number(inf.profile.maxPrice);
        });
        return `$${minPrice} - $${maxPrice}`;
    }

    get hasSelectedInfluencer() {
        return this.campaignInfluencer.length - this.recommendedInfluencer.length > 0;
    }

    get hasActiveInfluencer() {
        return this.campaignInfluencer.length > 0;
    }

    get allInfluencerInfNegotiation() {
        return this.contractInfluencer.length <= 0;
    }

    get hasPostedInfluencer() {
        return this.reviewInfluencer.length > 0;
    }
}
