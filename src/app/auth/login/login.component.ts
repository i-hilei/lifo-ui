import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService, AlertType } from 'src/app/services/notification.service';
import { UserGuideComponent } from 'src/app/shared/user-guide/user-guide.component';
import { MatDialog } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

    completeLoading;

    email;
    password;
    defaultLangs = 'English';

    constructor(
        public auth: AngularFireAuth,
        public router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService,
        private dialog: MatDialog,
        private i18n: TranslateService
    ) {
        // this.i18n.get('app.welcome').subscribe((res:string) => {
        //     console.log(res, 'trans');
        //   });

    }

    ngOnInit() {
        // default language is English
        let langs = 'en';
        if (localStorage.getItem('langs') != null) {
            langs = localStorage.getItem('langs');
        } else {
            const browserLangs = (navigator.language).toLowerCase();
            langs = browserLangs;
        }
        if (langs === 'zh-cn') {
            this.defaultLangs = 'Chinese';
            this.setLangs(this.defaultLangs);
        } else {
            this.defaultLangs = 'English';
            this.setLangs(this.defaultLangs);
        }
        this.route.queryParams.subscribe(params => {
            if (params['idToken']) {
                this.auth.signInWithCustomToken(params['idToken']).then(result => {
                    this.auth.idTokenResult.subscribe(idToken => {
                        if (idToken && idToken.claims && idToken.claims.store_account === true) {
                            this.router.navigate(['/app/brand-home']);
                        } else {
                            this.router.navigate(['/app/home']);
                        }
                        this.showUserGuide();
                    });
                }).catch(error => {
                    this.notificationService.addMessage({
                        type: AlertType.Error,
                        title: 'Login Error',
                        message: 'Invalid token. Please verify and login again.',
                        duration: 3000,
                    });
                    this.completeLoading = true;
                });
            } else {
                this.completeLoading = true;
            }
        });
    }

    setLangs(val) {
        if (val === 'English') {
            this.i18n.setDefaultLang('en-US');
            this.i18n.use('en-US');
            localStorage.setItem('langs', 'en-us');
        } else {
            this.i18n.setDefaultLang('zh-CN');
            this.i18n.use('zh-CN');
            localStorage.setItem('langs', 'zh-cn');
        }
    }

    loginWithPassword() {
        this.auth.signInWithEmailAndPassword(this.email, this.password).then(result => {
            if (result.user.email.indexOf('lifo.ai') >= 0) {
                this.router.navigate(['/internal/home']);
            } else {
                this.router.navigate(['/app/brand-home']);
                // this.showUserGuide();
            }
        }, error => {
            this.notificationService.addMessage({
                type: AlertType.Error,
                title: 'Login Error',
                message: error,
                duration: 3000,
            });
        });
    }

    change() {
        if (this.i18n.defaultLang === 'zh-CN') {
            this.i18n.setDefaultLang('en-US');
            this.i18n.use('en-US');
            localStorage.setItem('langs', 'en-US');
        //   this.i18n.defaultLang = 'en-US';
        } else {
            this.i18n.setDefaultLang('zh-CN');
            this.i18n.use('zh-CN');
            localStorage.setItem('langs', 'zh-CN');
        //   this.i18n.defaultLang = 'zh-CN';
        }
      }

    login() {
        this.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(result => {
            if (result.user.email.indexOf('lifo.ai') >= 0) {
                this.router.navigate(['/internal/home']);
            } else {
                this.router.navigate(['/app/brand-home']);
                // this.showUserGuide();
            }
        }, error => {
            this.notificationService.addMessage({
                type: AlertType.Error,
                title: 'Login Error',
                message: error,
                duration: 3000,
            });
        });
    }

    showUserGuide() {
        if (!localStorage.getItem('skipUserGuide') || localStorage.getItem('skipUserGuide') !== 'true') {
            this.dialog.open(UserGuideComponent, {
                width: '800px',
            });
        }
    }

    signUp() {
        this.router.navigate(['/sign-up']);
    }
}
