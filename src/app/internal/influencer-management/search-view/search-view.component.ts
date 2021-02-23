import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Influencer, InfluencerRecommendBody } from '@src/types/influencer';
import { CampaignService } from '@src/app/services/campaign.service';
import { LoadingSpinnerService } from '../../../services/loading-spinner.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-search-view',
  templateUrl: './search-view.component.html',
  styleUrls: ['./search-view.component.scss'],
})
export class SearchViewComponent implements OnInit {
  @ViewChild('tableSearch') tableSearch;
  @ViewChild('applied') applied;
  @ViewChild('orderPending') orderPending;
  @ViewChild('shipmentPending') shipmentPending;
  @ViewChild('shippedStatus') shippedStatus;
  @ViewChild('shippingIncident') shippingIncident;
  @ViewChild('draftPending') draftPending;
  @ViewChild('draftUploaded') draftUploaded;
  @ViewChild('draftOverdue') draftOverdue;
  @ViewChild('postPending') postPending;
  @ViewChild('postOverdue') postOverdue;
  @ViewChild('commissionPending') commissionPending;
  @ViewChild('campaignCompleted') campaignCompleted;
  @ViewChild('campaignUncompleted') campaignUncompleted;
  constructor(
    private campaignService: CampaignService,
    public loadingService: LoadingSpinnerService,
  ) { }
  shopData = [];
  campaignLists = [];
  subscriptions: Subscription[] = [];

  app_applied = [];
  app_order_pending = [];
  app_applied_status = false;
  app_order_pending_status = false;

  shipping_pending = [];
  shipping_shipped = [];
  shipping_incident = [];
  shipping_pending_status = false;
  shipping_shipped_status = false;
  shipping_incident_status = false;

  draft_pending = [];
  draft_unloaded = [];
  draft_overdue = [];
  draft_pending_status = false;
  draft_unloaded_status = false;
  draft_overdue_status = false;

  post_pending = [];
  post_overdue = [];
  post_pending_status = false;
  post_overdue_status = false;

  commission_pending = [];
  commission_pending_status = false;

  campaign_completed = [];
  campaign_uncompleted = [];
  campaign_completed_status = false;
  campaign_uncompleted_status = false;

  ngOnInit() {
  }

  shopSearch(vals) {
    // console.log(vals, 'search-value');
    this.getCampaignList(vals['option'], vals['value']);
    // this.productList = vals;
  }

  getCampaignList(platform, id) {
    this.loadingService.show();
    this.subscriptions.push(
        this.campaignService.getCampaignList(platform, id).subscribe((result) => {
          // console.log(result, 'search');
          this.campaignLists = this.influencerList(result);
          console.log(this.campaignLists, 'result');
          for (const i of this.campaignLists) {
              const item = this.getStatus(i);
              // console.log(item, 'items');
              if (item === 'Application Applied') {
                  this.app_applied.push(i);
                  this.app_applied_status = true;
              } else if (item === 'Application Order Pending') {
                  this.app_order_pending.push(i);
                  this.app_order_pending_status = true;
              } else if (item === 'Shipping Shipment Pending') {
                  this.shipping_pending.push(i);
                  this.shipping_pending_status = true;
              } else if (item === 'Shipping Shipped') {
                this.shipping_shipped.push(i);
                this.shipping_shipped_status = true;
              } else if (item === 'Shipping Incident') {
                this.shipping_incident.push(i);
                this.shipping_incident_status = true;
              } else if (item === 'Draft Pending') {
                this.draft_pending.push(i);
                this.draft_pending_status = true;
              } else if (item === 'Draft Uploaded') {
                this.draft_unloaded.push(i);
                this.draft_unloaded_status = true;
              } else if (item === 'Draft Overdue') {
                this.draft_overdue.push(i);
                this.draft_overdue_status = true;
              } else if (item === 'Post Pending') {
                this.post_pending.push(i);
                this.post_pending_status = true;
              } else if (item === 'Post Overdue') {
                this.post_overdue.push(i);
                this.post_overdue_status = true;
              } else if (item === 'Commission Pending') {
                this.commission_pending.push(i);
                this.commission_pending_status = true;
              } else if (item === 'Campaign Completed') {
                this.campaign_completed.push(i);
                this.campaign_completed_status = true;
              } else if (item === 'Campaign Uncompleted') {
                this.campaign_uncompleted.push(i);
                this.campaign_uncompleted_status = true;
              }
          }
          this.loadingService.hide();
        }, err => {})
      );
  }

