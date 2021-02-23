import { Component, OnInit, ViewChild } from '@angular/core';
import { ShopifyService } from '@src/app/services/shopify.service';
import { ShopifyProductDetail } from '@src/types/campaign';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'app-shop-management',
    templateUrl: './shop-management.component.html',
    styleUrls: ['./shop-management.component.scss'],
})
export class ShopManagementComponent implements OnInit {
    @ViewChild('tableSearch') tableSearch;
    @ViewChild('listLabel') listLabel;
    @ViewChild('specials') specials;
    productList: ShopifyProductDetail[] = [];
    loading = false;
    shopData = [];
    shopSearchData = [];
    subscriptions: Subscription[] = [];
    expandSet = new Set<number>();
    labelTagList = [];
    influencerList = [];

    listOfColumns = [
        {
            name: 'Product',
            sortOrder: null,
            sortFn: (a, b) => a.title.localeCompare(b.title),
            left: true,
        },
        {
            name: 'Vendor',
            sortOrder: null,
            sortFn: (a, b) => a.vendor.localeCompare(b.vendor),
        },
        {
            name: 'Compare At Price',
            sortOrder: null,
            sortFn: (a, b) => a.variants[0].compare_at_price - b.variants[0].compare_at_price,
        },
        {
            name: 'Vendor Discount',
            sortOrder: null,
            sortFn: (a, b) => a.discount - b.discount,
        },
        {
            name: 'Cost',
            sortOrder: null,
            sortFn: (a, b) => a.variants[0].compare_at_price * (100 - a.discount) - b.variants[0].compare_at_price * (100 - b.discount),
        },
        {
            name: 'Commission Per Sale',
            sortOrder: null,
            sortFn: (a, b) => a.commission - b.commission,
        },
        {
            name: 'Sales Price',
            sortOrder: null,
            sortFn: (a, b) => a.variants[0].price - b.variants[0].price,
        },
      ];

    constructor(
        private shopifyService: ShopifyService,
    ) { }

    ngOnInit(): void {
        this.initShopifyInfo();
    }

    initShopifyInfo() {
        this.loading = true;
        this.shopifyService.updateShopifyProductInfo('lifo-store.myshopify.com').subscribe(result => {
            const products = result.products;
            console.log(products, 'products');
            this.productList = result.products;
            this.shopData = result.products;
            this.shopifyService.listShopItem().then(items => {
                const active_items = items.items;
                console.log(active_items, 'items');
                products.forEach(product => {

                    product.variants[0].price = Number(product.variants[0].price);
                    if (!product.variants[0].compare_at_price) {
                        product.variants[0].compare_at_price = product.variants[0].price;
                    }
                    product.variants[0].compare_at_price = Number(product.variants[0].compare_at_price);
                    let exist = false;
                    active_items.forEach(item => {
                        if (item.product_id === product.id) {
                            exist = true;
                            product.discount = item.discount;
                            product.commission = item.commission;
                            product.active = item.status === 'active';

                            product.additional_commission = item.additional_commission ? item.additional_commission : '';
                            product.commission_offer_deadline = item.commission_offer_deadline ? item.commission_offer_deadline : '';
                            product.commission_offer_begin_time = item.commission_offer_begin_time ? item.commission_offer_begin_time : '';

                            product.additional_discount = item.additional_discount ? item.additional_discount : '';
                            product.discount_deadline = item.discount_deadline ? item.discount_deadline : '';
                            product.discount_begin_time = item.discount_begin_time ? item.discount_begin_time : '';

                            product.related_campaign_id = item.related_campaign_id ? item.related_campaign_id : '';

                            product.promoted = item.promoted ? item.promoted : false;

                            product.sample_price = item.sample_price ? item.sample_price : '';
                            product.commission_event = typeof(item.commission_event) == 'undefined' ? false : item.commission_event;
                            product.discount_event = typeof(item.discount_event) == 'undefined' ? false : item.discount_event;
                            product.show_campaign_history = typeof(item.show_campaign_history) == 'undefined' ? false : item.show_campaign_history;
                            product.promoted = typeof(item.promoted) == 'undefined' ? false : item.promoted;
                            product.allow_sample = typeof(item.allow_sample) == 'undefined' ? false : item.allow_sample;
                        }
                    });

                    if (!exist) {
                        product.discount = Math.round((1 - product.variants[0].price / product.variants[0].compare_at_price) * 100);
                        product.commission = 0;
                        product.active = false;
                    }
                });

                this.loading = false;
                // console.log(this.productList, 'products111');
            });


        });
    }

    reloadDatas(e) {
        // console.log('reload');
    }

    isShowListLabel(ids) {
        this.listLabel.listId = ids;
        this.listLabel.title = 'Product Labeling Board';
        this.listLabel.showModal();
    }

    shopSearch(vals) {
        // console.log(vals, 'search-value');
        this.productList = vals;
    }

    shopRefresh() {
        this.initShopifyInfo();
        this.tableSearch.searchValue = '';
        this.tableSearch.selectItem = 'product_name';
    }

    trackByName(_: number, item): string {
        return item.title;
    }

    getData(msg) {
        this.onExpandChange(msg, true);
    }

    onExpandChange(id: number, checked: boolean): void {
        if (checked) {
          this.expandSet.add(id);
          this.getLabelList(id);
        } else {
          for (const i of this.productList) {
            if (i.id === id) {
                i['label_list'] = [];
            }
        }
          this.expandSet.delete(id);
        }
    }

    getLabelList(id) {
        this.subscriptions.push(
            this.shopifyService.getLabelAllList(id).subscribe((result) => {
              this.labelTagList = result;
            for (const i of this.productList) {
                if (i.id === id) {
                    i['label_list'] = this.calChildren(result);
                }
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
              // console.log(j,555)
             }
           }
        }
       return filtParent;
     }

    uploadShopItem(product) {
        const new_price = Math.round((product.variants[0].compare_at_price * (100 - product.discount) / 100 + product.commission) * 100) / 100;
        console.log(new_price);
        this.shopifyService.uploadShopItem({
            product_id: product.id,
            discount: product.discount,
            commission: product.commission,
            compare_at_price: Math.round(product.variants[0].compare_at_price * 100) / 100,
            price: new_price,
            vendor: product.vendor,
            title: product.title,
            image: product.image?.src,
        }).then(result => {
            console.log(result);
            product.active = true;
            product.editable = false;
            product.variants[0].price = new_price;
        });
    }

    offloadShopItem(product) {
        this.shopifyService.offloadShopItem(product.id).then(result => {
            console.log(result);
            product.active = false;
        });
    }


    commissionError(product) {
        if (product.commission <= 0) {
            return 'Please enter a price > 0';
        }
        const max = product.variants[0].compare_at_price * product.discount / 100;
        if (product.commission > (max + 0.01)) {
            return 'Please enter a price < max';
        }
    }


    switch(product) {
        console.log(product.active);
        if (!product.active) {
            this.uploadShopItem(product);
        } else {
            this.offloadShopItem(product);
        }
    }
}
