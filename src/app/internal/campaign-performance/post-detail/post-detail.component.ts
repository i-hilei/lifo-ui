import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InternalService } from '@src/app/services/internal.service';
import { CampaignInfluencerPerformance } from 'src/types/campaign';
import { CreatePostComponent } from '../create-post/create-post.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from '@src/environments/environment';
import { LoadingSpinnerService } from '@src/app/services/loading-spinner.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { CampaignService } from '@src/app/services/campaign.service';
import { Subscription } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
    selector: 'app-post-detail',
    templateUrl: './post-detail.component.html',
    styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
    @Input() influencer: CampaignInfluencerPerformance;
    @Input() editable: boolean;

    subscriptions: Subscription[] = [];

    constructor(
        private dialog: MatDialog,
        private internalService: InternalService,
        private clipboard: Clipboard,
        private loadingService: LoadingSpinnerService,
        private notification: NotificationService,
        private campaignService: CampaignService,
        private storage: AngularFireStorage,
    ) {}

    ngOnInit() {}

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    open() {
        window.open(this.influencer.post_url, '_blank');
    }

    editPost() {
        const dialogRef = this.dialog.open(CreatePostComponent, {
            width: '650px',
            data: {
                post: this.influencer,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.savePost(result);
            }
        });
    }

    async savePost(influencerPost) {
        this.internalService.addInfluencerCampaignPost(influencerPost.brand_campaign_id, influencerPost.account_id, influencerPost)
            .then(result => {
                this.influencer = influencerPost;
            });

        // this.subscriptions.push(
        //     (await addInfluencer).subscribe((result) => {
        //         this.campaignInfluencerPerformance.push(influencerPost);
        //     })
        // );
    }

    copyLink() {
        this.clipboard.copy(this.influencer.post_url);
    }

    download(influencer) {
        this.loadingService.show();
        // Get content list
        const contents = [];
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
}
