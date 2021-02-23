import { Component, OnInit, Input } from '@angular/core';
import { InfluencerPost } from 'src/types/influencer';

@Component({
    selector: 'app-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit {
    @Input() post: InfluencerPost;
    @Input() platform: string = 'instagram';

    constructor() { }

    ngOnInit(): void {
    }

}
