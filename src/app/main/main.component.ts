import { Component, OnInit, ViewContainerRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { NotificationService } from '../services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { UserGuideComponent } from '../shared/user-guide/user-guide.component';
import { AccountManagerComponent } from '../shared/account-manager/account-manager.component';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {

    isBrandView: boolean;


    subscriptions: Subscription[] = [];
    rooterChange: Subscription;

    constructor(
        public router: Router,
        public activatedRoute: ActivatedRoute,
        public auth: AngularFireAuth,
        public dialog: MatDialog,
        private i18n: TranslateService
    ) {

    }

    ngOnInit(): void {
        if (localStorage.getItem('langs') != null) {
            const lans = localStorage.getItem('langs');
            this.setLangs(lans);
        } else {
            const browserLangs = (navigator.language).toLowerCase();
            localStorage.setItem('langs', browserLangs);
            this.setLangs(browserLangs);
        }
        this.subscriptions.push(
            this.auth.idTokenResult.subscribe(idToken => {
                if (idToken && idToken.claims && idToken.claims.store_account === true) {
                    this.isBrandView = true;
                    console.log(this.i18n.langs);
                    this.showHelp();
                } else {
                    this.isBrandView = false;
                }
            })
        );
    }

    setLangs(val) {
        if (val !== 'zh-CN') {
            this.i18n.setDefaultLang('en-US');
            this.i18n.use('en-US');
            localStorage.setItem('langs', 'en-US');
        } else {
            this.i18n.setDefaultLang('zh-CN');
            this.i18n.use('zh-CN');
            localStorage.setItem('langs', 'zh-CN');
        }
    }

    change() {
        if (this.i18n.defaultLang === 'zh-CN') {
            this.i18n.setDefaultLang('en-US');
            this.i18n.use('en-US');
            localStorage.setItem('langs', 'en-US');
        } else {
            this.i18n.setDefaultLang('zh-CN');
            this.i18n.use('zh-CN');
            localStorage.setItem('langs', 'zh-CN');
        }
      }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    navigate(page) {
        this.router.navigate([`/app/${page}`]);
    }

    logout() {
        this.auth.signOut().then(result => {
            this.router.navigate(['/login']);
        });
    }

    showHelp() {
        const dialogRef = this.dialog.open(AccountManagerComponent, {
            width: '800px',
        });
        // this.router.navigate(['/app/faqs']);
    }

    get homeClass() {
        return this.router.url.indexOf('/app/brand-home') >= 0;
    }

    get helpClass() {
        return this.router.url.indexOf('/app/faqs') >= 0;
    }

}
