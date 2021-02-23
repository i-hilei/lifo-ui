import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './main/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { FaqsComponent } from '@main/faqs/faqs.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { CreateCampaignComponent } from './main/create-campaign/create-campaign.component';
import { CommissionComponent } from './main/create-campaign/commission/commission.component';
import { CampaignComponent } from './main/campaign/campaign.component';
import { ConceptFeedbackComponent } from './concept-feedback/concept-feedback.component';
import { VideoReviewComponent } from './video-review/video-review.component';
import { VideoPlayerComponent } from './shared/video-player/video-player.component';
import { ImageReviewComponent } from './image-review/image-review.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { MainComponent } from './main/main.component';
import { EventCalendarComponent } from './main/event-calendar/event-calendar.component';
import { BrandCampaignComponent } from './main/brand-campaign/brand-campaign.component';
import { BrandHomeComponent } from './main/brand-home/brand-home.component';
import { ContractReviewComponent } from './contract-review/contract-review.component';
import { InternalComponent } from './internal/internal.component';
import { InternalHomeComponent } from './internal/internal-home/internal-home.component';
import { InternalBrandCampaignComponent } from './internal/internal-brand-campaign/internal-brand-campaign.component';
import { InfluencerDetailComponent } from '@shared/influencer-detail/influencer-detail.component';
import { CampaignInfluencerComponent } from './campaign-influencer/campaign-influencer.component';
import { SignContractComponent } from './sign-contract/sign-contract.component';
import { CampaignPerformanceComponent } from './internal/campaign-performance/campaign-performance.component';
import { AdminRoleGuard, UserRoleGuard } from './services/role-guard.service';
import { UserManagementComponent } from './internal/user-management/user-management.component';
import { InfluencerListComponent } from './internal/influencer-list/influencer-list.component';
import { InternalSearchComponent } from './internal/internal-search/internal-search.component';
import { InternalLoginComponent } from './auth/internal-login/internal-login.component';
import { InternalSettingComponent } from './internal/internal-setting/internal-setting.component';
import { CreateInvitationComponent } from './internal/campaign-outreach/create-invitation/create-invitation.component';
import { ExploreToolComponent } from './internal/explore-tool/explore-tool.component';
import { CampaignInvitationComponent } from './internal/campaign-invitation/campaign-invitation.component';
import { CompletePaymentComponent } from './main/complete-payment/complete-payment.component';
import { InfluencerListDetailComponent } from '@internal/influencer-list/influencer-list-detail/influencer-list-detail.component';
import { TransactionHistoryComponent } from './internal/transaction-history/transaction-history.component';
import { MonitoringDashboardComponent } from './internal/monitoring-dashboard/monitoring-dashboard.component';
import { ShopManagementComponent } from './internal/shop-management/shop-management.component';
import { LotteryComponent } from './internal/lottery/lottery.component';
import { InfluencerManagementComponent } from './internal/influencer-management/influencer-management.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'sign-up',
        component: SignUpComponent,
    },
    {
        path: 'internal-login',
        component: InternalLoginComponent,
    },
    {
        path: 'app',
        component: MainComponent,
        canActivate: [AngularFireAuthGuard, UserRoleGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        children: [
            {
                path: '',
                redirectTo: 'brand-home',
                pathMatch: 'full',
            },
            {
                path: 'home',
                component: HomeComponent,
            },
            {
                path: 'faqs',
                component: FaqsComponent,
            },
            {
                path: 'brand-home',
                component: BrandHomeComponent,
            },
            {
                path: 'create-campaign',
                component: CreateCampaignComponent,
            },
            {
                path: 'create-campaign-commission',
                component: CommissionComponent,
            },
            {
                path: 'calendar',
                component: EventCalendarComponent,
            },
            {
                path: 'campaign/:id',
                component: CampaignComponent,
            },
            {
                path: 'brand-campaign/:id',
                component: BrandCampaignComponent,
            },
            {
                path: 'concept-feedback/:campaignId/:historyId',
                component: ConceptFeedbackComponent,
            },
            {
                path: 'video-review/:campaignId/:historyId',
                component: VideoReviewComponent,
            },
            {
                path: 'image-review/:campaignId',
                component: ImageReviewComponent,
            },
            {
                path: 'image-review/:campaignId/:historyId',
                component: ImageReviewComponent,
            },
            {
                path: 'contract-review/:campaignId',
                component: ContractReviewComponent,
            },
            {
                path: 'complete-campaign-payment/:id',
                component: CompletePaymentComponent,
            },
        ],
    },
    {
        path: 'internal',
        component: InternalComponent,
        canActivate: [AngularFireAuthGuard, AdminRoleGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full',
            },
            {
                path: 'home',
                component: InternalHomeComponent,
            },
            {
                path: 'brand-campaign/:id',
                component: InternalBrandCampaignComponent,
            },
            {
                path: 'internal-search/:id',
                component: InternalSearchComponent,
            },
            {
                path: 'influencer-detail',
                component: InfluencerDetailComponent,
            },
            {
                path: 'campaign-performance/:id',
                component: CampaignPerformanceComponent,
            },
            {
                path: 'create-invitation',
                component: CreateInvitationComponent,
            },
            {
                path: 'user-management',
                component: UserManagementComponent,
            },
            {
                path: 'influencer-list',
                component: InfluencerListComponent,
            },
            {
                path: 'influencer-list-detail/:id',
                component: InfluencerListDetailComponent,
            },
            {
                path: 'campaign/:id',
                component: CampaignComponent,
            },
            {
                path: 'global-setting',
                component: InternalSettingComponent,
            },
            {
                path: 'influencer-discovery/:id/:list_id',
                component: ExploreToolComponent,
            },
            {
                path: 'campaign-invitation/:campaignId',
                component: CampaignInvitationComponent,
            },
            {
                path: 'transaction-history',
                component: TransactionHistoryComponent,
            },
            {
                path: 'monitoring-dashboard',
                component: MonitoringDashboardComponent,
            },
            {
                path: 'shop-management',
                component: ShopManagementComponent,
            },
            {
                path: 'lottery',
                component: LotteryComponent,
            },
            {
                path: 'influencer-management',
                component: InfluencerManagementComponent,
            },
        ],
    },
    {
        path: 'campaign-influencer/:campaignId/:accountId',
        component: CampaignInfluencerComponent,
    },
    {
        path: 'sign-contract/:campaignId/:accountId',
        component: SignContractComponent,
    },
    {
        path: 'image-review/:campaignId',
        component: ImageReviewComponent,
    },
    {
        path: 'image-review/:campaignId/:historyId',
        component: ImageReviewComponent,
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'app',
    },
    { path: '**', component: MainComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
