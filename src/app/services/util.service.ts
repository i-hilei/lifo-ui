import { CampaignDetail, CommissionType } from 'src/types/campaign';
import { Injectable } from '@angular/core';
import { InfluencerStatus } from '@src/types/influencer';

@Injectable({
    providedIn: 'root',
})
export class UtilsService {
    displayCommission(campaign: CampaignDetail) {
        const extra_info = campaign.extra_info;
        // Handle legacy code
        const commission_dollar = campaign.commission_dollar !== undefined ? campaign.commission_dollar : campaign['commision_dollar'];
        const commission_percent =
            campaign.commission_percent !== undefined ? campaign.commission_percent : campaign['commission_percentage'];
        if (extra_info && extra_info['commissionType']) {
            const type: CommissionType = extra_info['commissionType'];
            if (type === CommissionType.ONE_TIME_PAY) {
                return `$ ${commission_dollar}`;
            } else if (type === CommissionType.PER_SALES) {
                return `${commission_percent} %`;
            } else if (type === CommissionType.FIX_PAY_PLUS_PER_SALES) {
                return `$ ${commission_dollar} + ${commission_percent} %`;
            }
        }
        return `$ ${commission_dollar}`;
    }

    getInfluencerStatus(influencer) {
        if (influencer['inf_signing_status'] === 'Recommended') {
            return InfluencerStatus.RECOMMENDED;
        }
        if (influencer['inf_signing_status'] === 'Brand chosen') {
            if (influencer['inf_contacting_status'] === 'Email sent') {
                return InfluencerStatus.OFFER_SENT;
            }
            return InfluencerStatus.BRAND_CHOSEN;
        }
        if (influencer['inf_signing_status'] === 'Skip Offer') {
            return InfluencerStatus.SKIP_OFFER;
        }
        if (influencer['inf_signing_status'] === 'Influencer declined offer') {
            return InfluencerStatus.OFFER_DECLIEND;
        }
        if (
            influencer['inf_signing_status'] === 'Influencer signed up' ||
            influencer['inf_signing_status'] === 'Influencer accepted offer'
        ) {
            return InfluencerStatus.OFFER_ACCEPTED;
        }

        if (
            influencer['inf_signing_status'] === 'pending contract signing' &&
            influencer['brand_signing_status'] === 'pending contract signing'
        ) {
            if (influencer['inf_contract_status'] === 'Email sent') {
                return InfluencerStatus.PENDING_SIGNING;
            }
            return InfluencerStatus.PENDING_CONTRACT_SEND;
        }
        if (influencer['inf_signing_status'] === 'contract signed' && influencer['brand_signing_status'] === 'contract signed') {
            return InfluencerStatus.CONTRACT_SIGNED;
        }
        if (influencer['inf_signing_status'] === 'pending contract signing') {
            return InfluencerStatus.PENDING_INFLUENCER_SIGNING;
        }
        if (influencer['brand_signing_status'] === 'pending contract signing') {
            return InfluencerStatus.PENDING_BRAND_SIGNING;
        }
    }

    // https://github.com/kennethjiang/js-file-download
    downloadFile(
        data: string | ArrayBuffer | ArrayBufferView | Uint8Array | Blob,

        filename: string,

        mime?: string,

        bom?: string
    ) {
        const blobData = typeof bom !== 'undefined' ? [bom, data] : [data];

        const blob = new Blob(blobData, { type: mime || 'application/octet-stream' });

        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            // IE workaround for "HTML7007: One or more blob URLs were
            // revoked by closing the blob for which they were created.
            // These URLs will no longer resolve as the data backing
            // the URL has been freed."
            window.navigator.msSaveBlob(blob, filename);
        } else {
            const blobURL = window.URL.createObjectURL(blob);

            const tempLink = document.createElement('a');

            tempLink.style.display = 'none';

            tempLink.href = blobURL;

            tempLink.setAttribute('download', filename);

            // Safari thinks _blank anchor are pop ups. We only want to set _blank
            // target if the browser does not support the HTML5 download attribute.
            // This allows you to download files in desktop safari if pop up blocking
            // is enabled.
            if (typeof tempLink.download === 'undefined') {
                tempLink.setAttribute('target', '_blank');
            }

            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
        }
    }

    // https://stackoverflow.com/questions/11257062/converting-json-object-to-csv-format-in-javascript
    convertToCSV<T>(arr: T[]) {
        if (arr.length === 0) {
            return '';
        }

        const temp = [Object.keys(arr[0]), ...arr];

        return temp.map((it) => String(Object.values(it))).join('\n');
    }
}
