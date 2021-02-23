import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { ShopifyService } from '@src/app/services/shopify.service';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';

@Component({
  selector: 'app-order-pending-status',
  templateUrl: './order-pending-status.component.html',
  styleUrls: ['../../application-view/application-view.component.scss'],
})
export class OrderPendingStatusComponent implements OnInit, OnChanges {
  @ViewChild('influencerProfile') influencerProfile;
  @ViewChild('campaignDetail') campaignDetail;
  @Input() orderPendingInfluencers = [];
  orderPendingTableLoading = true;
  allOrderPendingChecked = false;
  orderPendingIndeterminate = false;
  orderInfo;
  acceptInfluencer;
  isCreatingOrder = false;
  showCreateOrderModal = false;

  brand_campaign_id = '';
  account_id = '';

  constructor(
    private shopifyService: ShopifyService,
    private internalService: InternalService,
    private notificationService: NotificationService,
  ) { }

  batchCreateOrder() {
    this.orderPendingInfluencers.forEach(influencer => {
        if (influencer.checked) {
            this.updateOrderInfo(influencer);
            this.createOrder(influencer);
        }
    });
  }

  checkAllOrderPending(value: boolean): void {
    this.orderPendingInfluencers.forEach(data => {
        if (!data.disabled) {
            data.checked = value;
        }
    });
    this.refreshOrderPendingStatus();
  }

  showFullModals(val) {
    this.influencerProfile.influencer = val;
    this.influencerProfile.showModals();
  }

  showDetailModals(val) {
    this.campaignDetail.campaignId = val['campaign']['brand_campaign_id'];
    this.campaignDetail.showModals();
  }

  refreshOrderPendingStatus(): void {
    const validData = this.orderPendingInfluencers.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allOrderPendingChecked = allChecked;
    this.orderPendingIndeterminate = !allChecked && !allUnChecked;
  }

  createOrder(influencer) {
    this.isCreatingOrder = true;
    this.shopifyService.createOrder(
        influencer.campaign.brand_id,
        influencer.campaign.brand_campaign_id,
        influencer.account_id,
        this.orderInfo
    ).then(result => {
        if (result.errors) {
            // Show error
            this.notificationService.addMessage({
                type: AlertType.Error,
                title: 'Create Order Error',
                message: JSON.stringify(result.errors),
                duration: 3000,
            });
            this.isCreatingOrder = false;
            return;
        }
        this.showCreateOrderModal = false;
        this.isCreatingOrder = false;
        this.notificationService.addMessage({
            type: AlertType.Success,
            title: 'Create Order Succeed',
            message: 'Order created and now pending fulfillment.',
            duration: 3000,
        });
    });
  }

  startCreateOrder(influencer) {
    this.acceptInfluencer = influencer;
    // let selectProduct: ShopifyProductDetail;
    // this.productList.forEach(product => {
    //     if (product.title === this.campaign.product_name) {
    //         selectProduct = product;
    //     }
    // });
    // this.selectProduct = selectProduct;
    this.updateOrderInfo(influencer);
    this.showCreateOrderModal = true;
  }

  ngOnInit() {

  }

  get orderPendingChecked() {
    return this.orderPendingInfluencers.filter(inf => inf.checked).length;
  }

  updateOrderInfo(influencer) {
    this.orderInfo = {
        // product_name: selectProduct ? selectProduct.title : '',
        variant_id: influencer.variant_id ? influencer.variant_id : '',
        product_price: influencer.campaign.product_price,
        first_name: influencer.inf_name,
        last_name: influencer.inf_last_name,
        email: influencer.email,
        phone_number: influencer.inf_phone,
        address_line_1: influencer.influencer_address1,
        address_line_2: influencer.influencer_address2,
        city: influencer.influencer_city,
        province: influencer.influencer_province,
        country: influencer.influencer_country,
        zip: influencer.influencer_zip,
    };
  }

  cancelCreateOrder() {
    this.showCreateOrderModal = false;
  }

  validateOrder() {
    if (!this.orderInfo.variant_id) {
        return 'Product could not be empty!';
    }
    if (!this.orderInfo.first_name || !this.orderInfo.last_name) {
        return 'First name / Last name could not be empty!';
    }
    if (!this.orderInfo.address_line_1) {
        return 'Address could not be empty!';
    }
    return '';
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

  ngOnChanges() {
    if (this.orderPendingInfluencers.length !== 0) {
      this.orderPendingTableLoading = false;
    }
  }

}
