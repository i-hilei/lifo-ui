import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { InternalSearchService } from '../internal-search.service';

interface FilterItem {
    name: string;
    range: [number, number];
}

@Component({
    selector: 'app-audience-info',
    templateUrl: './audience-info.component.html',
    styleUrls: ['./audience-info.component.scss'],
})
export class AudienceInfoComponent implements OnInit {
    genders: { value: string; title: string }[] = [
        { value: 'male', title: 'Male' },
        { value: 'female', title: 'FeMale' },
    ];

    cityFilter: FilterItem = { name: null, range: [null, null] };
    languageFilter: FilterItem = { name: null, range: [null, null] };

    get locationOptions() {
        return this.internalSearchService.locations;
    }
    get interestOptions() {
        return this.internalSearchService.interests;
    }
    get languageOptions() {
        return this.internalSearchService.languages;
    }

    subscriptions: Subscription[] = [];

    constructor(private internalSearchService: InternalSearchService) {}

    ngOnInit() {}
}
