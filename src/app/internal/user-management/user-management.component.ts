import { Component, OnInit } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { NotificationService, AlertType } from '@src/app/services/notification.service';
import { Subscription } from 'rxjs';
import { LoadingSpinnerService } from '@src/app/services/loading-spinner.service';

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

    newUser = {
        from_amazon: true,
        email: 'shanshuo0918@gmail.com',
        brand_name: 'Test Brand',
        password: '123456',
        first_name: 'Shuo',
        last_name: 'Shan',
        domain: '',
        address1: '123 Main St',
        address2: 'Apt 123',
        city: 'Stanford',
        province: 'CA',
        country: '95051',
        profile_image: '',
    }
    subscriptions: Subscription[] = [];

    constructor(
        private internalService: InternalService,
        private notification: NotificationService,
        private loadingService: LoadingSpinnerService,
        private auth: AngularFireAuth,
    ) { }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    createNewUser() {
        this.loadingService.show();
        this.subscriptions.push(
            this.internalService.createBrandUser(this.newUser).subscribe(result => {
                // TODO: replace with sendgrid template
                // this.auth.sendPasswordResetEmail(this.newUser.email, {
                //     url: 'https://localhost:4200/sign-up',
                //     // This must be true.
                //     handleCodeInApp: true,
                // }).then(result => {
                //     this.loadingService.hide();
                //     this.notification.addMessage({
                //         type: AlertType.Success,
                //         title: 'Contents Approved',
                //         message: 'Brand account has been created.',
                //         duration: 3000,
                //     });
                // }).catch(error => {
                //     this.loadingService.hide();
                //     this.notification.addMessage({
                //         type: AlertType.Error,
                //         title: 'Error',
                //         message: error,
                //         duration: 3000,
                //     });
                // });
                // this.auth.sendSignInLinkToEmail(this.newUser.email,
                    
                // )
            }, error => {
                this.loadingService.hide();
                this.notification.addMessage({
                    type: AlertType.Error,
                    title: 'Error',
                    message: error,
                    duration: 3000,
                });
            })
        );
    }

    setProfileImage(url) {
        this.newUser.profile_image = url;
    }

}
