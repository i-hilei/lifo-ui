export interface InfluencerFromApi {
    name: string;
    follower: string;
    fake_followers: string;
    engagement: string;
    avg_comment: number;
    spp: string;
    gender: string;
    age: string;
    location: string;
    language: string;
}

export interface Influencer {
    name: string;
    follower: string;
    fake_followers: string;
    engagement: string;
    avg_comment: number;
    spp: string;
    gender: string;
    age: string;
    location: string;
    language: string;
    selected?: boolean;
}

export interface Language {
    code: string;
    count: number;
    name: string;
}

export interface Location {
    id: number;
    name: string;
    title: string;
}

export interface Interest {
    id: number;
    name: string;
}
