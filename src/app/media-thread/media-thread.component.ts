import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CampaignService } from '../services/campaign.service';
import { Thread, ThreadStatus, Timestamp, Feedback } from 'src/types/thread';


import * as moment from 'moment';
import { UploadFile } from 'src/types/campaign';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-media-thread',
    templateUrl: './media-thread.component.html',
    styleUrls: ['./media-thread.component.scss'],
})
export class MediaThreadComponent implements OnInit, OnDestroy {

    @Input() mediaList: UploadFile[];
    @Input() selectedMedia: UploadFile;
    @Input() allMedia: UploadFile[];

    allThreads: Thread[] = [];
    shouldShowAddNewThread = false;

    newComment = '';
    displayName = 'Anonymous';
    constructor(
        public campaignService: CampaignService,
        public auth: AngularFireAuth,
    ) { }

    subscription: Subscription[] = [];

    async ngOnInit() {
        // Get User Info
        const user =  await this.auth.user;
        this.subscription.push(
            user.subscribe(profile => {
                this.displayName = profile.displayName;
            })
        );

        for (let i = 0; i < this.allMedia.length; i ++) {
            this.subscription.push(
                this.campaignService.getThread(this.allMedia[i].path).subscribe(thread => {
                    thread.forEach(t => {
                        t['showEdit'] = false;
                        t.feedback_list = t.feedback_list.sort((f1, f2) => {
                            return f2.timestamp['_seconds'] - f1.timestamp['_seconds'];
                        });
                        t.feedback_list[t.feedback_list.length - 1].original = true;
                    });
                    this.allThreads = this.allThreads.concat(thread);
                })
            );
        };
    }

    ngOnDestroy() {
        this.subscription.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    cancelComment() {
        this.newComment = '';
        this.shouldShowAddNewThread = false;
    }

    getImageUrl(path) {
        let url = '';
        this.allMedia.forEach(media => {
            if (media.path === path) {
                url = media.url;
            }
        });
        return url;
    }

    async createComment() {
        this.subscription.push(
            this.campaignService.createThread(this.selectedMedia.path, this.newComment).subscribe(thread => {
                const timestamp: Timestamp = {
                    _seconds: new Date().getTime() / 1000,
                    _nanoseconds: 0,
                };
                const threadStatus: ThreadStatus = {
                    deleted: false,
                    media_object_path: this.selectedMedia.path,
                    resolved: false,
                    timestamp,
                };
                const feedback: Feedback = {
                    like: 0,
                    dislike: 0,
                    extra_data: {},
                    feedback_str: this.newComment,
                    media_object_path: this.selectedMedia.path,
                    image_bounding_box: {},
                    timestamp,
                    video_offset: 0,
                    original: true,
                    displayName: this.displayName,
                };
                const newThread: Thread = {
                    feedback_list: [feedback],
                    thread_id: thread.thread_id,
                    thread: threadStatus,
                };
                this.newComment = '';
                this.allThreads.splice(0, 0, newThread);
                this.newComment = '';
                this.shouldShowAddNewThread = false;
            })
        );
    }

    async replyThread(thread: Thread) {
        this.subscription.push(
            this.campaignService.replyThread(this.selectedMedia.path, thread['newComment'], thread.thread_id).subscribe(response => {
                const timestamp: Timestamp = {
                    _seconds: new Date().getTime() / 1000,
                    _nanoseconds: 0,
                };
                const feedback: Feedback = {
                    like: 0,
                    dislike: 0,
                    extra_data: {},
                    feedback_str: thread['newComment'],
                    media_object_path: this.selectedMedia.path,
                    image_bounding_box: {},
                    timestamp,
                    video_offset: 0,
                    displayName: this.displayName,
                };
                thread.feedback_list.splice(0, 0, feedback);
                thread.feedback_list = [... thread.feedback_list];

                thread['showEdit'] = false;
                thread['newComment'] = '';
            })
        );
    }

    showAddNewThread() {
        this.shouldShowAddNewThread = true;
        this.allThreads.forEach(t => {
            t['showEdit'] = false;
        });
    }

    showReplyThread(thread) {
        this.shouldShowAddNewThread = false;
        this.allThreads.forEach(t => {
            t['showEdit'] = false;
        });
        thread['showEdit'] = true;
    }

    cancelReplyThread(thread) {
        thread['showEdit'] = false;
        thread['newComment'] = '';
    }

    trackItem(index: number, item: Feedback) {
        return JSON.stringify(item);
    }

    displayTime(timestamp: Timestamp) {
        const endTime = moment(timestamp._seconds * 1000).format('MMMM Do YYYY HH:mm');
        return endTime;
    }
}
