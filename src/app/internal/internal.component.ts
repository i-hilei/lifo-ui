import { Component, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
    selector: 'app-internal',
    templateUrl: './internal.component.html',
    styleUrls: ['./internal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class InternalComponent implements OnInit {

    constructor(
        public router: Router,
        public auth: AngularFireAuth,
    ) { }

    ngOnInit(): void {
    }

    goHome() {
        this.router.navigateByUrl('/internal/home');
    }
    goInfluencer() {
        this.router.navigateByUrl('/internal/influencer-list');
    }
    goUserManagement() {
        this.router.navigateByUrl('/internal/user-management');
    }
    goTransactionHistory() {
        this.router.navigateByUrl('/internal/transaction-history');
    }
    goToMonitoring() {
        this.router.navigateByUrl('/internal/monitoring-dashboard');
    }
    goToShopListing() {
        this.router.navigateByUrl('/internal/shop-management');
    }
    goToLottery() {
        this.router.navigateByUrl('/internal/lottery');
    }
    goToOperation() {
        this.router.navigateByUrl('/internal/influencer-management');
    }
    logout() {
        this.auth.signOut().then(result => {
            this.router.navigate(['/login']);
        });
    }
}
