import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InternalService } from '@src/app/services/internal.service';
import { validateVerticalPosition } from '@angular/cdk/overlay';
import { CampaignConfiguration } from '@src/types/campaign';
import { Router } from '@angular/router';
@Component({
    selector: 'app-internal-setting',
    templateUrl: './internal-setting.component.html',
    styleUrls: ['./internal-setting.component.scss'],
})
export class InternalSettingComponent implements OnInit, OnDestroy {
    // Default settings
    defaultSetting: CampaignConfiguration;

    create_radio = 'INFLUENCERS';
    edit_radio = 'INFLUENCERS';
    create_category_select = 'Campaign';
    getAllCategoryCreate = [];
    edit_category_select = 'Campaign';
    getAllCategoryEdit = [];
    create_question = '';
    create_response = '';

    isSpinning = false;
    currentView = 'setting';

    subscriptions: Subscription[] = [];
    @ViewChild('editFaqs') editFaqs;
    @ViewChild('category') category;


    constructor(
        private internalService: InternalService,
        private message: NzMessageService,
        public router: Router,
    ) { }


    getDefaultConfiguration() {
        this.subscriptions.push(
            this.internalService.getGlobalList().subscribe((result) => {
                this.defaultSetting = result as CampaignConfiguration;
            }, error => {
            })
        );
    }

    saveGlobal() {
        this.isSpinning = true;
        this.subscriptions.push(
            this.internalService.putGlobalList(this.defaultSetting).subscribe((result) => {
                this.isSpinning = false;
                this.message.create('success', 'Save Success');
            }, error => {
            })
        );
    }

    changeList() {
        this.editFaqs.getFaqAlls();
    }

    createFaq() {
        const vals = {
            type: this.create_radio,
            category: this.create_category_select,
            question: this.create_question,
            response: this.create_response,
        };
        this.subscriptions.push(
            this.internalService.createFaq(vals).subscribe((result) => {
                this.create_question = '';
                this.create_response = '';
                this.editFaqs.getFaqAlls();
                this.message.create('success', 'Create Success');
            }, error => {
            })
        );
    }

    ngOnInit() {
        this.getDefaultConfiguration();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    getLists(msg) {
        // console.log([...new Set(msg)], 'get');
        this.getAllCategoryCreate = [...new Set(msg)];
        this.getAllCategoryEdit = [...new Set(msg)];

    }

    isShowCategory() {
        this.category.isVisible = true;
    }

    addCategory(msg) {
        this.create_category_select = msg;
        this.getAllCategoryCreate.push(msg);
    }

    backToHome() {
        this.router.navigate(['/internal/home']);
    }

}
