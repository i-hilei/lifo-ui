import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { tap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CampaignInfluencerPerformance } from 'src/types/campaign';

@Component({
    selector: 'app-create-post',
    templateUrl: './create-post.component.html',
    styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent {
    influencerList = [];
    campaign;

    uploadTask: AngularFireUploadTask;
    snapshot: Observable<any>;

    influencerPost: CampaignInfluencerPerformance = {
        comments: 0,
        likes: 0,
        account_id: '',
        screenshot: '',
        comment_content: [],
        commission: 0,
        post_url: '',
        link: '',
    };
    selectedInfluencer = new FormControl();

    newComment = false;
    newCommentComment = '';
    newCommentUser;

    constructor(
        private storage: AngularFireStorage,
        public dialogRef: MatDialogRef<CreatePostComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) {
        if (data.influencer) {
            this.influencerList = data.influencer;
        }
        if (data.campaign) {
            this.campaign = data.campaign;
        }
        if (data.post) {
            this.influencerPost = {
                ...this.influencerPost,
                ...data.post,
            };
            if (this.influencerPost.account_id) {
                this.selectedInfluencer = new FormControl(this.influencerPost.account_id);
            }
        }
    }

    addNewComment() {
        this.influencerPost.comment_content.push({
            user: this.newCommentUser,
            comment: this.newCommentComment,
        });
        this.newCommentUser = '';
        this.newCommentComment = '';
    }

    removeFromList(list, index) {
        list.splice(index, 1);
    }

    onNoClick() {
        this.dialogRef.close();
    }

    savePost() {
        this.influencerPost.account_id = this.selectedInfluencer.value;
        this.dialogRef.close(this.influencerPost);
    }

    onDrop(fileList: FileList) {
        const path = `influencer-post/${this.campaign.brand_campaign_id}/${Date.now()}`;

        // Reference to storage bucket
        const ref = this.storage.ref(path);

        // The main task
        this.uploadTask = this.storage.upload(path, fileList[0]);

        this.uploadTask.percentageChanges();

        this.snapshot = this.uploadTask.snapshotChanges().pipe(
            tap(console.log),
            // The file's download URL
            finalize(async () => {
                const downloadURL = await ref.getDownloadURL().toPromise();
                this.influencerPost.screenshot = downloadURL;
            })
        );
    }
}
