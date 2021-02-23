import { BrowserModule } from '@angular/platform-browser';
import { Inject, LOCALE_ID, NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { AngularFireAuthGuardModule } from '@angular/fire/auth-guard';
import { MatNativeDateModule } from '@angular/material/core';
import { AngularFireStorageModule, BUCKET } from '@angular/fire/storage';
import {
    AngularFireAnalyticsModule,
    APP_NAME,
    APP_VERSION,
    CONFIG,
    DEBUG_MODE,
    ScreenTrackingService,
    UserTrackingService,
} from '@angular/fire/analytics';

// Translate
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import zh from '@angular/common/locales/zh';
import {registerLocaleData} from '@angular/common';
registerLocaleData(zh);

import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
// Plugin
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { ChartsModule } from 'ng2-charts';
import { VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule, VgStreamingModule } from 'ngx-videogular';
import { NguCarouselModule } from '@ngu/carousel';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AngularSplitModule } from 'angular-split';

// Module
import { AppRoutingModule } from './app-routing.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { IntercomModule } from 'ng-intercom';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';

import { InternalSearchModule } from './internal/internal-search/internal-search.module';

// Component
import { PrepareContractComponent } from '@internal/internal-brand-campaign/prepare-contract-dialog/prepare-contract-dialog';
import { CampaignComponent } from '@main/campaign/campaign.component';
import { CreateCampaignComponent } from '@main/create-campaign/create-campaign.component';
import { CommissionComponent } from '@main/create-campaign/commission/commission.component';
import { PrefferedInfluencerComponent } from '@main/create-campaign/preffered-influencer/preffered-influencer.component';
import { MenuComponent } from '@shared/menu/menu.component';
import { ConceptFeedbackComponent } from './concept-feedback/concept-feedback.component';
import { VideoReviewComponent } from './video-review/video-review.component';
import { LoginComponent } from '@auth/login/login.component';
import { InternalLoginComponent } from '@auth/internal-login/internal-login.component';
import { SignUpComponent } from '@auth/sign-up/sign-up.component';
import { HomeComponent } from '@main/home/home.component';
import { AppComponent } from './app.component';
import { UploadTaskComponent } from './upload-task/upload-task.component';
import { UploaderComponent } from './uploader/uploader.component';
import { VideoPlayerComponent } from '@shared/video-player/video-player.component';
import { LoadingSpinnerComponent } from '@shared/loading-spinner/loading-spinner.component';
import { UploadVideoDialogComponent } from '@main/campaign/upload-video-dialog/upload-video-dialog.component';
import { UploadImageDialogComponent } from '@main/campaign/upload-image-dialog/upload-image-dialog.component';
import { SendMessageDialogComponent } from '@main/campaign/send-message-dialog/send-message-dialog.component';
import { ImageReviewComponent } from './image-review/image-review.component';
import { UploadContractDialogComponent } from '@main/create-campaign/upload-contract-dialog/upload-contract-dialog.component';
import { MediaThreadComponent } from './media-thread/media-thread.component';
import { MainComponent } from '@main/main.component';
import { FaqsComponent } from '@main/faqs/faqs.component';
import { CampaignCardComponent } from '@shared/campaign-card/campaign-card.component';
import { EventCalendarComponent } from '@main/event-calendar/event-calendar.component';
import { CampaignOverviewComponent } from '@main/campaign-overview/campaign-overview.component';
import { CampaignOutreachComponent } from '@internal/campaign-outreach/campaign-outreach.component';
import { CreateInvitationComponent } from '@internal/campaign-outreach/create-invitation/create-invitation.component';
import { CreateNewListDialogComponent } from '@internal/campaign-outreach/create-new-list-dialog/create-new-list-dialog.component';
import { BrandCampaignComponent } from '@main/brand-campaign/brand-campaign.component';
import { SimpleCampaignOverviewComponent } from '@main/simple-campaign-overview/simple-campaign-overview.component';
import { BrandHomeComponent } from '@main/brand-home/brand-home.component';
import { InfluencerCardComponent } from '@shared/influencer-card/influencer-card.component';
import { BrandChartComponent } from '@main/brand-home/brand-chart/brand-chart.component';
import { NotificationComponent } from '@shared/notification/notification.component';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';
import { UserGuideComponent } from '@shared/user-guide/user-guide.component';
import { AccountManagerComponent } from '@shared/account-manager/account-manager.component';
import { ContractReviewComponent } from './contract-review/contract-review.component';
import { InternalComponent } from '@internal/internal.component';
import { InternalHomeComponent } from '@internal/internal-home/internal-home.component';
import { InternalBrandCampaignComponent } from '@internal/internal-brand-campaign/internal-brand-campaign.component';
import { InternalSettingComponent } from '@internal/internal-setting/internal-setting.component';
import { EditFaqsListComponent } from '@internal/internal-setting/edit-faqs-list/edit-faqs-list.component';
import { AddCategoryComponent } from '@internal/internal-setting/add-category/add-category.component';
import { InstagramCardComponent } from '@shared/instagram-card/instagram-card.component';
import { InfluencerDetailComponent } from '@shared/influencer-detail/influencer-detail.component';
import { FollowerInfoComponent } from '@shared/influencer-detail/follower-info/follower-info.component';
import { EditNotesComponent } from '@shared/influencer-detail/edit-notes/edit-notes.component';
import { LookalikesComponent } from '@shared/influencer-detail/lookalikes/lookalikes.component';
import { PostsComponent } from '@shared/influencer-detail/posts/posts.component';
import { ExploreToolComponent } from '@internal/explore-tool/explore-tool.component';
import { TinyInstagramCardComponent } from '@shared/tiny-instagram-card/tiny-instagram-card.component';
import { RecommendInfoDialogComponent } from '@internal/explore-tool/recommend-info-dialog/recommend-info-dialog.component';
import { EmailEditorComponent } from '@shared/email-editor/email-editor.component';
import { CampaignInfluencerComponent } from './campaign-influencer/campaign-influencer.component';
import { OfferDetailComponent } from '@internal/offer-detail/offer-detail.component';
import { MailBoxComponent } from '@internal/mail-box/mail-box.component';
import { InfluencerViewDetailsComponent } from '@main/influencer-discovery-list/influencer-view-details/influencer-view-details.component.ts';
import { MailBoxNewuiComponent } from '@internal/mail-box-newui/mail-box-newui.component';
import { DiscoveryStatusComponent } from '@internal/mail-box-newui/discovery-status/discovery-status.component';
import { MailStatusComponent } from '@internal/mail-box-newui/mail-status/mail-status.component';
import { MailHistoryInfoComponent } from '@internal/mail-box-newui/mail-history-info/mail-history-info.component';
import { MailTemplateModalComponent } from '@internal/mail-box-newui/mail-template-modal/mail-template-modal.component';
import { MailFullReportComponent } from '@internal/mail-box-newui/mail-full-report/mail-full-report.component';
import { HtmlContentComponent } from '@shared/html-content/html-content.component';
import { AcceptInfoDialogComponent } from './campaign-influencer/accept-info-dialog/accpet-info-dialog.component';
import { DeclineInfoDialogComponent } from './campaign-influencer/decline-info-dialog/decline-info-dialog.component';
import { SaveTemplateDialogComponent } from '@internal/mail-box/save-template-dialog/save-template-dialog.component';
import { SignContractComponent } from './sign-contract/sign-contract.component';
import { OfferDetailDisplayComponent } from '@shared/offer-detail-display/offer-detail-display.component';
import { CampaignPerformanceComponent } from '@internal/campaign-performance/campaign-performance.component';
import { CreatePostComponent } from '@internal/campaign-performance/create-post/create-post.component';
import { PostDetailComponent } from '@internal/campaign-performance/post-detail/post-detail.component';
import { ChangePasswordComponent } from '@main/brand-home/change-password/change-password.component';
import { InfluencerListDetailComponent } from '@internal/influencer-list/influencer-list-detail/influencer-list-detail.component';
import { InfluencerListLabelingComponent } from '@internal/influencer-list/influencer-list-labeling/influencer-list-labeling.component';
import { LabelCommonComponent } from '@internal/influencer-list/label-common/label-common.component';
import { SingleImageUploaderComponent } from './shared/single-image-uploader/single-image-uploader.component';

