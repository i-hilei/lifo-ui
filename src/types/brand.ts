export interface BrandUser {
    aud: string;
    auth_time: number;
    exp: number;
    firebase: any;
    from_shopify: boolean;
    iat: number;
    iss: string;
    store_account: boolean;
    store_email: string;
    store_name: string;
    sub: string;
    user_id: string;
}

export interface ShopifyApplicationCharge {
    api_client_id: number;
    charge_type: string;
    confirmation_url: string;
    created_at: string;
    decorated_return_url: string;
    id: number;
    name: string;
    price: string;
    return_url: string;
    status: string;
    test: boolean;
    updated_at: string;
}
