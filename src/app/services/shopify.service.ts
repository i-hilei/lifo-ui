import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '@src/environments/environment';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RequestService } from './request.service';

@Injectable({
    providedIn: 'root',
})
export class ShopifyService {
    DISCOVER_SERVICE_URL = environment.discoverService;
    constructor(
        private http: HttpClient,
        public auth: AngularFireAuth,
        private requestService: RequestService,
    ) {}

    async getShopifyShopInfo(shopName: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/am/shopify_shop_info?shop=${shopName}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    setSpecialOffers(campaign) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/am/update_product`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    getReferralsList(id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `https://campaign-test.lifo.ai/am/referrals/${id}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    async getShopifyCustomerInfo(shopName: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/am/shopify_customers?shop=${shopName}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    async updateShopifyCustomerInfo(shopName: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/am/shopify_customers?shop=${shopName}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    getLabelAllList(id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${ this.DISCOVER_SERVICE_URL }/am/label/shop-product?shop=lifo-store&product_id=${id}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }


    getShopifyProductInfo(shopName: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/brand/shopify_product_info?shop=${shopName}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }


    updateShopifyProductInfo(shopName: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/brand/shopify_product_info?shop=${shopName}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    async getShopifySingleProductInfo(shopName: string, productId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/am/shopify_single_product?shop=${shopName}&product_id=${productId}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    createCampaignPayment(shopName: string, campaignId: string, amount: number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const body = {
            shop: shopName,
            campaign_id: campaignId,
            due_amount: amount,
        };
        if (!environment.production) {
            body['is_test'] = true;
        }
        const reqeustUrl = `${environment.discoverService}/brand/create_campaign_payment`;
        return this.http.post<any>(reqeustUrl, body, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    updateCampaignChargeInfo(shopName: string, campaignId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/brand/retrieve_campaign_charge`;
        return this.http.put<any>(reqeustUrl, {
            shop: shopName,
            campaign_id: campaignId,
        }, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    activateCampaignPayment(shopName: string, campaignId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/brand/activate_campaign_charge`;
        return this.http.post<any>(reqeustUrl, {
            shop: shopName,
            campaign_id: campaignId,
        }, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    createOrder(shopName: string, campaignId: string, accountId: string, orderInfo) {
        return this.requestService.sendRequest<any>(
            {
                method: 'POST',
                url: '/brand/create_order',
                data: {
                    shop: shopName,
                    campaign_id: campaignId,
                    account_id: accountId,
                    ...orderInfo,
                },
            },
            environment.discoverService
        );
    }

    viewOrder(shopName: string, orderId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/brand/view_order?shop=${shopName}&order_id=${orderId}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    updateOrder(shopName: string, campaignId: string, accountId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/brand/update_order`;
        return this.http.put<any>(reqeustUrl, {
            shop: shopName,
            campaign_id: campaignId,
            account_id: accountId,
        }, httpOptions).pipe(
            catchError(this.handleError)
        );
    }


    createPriceRule(shop: string,
                    campaign_id: string,
                    coupon_discount_percentage: number,
                    product_id: number,
                    target_selection= 'entitled') {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/brand/create_price_rule`;
        return this.http.post<any>(reqeustUrl, {
            shop,
            campaign_id,
            coupon_discount_percentage,
            product_id,
            target_selection,
        }, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    createCouponCode(shop: string, campaign_id: string, account_id: string, coupon_code: string, price_rule_id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
            }),
        };
        const reqeustUrl = `${environment.discoverService}/brand/create_coupon_code`;
        return this.http.post<any>(reqeustUrl,  {
            shop,
            campaign_id,
            account_id,
            coupon_code,
            price_rule_id,
        }, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    listShopItem() {
        return this.requestService.sendRequest<any>(
            {
                method: 'GET',
                url: '/shared/list_product',
            },
            environment.discoverService
        );
    }

    uploadShopItem(shop_item) {
        return this.requestService.sendRequest<any>(
            {
                method: 'POST',
                url: '/am/upload_product',
                data: shop_item,
            },
            environment.discoverService
        );
    }

    offloadShopItem(product_id) {
        return this.requestService.sendRequest<any>(
            {
                method: 'POST',
                url: '/am/offload_product',
                data: {product_id},
            },
            environment.discoverService
        );
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError(
            'Something bad happened; please try again later.');
    };
}
