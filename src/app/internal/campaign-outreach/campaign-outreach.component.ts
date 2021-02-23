import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { CampaignDetail, CampaignConfiguration, CampaignRecruit, ShopifyProduct, ShopifyProductDetail } from 'src/types/campaign';
import { Influencer } from 'src/types/influencer';
import { Router, ActivatedRoute } from '@angular/router';
import { CampaignService } from 'src/app/services/campaign.service';
import { InternalService } from 'src/app/services/internal.service';
import { environment } from '@src/environments/environment';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { ShopifyService } from '@src/app/services/shopify.service';
import { Subscription } from 'rxjs';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import * as moment from 'moment';
import * as dayjs from 'dayjs';
import { ProgressLoadingConfig, ProgressLoadingService } from '@services/progress-loading.service';
@Component({
    selector: 'app-campaign-outreach',
    templateUrl: './campaign-outreach.component.html',
    styleUrls: ['./campaign-outreach.component.scss'],
})
export class CampaignOutreachComponent implements OnInit, OnDestroy {
    @Input() campaign: CampaignDetail;
    @Input() campaignRecruit: CampaignRecruit;

    @ViewChild('newList') newList;
    @ViewChild('listLabel') listLabel;

    campaignId;
    platform = 'instagram';
    isShowCreateBtn = true;

    allChecked = false;
    indeterminate = false;
    influencerList = [];

    campaignConfiguration: CampaignConfiguration;
    tempConfiguration: CampaignConfiguration;
    invitationProfileSimple = [];
    discoveryProfileSimple = [];
    displayedInvitationProfileSimple = [];
    fullProfileMap = {};

    allNumbers = 0;

    showInvitationModal = false;
    isCalculatingCommission = false;
    isSendingInvitation = false;

    subscriptions: Subscription[] = [];

    sortFunctions = {
        follower_cnts: (a, b) => a.follower_cnts - b.follower_cnts,
        fake_percentage: (a, b) => a.fake_percentage - b.fake_percentage,
        avg_likes: (a, b) => a.avg_likes - b.avg_likes,
        engagement_rate: (a, b) => a.engagement_rate - b.engagement_rate,
        commission_dollar: (a, b) => a.commission_dollar - b.commission_dollar,
        bonus_dollar: (a, b) => a.bonus_dollar - b.bonus_dollar,
    };

    nameSort = (a, b) => {
        return String(a.name).localeCompare(String(b.name));
    };

    is_discoverable: false;
    showDiscoveryModal = false;

    startPostTimeValue = '';
    postTimeValue = '';
    endTimeValue = '';
    percentageValue = '';
    labelTagList = [];
    attributesArr = [];
    platformArr = [];
    contentArr = [];
    payUpfrontValue = false;

    searchVisible: boolean = false;
    searchValue: string;
    productNameValue = '';
    productPriceValue = '';
    productUrlValue = '';
    brandNameValue = '';
    campaignNameValue = '';
    couponCodeValue = '';
    discountValue = 0;

    filter = {
        min_followers: null,
        max_followers: null,
        min_fake_follower_rate: null,
        max_fake_follower_rate: null,
        min_engagement_rate: null,
        max_engagement_rate: null,
        registered_only: false,
    };

    newProduct;
    productList: ShopifyProductDetail[] = [];
    currentProductList: ShopifyProductDetail[] = [];

    get allSelected() {
        return (this.invitationProfileSimple || []).every((item) => item.checked);
    }

    set allSelected(selected: boolean) {
        (this.invitationProfileSimple || []).forEach((item) => (item.checked = selected));
    }

    constructor(
        public router: Router,
        private shopifyService: ShopifyService,
        public campaignService: CampaignService,
        public internalService: InternalService,
        private activatedRoute: ActivatedRoute,
        public loadingService: LoadingSpinnerService,
        private notificationService: NotificationService,
        private progressLoadingService: ProgressLoadingService
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('id');
    }

