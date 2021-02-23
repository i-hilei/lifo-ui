import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertType, NotificationService } from '@src/app/services/notification.service';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
    isVisible = false;
    value?: string;
    isShowInputPass = true;
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;

    constructor(
        private notification: NotificationService,
        private auth: AngularFireAuth,
    ) { }


    ngOnInit() {
    }

    handleCancel(): void {
        this.isVisible = false;
    }

    async resetPassword() {
        const user = await this.auth.currentUser;
        if (this.newPassword !== this.confirmPassword) {
            this.notification.addMessage({
                type: AlertType.Error,
                title: 'Error',
                message: 'New Password and Confirm Password do not match',
                duration: 3000,
            });
            return;
        }
        this.auth.signInWithEmailAndPassword(user.email, this.oldPassword).then((result) => {
            user.updatePassword(this.newPassword).then(result => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Password Saved',
                    message: 'Your new password has been saved.',
                    duration: 3000,
                });
                this.isShowInputPass = false;
            }).catch(error => {
                this.notification.addMessage({
                    type: AlertType.Error,
                    title: 'Error',
                    message: error.error.errors,
                    duration: 3000,
                });
            });
        }).catch((err) => {
            this.notification.addMessage({
                type: AlertType.Error,
                title: 'Error',
                message: err.message,
                duration: 3000,
            });
        });
    }


}
