import { Component, Directive, HostListener, Output, EventEmitter, ViewEncapsulation, OnInit, ViewContainerRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Intercom } from 'ng-intercom';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationService } from './services/notification.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
    title = 'influencer';

    constructor(
        public auth: AngularFireAuth,
        public intercom: Intercom,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private notificationService: NotificationService,
        private viewContainerRef: ViewContainerRef,
    ) {

        this.notificationService.setRootViewContainerRef(this.viewContainerRef);

        this.matIconRegistry.addSvgIcon(
            'likes',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/likes.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'posts',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/posts.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'comments',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/comments.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'amount-spent',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/amount spent.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'cpl',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/CPL.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'cpe',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/CPL-1.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/LOGO.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'thankyou',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/thankyou.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'havefive',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/highfive.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'congradulations',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/congradulations.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'concern',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/concern.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'logo-circle',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/logo-circle.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'collaborator-empty',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/collaborator_empty.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'content-review-empty',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/conten_review_empty.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'performance-empty',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/performance_empty.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'chatbox-empty',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/undraw_a_moment_to_relax_bbpa.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'step',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/step.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'empty-campaign-table',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/empty_campaign_table.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'empty-checkbox',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/empty_checkbox.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'checked-checkbox',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/checked_checkbox.svg')
        );
    }

    ngOnInit() {
        this.intercom.boot({
            app_id: 'etq9z8nj',
            // Supports all optional configuration.
            widget: {
                activator: '#intercom',
            },
        });
    }
}

@Directive({
    selector: '[dropzone]',
})
export class DropzoneDirective {
    @Output() dropped = new EventEmitter<FileList>();
    @Output() hovered = new EventEmitter<boolean>();

    @HostListener('drop', ['$event'])
    onDrop($event: { preventDefault: () => void; dataTransfer: { files: FileList } }) {
        $event.preventDefault();
        this.dropped.emit($event.dataTransfer.files);
        this.hovered.emit(false);
    }

    @HostListener('dragover', ['$event'])
    onDragOver($event) {
        $event.preventDefault();
        this.hovered.emit(true);
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave($event) {
        $event.preventDefault();
        this.hovered.emit(false);
    }
}
