import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Influencer } from 'src/types/influencer';

@Component({
    selector: 'app-decline-info-dialog',
    templateUrl: './decline-info-dialog.html',
    styleUrls: ['./decline-info-dialog.scss'],
})
export class DeclineInfoDialogComponent implements OnInit {

    decline_type: string;
    decline_text_reason: string;

    constructor(
        public dialogRef: MatDialogRef<DeclineInfoDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) {
    }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submit() {
        this.dialogRef.close({
            decline_type: this.decline_type,
            decline_text_reason: this.decline_text_reason,
        });
    }
}