// Service
import { AdminRoleGuard, UserRoleGuard } from './services/role-guard.service';

// Shared
import { environment } from 'src/environments/environment';
import { SafeHtmlPipe } from './pipe/safe-html.pipe';
import { EmailHtmlPipe } from './pipe/email-html.pipe';
import * as moment from 'moment';
import { TokenInterceptor } from './auth/token.interceptor';
import { UserManagementComponent } from './internal/user-management/user-management.component';
import { InfluencerListComponent } from './internal/influencer-list/influencer-list.component';
import { CampaignPerformanceCounterComponent } from './shared/campaign-performance-counter/campaign-performance-counter.component';

// ant
import { IconDefinition } from '@ant-design/icons-angular';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS } from 'ng-zorro-antd';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

// 引入你需要的图标，比如你需要 fill 主题的 AccountBook Alert 和 outline 主题的 Alert，推荐 ✔️
// import { AccountBookFill, AlertFill, AlertOutline, MailFill, FileTextFill,
//     FileSearchOutline, BarChartOutline } from '@ant-design/icons-angular/icons';
import { InfluencerDiscoveryListComponent } from './main/influencer-discovery-list/influencer-discovery-list.component';
import { NegotiationStepsComponent } from './internal/negotiation-steps/negotiation-steps.component';
import { GroupEmailComponent } from './internal/group-email/group-email.component';
import { SingleEmailComponent } from './internal/single-email/single-email.component';
import { NgZorroAntdMobileModule } from 'ng-zorro-antd-mobile';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { CampaignOperationComponent } from './internal/campaign-operation/campaign-operation.component';
import { InfluencerOperationComponent } from './internal/influencer-operation/influencer-operation.component';
import { CampaignInvitationComponent } from './internal/campaign-invitation/campaign-invitation.component';
import { CompletePaymentComponent } from './main/complete-payment/complete-payment.component';
import { ProgressLoadingComponent } from './shared/progress-loading/progress-loading.component';
import { NgxStripeModule } from 'ngx-stripe';
import { StripePaymentComponent } from './main/create-campaign/stripe-payment/stripe-payment.component';
import { HashtagsComponent } from './main/create-campaign/hashtags/hashtags.component';
import { TransactionHistoryComponent } from './internal/transaction-history/transaction-history.component';
import { MonitoringDashboardComponent } from './internal/monitoring-dashboard/monitoring-dashboard.component';
import { LineChartComponent } from './shared/line-chart/line-chart.component';
import { InfluencerTableComponent } from './shared/influencer-table/influencer-table.component';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { ShopManagementComponent } from './internal/shop-management/shop-management.component';
import { SpecialOffersComponent } from './internal/shop-management/special-offers/special-offers.component';
import { LotteryComponent } from './internal/lottery/lottery.component';
import { TableSearchComponent } from './internal/table-search/table-search.component';
import { InfluencerManagementComponent } from './internal/influencer-management/influencer-management.component';
import { CampaignDetailModalComponent } from './internal/campaign-detail-modal/campaign-detail-modal.component';
import { InfluencerProfileModalComponent } from './internal/influencer-profile-modal/influencer-profile-modal.component';
import { ApplicationViewComponent } from './internal/influencer-management/application-view/application-view.component';
import { AppliedStatusComponent } from './internal/influencer-management/application-view/applied-status/applied-status.component';
import { OrderPendingStatusComponent } from './internal/influencer-management/application-view/order-pending-status/order-pending-status.component';
import { SearchViewComponent } from './internal/influencer-management/search-view/search-view.component';
import { AddPerformanceComponent } from './internal/influencer-management/add-performance/add-performance.component';
import { CommissionViewComponent } from './internal/influencer-management/commission-view/commission-view.component';
import { CommissionPendingStatusComponent } from './internal/influencer-management/commission-view/commission-pending-status/commission-pending-status.component';
import { CompletedViewComponent } from './internal/influencer-management/completed-view/completed-view.component';
import { CampaignCompletedStatusComponent } from './internal/influencer-management/completed-view/campaign-completed-status/campaign-completed-status.component';
import { CampaignUncompletedStatusComponent } from './internal/influencer-management/completed-view/campaign-uncompleted-status/campaign-uncompleted-status.component';
import { ShippingViewComponent } from './internal/influencer-management/shipping-view/shipping-view.component';
import { ShipmentPendingStatusComponent } from './internal/influencer-management/shipping-view/shipment-pending-status/shipment-pending-status.component';
import { ShippedStatusComponent } from './internal/influencer-management/shipping-view/shipped-status/shipped-status.component';
import { ShippingIncidentStatusComponent } from './internal/influencer-management/shipping-view/shipping-incident-status/shipping-incident-status.component';
import { DraftViewComponent } from './internal/influencer-management/draft-view/draft-view.component';
import { DraftPendingStatusComponent } from './internal/influencer-management/draft-view/draft-pending-status/draft-pending-status.component';
import { DraftUploadedStatusComponent } from './internal/influencer-management/draft-view/draft-uploaded-status/draft-uploaded-status.component';
import { DraftOverdueStatusComponent } from './internal/influencer-management/draft-view/draft-overdue-status/draft-overdue-status.component';
import { PostViewComponent } from './internal/influencer-management/post-view/post-view.component';
import { PostPendingStatusComponent } from './internal/influencer-management/post-view/post-pending-status/post-pending-status.component';
import { PostOverdueStatusComponent } from './internal/influencer-management/post-view/post-overdue-status/post-overdue-status.component';
import { LineChartFriendReferralComponent } from './shared/line-chart-friend-referral/line-chart-friend-referral.component';

