import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { CampaignDetail, CampaignPerformance } from 'src/types/campaign';
import { AngularFireAuth } from '@angular/fire/auth';
import { catchError } from 'rxjs/operators';
import { environment } from '@src/environments/environment';
import { RequestService } from '@services/request.service';

@Injectable({
    providedIn: 'root',
})
export class InternalService {
    DISCOVER_SERVICE_URL = environment.discoverService;
    CAMPAIGN_SERVICE_URL = environment.campaignService;
    AUTH_SERVICE_URL = 'https://auth.lifo.ai';
    LOCAL_SERVICE_URL = environment.localApiService;

    constructor(private http: HttpClient, private requestService: RequestService, public auth: AngularFireAuth) {}

    getInfluencerSearchOptions(type: string, query: string = ''): Observable<any> {
        // const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                // Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        if (query) {
            type = `${type}?query=${query}`;
        }
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/brand/instagram/${type}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getInfluencerSearchlocations(val) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/locations/search-us-city?input=${val}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async searchInfluencer(searchBody, platform) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/am/modash/search?platform=${platform}`;
        return this.http.post<any>(reqeustUrl, searchBody, httpOptions).pipe(catchError(this.handleError));
    }

    deleteInfluencerItem(id, name) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/influencer_list/remove_influencer/${id}/${name}`;
        return this.http.put<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async getInfluencerProfile(username: string = 'instagram', platform: string = 'instagram') {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/am/modash/profile?userId=${username}&platform=${platform}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getBatchInfluencerProfile(influencer_list: string[], platform: string = 'instagram') {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/am/modash/batch_profile?platform=${platform}`;
        return this.http
            .post<any>(
                reqeustUrl,
                {
                    influencer_list,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    getBatchInfluencerProfilePromise(influencer_list: string[], platform: string = 'instagram') {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'POST',
                url: `/am/modash/batch_profile?platform=${platform}`,
                data: { influencer_list },
            },
            this.DISCOVER_SERVICE_URL
        );
    }

    getBachInfluencerProfileStepByStep(
        influencer_list: string[],
        everyStepComplted?: (completedCount: number) => void,
        platform: string = 'instagram'
    ) {
        return new Promise(async (resolve, reject) => {
            let currentIndex = 0;
            let influencerObjects = {};

            const allTimes = Math.ceil(influencer_list.length / 50);

            while (currentIndex < allTimes) {
                const keysToSend = influencer_list.slice(currentIndex * 50, (currentIndex + 1) * 50).map((str) => str.toLowerCase());
                try {
                    const data = await this.getBatchInfluencerProfilePromise(keysToSend, platform);
                    influencerObjects = { ...influencerObjects, ...data };
                    currentIndex++;
                    everyStepComplted(Object.keys(influencerObjects).length);
                } catch (err) {
                    reject(err);
                }
            }

            resolve(influencerObjects);
        });
    }

    getGlobalList() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/campaign_configuration/brand_campaign_id/global`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getReferral() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.LOCAL_SERVICE_URL}/referral`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getConversion() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.LOCAL_SERVICE_URL}/referral/conversion`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getShopKPI() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/shop-statistics`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    putGlobalList(obj) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/campaign_configuration/brand_campaign_id/global`;
        return this.http.put<any>(reqeustUrl, obj, httpOptions).pipe(catchError(this.handleError));
    }

