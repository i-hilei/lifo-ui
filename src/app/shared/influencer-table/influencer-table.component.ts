import { Component, EventEmitter, Input, OnInit, ViewChild, Output } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { Influencer, InfluencerRecommendBody } from '@src/types/influencer';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { CampaignService } from '@src/app/services/campaign.service';

@Component({
    selector: 'app-influencer-table',
    templateUrl: './influencer-table.component.html',
    styleUrls: ['./influencer-table.component.scss'],
})
export class InfluencerTableComponent implements OnInit {

    @Input() influencerList: Influencer[] = [];
    @Input() platform = 'instagram';
    @Input() setOfCheckedId = new Set<string>();

    @Output() onPullLookalikes = new EventEmitter<any>();
    @ViewChild('listLabel') listLabel;

    checked = false;
    indeterminate = false;
    subscriptions: Subscription[] = [];
    labelTagList = [];
    attributesArr = [];
    platformArr = [];
    contentArr = [];
    campaignLists = [];
    paidList = [];
    activeList = [];

    sortFollower = (a, b) => a.profile.followers - b.profile.followers;
    sortCredibility = (a, b) => a.audience?.credibility - b.audience?.credibility;
    sortLikes = (a, b) => a.stats?.avgLikes?.value - b.stats?.avgLikes?.value;
    sortEngagement = (a, b) => a.profile.engagementRate - b.profile.engagementRate;

    constructor(
        private internalService: InternalService,
        private campaignService: CampaignService,
    ) { }

    ngOnInit(): void {
    }

    updateCheckedSet(id: string, checked: boolean): void {
        if (checked) {
            this.setOfCheckedId.add(id);
        } else {
            this.setOfCheckedId.delete(id);
        }
    }

    onAllChecked(value: boolean): void {
        this.influencerList.forEach((item) => this.updateCheckedSet(item.profile.username, value));
        this.refreshCheckedStatus();
    }

    refreshCheckedStatus(): void {
        this.checked = this.influencerList.every((item) => this.setOfCheckedId.has(item.profile.username));
        this.indeterminate = this.influencerList.some((item) => this.setOfCheckedId.has(item.profile.username)) && !this.checked;
    }

    onItemChecked(id: string, checked: boolean): void {
        this.updateCheckedSet(id, checked);
        this.refreshCheckedStatus();
    }


    fetchDetail(influencer) {
        this.getCampaignList(this.platform, influencer['profile']['username']);
        this.internalService.getBatchInfluencerProfilePromise([influencer.profile.username], this.platform).then((profile) => {
            Object.assign(influencer, profile[influencer.profile.username]);
            influencer.expanded = true;
        });
    }

    getCampaignList(platform, id) {
        this.subscriptions.push(
            this.campaignService.getCampaignList(platform, id).subscribe((result) => {
            //   console.log(result, 'res');
              this.campaignLists = result;
              for (const i of this.campaignLists) {
                  const item = this.getStatus(i['influencer_info']);
                  if (item === 'Commission Paid') {
                      this.paidList.push(i);
                  } else {
                      this.activeList.push(i);
                  }
              }
            }, err => {})
          );
    }

    displayTime(end_time) {
        const endTime = moment(end_time).format('MM/DD HH:mm');
        return endTime;
    }

    getStatus(influencer: InfluencerRecommendBody) {
        if (!influencer) {
            return 'Unknown';
        }
        if (influencer.commission_paid_time) {
            return 'Commission Paid';
        }
        if (influencer.submit_post_time) {
            return 'Pending Payment';
        }
        if (influencer.content_approve_time) {
            return 'Post Pending';
        }
        if (influencer.content_submit_time) {
            return 'Review Draft';
        }
        if (influencer.product_received_time) {
            return 'Content Pending';
        }
        if (influencer.product_ship_time) {
            return 'In Shipping';
        }
        if (influencer.order) {
            return 'To be Shipped';
        }
        if (influencer.offer_accept_time) {
            return 'Order to be Created';
        }
        return 'Pending';
    }

    isShowListLabel(ids) {
        // console.log(this.platform, 888);
        // console.log(ids);
        this.listLabel.listId = ids;
        this.listLabel.platform = this.platform;
        this.listLabel.showModal();
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
             }
           }
        }
       return filtParent;
     }

    openInsPage(influencer) {
        event.stopPropagation();
        window.open(influencer.profile.url, '_blank');
    }


    addLookalikeToList(influencer) {
        this.onPullLookalikes.emit(influencer);
    }

}