export function TranslateLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function LocaleIdFactory() {
    if (localStorage.getItem('langs') != null) {
        const lans = localStorage.getItem('langs');
        return lans;
    } else {
        const browserLangs = (navigator.language).toLowerCase();
        localStorage.setItem('langs', browserLangs);
        return browserLangs;
    }
}

// const icons: IconDefinition[] = [ AccountBookFill, AlertOutline, AlertFill, MailFill, FileTextFill, FileSearchOutline, BarChartOutline];
const antDesignIcons = AllIcons as {
    [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map((key) => antDesignIcons[key]);

export function momentAdapterFactory() {
    return adapterFactory(moment);
}

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
};

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        CampaignComponent,
        CreateCampaignComponent,
        CommissionComponent,
        PrefferedInfluencerComponent,
        MenuComponent,
        ConceptFeedbackComponent,
        VideoReviewComponent,
        UploadTaskComponent,
        UploaderComponent,
        VideoPlayerComponent,
        LoadingSpinnerComponent,
        UploadVideoDialogComponent,
        UploadImageDialogComponent,
        SendMessageDialogComponent,
        UploadContractDialogComponent,
        ImageReviewComponent,
        MediaThreadComponent,
        SignUpComponent,
        MainComponent,
        FaqsComponent,
        CampaignCardComponent,
        EventCalendarComponent,
        CampaignOverviewComponent,
        CampaignOutreachComponent,
        CreateInvitationComponent,
        CreateNewListDialogComponent,
        BrandCampaignComponent,
        SimpleCampaignOverviewComponent,
        BrandHomeComponent,
        InfluencerCardComponent,
        BrandChartComponent,
        NotificationComponent,
        ConfirmDialogComponent,
        UserGuideComponent,
        AccountManagerComponent,
        ContractReviewComponent,
        InternalComponent,
        InternalHomeComponent,
        InternalBrandCampaignComponent,
        InternalSettingComponent,
        EditFaqsListComponent,
        AddCategoryComponent,
        InstagramCardComponent,
        InfluencerDetailComponent,
        FollowerInfoComponent,
        EditNotesComponent,
        LookalikesComponent,
        PostsComponent,
        ExploreToolComponent,
        TinyInstagramCardComponent,
        RecommendInfoDialogComponent,
        PrepareContractComponent,
        EmailEditorComponent,
        CampaignInfluencerComponent,
        OfferDetailComponent,
        OfferDetailDisplayComponent,
        MailBoxComponent,
        InfluencerViewDetailsComponent,
        MailBoxNewuiComponent,
        DiscoveryStatusComponent,
        MailTemplateModalComponent,
        MailFullReportComponent,
        MailHistoryInfoComponent,
        MailStatusComponent,
        HtmlContentComponent,
        SafeHtmlPipe,
        EmailHtmlPipe,
        AcceptInfoDialogComponent,
        DeclineInfoDialogComponent,
        SaveTemplateDialogComponent,
        SignContractComponent,
        CampaignPerformanceComponent,
        CreatePostComponent,
        PostDetailComponent,
        ChangePasswordComponent,
        UserManagementComponent,
        InfluencerListComponent,
        CampaignPerformanceCounterComponent,
        SingleImageUploaderComponent,
        InfluencerDiscoveryListComponent,
        NegotiationStepsComponent,
        GroupEmailComponent,
        SingleEmailComponent,
        InternalLoginComponent,
        CampaignOperationComponent,
        InfluencerOperationComponent,
        CampaignInvitationComponent,
        CompletePaymentComponent,
        InfluencerListDetailComponent,
        InfluencerListLabelingComponent,
        LabelCommonComponent,
        SingleImageUploaderComponent,
        ProgressLoadingComponent,
        StripePaymentComponent,
        HashtagsComponent,
        TransactionHistoryComponent,
        MonitoringDashboardComponent,
        LineChartComponent,
        InfluencerTableComponent,
        ShopManagementComponent,
        SpecialOffersComponent,
        LotteryComponent,
        TableSearchComponent,
        InfluencerManagementComponent,
        CampaignDetailModalComponent,
        InfluencerProfileModalComponent,
        ApplicationViewComponent,
        AppliedStatusComponent,
        OrderPendingStatusComponent,
        SearchViewComponent,
        AddPerformanceComponent,
        CommissionViewComponent,
        CommissionPendingStatusComponent,
        CompletedViewComponent,
        CampaignCompletedStatusComponent,
        CampaignUncompletedStatusComponent,
        ShippingViewComponent,
        ShipmentPendingStatusComponent,
        ShippedStatusComponent,
        ShippingIncidentStatusComponent,
        DraftViewComponent,
        DraftPendingStatusComponent,
        DraftUploadedStatusComponent,
        DraftOverdueStatusComponent,
        PostViewComponent,
        PostPendingStatusComponent,
        PostOverdueStatusComponent,
        LineChartFriendReferralComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgZorroAntdMobileModule,
        NzIconModule.forRoot(icons),
        NzToolTipModule,
        NzModalModule,
        NzGridModule,
        NzTabsModule,
        NzMessageModule,
        NzDatePickerModule,
        NzInputModule,
        NzRadioModule,
        NzUploadModule,
        NzListModule,
        NzBadgeModule,
        NzSelectModule,
        NzFormModule,
        NzButtonModule,
        NzMenuModule,
        NzTableModule,
        NzCheckboxModule,
        NzStepsModule,
        NzDropDownModule,
        NzCollapseModule,
        NzTagModule,
        NzProgressModule,
        NzInputNumberModule,
        NzSpinModule,
        NzSliderModule,
        NzAnchorModule,
        NzSwitchModule,
        AngularSplitModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        AngularFireAuthGuardModule,
        AngularFirestoreModule,
        AngularFireFunctionsModule,
        AngularFireStorageModule,
        AngularFireAnalyticsModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatExpansionModule,
        MatCardModule,
        MatDividerModule,
        MatCheckboxModule,
        MatStepperModule,
        MatGridListModule,
        MatSortModule,
        FormsModule,
        MatListModule,
        MatMenuModule,
        MatIconModule,
        MatTableModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatRadioModule,
        MatSidenavModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatAutocompleteModule,
        MatPaginatorModule,
        MatChipsModule,
        ClipboardModule,
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule,
        VgStreamingModule,
        HttpClientModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatNativeDateModule,
        NgxMatMomentModule,
        CalendarModule.forRoot({ provide: DateAdapter, useFactory: momentAdapterFactory }),
        PerfectScrollbarModule,
        NgSelectModule,
        NguCarouselModule,
        ChartsModule,
        RichTextEditorModule,
        NzButtonModule,
        NzMenuModule,
        NzAlertModule,
        NzCarouselModule,
        NzDividerModule,
        NzPopoverModule,
        InternalSearchModule,
        SwiperModule,
        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: TranslateLoaderFactory,
              deps: [HttpClient],
            },
          }),
        IntercomModule.forRoot({
            appId: 'etq9z8nj', // from your Intercom config
            updateOnRouterChange: true, // will automatically run `update` on router event changes. Default: `false`
        }),
        NgxStripeModule.forRoot(environment.stripe.token),
    ],
    exports: [UploaderComponent],
    entryComponents: [
        LoadingSpinnerComponent,
        UploadVideoDialogComponent,
        UploadImageDialogComponent,
        SendMessageDialogComponent,
        UploadContractDialogComponent,
        NotificationComponent,
        ConfirmDialogComponent,
        RecommendInfoDialogComponent,
        PrepareContractComponent,
        AcceptInfoDialogComponent,
        DeclineInfoDialogComponent,
        SaveTemplateDialogComponent,
        OfferDetailComponent,
        CreatePostComponent,
    ],
    providers: [
        AdminRoleGuard,
        UserRoleGuard,
        MatDatepickerModule,
        { provide: BUCKET, useValue: 'influencer-272204.appspot.com' },
        { provide: NZ_ICONS, useValue: icons },
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true,
        },
        {
            provide: LOCALE_ID,
            useFactory: LocaleIdFactory,
        },
        { provide: NZ_I18N, useValue: en_US },
        { provide: APP_NAME, useValue: 'Lifo Brand' },
        { provide: APP_VERSION, useValue: 'r1.0' },
        ScreenTrackingService,
        UserTrackingService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private i18n: TranslateService, @Inject(LOCALE_ID) locale: string) {
        if (environment.supportedLocale.indexOf(locale) === -1) {
            locale = 'en-US';
        }
        this.i18n.use(locale);
     }
}
