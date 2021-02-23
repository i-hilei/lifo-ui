import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InfluencerInfo } from 'src/types/influencer';

@Component({
    selector: 'app-accept-info-dialog',
    templateUrl: './accept-info-dialog.html',
    styleUrls: ['./accept-info-dialog.scss'],
})
export class AcceptInfoDialogComponent implements OnInit {

    influencer: InfluencerInfo;

    constructor(
        public dialogRef: MatDialogRef<AcceptInfoDialogComponent>,
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
        this.dialogRef.close(this.influencer);
    }
}
