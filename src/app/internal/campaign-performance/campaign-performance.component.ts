import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreatePostComponent } from './create-post/create-post.component';
import { CampaignService } from 'src/app/services/campaign.service';
import { ActivatedRoute } from '@angular/router';
import { InternalService } from 'src/app/services/internal.service';
import { CampaignPerformance, CampaignInfluencerPerformance } from 'src/types/campaign';
import { Subscription } from 'rxjs';
import { environment } from '@src/environments/environment';
import { UtilsService } from '@src/app/services/util.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { LoadingSpinnerService } from '@src/app/services/loading-spinner.service';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
    selector: 'app-campaign-performance',
    templateUrl: './campaign-performance.component.html',
    styleUrls: ['./campaign-performance.component.scss'],
})
export class CampaignPerformanceComponent implements OnInit, OnDestroy {
    campaignId;

    campaignInfluencer = [];
    campaign;

    campaignPerformance: CampaignPerformance;
    campaignInfluencerPerformance: CampaignInfluencerPerformance[] = [];
    loading = true;

    @Input() editable = false;

    subscriptions: Subscription[] = [];

    constructor(
        public dialog: MatDialog,
        private campaignService: CampaignService,
        public activatedRoute: ActivatedRoute,
        private internalService: InternalService,
        private utilService: UtilsService,
        private loadingService: LoadingSpinnerService,
        private notification: NotificationService,
        private storage: AngularFireStorage,
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('id');
    }

    async ngOnInit() {
        const brandCampaign = await this.campaignService.getBrandCampaignById(this.campaignId);
        this.subscriptions.push(
            brandCampaign.subscribe((brandCampaign) => {
                this.campaignInfluencer = brandCampaign.discovered_infs;
                const campaign = brandCampaign.brand_campaigns;
                const extraInfo = campaign['extra_info'];
                if (typeof extraInfo === 'string') {
                    campaign.extra_info = JSON.parse(extraInfo);
                }
                this.campaign = campaign;
            })
        );

        this.getPerformance();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    async getPerformance() {
        const performance = await this.internalService.getCampaignPerformanceById(this.campaignId);
        this.subscriptions.push(
            performance.subscribe((result) => {
                if (result && result.all_inf_perfs) {
                    if (!environment.production) {
                        console.log(result);
                    }
                    this.campaignPerformance = result;
                    this.campaignInfluencerPerformance = result.all_inf_perfs;
                }
                this.loading = false;
            })
        );
    }

    async savePost(influencerPost) {
        this.internalService.addInfluencerCampaignPost(this.campaignId, influencerPost.account_id, influencerPost).then((result) => {
            this.campaignInfluencerPerformance.push(influencerPost);
        });
    }

    createPost() {
        const dialogRef = this.dialog.open(CreatePostComponent, {
            width: '650px',
            data: {
                influencer: this.campaignInfluencer,
                campaign: this.campaign,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.savePost(result);
            }
        });
    }

    downloadAllContent() {
        this.loadingService.show();
        // Get content list
        const contents = [];
        this.campaignInfluencerPerformance.forEach(influencer => {
            if (influencer.content) {
                const file_list = [];
                if (influencer.content.images) {
                    influencer.content.images.forEach(image => {
                        file_list.push(image.path);
                    });
                }
                if (influencer.content.videos) {
                    influencer.content.videos.forEach(video => {
                        file_list.push(video.path);
                    });
                }
                contents.push({
                    name: influencer.account_id,
                    campaign_id: influencer.brand_campaign_id,
                    file_list,
                });
            }
        });
        if (!environment.production) {
            console.log(contents);
        }

        this.campaignService.downloadCampaignData(contents).then(data => {
            this.loadingService.hide();
            this.subscriptions.push(
                this.storage.ref(data['link']).getDownloadURL().subscribe(url => {
                    window.open(url, '_blank');
                })
            );
            // const blob = new Blob([data], {
            //     type: 'application/zip',
            // });
            // const url = window.URL.createObjectURL(blob);

        }).catch(error => {
            this.loadingService.hide();
            this.notification.addMessage({
                type: AlertType.Error,
                title: 'Error',
                message: 'Error downloading content. Please contact your account manager.',
                duration: 3000,
            });
        });
    }

    downloadReport() {
        // columns in csv: influencers handle, followers, post link, likes, comments
        const header = [
            'IG handle',
            'Follower #',
            'Post Link',
            'Likes #',
            'Comments #',
        ];

        const dataToConvert = [];
        this.campaignInfluencerPerformance.forEach((influencer) => {
            const itemToAdd = [];
            itemToAdd.push(influencer.account_id);
            itemToAdd.push(influencer.followers);
            itemToAdd.push(influencer.post_url);
            itemToAdd.push(influencer.likes);
            itemToAdd.push(influencer.comments);
            dataToConvert.push(itemToAdd);
        });

        const data = [header, ...dataToConvert];

        const convertedData = data.map((rowArr) => rowArr.map((str) => (str ? `"${str}"` : '')).join(',')).join('\n');
        this.utilService.downloadFile(convertedData, `campaign-performance-${this.campaign.brand_campaign_id}.csv`);
    }
}