    getFaqAll() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/common/faq`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    createFaq(obj) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/faq`;
        return this.http.post<any>(reqeustUrl, obj, httpOptions).pipe(catchError(this.handleError));
    }

    updateFaq(obj, id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/faq/${id}`;
        return this.http.put<any>(reqeustUrl, obj, httpOptions).pipe(catchError(this.handleError));
    }

    deleteFaqs(id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/faq/${id}`;
        return this.http.delete<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    addRecommendedInfluencerPromise(brandCampaignId: string, influencers, skipBrand = true) {
        return this.requestService.sendRequest(
            {
                method: 'POST',
                url: `/am/recommend_influencers/brand_campaign_id/${brandCampaignId}`,
                data: {
                    influencers,
                    skip_brand: skipBrand,
                },
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    async chooseInfluencer(brandCampaignId: string, accountId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl =
            `${this.CAMPAIGN_SERVICE_URL}/brand/choose_influencer/` + `brand_campaign_id/${brandCampaignId}/account_id/${accountId}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(catchError(this.handleError));
    }

    async skipInfluencerOffer(brandCampaignId: string, accountId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl =
            `${this.CAMPAIGN_SERVICE_URL}/brand/skip_offer/` + `brand_campaign_id/${brandCampaignId}/account_id/${accountId}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(catchError(this.handleError));
    }

    async cancelInfluencerOffer(brandCampaignId: string, accountId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl =
            `${this.CAMPAIGN_SERVICE_URL}/brand/cancel_offer/` + `brand_campaign_id/${brandCampaignId}/account_id/${accountId}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(catchError(this.handleError));
    }

    discoverMore(brandCampaignId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/discover_more_influencers/brand_campaign_id/${brandCampaignId}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(catchError(this.handleError));
    }

    completeSign(brandCampaignId: string, signatureId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl =
            `${this.CAMPAIGN_SERVICE_URL}/share/signature_complete/` + `brand_campaign_id/${brandCampaignId}/signature_id/${signatureId}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(catchError(this.handleError));
    }

    async brandCompleteSign(brandCampaignId: string, signatureId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/signature_complete/brand_campaign_id/${brandCampaignId}/signature_id/${signatureId}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(catchError(this.handleError));
    }

    async getTemplateByName(templateName: string, type: string = 'emails') {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/template/template_type/${type}/template_name/${templateName}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getAllTemplate(type: string = 'emails') {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/template/template_type/${type}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getAllTemplateBrand(type: string = 'emails') {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `assets/${type}.json`;
        // const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/template/template_type/${type}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async createTemplateByName(templateName: string, body, type: string = 'emails') {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };

        body['template_name'] = templateName;
        body['template_type'] = type;
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/template`;
        return this.http.post<any>(reqeustUrl, body, httpOptions).pipe(catchError(this.handleError));
    }

    updateTemplateByName(templateName: string, subject: string, body: string, type: string = 'emails') {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/share/template/template_type/${type}/template_name/${templateName}`;
        return this.http
            .put<any>(
                reqeustUrl,
                {
                    subject,
                    body,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    deleteTemplateByName(templateName: string, type: string = 'emails') {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/template/template_type/${type}/template_name/${templateName}`;
        return this.http.delete<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    sendEmailWithTemplatePromise(
        subject,
        body,
        toEmail,
        toName,
        fileId,
        campaignName,
        brand_campaign_id,
        account_id,
        for_contract = false,
        reply_to_message_id = ''
    ) {
        return this.requestService.sendRequest(
            {
                method: 'POST',
                url: '/single_email_with_template',
                data: {
                    subject,
                    body,
                    to_email: toEmail,
                    to_name: toName,
                    file_id: fileId,
                    campaign_name: campaignName,
                    brand_campaign_id,
                    account_id,
                    for_contract,
                    reply_to_message_id,
                },
            },
            this.AUTH_SERVICE_URL
        );
    }

    async sendEmailWithTemplate(
        subject,
        body,
        toEmail,
        toName,
        fileId,
        campaignName,
        brand_campaign_id,
        account_id,
        for_contract = false,
        reply_to_message_id = ''
    ) {
        // single_email_with_template
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.AUTH_SERVICE_URL}/single_email_with_template`;
        return this.http
            .post<any>(
                reqeustUrl,
                {
                    subject,
                    body,
                    to_email: toEmail,
                    to_name: toName,
                    file_id: fileId,
                    campaign_name: campaignName,
                    brand_campaign_id,
                    account_id,
                    for_contract,
                    reply_to_message_id,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    sendEmailToBrand(subject, body, toEmail, toName, fileId, campaignName, brand_campaign_id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.AUTH_SERVICE_URL}/single_email_with_template`;
        return this.http
            .post<any>(
                reqeustUrl,
                {
                    subject,
                    body,
                    to_email: toEmail,
                    to_name: toName,
                    file_id: fileId,
                    campaign_name: campaignName,
                    brand_campaign_id,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    async getHistoricalMailInfo(mailName: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
            }),
        };
        const reqeustUrl = `${this.AUTH_SERVICE_URL}/email_thread?email=${mailName}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async saveNodtes(brandCampaignId: string, accountId: string, htmlContent: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/add_note/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`;
        return this.http
            .put<any>(
                reqeustUrl,
                {
                    note: htmlContent,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    async getEmailByThreadId(threadId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
            }),
        };
        const reqeustUrl = `${this.AUTH_SERVICE_URL}/get_thread_by_id?thread_id=${threadId}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async authorizeNylas() {
        const token = await (await this.auth.currentUser).getIdToken();
        const reqeustUrl = `${this.AUTH_SERVICE_URL}/authorize?scope=email.send,email.modify&id_token=${token}`;
        return of(reqeustUrl);
    }

    async verifyNylasSatus() {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.AUTH_SERVICE_URL}/verify_auth_status`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async internalGetAllCampaign() {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/campaign`;
        return this.http.get<CampaignDetail[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async updateProductMessage(brandCampaignId: string, accountId: string, htmlContent: string, imageList: string[]) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/inf_product_message/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`;
        return this.http
            .post<any>(
                reqeustUrl,
                {
                    product_message: htmlContent,
                    product_image_list: imageList,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    async updateOfferMessage(brandCampaignId: string, accountId: string, htmlContent: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/inf_comp_message/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`;
        return this.http
            .post<any>(
                reqeustUrl,
                {
                    compensation_message: htmlContent,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    addInfluencerCampaignPost(brandCampaignId: string, accountId: string, postDetail) {
        return this.requestService.sendRequest(
            {
                method: 'POST',
                url: '/am/post_perf',
                data: {
                    ...postDetail,
                    account_id: accountId,
                    brand_campaign_id: brandCampaignId,
                },
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    async getCampaignPerformanceById(brandCampaignId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/post_perf/brand_campaign_id/${brandCampaignId}`;
        return this.http.get<CampaignPerformance>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    // /brand/post_perf/brand_id/:brand_id
    async getBrandPerformanceById(brandId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/post_perf/brand_id/${brandId}`;
        return this.http.get<CampaignPerformance>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    createBrandUser(newUser) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/register_brand`;
        return this.http.post<any>(reqeustUrl, newUser, httpOptions).pipe(catchError(this.handleError));
    }

    getAllInfluencerList() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/influencer_list`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getInfluencerListById(list_id: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/influencer_list/${list_id}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    createNewInfluencer(influencerList) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/influencer_list`;
        return this.http.post<any>(reqeustUrl, influencerList, httpOptions).pipe(catchError(this.handleError));
    }

    addUserToInfluencerList(listId: string, insList: string[]) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/influencer_list/add_influencer/${listId}`;
        return this.http
            .put<any>(
                reqeustUrl,
                {
                    ins_list: insList,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    payCampaign(brandCampaignId: string, account_id: string, user_id: string, amount: number, product_name: string, email: string) {
        return this.requestService.sendRequest(
            {
                method: 'POST',
                url: '/brand/pay_campaign',
                data: {
                    campaign_id: brandCampaignId,
                    account_id,
                    user_id,
                    amount,
                    product_name,
                    email,
                },
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    payUpfrontCommission(brandCampaignId: string, account_id: string, user_id: string, amount: number) {
        return this.requestService.sendRequest(
            {
                method: 'POST',
                url: '/brand/pay_upfront_commission',
                data: {
                    campaign_id: brandCampaignId,
                    account_id,
                    user_id,
                    amount,
                },
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    deleteCampaignInfluencer(brandCampaignId: string, accountId: string) {
        return this.requestService.sendRequest(
            {
                method: 'DELETE',
                url: `/am/delete_campaign_influencer/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`,
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    setShipping(brandCampaignId: string, accountId: string, shippingInfo) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'PUT',
                url: `/brand/add_shipping_info/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`,
                data: shippingInfo,
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    setShippingArrived(brandCampaignId: string, accountId: string) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'PUT',
                url: `/brand/receive_shipping/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`,
                data: {},
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    addShippingIncident(brandCampaignId: string, accountId: string, incident) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'PUT',
                url: `/am/shipping_incident/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`,
                data: incident,
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    endCampaign(brandCampaignId: string, accountId: string, campaign) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'PUT',
                url: `/am/end_campaign/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`,
                data: campaign,
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    //
    calculateCommission(influencerList, maxCommission: number, bonusRate: number, productCost: number, cpm: number) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/commission`;
        return this.http
            .post<any>(
                reqeustUrl,
                {
                    influencers: influencerList,
                    max_commission: maxCommission,
                    bonus_percentage: bonusRate,
                    product_cost: productCost,
                    cpm,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    startCampaignRecruitPromise(brandCampaignId, quota, commissionMap, emailMap, bonusRate, bonusHour, maxHour, deadline) {
        return this.requestService.sendRequest(
            {
                method: 'POST',
                url: '/am/campaign_recruit',
                data: {
                    brand_campaign_id: brandCampaignId,
                    quota,
                    influencer_commissions: commissionMap,
                    inf_emails: emailMap,
                    bonus_percentage: bonusRate,
                    bonus_time: bonusHour,
                    max_time: maxHour,
                    inv_deadline: deadline,
                },
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    stopCampaignRecruit(brandCampaignId) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/stop_recruit/brand_campaign_id/${brandCampaignId}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(catchError(this.handleError));
    }

    getCampaignRecuritDetail(brandCampaignId) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/recruit-detail/brand_campaign_id/${brandCampaignId}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    updateInvitation(account_id, invitation) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/update_campaign_invitation/${account_id}`;
        return this.http.put<any>(reqeustUrl, invitation, httpOptions).pipe(catchError(this.handleError));
    }

    acceptCampaignApplication(brandCampaignId: string, accountId: string, product_name: string, email: string) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'POST',
                url: `/am/accept_application/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`,
                data: {
                    email,
                    product_name,
                },
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    skipCampaignApplication(brandCampaignId: string, accountId: string) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'POST',
                url: `/am/reject_application/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`,
                data: {},
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    getAllTransactionHistory(type, end_date) {
        return this.requestService.sendRequest<any>(
            {
                method: 'GET',
                url: `/am/transaction_history/${type}?start_date=2020-01-01&end_date=${end_date}`,
                data: {},
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    clearCashout(influencer_id: string, transaction_id: string, amount: number) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'POST',
                url: '/am/clear_cashout',
                data: {
                    influencer_id,
                    transaction_id,
                    amount,
                },
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    convertCredit(influencer_id: string, transaction_id: string) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'POST',
                url: '/am/convert_credit',
                data: {
                    influencer_id,
                    transaction_id,
                },
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    getInfluencerStatistics() {
        return this.requestService.sendRequest<any>(
            {
                method: 'GET',
                url: '/am/inflluencer/statistics',
            },
            this.DISCOVER_SERVICE_URL
        );
    }

    getInflucnerByCampaignStatus(status) {
        return this.requestService.sendRequest<any>(
            {
                method: 'GET',
                url: `/am/campaign/${status}`,
            },
        );
    }

    addPerformance(influencerList) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/brand/campaigns/score`;
        return this.http.post<any>(reqeustUrl, influencerList, httpOptions).pipe(catchError(this.handleError));
    }

    sendDraftReminderEmail(email) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'POST',
                url: '/am/send_content_overdue_email',
                data: email,
            },
            this.DISCOVER_SERVICE_URL
        );
    }

    sendPostReminderEmail(email) {
        return this.requestService.sendRequest<{ [key: string]: any }>(
            {
                method: 'POST',
                url: '/am/send_post_overdue_email',
                data: email,
            },
            this.DISCOVER_SERVICE_URL
        );
    }

    getInfluencerRecuritStatus(brandCampaignId) {}

    trackShipping(shipping_info) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/share/track_shipping/${shipping_info.carrier}/${shipping_info.tracking_number}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    shopVisitAll() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/shop_visit_by_day`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    showPaymentHistory(id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/inf_transaction_history/${id}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    shopVisitByDay(shopId) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/shop_visit_by_day?shopId=${shopId}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    }
}
