import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Influencer, InfluencerContractBody, InfluencerRecommendBody } from 'src/types/influencer';
import * as moment from 'moment';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormControl,
} from '@angular/forms';
import { environment } from '@src/environments/environment';

@Component({
    selector: 'app-prepare-contract-dialog',
    templateUrl: './prepare-contract-dialog.html',
    styleUrls: ['./prepare-contract-dialog.scss'],
})
export class PrepareContractComponent implements OnInit {

    influencer: InfluencerRecommendBody;
    contractBody: InfluencerContractBody = {
        brand: '',
        campaign_name: '',
        platform: '',
        start_date: '',
        end_time: '',
        inf_email: '',
        inf_name: '',
        account_id: '',
        fixed_commission: '',
        percentage_commission: '',
        shop_address_line1: '',
        shop_address_line2: '',
        influencer_address1: '',
        influencer_address2: '',
        product_name1: '',
        product_name2: '',
        deliverable1: '',
        deliverable2: '',
        deliverable3: '',
        trade_name1: '',
        trade_name2: '',
        trade_name3: '',
        store_state: '',
        store_county: '',
        test_mode: false,
    };
    formItem: string[];
    validateForm!: FormGroup;
    startDate = null;
    endDate = null;
    proImages = '';
    viewOnly = false;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<PrepareContractComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) {
        this.influencer = data.influencer;
        // Fill in some information for contract body
        if (this.influencer) {
            this.contractBody.account_id = this.influencer.account_id;
            this.contractBody.inf_email = this.influencer.email;
            this.contractBody.inf_name = data.influencer.inf_name;
            this.contractBody.influencer_address1 = data.influencer.influencer_address1;
            this.contractBody.influencer_address2 = data.influencer.influencer_address2;
        }

        if (data.campaign) {
            this.contractBody.fixed_commission = data.campaign.commission_dollar;
            this.contractBody.percentage_commission = data.campaign.commission_percent;
            this.contractBody.product_name1 = data.campaign.product_name;
            this.contractBody.campaign_name = data.campaign.campaign_name;
            this.contractBody.platform = Array.isArray(data.campaign.platform) ? data.campaign.platform.join(',') : 'instagram';
            this.contractBody.start_date = moment().format('L');
            this.startDate = moment().format('L');
            this.contractBody.end_time = moment(data.campaign.end_time).format('L');
            this.endDate = moment(data.campaign.end_time).format('L');
            this.contractBody.brand = data.campaign.brand;

            if (data.campaign.shop_address) {
                this.contractBody.shop_address_line1 = data.campaign.shop_address.address1;
                this.contractBody.shop_address_line2 = data.campaign.shop_address.address2;
                this.contractBody.store_state = data.campaign.shop_address.province;
                this.contractBody.store_county = data.campaign.shop_address.city;
            }
        }
        // From contract body
        if (data.contract_body) {
            this.contractBody = data.contract_body;
            console.log('true');
            this.viewOnly = true;
        }
        if (data.campaign && data.campaign.offer_detail && data.campaign.offer_detail.product_image_list) {
            this.proImages = data.campaign.offer_detail.product_image_list[0];
        }

        this.formItem = Object.keys(this.contractBody);
    }

    ngOnInit() {
        this.validateForm = this.fb.group({
            campaign_name: [ this.contractBody.campaign_name, Validators.required],
            startDate: [this.startDate, Validators.required],
            endDate: [this.endDate, Validators.required],
            deliverable1: [this.contractBody.deliverable1, Validators.required],
            deliverable2: [this.contractBody.deliverable2],
            deliverable3: [this.contractBody.deliverable3],
            brand: [this.contractBody.brand, Validators.required],
            shop_address_line1: [this.contractBody.shop_address_line1, Validators.required],
            shop_address_line2: [this.contractBody.shop_address_line2],
            inf_name: [this.contractBody.inf_name, Validators.required],
            influencer_address1: [this.contractBody.influencer_address1, Validators.required],
            influencer_address2: [this.contractBody.influencer_address2],
            platform: [this.contractBody.platform, Validators.required],
            account_id: [this.contractBody.account_id, Validators.required],
            fixed_commission: [this.contractBody.fixed_commission, Validators.required],
            percentage_commission: [this.contractBody.percentage_commission, Validators.required],
            store_county: [this.contractBody.store_county, Validators.required],
            store_state: [this.contractBody.store_state, Validators.required],
            test_mode: [this.contractBody.test_mode],
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onStartChange(result: Date): void {
        this.contractBody.start_date = moment(result).format('L');
    }
    onEndChange(result: Date): void {
        this.contractBody.end_time = moment(result).format('L');
    }

    submit() {
        const contract = {
            ...this.contractBody,
            ...this.validateForm.value,
        };
        if (!environment.production) {
            console.log(contract);
        }
        if (this.submitForm()) {
            this.dialogRef.close(contract);
        }
    }

    submitForm(): boolean {
        let isValid = true;
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
            if (!this.validateForm.controls[i].valid) {
                isValid = false;
            }
        }
        return isValid;
    }

}
