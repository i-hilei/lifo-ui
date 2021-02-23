import { Component, OnInit, Input } from '@angular/core';
import { CampaignPerformance } from '@src/types/campaign';
import { CampaignService } from 'src/app/services/campaign.service';

@Component({
    selector: 'app-campaign-performance-counter',
    templateUrl: './campaign-performance-counter.component.html',
    styleUrls: ['./campaign-performance-counter.component.scss'],
})
export class CampaignPerformanceCounterComponent implements OnInit {
    @Input() campaignPerformance: CampaignPerformance;

    ap_tooltip = this.campaignService.translates('Amount spent is the grand total you paid for the campaign. ');
    cpe_tooltip = 'Cost per engagement';
    cpl_tooltip = 'Cost per like';
    posts_tooltip = 'Total number of posts';
    likes_tooltip = 'Likes from all posts';
    comments_tooltip = 'Comments from all posts';

    constructor(
        public campaignService: CampaignService,
    ) { }

    ngOnInit(): void {
    }
}
