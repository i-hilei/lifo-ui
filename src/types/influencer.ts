export interface InfluencerContractBody {
    brand: string;
    platform: string;
    campaign_name: string;
    start_date: string;
    end_time: string;
    inf_email: string;
    inf_name: string;
    account_id: string;
    fixed_commission: string;
    percentage_commission: string;
    shop_address_line1: string;
    shop_address_line2: string;
    influencer_address1: string;
    influencer_address2: string;
    product_name1: string;
    product_name2: string;
    deliverable1: string;
    deliverable2: string;
    deliverable3: string;
    trade_name1: string;
    trade_name2: string;
    trade_name3: string;
    store_state: string;
    store_county: string;
    test_mode: boolean;
}

export interface InfluencerInfo {
    compensation_message?: string;
    inf_email: string;
    inf_name: string;
    inf_phone: string;
    influencer_address1: string;
    influencer_address2: string;
    product_image_list?: string[];
    product_message?: string;
}

export interface InfluencerRecommendBody {
    user_id: string;
    account_id: string;
    email: string;
    platform: string;
    profile: InfluencerRecommendProfile;
    inf_campaign_id?: string;
    selected?: boolean;
    checked?: boolean;
    expanded?: boolean;
    contract_data?: any;
    signature_request_id?: string;
    inf_signing_status: string;
    brand_signing_status: string;
    inf_contract_status: string;
    inf_contract_thread: string;
    inf_contacting_status: string;
    inf_offer_thread: string;
    note?: string;
    order?: any;
    post_url: string;
    post_perf?: any;
    inf_name: string;
    inf_last_name: string;
    inf_email: string;
    inf_phone: string;
    influencer_address1: string;
    influencer_address2: string;
    influencer_city: string;
    influencer_province: string;
    influencer_country: string;
    influencer_zip: string;
    shipping_info: ShippingInfo;
    offer_accept_time: number;
    product_ship_time: number;
    commission_paid_amount: number;
    commission_paid_time: number;
    accept_commission: number;
    accept_bonus: number;
    invitation: any;
    variant_id: number;
    discount_code?: any;
    content_approve_time: number;
    submit_post_time: number;
    content_submit_time: number;
    product_received_time: number;
    status: string;
    upfront_paid_amount: number;
    upfront_paid_time: number;
    application_time: number;
    application_decline_time: number;
    source: string;
    order_number: string;
}

export enum InfluencerStatus {
    BRAND_CHOSEN = 'Brand Chosen',
    OFFER_SENT = 'Offer Sent',
    OFFER_DECLIEND = 'Offer Declined',
    OFFER_ACCEPTED = 'Offer Accepted',
    RECOMMENDED = 'Recommended',
    PENDING_CONTRACT_SEND = 'Pending Contract Send',
    PENDING_SIGNING = 'Pending Signing',
    CONTRACT_SIGNED = 'Contract Signed',
    PENDING_INFLUENCER_SIGNING = 'Pending Influencer Signing',
    PENDING_BRAND_SIGNING = 'Pending Brand Signing',
    IN_CONTENT_REVIEW = 'In Content Review',
    CONTENT_APPROVED = 'Content Approved',
    SKIP_OFFER = 'Skip Offer',
    OFFER_CANCELLED = 'Offer Cancelled',
}

export interface InfluencerRecommendProfile {
    account_id: string;
    email: string;
    influencer: Influencer;
    maxPrice: number | string;
    minPrice: number | string;
    platform: string;
    reason: string;
    highlyRecommend: boolean;
}

export interface Influencer {
    userId: string;
    status: string;
    city: string;
    country: string;
    gender: string;
    ageGroup: string;
    profile: InfluencerProfile;
    stats: InfluencerStats;
    audience: InfluencerAudience;
    popularPosts: InfluencerPost[];
    recentPosts: InfluencerPost[];
    sponsoredPosts: InfluencerPost[];
    hashtags: InfluencerTagStatsItem[];
    mentions: InfluencerTagStatsItem[];
    contacts: InfluencerContactItem[];
    is_registered: boolean;
    complete_campaign: boolean;
    in_campaign: boolean;
    in_list: boolean;
    register_email: string;
    label_list: any;
}

export interface InfluencerContactItem {
    type: string;
    value: string;
}

export interface InfluencerProfile {
    fullname: string;
    username: string;
    url: string;
    picture: string;
    followers: number;
    engagementRate: number;
    engagements: number;
    avgComments: number;
    avgLikes: number;
}

export interface InfluencerStats {
    avgLikes: InfluencerStatsItem;
    followers: InfluencerStatsItem;
}

export interface InfluencerStatsItem {
    value: number;
    compared: number;
}

export interface InfluencerAudience {
    credibility: number;
    notable: number;
    genders: InfluencerDistributionItem[];
    geoCities: InfluencerDistributionItem[];
    geoCountries: InfluencerDistributionItem[];
    ages: InfluencerDistributionItem[];
    gendersPerAge: InfluencerGenderDistributionItem[];
    brandAffinity: InfluencerDistributionItem[];
    interests: InfluencerDistributionItem[];
    audienceLookalikes: any[];
}

export interface InfluencerDistributionItem {
    code?: string;
    name?: string;
    weight: number;
}

export interface InfluencerGenderDistributionItem {
    code?: string;
    name?: string;
    male: number;
    female: number;
}

export interface InfluencerPost {
    id: string;
    text: string;
    url: string;
    created: string;
    likes: number;
    comments: number;
    mentions?: string[];
    hashtags?: string[];
    thumbnail: string;
    image: string;
}

export interface InfluencerTagStatsItem {
    tag: string;
    weight: number;
}

export interface InfluencerSearchBody {
    filter: InstagramSearchFilters;
    page: number;
}

export interface InstagramSearchFilters {
    influencer: InstagramSearchInfluencerFilters;
    audience: InstagramSearchAudienceFilters;
}

export interface InstagramSearchInfluencerFilters {
    followers: {};
    engagementRate: number;
    location: number[];
    language: string;
    hasYoutube: boolean;
    relevance: string[];
    interests: number[];
}

export interface InstagramSearchAudienceFilters {
    location: number[];
    language: string;
    gender: string;
    interests: number[];
}

export interface ShippingInfo {
    carrier: string;
    tracking_number: string;
}
