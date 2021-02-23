import { Component, OnInit } from '@angular/core';
import { InternalSearchService } from '../../internal-search/internal-search.service';
import { Influencer, InfluencerFromApi } from '../models/index';
import { orderBy, get } from 'lodash';

interface HeaderColumnItem {
    columnKey: string;
    columnName: string;
}

@Component({
    selector: 'app-influencer-list',
    templateUrl: './influencer-list.component.html',
    styleUrls: ['./influencer-list.component.scss'],
})
export class InfluencerListComponent implements OnInit {
    headerColumnList: HeaderColumnItem[] = [
        // { columnKey: 'relevant', columnName: 'Relevant' },
        { columnKey: 'follower', columnName: 'Follower' },
        { columnKey: 'fake_followers', columnName: 'Fake Followers' },
        { columnKey: 'engagement', columnName: 'Engagement' },
        { columnKey: 'avg_comment', columnName: 'Avg Comment' },
        { columnKey: 'spp', columnName: 'SPP' },
        { columnKey: 'gender', columnName: 'Gender' },
        { columnKey: 'age', columnName: 'Age' },
        { columnKey: 'location', columnName: 'Location' },
        { columnKey: 'language', columnName: 'Language' },
    ];

    pageSize = 20;
    sort: HeaderColumnItem = null;
    page = 1; // start at 1

    influencerListFromApi: InfluencerFromApi[] = [];
    private originInfluencerList: Influencer[] = [];
    influencerList: Influencer[] = [];

    get = get;

    get selectedInfluencerList() {
        return this.influencerList.filter((influencer) => influencer.selected);
    }

    get influencersOfThisPage() {
        const start = this.pageSize * (this.page - 1);
        const end = this.pageSize * this.page; // don't indlude
        return this.influencerList.slice(start, end);
    }

    // Count of page
    get pageCount() {
        return Math.ceil(this.influencerList.length / this.pageSize);
    }

    get isAllSelected() {
        return this.influencersOfThisPage.every((influencer) => influencer.selected);
    }

    constructor(private internalSearchService: InternalSearchService) {}

    async ngOnInit() {
        this.influencerListFromApi = await this.internalSearchService.getInfluencerList();
        this.influencerList = this.internalSearchService.translateData(this.influencerListFromApi);
        this.originInfluencerList = this.influencerList;
    }

    goPage(next: boolean) {
        if (next) {
            this.page++;
        } else {
            this.page--;
        }
    }

    selectAll() {
        const status = !this.isAllSelected;
        this.influencersOfThisPage.forEach((influencer) => {
            influencer.selected = status;
        });
    }

    clickSort(sortItem: HeaderColumnItem) {
        if (this.sort === sortItem) {
            this.sort = null;
            this.influencerList = this.originInfluencerList;
        } else {
            this.sort = sortItem;
            this.influencerList = orderBy(this.influencerList, (item: Influencer) => parseFloat(item[sortItem.columnKey]), 'desc');
        }
    }
}
