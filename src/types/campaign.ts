import { InfluencerRecommendBody } from './influencer';

export interface Campaign {
    campaign_data: CampaignDetail;
    camapign_ref: string;
    campaign_name: string;
    campaign_id: string;
    completed?: boolean;
}

export interface BrandCampaign {
    brand_campaigns: CampaignDetail;
    discovered_infs: InfluencerRecommendBody[];
}

export interface CampaignData {
    campaign_historys: CampaignDetail[];
    final_history_id: string;
    final_campaign: CampaignDetail;
    final_video_draft_history_id: string;
    final_video_draft: CampaignDetail;
}

export interface CampaignDetail {
    content_concept?: string;
    image?: string;
    images?: ImageContent;
    feed_back?: string;
    end_time?: number;
    post_time?: number;
    start_post_time?: number;
    campaign_id?: string;
    brand_campaign_id?: string;
    time_stamp?: number;
    video?: string;
    brand: string;
    brand_id?: string;
    platform?: string;
    product?: ShopifyProduct;
    influencer_id?: string;
    campaign_name: string;
    contacts?: string;
    contact_name?: string;
    contact_email?: string;
    commission_type?: CommissionType;
    commission_dollar?: number;
    commission_percent?: number;
    budget?: number;
    milestones?: string[];
    donts?: string[];
    requirements?: string[];
    shipping_address?: string;
    tracking_number?: string;
    history_id?: string;
    extra_info?: string | CampaignExtraInfo;
    title?: string;
    description?: string;
    tags?: string[];
    collaborating_influencers?: string[];
    inf_campaign_dict?: {};
    share_url?: string;
    short_share_url?: string;
    tracking_url?: string;
    short_tracking_url?: string;
    is_final?: boolean;
    campaign_type?: string;
    product_name: string;
    product_price: number;
    product_image: string;
    product_id: number;
    product_list?: ShopifyProductDetail[];
    product_url: string;
    product_variants: any[];
    unit_cost: number;
    amazon_url?: string;
    number_of_posts: number;
    estimated_total_cost: number;
    campaign_coupon_code?: string;
    coupon_discount_percentage?: number;
    audience_detail?: any;
    status?: string;
    discovery_status?: string;
    offer_detail?: OfferDetail;
    configuration?: CampaignConfiguration;
    application_charge?: any;
    is_discoverable?: boolean;
    discover_configuration?: CampaignConfiguration;
    price_rule?: any;
    content?: {
        images: { url: string; path: string }[];
        videos: { url: string; path: string }[];
    };
    initial_payment_percentage?: number;
    has_initial_payment?: boolean;
    post_tags?: string[];
    post_hastags?: string[];
    active?: boolean;
}

export interface CampaignConfiguration {
    cpm: number;
    offer_expiration_time: number;
    fast_deliver_window: number;
    delivery_deadline: number;
    fast_delivery_bonus: number;
    max_base_commission: number;
    quota: number;
}

export interface BrandCampaignOverview {
    brand: string;
    campaigns: CampaignDetail[];
}

export interface CampaignExtraInfo {
    type?: string;
    platform?: string;
    post_time?: number;
    contracts: UploadFile[];
    commissionType?: CommissionType;
}

export interface VideoMetaData {
    resolution_height: number;
    text_reg_res: any[];
    transcoded: boolean;
    transcoded_path: string;
    uri: string;
}

export interface UploadFile {
    url: string;
    path: string;
}

export interface ImageContent {
    images: UploadFile[];
    caption: string;
}

export enum CommissionType {
    Brand_Awareness = 'Brand Awareness',
    Sales_Conversion = 'Sales Conversion',
    PER_SALES = 'Per Sales Commission',
    PRODUCT_FOR_POST = 'Product For Post',
    ONE_TIME_PAY = 'One Time Commission',
    FIX_PAY_PLUS_PER_SALES = 'Fixed Pay + Per Sales Commission',
}

export interface ShopifyProduct {
    title: string;
    image: string;
    id: string;
}

export interface ShopifyProductDetail {
    admin_graphql_api_id: string;
    body_html: string;
    created_at: string;
    handle: string;
    id: number;
    image: ShopifyImage;
    images: ShopifyImage[];
    options: any[];
    product_type: string;
    published_at: string;
    published_scope: string;
    tags: string;
    template_suffix: string;
    title: string;
    updated_at: string;
    variants: any[];
    vendor: string;
    commission?: number;
    discount?: number;
    active: boolean;
}

export interface ShopifyImage {
    admin_graphql_api_id: string;
    alt: string;
    created_at: string;
    height: number;
    id: number;
    position: number;
    product_id: number;
    src: string;
    updated_at: string;
    variant_ids: any[];
    width: number;
}

export interface OfferDetail {
    compensation_message: string;
    product_message: string;
    product_image_list: string[];
    content_format?: string;
    post_tags?: any;
    visual_content_guideline?: string;
    text_post_guideline?: string;
    post_hastags?: any;
    compensate_method?: string;
    payment_platform?: string;
}

export interface CampaignPerformance {
    all_inf_perfs: CampaignInfluencerPerformance[];
    amount_spent: number;
    cost_per_engagement: number;
    cost_per_like: number;
    posts: number;
    product_cost: number;
    total_comments: number;
    total_commission: number;
    total_likes: number;
    total_followers: number;
}

export interface CampaignInfluencerPerformance {
    account_id?: string;
    brand_campaign_id?: string;
    comments: number;
    commission: number;
    likes: number;
    followers?: number;
    screenshot: string;
    comment_content: any[];
    post_url: string;
    link: string;
    content?: {
        images: { url: string; path: string }[];
        videos: { url: string; path: string }[];
    };
}

export interface EmailTemplate {
    body: string;
    subject: string;
    template_name: string;
    template_type?: string;
    require_offer_detail?: boolean;
}

export interface CampaingRecuritStatus {
    brand: string;
    inf_commissions: [];
    inf_emails: [];
    invited_ins_influencers: [];
    product_name: string;
    quota: number;
    recruited_influencers: {};
    status: string;
    invitations: any;
}

export interface CampaignRecruit {
    campaign: CampaingRecuritStatus;
    influencers: any[];
}
