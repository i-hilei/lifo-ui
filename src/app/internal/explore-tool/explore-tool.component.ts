import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { InfluencerSearchBody, Influencer, InfluencerRecommendBody } from 'src/types/influencer';
import { InternalService } from 'src/app/services/internal.service';
import { Observable, of, Subscription } from 'rxjs';
import { CampaignDetail } from 'src/types/campaign';
import { CampaignService } from 'src/app/services/campaign.service';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, map } from 'rxjs/operators';
import { NotificationService, AlertType } from 'src/app/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { LoadingSpinnerService } from 'src/app/services/loading-spinner.service';
import { SaveTemplateDialogComponent } from '../mail-box/save-template-dialog/save-template-dialog.component';
import { environment } from '@src/environments/environment';
import { ProgressLoadingService, ProgressLoadingConfig } from '@services/progress-loading.service';

@Component({
    selector: 'app-explore-tool',
    templateUrl: './explore-tool.component.html',
    styleUrls: ['./explore-tool.component.scss'],
})
export class ExploreToolComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;

    campaignId;
    influencerListId;
    influencerList;
    campaign: CampaignDetail;
    campaignInfluencer: InfluencerRecommendBody[];

    influencerLocationOptions = [];
    audienceLocationOptions = [];
    interestOptions = [];
    interestOptions$: Observable<any[]>;
    languageOptions = [];
    languageOptions$: Observable<any[]>;
    genderOptions = ['MALE', 'FEMALE'];
    selectAudienceGender;

    ageOptions = ['18-24', '25-34', '35-44', '45-64', '65-'];
    selectAudienceAge = [];

    engagementRateOptions = [
        0.01,
        0.02,
        0.03,
        0.04,
        0.05,
        0.05,
        0.06,
        0.07,
        0.08,
        0.09,
        0.1,
        0.11,
        0.12,
        0.13,
        0.14,
        0.15,
        0.16,
        0.17,
        0.18,
        0.19,
        0.2,
    ].map((item) => {
        return {
            value: item,
            label: `≥ ${Math.round(item * 100)}%`,
        };
    });
    selectInfluencerEngagementRate = 0.05;

    // followerOptions = [1000, 5000, 10000, 50000, 100000, 1000000, 10000000];
    minFollower = 5000;
    maxFollower = 100000;
    followerOptions = [
        {label: '1000', value: '1000'},
        {label: '5000', value: '5000'},
        {label: '10000', value: '10000'},
        {label: '50000', value: '50000'},
        {label: '100000', value: '100000'},
        {label: '1000000', value: '1000000'},
        {label: '10000000', value: '10000000'},
    ];

    selectInfluencerInterest = [];
    selectInfluencerLanguage = {};
    selectInfluencerLocation = [];
    selectAudienceLocation = [];
    selectAudienceInterest = [];
    selectAudienceLanguage = {};

    usernames = '';
    hashtags = '';

    filter: InfluencerSearchBody;
    lookAlike: Influencer[] = [];
    currentLookalike: Influencer[] = [];

    totalSize = 0;
    currentPage = 0;

    searching = false;

    hasContactInfo = true;

    templates = [];
    selectedTemplate = '';

    setOfCheckedId = new Set<string>();
    setOfCheckedCurrentId = new Set<string>();
    skipBrandReview = false;

    subscriptions: Subscription[] = [];

    platformList = [
        {
            title: 'Instagram',
            name: 'instagram',
            checked: true,
        },
        {
            title: 'Youtube',
            name: 'youtube',
            checked: false,
        },
        {
            title: 'Tiktok',
            name: 'tiktok',
            checked: false,
        },
    ];

    platformValue = 'instagram';
    isShowAddLookalike = false;

    constructor(
        private internalService: InternalService,
        private campaignService: CampaignService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private notification: NotificationService,
        private progressLoadingService: ProgressLoadingService,
        private dialog: MatDialog,
        public loadingService: LoadingSpinnerService
    ) {
        this.influencerListId = this.activatedRoute.snapshot.paramMap.get('list_id');
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('id');
    }

    async ngOnInit() {
        if (this.campaignId && this.campaignId !== 'campaign') {
            const brandCampaign = await this.campaignService.getBrandCampaignById(this.campaignId);
            this.subscriptions.push(
                brandCampaign.subscribe((brandCampaign) => {
                    this.campaignInfluencer = brandCampaign.discovered_infs;
                    const campaign = brandCampaign.brand_campaigns;
                    this.campaign = campaign;
                })
            );
        }

        if (this.influencerListId) {
            this.subscriptions.push(
                this.internalService.getInfluencerListById(this.influencerListId).subscribe((influencerList) => {
                    this.influencerList = influencerList;
                    if (this.influencerList.platform) {
                        this.isSelecet(this.influencerList.platform);
                    }
                })
            );
        }

        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('locations').subscribe((location) => {
                this.influencerLocationOptions = location.locations;
                this.audienceLocationOptions = location.locations;
            })
        );

        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('interests').subscribe((interest) => {
                this.interestOptions = interest.interests;
                this.interestOptions$ = this.getInterest();
            })
        );

        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('languages').subscribe((language) => {
                this.languageOptions = language.languages;
                this.languageOptions$ = this.getLanguage();
            })
        );

        this.subscriptions.push(
            this.internalService.getAllTemplate('filters').subscribe((result) => {
                this.templates = result;
            })
        );
    }

    isSelecet(val) {
        for (const i of this.platformList) {
            if (i.name === val) {
                i.checked = true;
                if (this.platformValue !== i.name) {
                    this.lookAlike = [];
                }
                this.platformValue = i.name;
            } else {
                i.checked = false;
            }
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    updataInfluencerLocationOptions(term) {
        const searchTemr = term.term;
        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('locations', searchTemr).subscribe((result) => {
                this.influencerLocationOptions = result.locations;
            })
        );
    }

    updataAudienceLocationOptions(term) {
        const searchTemr = term.term;
        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('locations', searchTemr).subscribe((result) => {
                this.audienceLocationOptions = result.locations;
            })
        );
    }

    getLocation(term: string = null): Observable<any[]> {
        return this.internalService.getInfluencerSearchOptions('locations', term).pipe(
            map((result) => {
                return result.locations;
            })
        );
    }

    getInterest(term: string = null): Observable<any[]> {
        let items = this.interestOptions;
        if (term) {
            items = items.filter((x) => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }

    getLanguage(term: string = null): Observable<any[]> {
        let items = this.languageOptions;
        if (term) {
            items = items.filter((x) => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }

    getRelevance() {
        let relevance = [];
        if (this.hashtags) {
            const hashtags = this.hashtags.split(',').map((hashtag) => {
                if (!hashtag.startsWith('#')) {
                    hashtag = `#${hashtag}`;
                }
                return hashtag;
            });
            relevance = relevance.concat(hashtags);
        }
        if (this.usernames) {
            const usernames = this.usernames.split(',').map((username) => {
                if (!username.startsWith('@')) {
                    username = `@${username}`;
                }
                return username;
            });
            relevance = relevance.concat(usernames);
        }
        return relevance;
    }

    newSearchInfluencer() {
        this.paginator.pageIndex = 0;
        this.currentPage = 0;
        this.searchInfluencer();
    }

    searchInfluencerById() {
        this.loadingService.show();
        this.internalService.getBatchInfluencerProfilePromise([this.usernames], this.platformValue).then(result => {
        this.loadingService.hide();
            this.lookAlike = Object.values(result);
        }).catch(error => {
            this.notification.addMessage({
                type: AlertType.Error,
                title: 'No Result',
                message: 'Error encountered when searching influencers.',
                duration: 3000,
            });
        });
    }

    async searchInfluencer() {
        this.searching = true;
        this.loadingService.show();
        this.lookAlike = [];
        this.totalSize = 0;

        const searchBody = {
            filter: {
                influencer: {
                    followers: {
                        min: this.minFollower,
                        max: this.maxFollower,
                    },
                    engagementRate: Number(this.selectInfluencerEngagementRate),
                    location: this.selectInfluencerLocation.map((item) => item.id),
                    language: this.selectInfluencerLanguage['code'],
                    relevance: this.getRelevance(),
                    interests: this.selectInfluencerInterest.map((item) => item.id),
                    hasContactDetails: this.hasContactInfo,
                },
                audience: {
                    location: this.selectAudienceLocation.map((item) => item.id),
                    language: this.selectAudienceLanguage['code'],
                    gender: this.selectAudienceGender,
                    age: this.selectAudienceAge,
                    interests: this.selectAudienceInterest.map((item) => item.id),
                },
            },
            page: this.currentPage,
        };

        if (!environment.production) {
            console.log(searchBody);
        }

        const search = await this.internalService.searchInfluencer(searchBody, this.platformValue);

        this.subscriptions.push(
            search.subscribe(
                (result) => {
                    if (result['error'] === false) {
                        this.lookAlike = result.directs.concat(result.lookalikes);
                        this.totalSize = result.total;
                    } else {
                        this.notification.addMessage({
                            type: AlertType.Error,
                            title: 'No Result',
                            message: 'Error encountered when searching influencers.',
                            duration: 3000,
                        });
                    }
                    this.searching = false;
                    this.loadingService.hide();
                },
                (error) => {
                    // Show error
                    this.notification.addMessage({
                        type: AlertType.Error,
                        title: 'No Result',
                        message: 'Error encountered when searching influencers.',
                        duration: 3000,
                    });
                    this.searching = false;
                    this.loadingService.hide();
                }
            )
        );
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
            popularPosts: influencer.popularPosts.slice(0, 3),
            sponsoredPosts: influencer.sponsoredPosts.slice(0, 3),
            profile: influencer.profile,
            recentPosts: influencer.recentPosts.slice(0, 3),
            stats: influencer.stats,
            userId: influencer.userId,
        };
    }

    backToCampaign() {
        this.router.navigate([`/internal/brand-campaign/${this.campaignId}`]);
    }

    resetFilter() {
        this.selectAudienceGender = null;
        this.selectAudienceAge = [];
        this.selectInfluencerEngagementRate = 0.05;
        this.minFollower = 5000;
        this.maxFollower = 100000;
        this.selectInfluencerInterest = [];
        this.selectInfluencerLanguage = {};
        this.selectInfluencerLocation = [];
        this.selectAudienceLocation = [];
        this.selectAudienceInterest = [];
        this.selectAudienceLanguage = {};
        this.usernames = '';
        this.hashtags = '';
    }

    pageEvent(event: PageEvent) {
        this.currentPage = event.pageIndex;
        this.searchInfluencer();
    }

    csvTojson(csv) {
        const lines = csv.split('\n');
        const result = [];
        const headers = lines[0].split(',').map((column) => {
            if (column.indexOf('"') === 0) {
                return column.substring(1, column.length - 1);
            } else {
                return column.trim();
            }
        });

        for (let i = 1; i < lines.length; i++) {
            const obj = {};

            const row = lines[i];
            let queryIdx = 0;
            let startValueIdx = 0;
            let idx = 0;

            if (row.trim() === '') {
                continue;
            }

            while (idx < row.length) {
                /* if we meet a double quote we skip until the next one */
                let c = row[idx];

                if (c === '"') {
                    do {
                        c = row[++idx];
                    } while (c !== '"' && idx < row.length - 1);
                }

                if (c === ',' || /* handle end of line with no comma */ idx === row.length - 1) {
                    /* we've got a value */
                    let value = row.substr(startValueIdx, idx - startValueIdx).trim();

                    /* skip first double quote */
                    if (value[0] === '"') {
                        value = value.substr(1);
                    }
                    /* skip last comma */
                    if (value[value.length - 1] === ',') {
                        value = value.substr(0, value.length - 1);
                    }
                    /* skip last double quote */
                    if (value[value.length - 1] === '"') {
                        value = value.substr(0, value.length - 1);
                    }

                    const key = headers[queryIdx++];
                    obj[key] = value;
                    startValueIdx = idx + 1;
                }

                ++idx;
            }

            result.push(obj);
        }
        return result;
    }

    loadCSVResult(data) {
        const influencers = [];

        data.forEach((item) => {
            let influencer = {};
            console.log(item);
            if (item['%ER'] && item['#F/IG']) {
                const engagementRate = Number(item['%ER'].substring(0, item['%ER'].length - 1)) / 100;
                influencer = {
                    profile: {
                        fullname: item['IG Handle'].substring(1),
                        username: item['IG Handle'].substring(1),
                        url: `https://www.instagram.com/${item['IG Handle'].substring(1)}/`,
                        picture: '',
                        followers: Number(item['#F/IG']),
                        engagementRate,
                        engagements: Math.round(engagementRate * Number(item['#F/IG'])),
                    },
                    audience: {
                        credibility: item['%Foll Credibility'],
                    },
                    stats: {
                        avgLikes: { value: Number(item['Avg likes']) },
                    },
                };
            } else {
                influencer = {
                    profile: {
                        fullname: item['IG Handle'].substring(1),
                        username: item['IG Handle'].substring(1),
                        url: `https://www.instagram.com/${item['IG Handle'].substring(1)}/`,
                    },
                };
            }

            console.log(influencer);
            influencers.push(influencer);
        });

        return influencers;
    }

    onDrop(fileList: FileList) {
        const reader = new FileReader();
        reader.readAsText(fileList[0]);
        reader.onload = () => {
            const csvData = reader.result;
            const data = this.csvTojson(csvData);
            console.log(data);
            this.lookAlike = this.loadCSVResult(data);
        };
    }

    estimatePricing(influencer) {}

    async saveAsNewTemplate(templateName) {
        const filters = {
            influencer: {
                followers: {
                    min: Number(this.minFollower[0]),
                    max: Number(this.maxFollower[0]),
                },
                engagementRate: Number(this.selectInfluencerEngagementRate),
                location: this.selectInfluencerLocation,
                language: this.selectInfluencerLanguage,
                relevance: {
                    hashtags: this.hashtags,
                    usernames: this.usernames,
                },
                interests: this.selectInfluencerInterest,
                hasContactDetails: this.hasContactInfo,
            },
            audience: {
                location: this.selectAudienceLocation,
                language: this.selectAudienceLanguage,
                gender: this.selectAudienceGender,
                age: this.selectAudienceAge,
                interests: this.selectAudienceInterest,
            },
            template_name: templateName,
        };

        const saveTemplate = await this.internalService.createTemplateByName(templateName, filters, 'filters');

        this.subscriptions.push(
            saveTemplate.subscribe((result) => {
                this.templates = [...this.templates, filters];
            })
        );
    }

    saveFilter() {
        const dialogRef = this.dialog.open(SaveTemplateDialogComponent, {
            width: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.saveAsNewTemplate(result);
            }
        });
    }

    changeValue(val) {
        console.log(val, 66);
        this.minFollower = val['label'];
    }

    selectTempalte(template) {
        // Load template
        if (template.influencer) {
            this.minFollower = template.influencer.followers.min;
            this.maxFollower = template.influencer.followers.max;
            this.selectInfluencerEngagementRate = template.influencer.engagementRate;
            this.selectInfluencerLanguage = template.influencer.language;
            this.selectInfluencerLocation = template.influencer.location;
            this.selectInfluencerInterest = template.influencer.interests;
            this.hasContactInfo = template.influencer.hasContactDetails;
            this.hashtags = template.influencer.relevance.hashtags;
            this.usernames = template.influencer.relevance.usernames;
        }
        if (template.audience) {
            this.selectAudienceLocation = template.audience.location;
            this.selectAudienceLanguage = template.audience.language;
            this.selectAudienceGender = template.audience.gender;
            this.selectAudienceAge = template.audience.age;
            this.selectAudienceInterest = template.audience.interests ? template.audience.interests : [];
        }
    }

    selectCustomFilter() {
        this.selectTempalte(this.campaign.audience_detail);
    }

    openInsPage(influencer) {
        event.stopPropagation();
        window.open(influencer.profile.url, '_blank');
    }

    fetchDetail(influencer) {
        this.internalService.getBatchInfluencerProfilePromise([influencer.profile.username], this.platformValue).then((profile) => {
            Object.assign(influencer, profile[influencer.profile.username]);
            influencer.expanded = true;
            console.log(influencer);
        });
    }

    async pullAndAdd(insList: string[]) {
        const config: ProgressLoadingConfig = {
            title: 'Pulling Data',
            completedCount: 0,
            totalSize: insList.length,
            message: 'Pulling influencers data %1',
        };
        this.progressLoadingService.showProgress(config);

        this.internalService
            .getBachInfluencerProfileStepByStep(
                insList,
                (completedCount) => (config.completedCount = completedCount),
                this.platformValue
            ).then((influencerObjects) => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'User Profile Pulled',
                    message: `Pulled ${insList.length} user profile.`,
                    duration: 3000,
                });

                if (this.influencerListId) {
                    this.subscriptions.push(
                        this.internalService.addUserToInfluencerList(this.influencerListId, insList).subscribe((result) => {
                            this.notification.addMessage({
                                type: AlertType.Success,
                                title: 'User Saved',
                                message: 'Selected influencers have been added to the list.',
                                duration: 3000,
                            });
                            this.progressLoadingService.hideProgress();
                            this.setOfCheckedId.clear();
                        })
                    );
                } else {
                    // Add recommend
                    const influencer_list = Object.keys(influencerObjects)
                        .map((inf) => {
                            return {
                                email: this.getEmailAddress(influencerObjects[inf]),
                                account_id: inf,
                                platform: 'instagram',
                                influencer: this.simplifyInfluencerProfile(influencerObjects[inf]),
                            };
                        })
                        .filter((inf) => {
                            return inf.email;
                        });

                    if (Object.keys(influencerObjects).length > influencer_list.length) {
                        this.notification.addMessage({
                            type: AlertType.Error,
                            title: 'User without email',
                            message: 'Skip user without email!',
                            duration: 3000,
                        });
                    }

                    this.internalService
                        .addRecommendedInfluencerPromise(this.campaignId, influencer_list, this.skipBrandReview)
                        .then((result) => {
                            this.notification.addMessage({
                                type: AlertType.Success,
                                title: 'User Recommended to Brand',
                                message: 'Selected influencers have been pushed to client.',
                                duration: 3000,
                            });
                            this.setOfCheckedId.clear();
                            this.loadingService.hide();
                        });
                }
            })
            .catch(() => {
                this.notification.addMessage({
                    type: AlertType.Error,
                    title: 'Pulled Profile Error',
                    message: 'Something wrong with Modash API, try again!',
                    duration: 3000,
                });
                this.progressLoadingService.hideProgress();
            });
    }

    addInfluencerToList() {
        const insList = [];
        this.setOfCheckedId.forEach((inf) => {
            insList.push(inf.toLowerCase());
        });
        this.pullAndAdd(insList);
    }

    addLookalikeToList(influencer) {
        if (influencer && influencer.audience['audienceLookalikes']) {
            const insList = [];
            influencer.audience['audienceLookalikes'].forEach((influencer) => {
                insList.push(influencer.username);
            });

            const config: ProgressLoadingConfig = {
                title: 'Pulling Data',
                completedCount: 0,
                totalSize: insList.length,
                message: 'Pulling influencers data %1',
            };
            this.progressLoadingService.showProgress(config);

            this.internalService
                .getBachInfluencerProfileStepByStep(
                    insList,
                    (completedCount) => (config.completedCount = completedCount),
                    this.platformValue
                ).then((influencerObjects) => {
                    this.progressLoadingService.hideProgress();
                    this.notification.addMessage({
                        type: AlertType.Success,
                        title: 'User Profile Pulled',
                        message: `Pulled ${insList.length} user profile.`,
                        duration: 3000,
                    });
                    this.currentLookalike = Object.values(influencerObjects);
                    this.isShowAddLookalike = true;
                });
        }
    }

    addLookalikeToListReal() {
        const insList = [];
        this.setOfCheckedCurrentId.forEach((inf) => {
            insList.push(inf.toLowerCase());
        });
        this.subscriptions.push(
            this.internalService.addUserToInfluencerList(this.influencerListId, insList).subscribe((result) => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'User Saved',
                    message: 'Selected influencers have been added to the list.',
                    duration: 3000,
                });
                this.isShowAddLookalike = false;
                this.setOfCheckedCurrentId.clear();
            })
        );
    }

    cancelAddLookalikeToList() {
        this.isShowAddLookalike = false;
        this.setOfCheckedCurrentId.clear();
    }
}
