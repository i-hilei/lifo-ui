import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService, AlertType } from '@src/app/services/notification.service';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['../login/login.component.scss'],
})
export class SignUpComponent implements OnInit {

    constructor(
        private auth: AngularFireAuth,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private notificationService: NotificationService,
    ) {
        this.code = this.activatedRoute.snapshot.queryParamMap.get('oobCode');
    }

    ngOnInit(): void {

    }

    email;
    newPassword;
    confirmPassword;
    code;

    resetPassword() {
        if (this.newPassword !== this.confirmPassword) {
            this.notificationService.addMessage({
                type: AlertType.Success,
                title: 'Signup Success',
                message: 'New Password and Confirm Password do not match',
                duration: 3000,
            });
            return;
        }

        // Save the new password.
        // this.auth.signInWithEmailLink
        this.auth.confirmPasswordReset(
            this.code,
            this.newPassword
        )
            .then(resp => {
            // Password reset has been confirmed and new password updated.
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Signup Success',
                    message: 'New password has been saved',
                    duration: 3000,
                });
                this.router.navigate(['/login']);
            }).catch(e => {
            // Error occurred during confirmation. The code might have
            // expired or the password is too weak.
                this.notificationService.addMessage({
                    type: AlertType.Error,
                    title: 'Signup Error',
                    message: e,
                    duration: 3000,
                });
            });
    }

    signup() {
        if (this.newPassword !== this.confirmPassword) {
            this.notificationService.addMessage({
                type: AlertType.Success,
                title: 'Signup Success',
                message: 'New Password and Confirm Password do not match',
                duration: 3000,
            });
            return;
        }

        this.auth.createUserWithEmailAndPassword(
            this.email,
            this.newPassword,
        ).then(resp => {
            // Password reset has been confirmed and new password updated.
            this.notificationService.addMessage({
                type: AlertType.Success,
                title: 'Signup Success',
                message: 'Your account has been created and you can login now',
                duration: 3000,
            });
            this.router.navigate(['/login']);
        }).catch(e => {
            this.notificationService.addMessage({
                type: AlertType.Error,
                title: 'Signup Error',
                message: e,
                duration: 3000,
            });
        });

    }

}
