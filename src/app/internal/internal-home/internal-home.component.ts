import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CampaignService } from 'src/app/services/campaign.service';
import { BrandCampaignOverview, CampaignDetail } from 'src/types/campaign';
import { InternalService } from 'src/app/services/internal.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { LoadingSpinnerService } from '@src/app/services/loading-spinner.service';
import { BrandUser } from '@src/types/brand';
import { Router } from '@angular/router';
import { environment } from '@src/environments/environment';

@Component({
    selector: 'app-internal-home',
    templateUrl: './internal-home.component.html',
    styleUrls: ['./internal-home.component.scss'],
})
export class InternalHomeComponent implements OnInit, OnDestroy {
    @ViewChild('changePass') changePass;
    brandCampaigns: CampaignDetail[] = [];
    brandCampaignOverView: BrandCampaignOverview[] = [];
    subscriptions: Subscription[] = [];
    brandUser: BrandUser;

    constructor(
        private campaignService: CampaignService,
        private internalService: InternalService,
        private loadingService: LoadingSpinnerService,
        public auth: AngularFireAuth,
        public router: Router,
    ) { }

    async ngOnInit() {
        const brandCampaign = await this.internalService.internalGetAllCampaign();

        this.subscriptions.push(
            brandCampaign.subscribe(campaigns => {
                if (!environment.production) {
                    console.log(campaigns);
                }
                campaigns.forEach(campaign => {
                    const brandIndex = this.brandCampaignOverView.map(overview => overview.brand).indexOf(campaign.brand);
                    if (brandIndex >= 0) {
                        this.brandCampaignOverView[brandIndex].campaigns.push(campaign);
                    } else {
                        this.brandCampaignOverView.push({
                            brand: campaign.brand,
                            campaigns: [campaign],
                        });
                    }
                });
                this.brandCampaigns = campaigns;
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    deleteCampaign(campaign: CampaignDetail) {
        this.loadingService.show();
        this.subscriptions.push(
            this.campaignService.deleteBrandCampaignById(campaign.brand_campaign_id).subscribe(result => {
                this.brandCampaignOverView.forEach(brand => {
                    let index = -1;
                    for (let i = 0; i < brand.campaigns.length; i ++) {
                        if (campaign.brand_campaign_id === brand.campaigns[i].brand_campaign_id) {
                            index = i;
                            break;
                        }
                    }
                    if (index >= 0) {
                        brand.campaigns.splice(index, 1);
                        this.loadingService.hide();
                        return;
                    }
                });
            })
        );
    }

    showPasswordModal() {
        this.changePass.oldPassword = '';
        this.changePass.newPassword = '';
        this.changePass.confirmPassword = '';
        this.changePass.isShowInputPass = true;
        this.changePass.isVisible = true;
    }

    viewGlobalSetting() {
        this.router.navigate(['/internal/global-setting']);
    }
}
