import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ShopifyService } from '@src/app/services/shopify.service';
import { InternalService } from '@src/app/services/internal.service';
import { CampaignDetail, CampaignRecruit, CampaingRecuritStatus, ShopifyProduct, ShopifyProductDetail } from '@src/types/campaign';
import { InfluencerRecommendBody } from '@src/types/influencer';
import { Subscription } from 'rxjs';
import * as dayjs from 'dayjs';
import { UtilsService } from '@services/util.service';
import { environment } from '@src/environments/environment';

@Component({
    selector: 'app-campaign-operation',
    templateUrl: './campaign-operation.component.html',
    styleUrls: ['./campaign-operation.component.scss'],
})
export class CampaignOperationComponent implements OnInit, OnDestroy {
    @Input() influencers: InfluencerRecommendBody[];
    @Input() campaign: CampaignDetail;
    @Input() campaignRecruit: CampaignRecruit;

    productList: ShopifyProductDetail[] = [];
    subscriptions: Subscription[] = [];

    campaignRecruitStatus: CampaingRecuritStatus;
    recruitedInfluencers = [];
    invitedInfluencers = [];
    appliedInfluencers = [];

    showEditInvitation = false;
    editInfluencer;

    searchValue = '';
    recruitSearchValue = '';
    recruitVisible = false;
    visible = false;

    showAcceptApplication = false;
    showSkipApplication = false;
    acceptInfluencer;

    listOfStatus = [
        { text: 'Commission Paid', value: 'Commission Paid' },
        { text: 'Pending Payment', value: 'Pending Payment' },
        { text: 'Post Pending', value: 'Post Pending' },
        { text: 'Review Draft', value: 'Review Draft' },
        { text: 'Content Pending', value: 'Content Pending' },
        { text: 'In Shipping', value: 'In Shipping' },
        { text: 'To be Shipped', value: 'To be Shipped' },
        { text: 'Order to be Created', value: 'Order to be Created' },
    ];

