import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';
import { CampaignDetail, ImageContent, UploadFile } from 'src/types/campaign';
import { Route } from '@angular/compiler/src/core';
import { AngularFireStorage } from '@angular/fire/storage';
import * as moment from 'moment';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import { CampaignService } from '../../services/campaign.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadVideoDialogComponent } from './upload-video-dialog/upload-video-dialog.component';
import { UploadImageDialogComponent } from './upload-image-dialog/upload-image-dialog.component';
import { SendMessageDialogComponent } from './send-message-dialog/send-message-dialog.component';
import { NguCarouselConfig, NguCarousel } from '@ngu/carousel';
import { NotificationService, AlertType } from 'src/app/services/notification.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
    selector: 'app-campaign',
    templateUrl: './campaign.component.html',
    styleUrls: ['./campaign.component.scss'],
})
export class CampaignComponent implements OnInit {
    campaignId = '';
    campaign: CampaignDetail;
    campaignHistory: CampaignDetail[];
    historyId = '';

    itemsCollection;
    items;

    conceptCampaignList: CampaignDetail[];
    videoCampaignList: CampaignDetail[];
    newContentConcept = '';
    newTitle = '';
    newDescription = '';
    uploadPath = '';

    campaignType = '';
    selectedTab = 'overview';

    defaultImage: UploadFile = {
        path: 'new',
        url: 'new',
    };
    images: ImageContent;
    imageSlides: UploadFile[];
    selectedMedia: UploadFile;
    allMedia: UploadFile[];

    isAddingNewTag = false;
    newTag = '';

    public carouselTileItems: Array<UploadFile> = [
        {
            url: 'new',
            path: 'new',
        },
    ];
    public carouselTileLarge: NguCarouselConfig = {
        grid: {xs: 1, sm: 1, md: 1, lg: 1, all: 0},
        slide: 1,
        speed: 400,
        animation: 'lazy',
        point: {
            visible: true,
        },
        load: 2,
        touch: true,
        easing: 'ease',
    };
    public carouselTileSmall: NguCarouselConfig = {
        grid: {xs: 0, sm: 0, md: 0, lg: 0, all: 140},
        slide: 2,
        speed: 400,
        animation: 'lazy',
        point: {
            visible: true,
        },
        load: 2,
        touch: true,
        easing: 'ease',
    };
    @ViewChild('carouselLarge') carouselLarge: NguCarousel<any>;
    @ViewChild('carouselSmall') carouselSmall: NguCarousel<any>;

    constructor(
        public auth: AngularFireAuth,
        public router: Router,
        private fns: AngularFireFunctions,
        private afs: AngularFirestore,
        private activatedRoute: ActivatedRoute,
        private storage: AngularFireStorage,
        public loadingService: LoadingSpinnerService,
        public campaignService: CampaignService,
        public dialog: MatDialog,
        private notification: NotificationService,
        private clipboard: Clipboard,
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('id');

        const step = this.activatedRoute.snapshot.queryParamMap.get('step');
        if (step === 'review') {
            this.selectedTab = 'review';
        } else if (step === 'post') {
            this.selectedTab = 'post';
        }
        // this.transcodeVideo('video/HK0fpmQI7WOGUDwdmVpPffis7hY2/dK5e3YW4qfTQgBfUOkqX/1586836863114');
    }

    async ngOnInit() {
        this.loadingService.show();

        const campaign = await this.campaignService.getCampaignByIdInfluencer(this.campaignId);
        campaign.subscribe(result => {
            this.campaignHistory = result.history_list;
            // with concept
            const conceptCampaignList = [];
            const videoCampaignList = [];
            const allMedia = [];
            for (let i = 0; i < this.campaignHistory.length; i ++) {
                const campaign = this.campaignHistory[i];
                campaign['version_name'] = this.campaignHistory.length - i;
                const extraInfo = campaign['extra_info'];
                if ( typeof extraInfo === 'string') {
                    campaign.extra_info  = JSON.parse(extraInfo);
                }
                // check campaign status
                if (result.finalized_campaign_data) {
                    if (result.finalized_campaign_data.final_history_id === campaign.history_id) {
                        campaign.is_final = true;
                    }
                    conceptCampaignList.push(campaign);
                }
                if (campaign.video) {
                    campaign.images = JSON.parse(campaign.video);

                    try {
                        const images = JSON.parse(campaign.video);
                        images.images.forEach(image => {
                            if (allMedia.map(file => file.path).indexOf(image.path) < 0) {
                                allMedia.push(image);
                            }
                        });
                    } catch (e) {
                        console.warn(e);
                    }
                    videoCampaignList.push(campaign);
                }
            };
            this.allMedia = allMedia;

            this.conceptCampaignList = conceptCampaignList;
            this.videoCampaignList = videoCampaignList;


            this.campaign = this.campaignHistory[0];
            this.selectVersion(this.campaign);

            this.loadingService.hide();

            this.auth.user.subscribe(user => {
                if (this.campaign.extra_info['type'] !== 'image') {
                    this.uploadPath = `video/${user.uid}/${this.campaign.campaign_id}/`;
                    this.campaignType = 'video';
                } else {
                    this.uploadPath = `image/${user.uid}/${this.campaign.campaign_id}/`;
                    this.campaignType = 'image';
                }

            });
            this.loadingService.hide();
        });

    }

