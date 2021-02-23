import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { VALID_MEMORY_OPTIONS } from 'firebase-functions';
import { CampaignService } from '@services/campaign.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-influencer-list-labeling',
  templateUrl: './influencer-list-labeling.component.html',
  styleUrls: ['./influencer-list-labeling.component.scss'],
})
export class InfluencerListLabelingComponent implements OnInit {
  @Output() private childOuter = new EventEmitter();
  @Input() defaultLabelTagList;
  @Input() pageName;
  @ViewChild('labelCommon01') labelCommon01;
  @ViewChild('labelCommon02') labelCommon02;
  @ViewChild('labelCommon03') labelCommon03;
  @ViewChild('labelCommon04') labelCommon04;

  subscriptions: Subscription[] = [];
  isVisible = false;
  title = 'List Labeling Board';
  listId = '';
  platform = '';
  isConfirmLoading = false;

  influencerContent01 = [];
  influencerContent02 = [];
  attributesArr = [];
  platformArr = [];
  contentArr = [];
  productArray = [];

  // attributesContent = [];


  constructor(
    public campaignService: CampaignService
  ) {}
  ngOnInit() {
    // this.getAllList();
  }

  getAllList() {
    this.attributesArr = [];
    this.platformArr = [];
    this.contentArr = [];
    this.productArray = [];
    this.subscriptions.push(
      this.campaignService.getLabelList().subscribe((result) => {
        for (const item of result) {
          item['checked'] = false;
          for (const k of this.defaultLabelTagList) {
            if (k.id === item.id) {
              item['checked'] = true;
            }
          }
          if (item.type === 'attributes') {
            this.attributesArr.push(item);
          } else if (item.type === 'platform') {
            this.platformArr.push(item);
          } else if (item.type === 'content') {
            this.contentArr.push(item);
          } else if (item.type === 'product') {
            this.productArray.push(item);
          }
        }
        // console.log(this.attributesArr);
        // console.log(this.platformArr);
        // console.log(this.contentArr);
        if (this.pageName !== 'shop_product') {
          this.labelCommon01.isShowDefault();
          this.labelCommon02.isShowDefault();
          this.labelCommon03.isShowDefault();
        } else {
          this.labelCommon04.isShowDefault();
        }


      }, err => {})
   );
  }


  showModal(): void {
    this.isVisible = true;
    this.getAllList();
  }

  handleClose(obj, removedTag: {}): void {
    this[obj] = this[obj].filter(tag => tag !== removedTag);
  }


  handleOk() {
    let arrParam01 = [];
    let arrParam02 = [];
    let arrParam03 = [];
    let arrParam04 = [];
    if (this.pageName !== 'shop_product') {
      arrParam01 = this.labelCommon01.calLabelId();
      arrParam02 = this.labelCommon02.calLabelId();
      arrParam03 = this.labelCommon03.calLabelId();
    } else {
      arrParam04 = this.labelCommon04.calLabelId();
    }
    if (arrParam01.length !== 0 || arrParam02.length !== 0 || arrParam03.length !== 0 || arrParam04.length !== 0) {
      if (this.pageName === 'list') {
          this.subscriptions.push(
            this.campaignService.addLabelList({
              list: this.listId,
              label: [...arrParam01, ...arrParam02, ...arrParam03],
            }).subscribe((result) => {
              this.isVisible = false;
              this.childOuter.emit(this.listId);
            }, err => {})
          );
      } else if (this.pageName === 'influencer') {
        this.subscriptions.push(
          this.campaignService.addLabelInfluencer({
            account_id: this.listId,
            platform: this.platform,
            label: [...arrParam01, ...arrParam02, ...arrParam03],
          }).subscribe((result) => {
            this.isVisible = false;
            this.childOuter.emit(this.listId);
          }, err => {})
        );
      }else if (this.pageName === 'shop_product') {
        this.subscriptions.push(
          this.campaignService.addLabelShop({
            product_id: this.listId,
            shop: 'lifo-store',
            label: [...arrParam04],
          }).subscribe((result) => {
            this.isVisible = false;
            this.childOuter.emit(this.listId);
          }, err => {})
        );
    }
    else if (this.pageName === 'campaign') {
        this.subscriptions.push(
          this.campaignService.addLabelCampaign({
            campaign: this.listId,
            label: [...arrParam01, ...arrParam02, ...arrParam03],
          }).subscribe((result) => {
            this.isVisible = false;
            this.childOuter.emit(this.listId);
          }, err => {})
        );
      }
    } else {
      this.isVisible = false;
    }
  }

  handleCancel(): void {
      this.isVisible = false;
  }

}
