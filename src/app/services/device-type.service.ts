import {HostListener, Injectable, OnDestroy, Renderer2, RendererFactory2} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {BehaviorSubject, fromEventPattern, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DeviceTypeService implements OnDestroy {
    currentDeviceType$: BehaviorSubject<'mobile' | 'tablet' | 'desktop'> = new BehaviorSubject<'mobile' | 'tablet' | 'desktop'>(null);
    currentDeviceType: 'mobile' | 'tablet' | 'desktop' = null;
    public onResize$: Observable<Event>;
    protected renderer: Renderer2;
    protected _destroy$ = new Subject();

    constructor(
        private deviceDetectorService: DeviceDetectorService,
        private rendererFactory2: RendererFactory2
    ) {
        this.renderer = this.rendererFactory2.createRenderer(null, null);
        this.createOnClickObservable();
        this.onResize$
            .pipe(takeUntil(this._destroy$))
            .subscribe(event => {
                this.setDeviceType();
            })
        this.setDeviceType();
    }
    
    setDeviceType(): void {
        this.currentDeviceType = null;
        switch (true) {
            case this.deviceDetectorService.isMobile():
                this.currentDeviceType = 'mobile';
                break;
            case this.deviceDetectorService.isTablet():
                this.currentDeviceType = 'tablet';
                break;
            case this.deviceDetectorService.isDesktop():
                this.currentDeviceType = 'desktop';
                break;
        }
        this.currentDeviceType$.next(this.currentDeviceType);
    }

    protected createOnClickObservable() {
        let removeResizeEventListener: () => void;
        const createResizeEventListener = (
            handler: (e: Event) => boolean | void
        ) => {
            removeResizeEventListener = this.renderer.listen("window", "resize", handler);

        };

        this.onResize$ = fromEventPattern<Event>(createResizeEventListener, () =>
            removeResizeEventListener()
        );
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