    selectVersion(campaign: CampaignDetail) {
        this.historyId = campaign.history_id;
        this.newContentConcept = campaign.content_concept;
        this.newTitle = campaign.title;
        this.newDescription = campaign.description;
        try {
            this.images = JSON.parse(JSON.stringify(campaign.images));
        } catch (e) {
            this.images = JSON.parse(JSON.stringify({images: [] }));
        }

        this.imageSlides = [this.defaultImage, ...this.images.images];
        if (this.images.images.length > 0) {
            this.selectedMedia = this.images.images[0];
        } else {
            this.selectedMedia = null;
        }
    }

    async AddNewConcept() {
        const newCampaign = JSON.parse(JSON.stringify(this.campaign));
        newCampaign.content_concept = this.newContentConcept;
        newCampaign.feed_back = '';
        newCampaign.extra_info = JSON.stringify(newCampaign.extra_info);

        // this.campaign.campaignId = this.campaign.campaign_id;
        this.loadingService.show();
        const campaign = await this.campaignService.updateCampaignById(newCampaign, this.campaignId);
        campaign.subscribe(result => {
            this.conceptCampaignList.splice(0, 0, newCampaign);
            this.loadingService.hide();
        });
    }

    async updateCampaignVersion() {
        const newCampaign: CampaignDetail = JSON.parse(JSON.stringify(this.campaign));
        if (this.newContentConcept) {
            newCampaign.content_concept = this.newContentConcept;
        }
        if (this.newTitle) {
            newCampaign.title = this.newTitle;
        }
        if (this.newDescription) {
            newCampaign.description = this.newDescription;
        }
        newCampaign.feed_back = '';
        newCampaign.extra_info = JSON.stringify(newCampaign.extra_info);
        newCampaign.video = JSON.stringify(this.images);

        if (!newCampaign.short_share_url) {
            newCampaign.share_url = `${window.location.protocol}//${window.location.hostname}/image-review/${newCampaign.campaign_id}`;
        }

        this.loadingService.show();
        const campaign = await this.campaignService.updateCampaignById(newCampaign, this.campaignId);
        campaign.subscribe(result => {
            newCampaign.history_id = result['history_id'];
            newCampaign['version_name'] = this.campaignHistory.length + 1;
            this.campaignHistory = [newCampaign, ...this.campaignHistory];
            this.historyId = result['history_id'];
            this.loadingService.hide();

            this.notification.addMessage({
                type: AlertType.Success,
                title: 'Campaign Saved',
                message: 'Your change has been saved!',
                duration: 3000,
            });
        });
    }

    leaveFeedback(campaign) {
        this.router.navigate([
            `/app/concept-feedback/${campaign.campaign_id}/${campaign.history_id}`,
        ]);
    }

    reviewVideo(campaign) {
        this.router.navigate([
            `/app/video-review/${campaign.campaign_id}/${campaign.history_id}`,
        ]);
    }

    reviewImages(campaign) {
        this.router.navigate([
            `/app/image-review/${campaign.campaign_id}/${campaign.history_id}`,
        ]);
    }

    shareImages(campaign) {
        const dialogRef = this.dialog.open(SendMessageDialogComponent, {
            width: '600px',
            data: {

            },
        });

        dialogRef.afterClosed().subscribe(message => {
            if (message) {
                const url = `/app/image-review/${campaign.campaign_id}/${campaign.history_id}`;
                this.campaignService.shareContent(message.receiver, 'shanshuo0918@gmail.com', url).subscribe(result => {
                });
            }
        });
    }

    shareConcept(campaign) {
        const dialogRef = this.dialog.open(SendMessageDialogComponent, {
            width: '600px',
            data: {

            },
        });

        dialogRef.afterClosed().subscribe(message => {
            if (message) {
                const url = `/app/video-review/${campaign.campaign_id}/${campaign.history_id}`;
                this.campaignService.shareContent(message.receiver, 'shanshuo0918@gmail.com', url).subscribe(result => {
                });
            }
        });

    }

