import { Component, OnInit, Inject } from '@angular/core';
import { CampaignService } from 'src/app/services/campaign.service';
import { UserGuideComponent } from '../user-guide/user-guide.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';

@Component({
    selector: 'app-account-manager',
    templateUrl: './account-manager.component.html',
    styleUrls: ['./account-manager.component.scss'],
})
export class AccountManagerComponent implements OnInit {
    validateForm!: FormGroup;
    constructor(
        public dialogRef: MatDialogRef<AccountManagerComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public campaignService: CampaignService,
        public loadingService: LoadingSpinnerService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private notification: NotificationService,
    ) { }

    isShowOld = true;
    subscriptions: Subscription[] = [];
    marketList = [
        this.campaignService.translates('I’m new to influencer marketing'),
        this.campaignService.translates('I have some experience'),
        this.campaignService.translates('I‘m very experienced'),
    ];
    platformsList = [];
    targetsList = [];
    checkOptionsOne = [
        { label: 'Instagram', value: 'Instagram'},
        { label: 'TikTok', value: 'TikTok' },
        { label: 'Youtube', value: 'Youtube' },
        { label: 'Facebook', value: 'Facebook' },
        { label: 'Twitch', value: 'Twitch' },
        { label: 'Snapchat', value: 'Snapchat' },
        { label: 'Pinterest', value: 'Pinterest' },
        { label: this.campaignService.translates('Others'), value: 'Others' },
    ];

    checkOptionsTwo = [
        { label: this.campaignService.translates('Brand awareness'), value: 'Brand awareness'},
        { label: this.campaignService.translates('Sales conversion'), value: 'Sales conversion' },
        { label: this.campaignService.translates('Customer acquisition'), value: 'Customer acquisition' },
        { label: this.campaignService.translates('Content creation'), value: 'Content creation' },
        { label: this.campaignService.translates('Offline business'), value: 'Offline business' },
        { label: this.campaignService.translates('App installs'), value: 'App installs' },
        { label: this.campaignService.translates('Product testing'), value: 'Product testing' },
        { label: this.campaignService.translates('Others'), value: 'Others' },
    ];

    confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return { required: true };
        } else if (control.value !== this.validateForm.controls.password.value) {
            return { confirm: true, error: true };
        }
        return {};
    };

    ngOnInit() {
        this.validateForm = this.fb.group({
            email: [null, [Validators.email, Validators.required]],
            name: [null, [Validators.required]],
            phone_number: [null, [Validators.required]],
            marketing: [''],
        });
    }

    isBook() {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }
        this.ngforList(this.checkOptionsOne, 'platformsList');
        this.ngforList(this.checkOptionsTwo, 'targetsList');
        const arr = this.validateForm.value;
        arr['platforms'] = this.platformsList;
        arr['targets'] = this.targetsList;
        this.loadingService.show();
        this.subscriptions.push(
            this.campaignService.bookDemo(arr).subscribe((result) => {
                this.notification.addMessage({
                    type: AlertType.Success,
                    title: 'Demo Request Received',
                    message: 'We have received your request, our account manager will reach out to you shortly',
                    duration: 3000,
                });
                window.open('https://calendar.x.ai/lifodemo/demo', '_blank');
                this.loadingService.hide();
                this.close();
            }, err => {
                this.loadingService.hide();
            })
        );
    }

    log(value: object[], key): void {
        if (key === 'one' ) {
            this.platformsList = value;
        } else {
            this.targetsList = value;
        }
    }

    ngforList(obj, key) {
        this[key] = [];
        for (const i of obj) {
            if (i['checked']) {
                this[key].push(i['value']);
            }
        }
    }

    isShowGuide() {
        this.close();
        const dialogRef = this.dialog.open(UserGuideComponent, {
            width: '800px',
        });
    }

    close() {
        this.dialogRef.close();
    }
}
