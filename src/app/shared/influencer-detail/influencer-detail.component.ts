import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Influencer } from 'src/types/influencer';
import { InternalService } from 'src/app/services/internal.service';
import { CampaignDetail } from '@src/types/campaign';
import { Subscription } from 'rxjs';
import { CampaignService } from '@services/campaign.service';
import { InfluencerRecommendBody } from '@src/types/influencer';

@Component({
    selector: 'app-influencer-detail',
    templateUrl: './influencer-detail.component.html',
    styleUrls: ['./influencer-detail.component.scss'],
})
export class InfluencerDetailComponent implements OnInit {

    @Input() influencer: Influencer;
    @Input() influencerList: Influencer[] = [];
    @Input() mode: string = 'am';
    @Input() displayInfluencer: InfluencerRecommendBody;
    @Input() campaign: CampaignDetail;
    @Input() platform: string = 'instagram';
    @ViewChild('followers') followers;
    @ViewChild('listLabel') listLabel;

    @Output() onPullLooklikes = new EventEmitter<any>();

    isVisible = false;
    labelTagList = [];
    attributesArr = [];
    subscriptions: Subscription[] = [];
    platformArr = [];
    contentArr = [];

    constructor(
        private internalService: InternalService,
        private campaignService: CampaignService,
    ) { }

    ngOnInit() {
        this.getLabelList(this.influencer.profile.username, this.platform);
    }

    ngOnChanges() {
        const objleg = Object.keys(this.influencer);
        const ilength = objleg.length;
        if (ilength !== 0 ) {
            this.isVisible = true;
            setTimeout(() => {
                this.followers.isSetHeight = true;
            }, 500);
        } else {
            this.isVisible = false;
            setTimeout(() => {
                this.followers.isSetHeight = false;
            }, 500);
        }
    }

    addLookalikeToList() {
        this.onPullLooklikes.emit();
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

    isShowListLabel(ids) {
        // console.log(this.platform, 888);
        // console.log(ids);
        this.listLabel.listId = ids;
        this.listLabel.platform = this.platform;
        this.listLabel.showModal();
    }

    getData(msg) {
        this.getLabelList(msg, this.platform);
    }

    getLabelList(id, plat) {
        const attributes = [];
        const platform = [];
        const content = [];
        this.attributesArr = [];
        this.platformArr = [];
        this.contentArr = [];
        this.influencer['label_list'] = {};
        this.subscriptions.push(
            this.campaignService.getLabelAllInfluencer(id, plat).subscribe((result) => {
              this.labelTagList = result;
              for (const item of this.labelTagList) {
                if (item.type === 'attributes') {
                    attributes.push(item);
                  } else if (item.type === 'platform') {
                    platform.push(item);
                  } else if (item.type === 'content') {
                    content.push(item);
                  }
            }
            this.attributesArr = this.calChildren(attributes);
            this.platformArr = this.calChildren(platform);
            this.contentArr = this.calChildren(content);

            if (this.influencer['profile']['username'] === id) {
                this.influencer['label_list'] = {
                    attributes: this.attributesArr,
                    platform: this.platformArr,
                    content: this.contentArr,
                };
            }
            // console.log(this.influencerList, 9222);
            }, err => {})
          );
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

}
