import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { CampaignDetail, VideoMetaData } from 'src/types/campaign';
import { VideoPlayerComponent } from '../shared/video-player/video-player.component';
import { LoadingSpinnerService } from '../services/loading-spinner.service';
import { CampaignService } from '../services/campaign.service';

@Component({
    selector: 'app-video-review',
    templateUrl: './video-review.component.html',
    styleUrls: ['./video-review.component.scss'],
})
export class VideoReviewComponent implements OnInit {
    @ViewChild('videoPlayeer') videoPlayer: VideoPlayerComponent;
    @ViewChild('feedbackTextArea') textAreas: ElementRef;

    campaignId = '';
    historyId = '';
    newFeedback = '';
    campaign: CampaignDetail;
    sources = [];

    videoMeta: VideoMetaData;
    videoPath: string;

    constructor(
        public auth: AngularFireAuth,
        public router: Router,
        private fns: AngularFireFunctions,
        private afs: AngularFirestore,
        private activatedRoute: ActivatedRoute,
        public loadingService: LoadingSpinnerService,
        private campaignService: CampaignService,
    ) {
        this.campaignId = this.activatedRoute.snapshot.paramMap.get('campaignId');
        this.historyId = this.activatedRoute.snapshot.paramMap.get('historyId');
    }

    async ngOnInit() {
        this.loadingService.show();

        const campaign = await this.campaignService.getCampaignById(this.campaignId);
        campaign.subscribe(result => {
            result.history_list.forEach(campaign => {
                if (campaign.history_id === this.historyId) {
                    this.campaign = campaign;
                }
            });
            this.sources = [
                {
                    src: this.campaign.video,
                    type: 'video/mp4',
                },
            ];

            const videoIndex = this.campaign.video.indexOf('/video');

            this.videoPath = 'video/HK0fpmQI7WOGUDwdmVpPffis7hY2/51zqgUMOw45MibQSNhKk/1588350956040';
            this.campaignService.getVideoMetaData(
                this.videoPath
            ).subscribe(result => {
                this.videoMeta = result;
            });

            this.newFeedback = this.campaign.feed_back;
            this.loadingService.hide();
        });
    }

    async provideFeedback() {
        this.loadingService.show();
        const data = {
            campaign_id: this.campaignId,
            history_id: this.historyId,
            feed_back: this.newFeedback,
        };
        const feedback = await this.campaignService.provideFeedback(data, this.campaignId, this.historyId);
        feedback.subscribe(result => {
            this.loadingService.hide();
            this.router.navigate([
                `/app/campaign/${this.campaign.campaign_id}`,
            ]);
        });
    }

    async approveVideo() {
        this.loadingService.show();
        const data = {
            campaign_id: this.campaignId,
            history_id: this.historyId,
            feed_back: this.newFeedback,
        };
        const feedback = await this.campaignService.provideFeedback(data, this.campaignId, this.historyId);
        feedback.subscribe(result => {
            const callable2 = this.fns.httpsCallable('finalizeVideoDraft');
            callable2(
                {
                    campaign_id: this.campaignId,
                    history_id: this.historyId,
                }
            ).subscribe(result2 => {
                this.loadingService.hide();
                this.router.navigate([
                    `/app/campaign/${this.campaign.campaign_id}`,
                ]);
            });
        });
    }

    getTimeStamp() {
        const time = this.videoPlayer.getCurrentSecond();
        const minute = Math.floor(time / 60);
        const second = Math.round(time % 60);
        this.newFeedback = `${this.newFeedback  }\n [${minute}:${second}] `;
        this.textAreas.nativeElement.focus();
    }
}

