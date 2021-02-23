import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-progress-loading',
    templateUrl: './progress-loading.component.html',
    styleUrls: ['./progress-loading.component.scss'],
})
export class ProgressLoadingComponent implements OnInit {
    @Input() config: {
        totalSize: number;
        completedCount: number;
        title: string;
        message: string;
    };

    get realMessage() {
        return (this.message || '').replace('%1', `${this.completedCount} / ${this.totalSize}`);
    }

    get title() {
        return this.config?.title;
    }

    get completedCount() {
        return this.config?.completedCount;
    }

    get totalSize() {
        return this.config?.totalSize;
    }

    get message() {
        return this.config?.message;
    }

    constructor() {}

    ngOnInit(): void {}
}