    updateAllChecked(): void {
        if (this.allChecked) {
            this.influencerList = this.influencerList.map((item) => {
                return {
                    ...item,
                    checked: true,
                };
            });
        } else {
            this.influencerList = this.influencerList.map((item) => {
                return {
                    ...item,
                    checked: false,
                };
            });
        }
    }

    updateSingleChecked(val): void {
        if (this.influencerList.some((item) => !item.checked)) {
            this.allChecked = false;
        } else if (this.influencerList.every((item) => item.checked)) {
            this.allChecked = true;
        }
    }

    ngOnInit() {
        setTimeout(() => {
            if (this.campaign.offer_detail && this.campaign.offer_detail.compensate_method) {
                this.isShowCreateBtn = false;
            } else {
                this.isShowCreateBtn = true;
            }
        }, 500);
        this.getProductList();
        this.getLabelList(this.campaignId);
        this.loadInfluencerList();
        this.loadDefaultSetting();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    isShowListLabel(ids) {
        // console.log(ids);
        this.listLabel.listId = ids;
        this.listLabel.showModal();
    }

    getData(msg) {
        this.getLabelList(msg);
    }

    getLabelList(id) {
        const attributes = [];
        const platform = [];
        const content = [];
        this.attributesArr = [];
        this.platformArr = [];
        this.contentArr = [];
        this.subscriptions.push(
            this.campaignService.getLabelAllCampaign(id).subscribe((result) => {
            //   console.log(result, 'list');
              this.labelTagList = result;
              for (const item of this.labelTagList) {
                if (item.type === 'attributes') {
                    attributes.push(item);
                  } else if (item.type === 'platform') {
                    platform.push(item);
                  } else if (item.type === 'content') {
                    content.push(item);
                  }
            }
            this.attributesArr = this.calChildren(attributes);
            this.platformArr = this.calChildren(platform);
            this.contentArr = this.calChildren(content);

            }, err => {})
          );
    }

    calChildren(arr) {
        const filtParent = arr.filter(function (x) {
          return x.parent === null;
        });
        const filtChild = arr.filter(function (x) {
          return x.parent !== null;
        });
       for (const k of filtParent) {
         k.children = [];
         for (const j of filtChild) {
            if (j.parent === k.id ) {
              k.children.push(j);
              // console.log(j,555)
             }
           }
        }
       return filtParent;
     }

    loadDefaultSetting() {
        this.subscriptions.push(
            this.internalService.getGlobalList().subscribe(
                (result) => {
                    if (this.campaign.platform) {
                        this.platform = this.campaign.platform.toLowerCase();
                    }
                    if (!this.campaign.hasOwnProperty('is_discoverable') || !this.campaign.is_discoverable) {
                        this.campaign.is_discoverable = false;
                    }
                    if (this.campaign.hasOwnProperty('initial_payment_percentage')) {
                        this.percentageValue = String(this.campaign.initial_payment_percentage);
                    }
                    if (this.campaign.hasOwnProperty('has_initial_payment')) {
                        this.payUpfrontValue = this.campaign.has_initial_payment;
                    }
                    if (this.campaign.hasOwnProperty('post_time') ) {
                        this.postTimeValue = dayjs(this.campaign.post_time * 1000).format('YYYY-MM-DD HH:mm');
                    }
                    if (this.campaign.hasOwnProperty('start_post_time') ) {
                        this.startPostTimeValue = dayjs(this.campaign.start_post_time * 1000).format('YYYY-MM-DD HH:mm');
                    }
                    if (this.campaign.hasOwnProperty('end_time') ) {
                        this.endTimeValue = dayjs(this.campaign.end_time).format('YYYY-MM-DD HH:mm');
                    }
                    if (this.campaign.hasOwnProperty('product_name')) {
                        this.productNameValue = this.campaign.product_name;
                    }
                    if (this.campaign.hasOwnProperty('product_price')) {
                        this.productPriceValue = String(this.campaign.product_price);
                    }
                    if (this.campaign.hasOwnProperty('product_url')) {
                        this.productUrlValue = this.campaign.product_url;
                    }
                    if (this.campaign.hasOwnProperty('brand')) {
                        this.brandNameValue = this.campaign.brand;
                    }
                    if (this.campaign.hasOwnProperty('campaign_name')) {
                        this.campaignNameValue = this.campaign.campaign_name;
                    }
                    if (this.campaign.hasOwnProperty('campaign_coupon_code')) {
                        this.couponCodeValue = this.campaign.campaign_coupon_code;
                    }
                    if (this.campaign.hasOwnProperty('coupon_discount_percentage')) {
                        this.discountValue = this.campaign.coupon_discount_percentage;
                    }

                    if (this.campaign && this.campaign.configuration) {
                        this.campaignConfiguration = this.campaign.configuration;
                        this.tempConfiguration = this.campaign.configuration;
                    } else {
                        this.campaignConfiguration = result as CampaignConfiguration;
                        this.tempConfiguration = result as CampaignConfiguration;
                        this.campaignConfiguration.quota = this.campaign.number_of_posts;
                    }
                },
                (error) => {}
            )
        );
    }

    loadInfluencerList() {
        const count_list = [];
        this.subscriptions.push(
            this.campaignService.getInfluencerList().subscribe((result) => {
                for (const i of result) {
                    i['checked'] = false;
                    i['indeterminate'] = false;
                    i['isShowed'] = false;
                    i['sublist'] = [];
                    i['ins_list'].forEach(inf => {
                        if (count_list.indexOf(inf) < 0) {
                            count_list.push(inf);
                        }
                    });
                }
                this.allNumbers = count_list.length;
                this.influencerList = result;
                if (!environment.production) {
                    console.log(this.influencerList);
                }
            })
        );
    }

    reviewCommission() {
        this.showDiscoveryModal = false;
        this.subscriptions.push(
            this.campaignService.reviewCommission({
                max_commission: this.campaignConfiguration.max_base_commission,
                bonus_percentage: this.campaignConfiguration.fast_delivery_bonus,
                cpm: this.campaignConfiguration.cpm,
                product_price: this.campaign.product_price,
            }).subscribe((result) => {
                this.discoveryProfileSimple = [...result];
                this.showDiscoveryModal = true;
            })
        );
    }

    postTimeOnChange(result: Date): void {
        // console.log('Selected Time: ', result);
    }

    postTimeOnOk(result: Date | Date[] | null): void {
        // console.log('onOk', result);
    }

    campaignSave() {
        this.loadingService.show();
        const newCampaignBody:any = {
            initial_payment_percentage: Number(this.percentageValue),
            has_initial_payment: this.payUpfrontValue,
            product_name: this.productNameValue,
            product_price: Number(this.productPriceValue),
            product_url: this.productUrlValue,
            brand: this.brandNameValue,
            campaign_name: this.campaignNameValue,
            configuration: this.campaignConfiguration,
            campaign_coupon_code: this.couponCodeValue,
            coupon_discount_percentage: this.discountValue,
        };
        if (this.startPostTimeValue) {
            newCampaignBody.start_post_time = Number(moment(this.startPostTimeValue).unix());
        }
        if (this.postTimeValue) {
            newCampaignBody.post_time = Number(moment(this.postTimeValue).unix());
        }
        this.campaignService
            .updateCommonCampaign(
                newCampaignBody,
                this.campaignId
            )
            .then((result) => {
                this.loadingService.hide();
                this.startCampaignRecruit({}, {}, this.campaignConfiguration);
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Update Campaign',
                    message: 'Updata campaign information has been saved.',
                    duration: 3000,
                });
            });
    }

    turnOnConfirm(is_discoverable: boolean) {
        this.campaignService
            .updateCommonCampaign(
                {
                    end_time: moment(this.endTimeValue).format(),
                    is_discoverable,
                    discover_configuration: this.campaignConfiguration,
                    configuration: this.campaignConfiguration,
                },
                this.campaignId
            )
            .then((result) => {
                this.campaign.is_discoverable = is_discoverable;
                if (is_discoverable) {
                    this.startCampaignRecruit({}, {}, this.campaignConfiguration);
                }
                this.showDiscoveryModal = false;
            });
    }

    selectAllList() {
        const isCheck = this.influencerList.every((value) => value['checked']);
        for (const i of this.influencerList) {
            if (!isCheck) {
                i['checked'] = true;
                this.allChecked = true;
            } else {
                i['checked'] = false;
                this.allChecked = false;
            }
        }
    }

    async showSubList(key) {
        if (key['ins_list'].length !== 0) {
            if (key['sublist'].length === 0) {
                for (const i of key['ins_list'].slice(0, 5)) {
                    const getInfluencer = await this.internalService.getInfluencerProfile(i);
                    getInfluencer.subscribe((result) => {
                        result.checked = true;
                        key['sublist'] = [...key['sublist'], result];
                    });
                }
            }
            key.isShowed = !key.isShowed;
            if (key.isShowed) {
                key.checked = true;
            } else {
                key.checked = false;
            }
        }
    }

    openInsPage(influencer) {
        window.open(influencer.profile.url, '_blank');
    }

    invitationRouter() {
        this.router.navigate(['/internal/create-invitation'], {
            queryParams: {
                id: this.campaignId,
            },
        });
    }

    editInfluencerList(list) {
        this.router.navigate([`/internal/influencer-discovery/${this.campaignId}/${list.id}`]);
    }

    previewInvitation() {
        window.open(`/internal/campaign-invitation/${this.campaignId}`, '_blank');
    }

    getEmailAddress(influencer: Influencer) {
        if (influencer.register_email) {
            return influencer.register_email;
        }
        let email = '';
        if (influencer.contacts) {
            influencer.contacts.forEach((contact) => {
                if (contact.type === 'email') {
                    email = contact.value;
                }
            });
        }
        return email;
    }

    simplifyInfluencerProfile(influencer: Influencer) {
        return {
            audience: influencer.audience,
            contacts: influencer.contacts,
            city: influencer.city,
            country: influencer.country,
            gender: influencer.gender,
            ageGroup: influencer.ageGroup,
            hashtags: influencer.hashtags,
            popularPosts: influencer.popularPosts ? influencer.popularPosts.slice(0, 3) : [],
            sponsoredPosts: influencer.sponsoredPosts ? influencer.sponsoredPosts.slice(0, 3) : [],
            profile: influencer.profile,
            recentPosts: influencer.recentPosts ? influencer.recentPosts.slice(0, 3) : [],
            stats: influencer.stats,
            userId: influencer.userId,
        };
    }

    cancelDiscoveryModel() {
        this.showDiscoveryModal = false;
    }

    showInvitations() {
        this.isCalculatingCommission = true;

        // Step one: get all selected influencer
        const ins_list = [];
        this.influencerList.forEach((list) => {
            if (list.checked) {
                list.ins_list.forEach((inf) => {
                    if (ins_list.indexOf(inf) < 0) {
                        ins_list.push(inf);
                    }
                });
            }
        });

        // Step two: pull list
        const config: ProgressLoadingConfig = {
            title: 'Pulling Data',
            message: 'Pulling influencers data %1',
            completedCount: 0,
            totalSize: ins_list.length,
        };
        if (ins_list.length > 50) {
            this.progressLoadingService.showProgress(config);
        }

        this.internalService
            .getBachInfluencerProfileStepByStep(
                ins_list,
                (num) => (config.completedCount = num),
                this.platform,
            )
            .then((result) => {
                const invitationProfileSimple = [];
                this.fullProfileMap = result;
                Object.keys(result).forEach((id) => {
                    invitationProfileSimple.push({
                        inf_id: id,
                        follower_cnts: result[id].profile.followers,
                        profile: result[id].profile,
                        fake_percentage: 1 - result[id].audience.credibility,
                        engagement_rate: result[id].profile.engagementRate,
                        avg_likes: result[id].stats?.avgLikes?.value,
                        email: this.getEmailAddress(result[id]),
                        is_registered: result[id].is_registered,
                        complete_campaign: result[id].complete_campaign,
                        in_campaign: result[id].in_campaign,
                        in_list: result[id].in_list,
                    });
                });
                this.subscriptions.push(
                    this.internalService
                        .calculateCommission(
                            invitationProfileSimple,
                            this.tempConfiguration.max_base_commission,
                            this.tempConfiguration.fast_delivery_bonus,
                            this.campaign.unit_cost,
                            this.tempConfiguration.cpm
                        )
                        .subscribe((result) => {
                            for (let i = 0; i < result.length; i++) {
                                invitationProfileSimple[i].commission_dollar = result[i].commission_dollar;
                                invitationProfileSimple[i].bonus_dollar = result[i].bonus_dollar;
                                invitationProfileSimple[i].checked = true;
                            }
                            if (environment.production) {
                                console.log(this.invitationProfileSimple);
                            }
                            this.invitationProfileSimple = invitationProfileSimple;
                            this.displayedInvitationProfileSimple = invitationProfileSimple;
                            this.showInvitationModal = true;
                            this.isCalculatingCommission = false;
                            this.progressLoadingService.hideProgress();
                        })
                );
            })
            .catch((err) => {
                this.notificationService.addMessage({
                    type: AlertType.Error,
                    title: 'Pull Profile Error',
                    message: err,
                    duration: 3000,
                });
                this.progressLoadingService.hideProgress();
                this.isCalculatingCommission = false;
            });
    }

    async sendInviations() {
        this.isSendingInvitation = true;
        const emailMap = {};
        const commissionMap = {};

        this.displayedInvitationProfileSimple.forEach((inf) => {
            if (inf.checked) {
                emailMap[inf.inf_id] = inf.email;
                commissionMap[inf.inf_id] = inf.commission_dollar;
            }
        });

        const influencer_list = this.displayedInvitationProfileSimple
            .filter((inf) => {
                return inf.checked;
            })
            .map((inf) => {
                return {
                    email: inf.email,
                    account_id: inf.inf_id,
                    platform: this.platform,
                    influencer: this.simplifyInfluencerProfile(this.fullProfileMap[inf.inf_id]),
                };
            });

        // This takes longer Also need to do in batch

        for (let i = 0; i < influencer_list.length; i += 50) {
            const sub_list = influencer_list.slice(i, i + 50);
            await this.internalService.addRecommendedInfluencerPromise(this.campaignId, sub_list);
        }

        this.startCampaignRecruit(commissionMap, emailMap, this.tempConfiguration);
    }

    calculateInvDeadline() {
        return dayjs().add(this.tempConfiguration.offer_expiration_time, 'hour').format('MMMM DD, HH:mm');
    }

    startCampaignRecruit(commissionMap, emailMap, configuration) {
        this.internalService
            .startCampaignRecruitPromise(
                this.campaign.brand_campaign_id,
                this.campaignConfiguration.quota,
                commissionMap,
                emailMap,
                configuration.fast_delivery_bonus,
                this.campaignConfiguration.fast_deliver_window,
                this.campaignConfiguration.delivery_deadline,
                new Date().getTime() / 1000 + this.tempConfiguration.offer_expiration_time * 3600
            )
            .then((result) => {
                this.showInvitationModal = false;
                this.isSendingInvitation = false;
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Create Campaign Recruit',
                    message: 'Campaign recruitment created for all influencers',
                    duration: 3000,
                });
            })
            .catch((error) => {
                console.warn(error);
            });
    }

    cancelSendInvitaion() {
        this.showInvitationModal = false;
    }

    isShowList() {
        this.newList.names = '';
        this.newList.isVisible = true;
    }

    createList(msg) {
        this.subscriptions.push(
            this.campaignService
                .setInfluencer({
                    name: msg.name,
                    ins_list: [],
                    platform: msg.platform,
                })
                .subscribe((result) => {
                    this.loadInfluencerList();
                    this.newList.isConfirmLoading = false;
                    this.newList.isVisible = false;
                })
        );
    }

    createPriceRule() {
        this.subscriptions.push(
            this.shopifyService
                .createPriceRule(
                    this.campaign.brand_id,
                    this.campaign.brand_campaign_id,
                    this.campaign.coupon_discount_percentage,
                    this.campaign.product_id
                )
                .subscribe((result) => {
                    this.notificationService.addMessage({
                        type: AlertType.Success,
                        title: 'Price rule created',
                        message: 'Price rule has been created!',
                        duration: 3000,
                    });
                })
        );
    }

    search() {
        this.searchVisible = false;
        this.displayedInvitationProfileSimple = this.invitationProfileSimple.filter(
            (item) => item.profile.username.indexOf(this.searchValue) !== -1
        );
    }

    filterInfluencers() {
        this.displayedInvitationProfileSimple = this.invitationProfileSimple.filter(
            (item) => {
                if (this.filter.min_followers && item.follower_cnts < this.filter.min_followers) {
                    return false;
                }
                if (this.filter.max_followers && item.follower_cnts > this.filter.max_followers) {
                    return false;
                }
                if (this.filter.min_fake_follower_rate && item.fake_percentage * 100 < this.filter.min_fake_follower_rate) {
                    return false;
                }
                if (this.filter.max_fake_follower_rate && item.fake_percentage * 100 > this.filter.max_fake_follower_rate) {
                    return false;
                }
                if (this.filter.min_engagement_rate && item.engagement_rate * 100 < this.filter.min_engagement_rate) {
                    return false;
                }
                if (this.filter.max_engagement_rate && item.engagement_rate * 100 > this.filter.max_engagement_rate) {
                    return false;
                }
                if (this.filter.registered_only && !item.is_registered) {
                    return false;
                }
                return true;
            }
        );
    }

    resetFilters() {
        this.filter = {
            min_followers: null,
            max_followers: null,
            min_fake_follower_rate: null,
            max_fake_follower_rate: null,
            min_engagement_rate: null,
            max_engagement_rate: null,
            registered_only: false,
        };
        this.displayedInvitationProfileSimple = this.invitationProfileSimple;
    }

    resetSearch() {
        this.searchValue = '';
        this.search();
    }

    getProductList() {

        this.subscriptions.push(
            this.shopifyService.updateShopifyProductInfo(this.campaign.brand_id).subscribe(
                (result) => {
                    if (!environment.production) {
                        console.log(result);
                    }
                    if (result && result.products) {
                        this.productList = result.products;
                        console.log(this.campaign.product_id);

                    }
                    let currentProductList = [];
                    if (this.campaign.product_list) {
                        currentProductList = this.campaign.product_list;
                    } else if (this.campaign.product_id) {
                        if (this.productList.find(product => product.id === this.campaign.product_id)) {
                            currentProductList = [this.productList.find(product => product.id === this.campaign.product_id)];
                        }
                    }
                    this.currentProductList = currentProductList;
                },
                (error) => {}
            )
        );
    }

    addProduct() {
        const existing = this.productList.find(product => product.id === this.newProduct);
        if (existing) {
            this.currentProductList.push(existing);
            this.updateProductList();
        } else {
            this.campaignService.searchShopifyValue(this.campaign.brand_id, this.newProduct).subscribe(result => {
                if (result.products) {
                    this.currentProductList.push(result.products[0]);
                    this.updateProductList();
                }
            });
        }
    }

    deleteProduct(index) {
        this.currentProductList.splice(index, 1);
        this.updateProductList();
    }

    deleteVariant(product, index) {
        product.variants.splice(index, 1);
        this.updateProductList();
    }

    updateProductList() {
        this.campaignService.updateCommonCampaign({
            product_list: this.currentProductList,
        }, this.campaign.brand_campaign_id).then(res => {
            this.notificationService.addMessage({
                type: AlertType.Success,
                title: 'Update Campaign',
                message: 'Updata campaign information has been saved.',
                duration: 3000,
            });
        });
    }
}
