import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { ProgressLoadingComponent } from '@shared/progress-loading/progress-loading.component';

export interface ProgressLoadingConfig {
    totalSize: number;
    completedCount: number;
    title: string;
    // format like: we are uploading file %1
    // %1 will be replaced by completedCount / totalSize
    message: string;
}

@Injectable({
    providedIn: 'root',
})
export class ProgressLoadingService {
    private overlayRef: OverlayRef = null;

    constructor(private overlay: Overlay) {}

    public showProgress(props: ProgressLoadingConfig) {
        if (!this.overlayRef) {
            this.overlayRef = this.overlay.create();
        }

        const spinnerOverlayPortal = new ComponentPortal(ProgressLoadingComponent);
        const component = this.overlayRef.attach(spinnerOverlayPortal);
        component.instance.config = props;
    }

    public hideProgress() {
        if (!!this.overlayRef) {
            this.overlayRef.detach();
        }
    }
}
