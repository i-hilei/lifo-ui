import { Component, OnInit, ViewChild, OnDestroy, Input, OnChanges } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { CampaignDetail, UploadFile } from 'src/types/campaign';
import { LoadingSpinnerService } from '../services/loading-spinner.service';
import { CampaignService } from '../services/campaign.service';
import { NotificationService, AlertType } from '../services/notification.service';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { environment } from '@src/environments/environment';
import { NzCarouselComponent, FromToInterface } from 'ng-zorro-antd';
import { drawImageByVideo } from './draw';
import { HttpClient } from '@angular/common/http';

export interface PreviewFile {
    url: string;
    videoUrl?: string;
    type: 'image' | 'video';
}

@Component({
    selector: 'app-image-review',
    templateUrl: './image-review.component.html',
    styleUrls: ['./image-review.component.scss'],
})
export class ImageReviewComponent implements OnInit, OnDestroy, OnChanges {
    @Input() campaignId;

    campaign: CampaignDetail;
    historyId = '';
    historyList: CampaignDetail[] = [];
    newFeedback = '';

    selectedMedia: UploadFile;
    allMedia: UploadFile[];

    subscription: Subscription[] = [];

    selectedIndex = 0;
    selectImgDisabled = false;
    images = [];
    videos = [];
    files: PreviewFile[] = [];

    @ViewChild('carousel') carousel: NzCarouselComponent;

    constructor(
        public auth: AngularFireAuth,
        public router: Router,
        public location: Location,
        private activatedRoute: ActivatedRoute,
        public loadingService: LoadingSpinnerService,
        private campaignService: CampaignService,
        private notification: NotificationService,
        private httpClient: HttpClient,
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('campaignId');
        // this.historyId = this.activatedRoute.snapshot.paramMap.get('historyId');
    }

    ngOnDestroy() {
        this.subscription.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    async ngOnInit() {
        if (this.campaignId) {
            this.reloadData();
        }
    }

    async reloadData() {
        this.loadingService.show();

        this.subscription.push(
            this.campaignService.getCampaignById(this.campaignId).subscribe((result) => {
                if (result.history_list.length <= 0) {
                    this.loadingService.hide();
                    return;
                }
                if (!environment.production) {
                    console.log(result);
                }
                const allMedia: UploadFile[] = [];
                for (let i = 0; i < result.history_list.length; i++) {
                    const campaign = result.history_list[i];
                    campaign['version_name'] = result.history_list.length - i;
                    try {
                        const images = JSON.parse(campaign.video);
                        images.images.forEach((image) => {
                            if (allMedia.map((file) => file.path).indexOf(image.path) < 0) {
                                allMedia.push(image);
                            }
                        });
                    } catch (e) {
                        console.warn(e);
                    }
                }
                this.allMedia = allMedia;
                this.historyList = result.history_list;
                this.selectVersion(result.history_list[0]);
                this.newFeedback = this.campaign.feed_back;
                this.loadingService.hide();
            })
        );

        const media = await this.campaignService.getAllMediaForCampaign('image', this.campaignId);
        this.subscription.push(media.subscribe((result) => {}));
    }

    ngOnChanges(change) {
        if (change.campaignId && change.campaignId.currentValue) {
            this.reloadData();
        }
    }

    selectVersion(version) {
        this.historyId = version.history_id;
        this.campaign = version;
        this.loadVersionData();
    }

    loadVersionData() {
        const images = this.campaign.content.images;
        const videos = this.campaign.content.videos;

        const files = [];
        images.forEach((img) => {
            const file: PreviewFile = { url: img.url, type: 'image' };
            files.push(file);
        });
        videos.forEach(async (video, index) => {
            const file: PreviewFile = {
                url: null,
                videoUrl: video.url,
                type: 'video',
            };
            files.push(file);
            const { url } = await drawImageByVideo(video);
            file.url = url;
        });

        this.files = files;
    }

    async provideFeedback() {
        this.loadingService.show();
        const data = {
            campaign_id: this.campaignId,
            history_id: this.historyId,
            feed_back: this.newFeedback,
        };
        const feedback = await this.campaignService.provideFeedback(data, this.campaignId, this.historyId);
        this.subscription.push(
            feedback.subscribe((result) => {
                this.loadingService.hide();
                this.router.navigate([`/campaign/${this.campaign.campaign_id}`]);
            })
        );
    }

    async approveImage() {
        this.loadingService.show();
        this.campaignService.approveCampaignContent(this.campaignId, this.historyId).then((result) => {
            this.loadingService.hide();
            if (result['status'] && result['status'] === 'OK') {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Contents Approved',
                    message: 'Your have approved the contents for posting.',
                    duration: 3000,
                });
            } else {
                this.notification.addMessage({
                    type: AlertType.Error,
                    title: 'Error',
                    message: 'Error during campaign approval. Please try again.',
                    duration: 3000,
                });
            }
        });
    }

    downloadImage(imgUrl) {
        const imgName = imgUrl.substr(imgUrl.lastIndexOf('/') + 1);
        this.httpClient.get(imgUrl, {responseType: 'blob' as 'json'})
          .subscribe((res: any) => {
            const file = new Blob([res], {type: res.type});

            // IE
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(file);
              return;
            }

            const blob = window.URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = blob;
            link.download = imgName;

            // Version link.click() to work at firefox
            link.dispatchEvent(new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            }));

            setTimeout(() => { // firefox
              window.URL.revokeObjectURL(blob);
              link.remove();
            }, 100);
          });
      }

    backToCampaign() {
        this.location.back();
    }

    selectPreviewImg(index: number) {
        if (this.selectImgDisabled) {
            return;
        }
        this.selectedIndex = index;
        this.carousel.goTo(this.selectedIndex);
    }

    beforeChange(fromTo: FromToInterface) {
        this.selectImgDisabled = true;
        this.selectedIndex = fromTo.to;
    }

    afterChange() {
        this.selectImgDisabled = false;
    }
}