  influencerList(data) {
    const influencerList = [];
    data.forEach(campaign => {
                const campaignConcise = this.getConciseCampaign(campaign);
                if (campaign.influencer_info.profile.influencer?.profile) {
                  campaign.influencer_info.checked = false;
                  campaign.influencer_info.campaign = campaignConcise;
                  influencerList.push(campaign.influencer_info);
                }
            });
    return influencerList;
  }

  getConciseCampaign(campaign) {
    return {
        brand_campaign_id: campaign.brand_campaign_id,
        campaign_name: campaign.campaign_name,
        platform: campaign.platform,
        end_time: campaign.end_time,
        post_time: campaign.post_time,
        start_post_time: campaign.start_post_time,
        product_name: campaign.product_name,
        product_price: campaign.product_price,
        brand_id: campaign.brand_id,
        configuration: campaign.configuration,
    };
  }

  getStatus(influencer) {
    if (!influencer) {
        return 'Unknown';
    }
    // Application
    if (influencer.application_time && !influencer.offer_accept_time) {
        return 'Application Applied';
    }
    if (influencer.offer_accept_time && !influencer.order) {
      return 'Application Order Pending';
    }
    // Shipping
    if (influencer.order && !influencer.product_received_time && !influencer.campaign_close_time &&
      (!influencer.shipping_incident || influencer.shipping_incident.status === 'open')) {
        if (!influencer.shipping_info) {
          return 'Shipping Shipment Pending';
        }
        if (influencer.shipping_info) {
          return 'Shipping Shipped';
        }
    }
    if (influencer.shipping_incident && influencer.shipping_incident.status !== 'resolved') {
        return 'Shipping Incident';
    }
    // Draft 获取当前时间，查看是否逾期
    if (influencer.product_received_time > 0 && !influencer.content_approve_time && !influencer.campaign_close_time && (!influencer.shipping_incident || influencer.shipping_incident.status === 'open')) {
          influencer.draft_deadline = influencer.product_received_time + influencer.campaign.configuration.delivery_deadline * 3600;
          if (influencer.content_submit_time) {
              influencer.inf_campaign_id = influencer.account_id;
              return 'Draft Uploaded';
          } else if (influencer.draft_deadline > dayjs().unix()) {
            return 'Draft Pending';
          } else {
            return 'Draft Overdue';
          }
    }
    // Post 获取当前时间，查看是否逾期
    if (influencer.content_approve_time > 0 && !influencer.submit_post_time && !influencer.campaign_close_time && (!influencer.shipping_incident || influencer.shipping_incident.status === 'open')) {
      influencer.post_deadline = influencer.content_approve_time + 24 * 3600;
      // return times;
      if (influencer.post_deadline > dayjs().unix()) {
        return 'Post Pending';
      } else {
        return 'Post Overdue';
      }
    }
    // Commission
    if ( influencer.submit_post_time > 0 && !influencer.commission_paid_time && !influencer.campaign_close_time &&  (!influencer.shipping_incident || influencer.shipping_incident.status === 'open')) {
        return 'Commission Pending';
    }
    // Completed
    if (influencer.commission_paid_time > 0) {
        return 'Campaign Completed';
    }
    if (influencer.commission_close_time > 0) {
        return 'Campaign Uncompleted';
    }
    return 'Pending';
  }

}
