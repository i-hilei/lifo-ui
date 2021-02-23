import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-create-new-list-dialog',
    templateUrl: './create-new-list-dialog.component.html',
    styleUrls: ['./create-new-list-dialog.component.scss'],
})
export class CreateNewListDialogComponent implements OnInit {
    @Output() private childOuter = new EventEmitter();
    isVisible = false;
    isConfirmLoading = false;
    names = '';
    platform = 'instagram';
    title = 'create';

    constructor() {}
    ngOnInit() {}

    showModal(): void {
        this.names = '';
        this.isVisible = true;
    }

    handleOk(key): void {
        this.isConfirmLoading = true;
        this.childOuter.emit({
            name: this.names,
            title: key,
            platform: this.platform,
        });
    }

    handleCancel(): void {
        this.isVisible = false;
    }

}
