import { Component, OnInit } from '@angular/core';
import { InternalSearchService } from '../internal-search.service';

@Component({
    selector: 'app-influencer-info',
    templateUrl: './influencer-info.component.html',
    styleUrls: ['./influencer-info.component.scss'],
})
export class InfluencerInfoComponent implements OnInit {
    countryFilter: string[] = [];
    cityFilter: string[] = [];
    languageFilter: string[] = [];
    genderFilter: { male: boolean; female: boolean } = {
        male: false,
        female: false,
    };
    followerFilter: [number, number] = [null, null];
    engagementFilter: [number, number] = [null, null];

    MATH_MAX = Math.max;

    get locationOptions() {
        return this.internalSearchService.locations;
    }
    get interestOptions() {
        return this.internalSearchService.interests;
    }
    get languageOptions() {
        return this.internalSearchService.languages;
    }

    constructor(private internalSearchService: InternalSearchService) {}

    ngOnInit() {}
}
