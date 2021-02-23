import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-save-template-dialog',
    templateUrl: './save-template-dialog.html',
    styleUrls: ['./save-template-dialog.scss']
})
export class SaveTemplateDialogComponent implements OnInit {

    templateName = '';

    constructor(
        public dialogRef: MatDialogRef<SaveTemplateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) {
    }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submit() {
        this.dialogRef.close(this.templateName);
    }
}
