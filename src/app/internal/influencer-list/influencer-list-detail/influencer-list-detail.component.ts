import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { CreateNewListDialogComponent } from '@internal/campaign-outreach/create-new-list-dialog/create-new-list-dialog.component';

import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { InternalService } from '@services/internal.service';
import { CampaignService } from '@services/campaign.service';
import { ProgressLoadingService, ProgressLoadingConfig } from '@services/progress-loading.service';

@Component({
    selector: 'app-influencer-list-detail',
    templateUrl: './influencer-list-detail.component.html',
    styleUrls: ['../influencer-list.component.scss'],
})
export class InfluencerListDetailComponent implements OnInit {
    id: string;
    currentInfluencer: {
        name: string;
        id: string;
        ins_list: string[];
        platform: string;
    };

    platform: string = 'instagram';

    detailList: any[];
    displayedDetailList: any[];
    searchVisible: boolean = false;
    searchValue: string;
    loading: boolean = true;
    influencerList = {};

    listOfColumn = [
        {
            name: 'Follower Range',
            sortOrder: null,
            sortFn: (a, b) => a.profile.followers - b.profile.followers,
            listOfFilter: [],
            filterFn: null,
        },
        {
            name: 'Fake Followers Rate',
            sortOrder: null,
            sortFn: (a, b) => 1 - a.audience.credibility - (1 - b.audience.credibility),
            listOfFilter: [],
            filterFn: null,
        },
        {
            name: 'Average Likes',
            sortOrder: null,
            sortFn: (a, b) => a.stats?.avgLikes?.value - b.stats?.avgLikes?.value,
            listOfFilter: [],
            filterFn: null,
        },
        {
            name: 'Engagement Rate',
            sortOrder: null,
            sortFn: (a, b) => a.profile.engagementRate * 100 - b.profile.engagementRate * 100,
            listOfFilter: [],
            filterFn: null,
        },
    ];

    @ViewChild('newList') newList: CreateNewListDialogComponent;
    @ViewChild('influencerDetails') influencerDetails;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private modal: NzModalService,
        private internalService: InternalService,
        private campaignService: CampaignService,
        private message: NzMessageService,
        private progressLoadingService: ProgressLoadingService
    ) {}

    ngOnInit(): void {
        this.id = this.activatedRoute.snapshot.paramMap.get('id');
        this.currentInfluencer = {
            name: '',
            id: this.id,
            ins_list: [],
            platform: 'instagram',
        };

        this.getData();
    }

    forBack() {
        this.router.navigateByUrl('/internal/influencer-list');
    }

    addInfluencer(id: string) {
        this.router.navigateByUrl(`/internal/influencer-discovery/campaign/${id}`);
    }

    openInsPage(influencer) {
        window.open(influencer.profile.url, '_blank');
    }

    deleteItem(id: string, name: string) {
        this.modal.confirm({
            nzTitle: 'Delete the influencer',
            nzContent: 'Are you sure to delete this influencer from the list?',
            nzOkText: 'Confirm',
            nzOkType: 'primary',
            nzOnOk: () => {
                this.internalService.deleteInfluencerItem(id, name).subscribe(
                    () => {
                        this.detailList = this.detailList.filter((item) => item.profile.username.toLowerCase() !== name.toLowerCase());
                        this.displayedDetailList = this.displayedDetailList.filter(
                            (item) => item.profile.username.toLowerCase() !== name.toLowerCase()
                        );
                        this.message.create('success', 'Delete Success');
                    },
                    () => {
                        this.message.create('error', 'Delete Faild');
                    }
                );
            },
            nzCancelText: 'Cancel',
            nzOnCancel: () => {},
        });
    }

    getData() {
        this.campaignService
            .getInfluencerListById(this.id)
            .then(async (res) => {
                this.currentInfluencer = res;
                if (res.platform === 'tiktok') {
                    this.platform = 'tiktok';
                }

                const config: ProgressLoadingConfig = {
                    title: 'Loading data',
                    completedCount: 0,
                    totalSize: this.currentInfluencer.ins_list.length,
                    message: 'Loading influencers data %1',
                };
                if (this.currentInfluencer.ins_list.length > 50) {
                    this.progressLoadingService.showProgress(config);
                }

                const influencerObjects = await this.internalService.getBachInfluencerProfileStepByStep(
                    this.currentInfluencer.ins_list,
                    (completedCount) => {
                        config.completedCount = completedCount;
                    },
                    this.currentInfluencer.platform ? this.currentInfluencer.platform : 'instagram'
                );

                const tempInfluencerList = [];
                Object.keys(influencerObjects).forEach((key) => {
                    tempInfluencerList.push(influencerObjects[key]);
                });
                this.detailList = tempInfluencerList;
                console.log(tempInfluencerList);
                this.displayedDetailList = tempInfluencerList;
                this.loading = false;
                this.progressLoadingService.hideProgress();
            })
            .catch((err) => {
                this.loading = false;
                this.progressLoadingService.hideProgress();
                console.error(err);
            });
    }

    getBatchInfluencerProfileStepByStep(keys: string[]): Promise<{ [key: string]: any }> {
        return this.internalService.getBatchInfluencerProfilePromise(keys);
    }

    search() {
        this.searchVisible = false;
        this.displayedDetailList = this.detailList.filter((item) => item.profile.username.indexOf(this.searchValue) !== -1);
    }

    fetchDetail(influencer) {
        // this.influencerList = influencer;
        influencer.expanded = true;
    }

    resetSearch() {
        this.searchValue = '';
        this.search();
    }
}