    constructor(private shopifyService: ShopifyService, private internalService: InternalService, private utilService: UtilsService) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.shopifyService.updateShopifyProductInfo(this.campaign.brand_id).subscribe((products) => {
                this.productList = products?.products as ShopifyProductDetail[];
            })
        );
        if (this.campaignRecruit.campaign) {
            this.campaignRecruitStatus = this.campaignRecruit.campaign;
        }
        if (this.campaignRecruit.influencers) {
            const influencer_invitations = this.campaignRecruit.influencers;

            this.influencers.forEach((inf) => {
                influencer_invitations.forEach((inv) => {
                    if (inf.account_id === inv.inf_id) {
                        inf.invitation = inv;
                    }
                });

                if (inf.application_time) {
                    inf.source = 'Discovery';
                } else {
                    inf.source = 'Invitation';
                }

                // Handle error
                if (!inf.invitation && inf.offer_accept_time) {
                    inf.invitation = {
                        status: 'Accepted',
                    };
                }

                inf.status = this.getStatus(inf);
            });
            this.recruitedInfluencers = this.influencers.filter((inf) => inf.invitation && inf.offer_accept_time);
            this.invitedInfluencers = this.influencers.filter((inf) => inf.invitation && !inf.offer_accept_time && !inf.application_time);
            this.appliedInfluencers = this.influencers.filter((inf) => !inf.invitation && !inf.offer_accept_time && inf.application_time && inf.profile.influencer?.userId);
            if (!environment.production) {
                console.log('recruited', this.recruitedInfluencers);
                console.log('invited', this.invitedInfluencers);
                console.log('applied', this.appliedInfluencers);
            }
        }

        this.subscriptions.push(
            this.internalService.getCampaignRecuritDetail(this.campaign.brand_campaign_id).subscribe((status) => {
                console.log(status);
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    openInsPage(influencer) {
        event.stopPropagation();
        window.open(influencer.profile.url, '_blank');
    }

    countInvitationBonus(invitation) {
        return (invitation?.commission * Number(invitation?.bonus)) / 100;
    }

    deadlineBlur(value: string) {
        this.editInfluencer.invitation.inv_deadline = dayjs(value).unix();
    }

    editInvitation(influencer) {
        this.showEditInvitation = true;
        this.editInfluencer = influencer;
    }

    updateInvitation() {
        this.subscriptions.push(
            this.internalService.updateInvitation(this.editInfluencer.account_id, this.editInfluencer.invitation).subscribe((result) => {
                this.showEditInvitation = false;
            })
        );
    }

    canceleditInvitation() {
        this.showEditInvitation = false;
    }

    getStatus(influencer: InfluencerRecommendBody) {
        if (!influencer) {
            return 'Unknown';
        }
        if (influencer.commission_paid_time) {
            return 'Commission Paid';
        }
        if (influencer.submit_post_time) {
            return 'Pending Payment';
        }
        if (influencer.content_approve_time) {
            return 'Post Pending';
        }
        if (influencer.content_submit_time) {
            return 'Review Draft';
        }
        if (influencer.product_received_time) {
            return 'Content Pending';
        }
        if (influencer.product_ship_time) {
            return 'In Shipping';
        }
        if (influencer.order) {
            return 'To be Shipped';
        }
        if (influencer.offer_accept_time) {
            return 'Order to be Created';
        }
        return 'Pending';
    }

    get getRecruitedInfluencerSize() {
        return this.campaignRecruitStatus?.recruited_influencers
            ? Object.keys(this.campaignRecruitStatus?.recruited_influencers).length
            : 0;
    }

    get getAcceptedInfluencerSize() {
        return this.recruitedInfluencers.filter(inf => inf.application_time).length;
    }

    get getTotalCommission() {
        let total = 0;
        this.recruitedInfluencers.forEach((inf) => {
            if (inf.accept_commission) {
                total += Number(inf.accept_commission);
                total += Number(inf.accept_bonus);
            }
        });
        return total;
    }

    get getTotalFollowers() {
        let total = 0;
        this.recruitedInfluencers.forEach((inf) => {
            total += inf.profile.influencer.profile.followers;
        });
        return total;
    }

    get getCampaignDeadline() {
        return dayjs(this.campaign.end_time).format('MM/DD/YYYY');
    }

    sortByStatus = (a, b) => a.status.localeCompare(b.status);
    sortBySource = (a, b) => a.source.localeCompare(b.source);
    filterByStatus = (list, inf) => list.some(status => inf.status === status);
    reset(): void {
        this.searchValue = '';
        this.search();
    }

    search(): void {
        this.visible = false;
        this.invitedInfluencers = this.influencers
            .filter((inf) => inf.invitation && !inf.offer_accept_time && !inf.application_time)
            .filter((item) => item.account_id.toLocaleLowerCase().indexOf(this.searchValue.toLocaleLowerCase()) !== -1);
    }

    resetRecruit() {
        this.recruitSearchValue = '';
        this.searchRecruit();
    }

    searchRecruit() {
        this.recruitVisible = false;
        this.recruitedInfluencers = this.influencers
            .filter((inf) => inf.invitation && inf.offer_accept_time)
            .filter((item) => item.account_id.toLocaleLowerCase().indexOf(this.recruitSearchValue.toLocaleLowerCase()) !== -1);
    }

    download() {
        const header = [
            'Name',
            'IG handle', // account_id
            'Follower #', // profile.influencer.profiel.followers
            'Commission', // invitation.commission
            'Bonus', // invitation.bonus
            'Full Name',
            'Address', // address1, 2, city, province, zip, country
            'Email', // email
            'Phone Number', // inf_phone
            'Product Variants', // variant_id
            'Status', // status
            'Post URL', // post url
            'Payment Amount', // payment
            'Content draft',
        ];

        const dataToConvert = [];
        this.recruitedInfluencers.forEach((influencer) => {
            const itemToAdd = [];
            itemToAdd.push(influencer.profile?.influencer?.profile?.fullname);
            itemToAdd.push(influencer.account_id);
            itemToAdd.push(influencer.profile?.influencer?.profile?.followers);
            itemToAdd.push(influencer.invitation?.commission);
            itemToAdd.push(influencer.invitation?.bonus);
            const fullName = `${influencer.inf_name} ${influencer.inf_last_name}`;
            itemToAdd.push(fullName);
            const address =
                `${influencer.influencer_address1}, ${influencer.influencer_address2 ? `${influencer.influencer_address2}, ` : ''}` +
                `${influencer.influencer_city}, ${influencer.influencer_province},  ${influencer.influencer_zip}, ${influencer.influencer_country}`;
            itemToAdd.push(address);
            itemToAdd.push(influencer.email);
            itemToAdd.push(influencer.inf_phone);
            itemToAdd.push(influencer.variant_id ? influencer.variant_id : '');
            itemToAdd.push(influencer.status);
            itemToAdd.push(influencer.post_url);
            itemToAdd.push(influencer.commission_paid_amount ? influencer.commission_paid_amount : 0);
            dataToConvert.push(itemToAdd);
        });

        const data = [header, ...dataToConvert];

        const convertedData = data.map((rowArr) => rowArr.map((str) => (str ? `"${str}"` : '')).join(',')).join('\n');
        this.utilService.downloadFile(convertedData, `recrutied-influencers-${this.campaign.brand_campaign_id}.csv`);
    }

    startAcceptApplication(influencer) {
        this.showAcceptApplication = true;
        this.acceptInfluencer = influencer;
    }

    cancelAcceptApplication() {
        this.showAcceptApplication = false;
    }

    acceptApplication() {
        this.internalService.acceptCampaignApplication(
            this.campaign.brand_campaign_id,
            this.acceptInfluencer.account_id,
            this.campaign.product_name,
            this.acceptInfluencer.email
        ).then(result => {
            console.log(result);
            this.showAcceptApplication = false;

            let index = -1;
            for (let i = 0; i < this.appliedInfluencers.length; i ++) {
                if (this.appliedInfluencers[i].account_id === this.acceptInfluencer.account_id) {
                    index = i;
                }
            }
            this.appliedInfluencers.splice(index, 1);
            this.appliedInfluencers = [
                ...this.appliedInfluencers,
            ];
            this.recruitedInfluencers.push(this.acceptInfluencer);
            this.recruitedInfluencers = [
                ...this.recruitedInfluencers,
            ];
        });
    }

    startSkipApplication(influencer) {
        this.showSkipApplication = true;
        this.acceptInfluencer = influencer;
    }

    cancelSkipApplication() {
        this.showSkipApplication = false;
    }

    skipApplication() {
        this.internalService.skipCampaignApplication(
            this.campaign.brand_campaign_id,
            this.acceptInfluencer.account_id,
        ).then(result => {
            this.showSkipApplication = false;
            this.acceptInfluencer.application_decline_time = dayjs().unix();
        });
    }
}
