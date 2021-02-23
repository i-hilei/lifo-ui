import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Influencer } from 'src/types/influencer';
import { InternalService } from '@src/app/services/internal.service';
import { Subscription } from 'rxjs';
import { NotificationService, AlertType } from '@src/app/services/notification.service';

@Component({
    selector: 'app-lookalikes',
    templateUrl: './lookalikes.component.html',
    styleUrls: ['./lookalikes.component.scss'],
})
export class LookalikesComponent implements OnInit, OnDestroy {
    @Input() influencer: Influencer;

    @Output() onPullLooklikes = new EventEmitter<any>();

    subscriptions: Subscription[] = [];

    constructor(
        private internalService: InternalService,
        private notificationService: NotificationService,
    ) { }

    openInsPage(val) {
        event.stopPropagation();
        window.open(val, '_blank');
    }

    pullAllProfile() {
        if (this.influencer.audience['audienceLookalikes']) {
            this.onPullLooklikes.emit();
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

}
