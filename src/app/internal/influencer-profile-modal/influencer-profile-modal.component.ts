import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { Influencer } from 'src/types/influencer';
import { InternalService } from 'src/app/services/internal.service';
import { CampaignService } from 'src/app/services/campaign.service';
import { UtilsService } from '@src/app/services/util.service';
import { CampaignDetail } from '@src/types/campaign';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { environment } from '@src/environments/environment';
import { Influencer, InfluencerRecommendBody, InfluencerStatus } from 'src/types/influencer';
import { EmailEditorComponent } from 'src/app/shared/email-editor/email-editor.component';

@Component({
  selector: 'app-influencer-profile-modal',
  templateUrl: './influencer-profile-modal.component.html',
  styleUrls: ['./influencer-profile-modal.component.scss'],
})
export class InfluencerProfileModalComponent implements OnInit {
    // @Input() templateData;
    // @Input() campaignId;
    // @Input() influencer: InfluencerRecommendBody;
    @ViewChild('emailEditor') emailEditor: EmailEditorComponent;
    @ViewChild('listLabel') listLabel;
    @ViewChild('followerList') followerList;
    @Output('checked') checkedBack = new EventEmitter<any>();

    subscriptions: Subscription[] = [];
    defalutInfluencer:any;

    campaign: CampaignDetail;

    isModalVisible = false;
    isShowInfluencer = false;
    campaignId = '';
    influencer:any;
    accountId = '';
    templateArr = [];
    templates = [];
    paidList = [];
    activeList = [];
    campaignLists = [];
    allTemplateInfo = {
        template_name: 'alltemplate',
    };
    emailContent = '';
    spinHeight = `${document.documentElement.clientHeight - 103  }px`;
    emailTitle;
    setModalStyle = {
        position: 'relative',
        top: 0,
        bottom: 0,
        'padding-bottom': 0,
    };

    labelTagList = [];
    attributesArr = [];
    platformArr = [];
    contentArr = [];
    fllowersDatas:any;

    constructor(
        private modal: NzModalService,
        private message: NzMessageService,
        private utilService: UtilsService,
        private campaignService: CampaignService,
        private internalService: InternalService,
    ) { }

    handleOk(): void {
        this.isModalVisible = false;
    }

    handleCancel(): void {
        this.isModalVisible = false;
    }

    fllowersInfluencer() {
      this.fllowersDatas = {};
      this.internalService.getBatchInfluencerProfilePromise([this.influencer.profile.influencer.profile.username], this.influencer.platform).then((profile) => {
        // Object.assign(influencer, profile[influencer.profile.username]);
        this.fllowersDatas = profile[this.influencer.profile.influencer.profile.username];
        this.followerList.prepareData();
      });
    }

    isShowListLabel() {
      this.listLabel.listId = this.influencer.account_id;
      this.listLabel.platform = this.influencer.platform;
      this.listLabel.showModal();
    }

    getData(msg) {
      this.getLabelList(msg, this.influencer.platform);
  }

  getCampaignList(platform, id) {
    this.paidList = [];
    this.activeList = [];
    this.subscriptions.push(
        this.campaignService.getCampaignList(platform, id).subscribe((result) => {
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

  displayTime(end_time) {
    const endTime = moment(end_time).format('MM/DD HH:mm');
    return endTime;
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
          // console.log(result, 'result');
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

            if (this.influencer['profile']['influencer']['profile']['username'] === id) {
                this.influencer['label_list'] = {
                    attributes: this.attributesArr,
                    platform: this.platformArr,
                    content: this.contentArr,
                };
            }
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

    showModals() {
      this.spinHeight = `${document.documentElement.clientHeight - 103  }px`;
      setTimeout(() => {
        this.isModalVisible = true;
        this.getLabelList(this.influencer['account_id'], this.influencer['platform']);
        this.getCampaignList(this.influencer['platform'], this.influencer['profile']['influencer']['profile']['username']);
        this.fllowersInfluencer();
      }, 200);
    }

    ngOnInit() {
    }

}