    shareVideo(campaign) {
        const dialogRef = this.dialog.open(SendMessageDialogComponent, {
            width: '600px',
            data: {

            },
        });

        dialogRef.afterClosed().subscribe(message => {
            if (message) {
                const url = `/app/concept-feedback/${campaign.campaign_id}/${campaign.history_id}`;
                this.campaignService.shareContent(message.receiver, 'shanshuo0918@gmail.com', url).subscribe(result => {
                });
            }
        });

    }

    async uploadYoutubeSuccess(youtubeLink) {
        const newCampaign = JSON.parse(JSON.stringify(this.campaign));
        newCampaign.content_concept = '';
        newCampaign.feed_back = '';
        newCampaign.video = youtubeLink;
        newCampaign.extra_info = JSON.stringify(newCampaign.extra_info);
        this.loadingService.show();

        const campaign = await this.campaignService.updateCampaignById(newCampaign, this.campaignId);
        campaign.subscribe(result => {
            this.videoCampaignList.splice(0, 0, newCampaign);
            this.loadingService.hide();
        });
    }

    async uploadSuccess(video) {
        const newCampaign = JSON.parse(JSON.stringify(this.campaign));
        newCampaign.content_concept = '';
        newCampaign.feed_back = '';
        newCampaign.video = video['url'];
        newCampaign.extra_info = JSON.stringify(newCampaign.extra_info);
        this.loadingService.show();
        // this.campaign.campaignId = this.campaign.campaign_id;
        const campaign = await this.campaignService.updateCampaignById(newCampaign, this.campaignId);
        campaign.subscribe(result => {
            this.videoCampaignList.splice(0, 0, newCampaign);
            // this.campaignService.transcodeVideo(video['path']).subscribe(reuslt => {
            // });
            this.loadingService.hide();
        });
    }

    async uploadImageSuccess(images: ImageContent) {
        this.images.images = [...images.images, ...this.images.images];
        this.imageSlides = [this.defaultImage, ...this.images.images];
        this.allMedia = [...this.allMedia, ...images.images];
        // If no image selected
        if (!this.selectedMedia && this.images.images.length > 0) {
            this.selectedMedia = this.images.images[0];
        }
        this.updateCampaignVersion();
    }

    uploadImages() {
        const dialogRef = this.dialog.open(UploadImageDialogComponent, {
            width: '600px',
            data: {
                uploadPath: this.uploadPath,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.uploadImageSuccess(result);
            }
        });
    }

    uploadVideo() {
        const dialogRef = this.dialog.open(UploadVideoDialogComponent, {
            width: '600px',
            data: {
                uploadPath: this.uploadPath,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result['type'] === 'local') {
                    this.uploadSuccess(result['file']);
                } else if (result['type'] === 'youtube') {
                    this.uploadYoutubeSuccess(result['link']);
                }
            }
        });
    }

    async completeCampaign() {
        const completeCampaign = await this.campaignService.completeCampaign(this.campaign);
        completeCampaign.subscribe(result => {
            this.router.navigate(['/app/home']);
        });

    }

    deleteImage(index) {
        this.images.images.splice(index - 1, 1);
        this.imageSlides.splice(index, 1);
        if (this.images.images.length > 0) {
            this.selectedMedia = this.images.images[0];
            this.carouselLarge.moveTo(0, false);
        } else {
            this.selectedMedia = null;
        }
        this.updateCampaignVersion();
    }

    displayTime(end_time) {
        const endTime = moment(end_time).format('MMMM Do YYYY HH:mm');
        return endTime;
    }

    slideLargeImageLeft() {
        const index = Math.max(0, this.carouselLarge.currentSlide - 1);
        this.selectedMedia = this.images.images[index];
    }

    slideLargeImageRight() {
        const index = Math.min(this.images.images.length - 1, this.carouselLarge.currentSlide + 1);
        this.selectedMedia = this.images.images[index];
    }

    clickSmallImage(item) {
        if (item.path !== 'new') {
            this.selectedMedia = item;
            const index = this.images.images.map(file => file.path).indexOf(item.path);
            this.carouselLarge.moveTo(index, false);
        }
    }

    switchTab(tab) {
        this.selectedTab = tab;
        if (this.router.url.startsWith('/internal')) {
            this.router.navigate([`/internal/campaign/${this.campaignId}`], {
                queryParams:
                    {
                        step: tab,
                    },
            }
            );
        } else {
            this.router.navigate([`/app/campaign/${this.campaignId}`], {
                queryParams:
                    {
                        step: tab,
                    },
            }
            );
        }

    }

    copyUrl() {
        this.clipboard.copy(this.campaign.short_share_url);
    }

    addNewTag() {
        if (!this.campaign.tags) {
            this.campaign.tags = [];
        }
        this.campaign.tags.push(this.newTag);
        this.newTag = '';
        this.isAddingNewTag = false;
    }

    cancelAddTag() {
        this.newTag = '';
        this.isAddingNewTag = false;
    }
}
