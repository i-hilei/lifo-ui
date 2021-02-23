import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Influencer } from 'src/types/influencer';

@Component({
    selector: 'app-recommend-info-dialog',
    templateUrl: './recommend-info-dialog.html',
    styleUrls: ['./recommend-info-dialog.scss'],
})
export class RecommendInfoDialogComponent implements OnInit {

    influencer: Influencer;

    reason_type: string;
    other_reason = '';
    minPrice: number = 0;
    maxPrice: number = 100;

    skipBrand = false;
    highlyRecommend = false;

    constructor(
        public dialogRef: MatDialogRef<RecommendInfoDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) {
        this.influencer = data.influencer;
    }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submit() {
        const data = {
            reason:  `${this.reason_type} | ${this.other_reason}`,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            skipBrand: this.skipBrand,
            highlyRecommend: this.highlyRecommend,
        };
        this.dialogRef.close(data);
    }
}
