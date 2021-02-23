import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { VideoMetaData, Campaign, CampaignDetail, BrandCampaign, CampaignPerformance } from 'src/types/campaign';
import { AngularFireAuth } from '@angular/fire/auth';
import { catchError } from 'rxjs/operators';
import { Thread } from 'src/types/thread';
import { InfluencerInfo } from 'src/types/influencer';
import { environment } from '@src/environments/environment';
import { RequestService } from '@services/request.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class CampaignService {
    CAMPAIGN_SERVICE_URL = environment.campaignService;
    DISCOVER_SERVICE_URL = environment.discoverService;

    constructor(private http: HttpClient, private requestService: RequestService, public auth: AngularFireAuth, private translate: TranslateService) {}

    async getAllCampaignForUser() {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/get_campaign`;
        return this.http.get<Campaign[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    /** 翻译 */
    translates(key: string) {
        return this.translate.instant(key);
    }

    async getFaqAll() {
        const token = await (await this.auth.currentUser).getIdToken();
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/common/faq`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getCampaignById(campaignId) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/common/campaign/campaign_id/${campaignId}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    // label
    getLabelList() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${ this.DISCOVER_SERVICE_URL }/am/label/label`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    addLabelItem(campaign) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/am/label/label`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    getLabelAllList(id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${ this.DISCOVER_SERVICE_URL }/am/label/list?list=${id}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getLabelAllInfluencer(account_id, platform) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${ this.DISCOVER_SERVICE_URL }/am/label/social-account?account_id=${account_id}&platform=${platform}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getLabelAllCampaign(id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${ this.DISCOVER_SERVICE_URL }/am/label/campaign?campaign=${id}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getCampaignList(platform, id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${ this.CAMPAIGN_SERVICE_URL }/am/influencer-campaign/platform/${platform}/${id}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    addLabelList(campaign) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/am/label/list`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    addLabelInfluencer(campaign) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/am/label/social-account`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    addLabelCampaign(campaign) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/am/label/campaign`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    addLabelShop(campaign) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/am/label/shop-product`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    async getCampaignByIdInfluencer(campaignId) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/get_campaign/campaign_id/${campaignId}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async getBrandCampaignById(brandCampaignId) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/common/campaign/brand_campaign_id/${brandCampaignId}`;
        return this.http.get<BrandCampaign>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async createCamapaign(campaign) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/create_campaign`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    async updateCampaignById(campaign, campaignId) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/update_campaign/campaign_id/${campaignId}`;
        return this.http.put<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    async deleteCampaignById(campaignId) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/delete_campaign/campaign_id/${campaignId}`;
        return this.http.delete<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    deleteBrandCampaignById(campaignId) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/campaign/brand_campaign_id/${campaignId}`;
        return this.http.delete<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async completeCampaign(campaign) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/complete_campaign/campaign_id/${campaign.campaign_id}`;
        return this.http.put<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    async signupCampaign(campaign: CampaignDetail) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/sign_up_campaign/brand_campaign_id/${campaign.brand_campaign_id}`;
        return this.http.put<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    async provideFeedback(content, campaignId, historyId) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/feedback/campaign_id/${campaignId}/history_id/${historyId}`;
        return this.http.put<any>(reqeustUrl, content, httpOptions).pipe(catchError(this.handleError));
    }

    async getAllBrandCamapignInf() {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/list_brand_campaigns_inf`;
        return this.http.get<CampaignDetail[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    createBrandCampaign(campaign) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/campaign`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    bookDemo(campaign) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/brand/book_demo`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    searchAmazonValue(campaign_id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `https://dealsite-4lladlc2eq-uc.a.run.app/share/get_item_info/${campaign_id}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    searchShopifyValue(campaign_user, campaign_id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `https://discover-test.lifo.ai/brand/shopify_single_product?shop=${campaign_user}&product_id=${campaign_id}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    updateCommonCampaign(campaign, campaign_id) {
        return this.requestService.sendRequest({
            method: 'PUT',
            url: `/brand/update_campaign/brand_campaign_id/${campaign_id}`,
            data: campaign,
        });
    }

    reviewCommission(campaign) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/review_commission`;
        return this.http.post<any>(reqeustUrl, campaign, httpOptions).pipe(catchError(this.handleError));
    }

    getInfluencerList() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/influencer_list`;
        return this.http.get<CampaignDetail[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getInfluencerListById(id: string) {
        return this.requestService.sendRequest<{
            name: string;
            id: string;
            ins_list: string[];
            platform: string;
        }>({
            method: 'GET',
            url: `/am/influencer_list/${id}`,
        });
    }

    setInfluencer(request) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/am/influencer_list`;
        return this.http.post<any>(reqeustUrl, request, httpOptions);
    }

    renameInfluencerList(id: string, newName: string) {
        return this.requestService.sendRequest({
            method: 'PUT',
            url: `/am/influencer_list/${id}`,
            data: { name: newName },
        });
    }

    deleteInfluencerList(id: string) {
        return this.requestService.sendRequest({
            method: 'DELETE',
            url: `/am/influencer_list/${id}`,
        });
    }

    getBrandCampaign() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/campaign`;
        return this.http.get<CampaignDetail[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getBrandCampaignDetail(brandCampaignId) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/campaign/brand_campaign_id/${brandCampaignId}`;
        return this.http.get<CampaignDetail[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getBrandCampaignPerformance(brandId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/post_perf/brand_id/${brandId}`;
        return this.http.get<CampaignPerformance>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async getCommissionType() {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/get_brand_campaign_types`;
        return this.http.get<Campaign[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async getInfluencerProfile(uid) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/common/influencer_profile/uid/${uid}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    shareContent(toEmail: string, fromEmail: string, url: string) {
        const request = {
            to_email: toEmail,
            email: fromEmail,
            url,
        };
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = 'https://api-general-4lladlc2eq-uc.a.run.app/share';
        return this.http.post<any>(reqeustUrl, request, httpOptions);
    }

    getImageMetaData(imageUrl: string) {
        const url = `http://video-transcoder-k8s.default.35.193.22.35.xip.io/get_image_meta/name/${encodeURIComponent(imageUrl)}`;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };

        return this.http.get<any>(url, httpOptions);
    }

    getVideoMetaData(videoUrl: string, videoType: string = 'video/mp4'): Observable<any> {
        const data = {
            name: videoUrl,
            contentType: 'video/mp4',
        };

        const url = `http://video-transcoder-k8s.default.35.193.22.35.xip.io/get_video_meta/name/${encodeURIComponent(videoUrl)}`;

        const httpParms = new HttpParams().set('name', encodeURIComponent(videoUrl)).set('contentType', encodeURIComponent('video/mp4'));
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
            // params: httpParms,
        };

        return this.http.get<any>(url, httpOptions).pipe(catchError(this.handleError));
    }

    transcodeVideo(videoUrl: string, videoType: string = 'video/mp4'): Observable<VideoMetaData> {
        const data = {
            name: videoUrl,
            contentType: videoType,
        };
        const url = 'http://video-transcoder-k8s.default.35.193.22.35.xip.io/transcode_gcs';
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        return this.http.post<any>(url, data, httpOptions);
    }

    async createContractSign(signRequest) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/signature_request/create_embedded_with_template`;
        return this.http.post<any>(reqeustUrl, signRequest, httpOptions).pipe(catchError(this.handleError));
    }

    getSignUrl(brandCampaignId, email) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/share/embedded/sign_url/brand_campaign_id/${brandCampaignId}/email/${email}`;
        return this.http.get<CampaignDetail[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getSignUrlByEmail(brandCampaignId, email) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/embedded/sign_url/brand_campaign_id/${brandCampaignId}/inf_email/${email}`;
        return this.http.get<CampaignDetail[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    async influencerSignComplete(brandCampaignId: string, signatureId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/
        signature_complete/brand_campaign_id/${brandCampaignId}/
        signature_id/${signatureId}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(catchError(this.handleError));
    }

    async brandSignComplete(brandCampaignId: string, signatureId: string) {
        const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: `${token}`,
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/
        brand/signature_complete/brand_campaign_id/${brandCampaignId}/
        signature_id/${signatureId}`;
        return this.http.put<any>(reqeustUrl, {}, httpOptions).pipe(catchError(this.handleError));
    }

    downloadContract(signature_request_id: string): Observable<Blob> {
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/common/signature_request/files/signature_request_id/${signature_request_id}`;
        return this.http.get(reqeustUrl, { responseType: 'blob' }).pipe(catchError(this.handleError));
    }

    async getInfluencerCampaignDetail(brandCampaignId: string, accountId: string) {
        // const token = await (await this.auth.currentUser).getIdToken();

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/share/influencer/brand_campaign_id/${brandCampaignId}/account_id/${accountId}`;
        return this.http.get<CampaignDetail[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    inputInfluencerInfo(brandCampaignId: string, accountId: string, influencerInfo: InfluencerInfo) {
        // /share/influencer
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/influencer/influencer`;
        return this.http
            .put<any>(
                reqeustUrl,
                {
                    brand_campaign_id: brandCampaignId,
                    account_id: accountId,
                    inf_name: influencerInfo.inf_name,
                    inf_email: influencerInfo.inf_email,
                    inf_phone: influencerInfo.inf_phone,
                    influencer_address1: influencerInfo.influencer_address1,
                    influencer_address2: influencerInfo.influencer_address2,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    declineInfluencerOffer(brandCampaignId: string, accountId: string, decline_type: string, decline_text_reason: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/influencer/influencer_offer`;
        return this.http
            .put<any>(
                reqeustUrl,
                {
                    brand_campaign_id: brandCampaignId,
                    account_id: accountId,
                    accept: false,
                    decline_type,
                    decline_text_reason,
                },
                httpOptions
            )
            .pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(`Backend returned code ${error.status}, ` + `body was: ${JSON.stringify(error.error)}`);
        }
        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    }

    async getAllMediaForCampaign(type: string, campaignId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/common/media/campaign_type/${type}/campaign_id/${campaignId}}`;
        return this.http.get<any>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    getThread(path: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/share/get_threads/media_object_path/${encodeURIComponent(path)}`;
        return this.http.get<Thread[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    createThread(path: string, feedback: string) {
        const request = {
            media_object_path: path,
            feedback_str: feedback,
        };

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/share/create_feedback_thread`;
        return this.http.post<any>(reqeustUrl, request, httpOptions).pipe(catchError(this.handleError));
    }

    replyThread(path: string, feedback: string, threadId: string) {
        const request = {
            media_object_path: path,
            feedback_str: feedback,
            thread_id: threadId,
        };
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/share/reply_feedback_thread`;
        return this.http.post<any>(reqeustUrl, request, httpOptions).pipe(catchError(this.handleError));
    }

    // Finalize Campaign
    async finalizeCampaign(content, campaignId, historyId) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/share/finalize_campaign/campaign_id/${campaignId}/history_id/${historyId}`;
        return this.http.put<any>(reqeustUrl, content, httpOptions).pipe(catchError(this.handleError));
    }

    approveCampaignContent(campaignId, historyId) {
        return this.requestService.sendRequest(
            {
                method: 'PUT',
                url: `/brand/approve/campaign_id/${campaignId}/history_id/${historyId}`,
                data: {},
            },
            this.CAMPAIGN_SERVICE_URL
        );
    }

    getBrandCampaignStatus(brandCampaignId) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/brand/brand_campaign_status/brand_campaign_id/${brandCampaignId}`;
        return this.http.get<Thread[]>(reqeustUrl, httpOptions).pipe(catchError(this.handleError));
    }

    deleteThread(path: string, threadId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        const reqeustUrl = `${this.CAMPAIGN_SERVICE_URL}/share/delete_thread/media_object_path/${path}/thread_id/${threadId}`;
        return this.http.delete<any>(reqeustUrl, httpOptions);
    }

    downloadCampaignData(contents) {
        return this.requestService.sendRequest(
            {
                method: 'POST',
                url: '/brand/storage/download',
                data: contents,
            },
            this.DISCOVER_SERVICE_URL
        );
    }

    // downloadCampaignData(contents): Observable<ArrayBuffer> {
    //     const reqeustUrl = `${this.DISCOVER_SERVICE_URL}/brand/storage/download`;
    //     return this.http.post(reqeustUrl, contents, {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/json',
    //         }),
    //         responseType: 'arraybuffer',
    //     });
    // }

}
