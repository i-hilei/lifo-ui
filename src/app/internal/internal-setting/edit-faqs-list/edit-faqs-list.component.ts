import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { InternalService } from '@src/app/services/internal.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    selector: 'app-edit-faqs-list',
    templateUrl: './edit-faqs-list.component.html',
    styleUrls: ['./edit-faqs-list.component.scss'],
})
export class EditFaqsListComponent implements OnInit {

    constructor(
        private internalService: InternalService,
        private message: NzMessageService
    ) { }

    subscription: Subscription[] = [];
    @Input() editType;
    @Input() editCateGory;
    @Output() private defaultList = new EventEmitter();

    create_radio = '';
    create_category_select = '';
    create_question = '';
    create_response = '';
    faqList = [];
    faqCategory = [];
    isSpinning = false;


    updateFaq(vals) {
        const val = {
            type: vals.type,
            category: vals.category,
            question: vals.question,
            response: vals.response,
        };
        this.subscription.push(
            this.internalService.updateFaq(val, vals.id).subscribe((result) => {
                this.getFaqAlls();
                this.message.create('success', 'Success');
                // this.childOuter.emit();
            }, error => {
            })
        );
    }

    getFaqAlls() {
        this.faqList = [];
        this.faqCategory = [];
        this.isSpinning = true;
        this.subscription.push(
            this.internalService.getFaqAll().subscribe((result) => {
                for (const i of result) {
                    if (i.type === this.editType && i.category === this.editCateGory) {
                        i.isShowList = true;
                        this.faqList.push(i);
                    }
                    if (i.hasOwnProperty('category')) {
                        this.faqCategory.push(i.category);
                    }
                }
                this.defaultList.emit(this.faqCategory);
                this.isSpinning = false;
            }, error => {
            })
        );
    }
    deleteFaq(id) {
        this.subscription.push(
            this.internalService.deleteFaqs(id).subscribe((result) => {
                this.getFaqAlls();
                this.message.create('success', 'Success');
                // this.isShowList  = true;
            }, error => {
            })
        );
    }
    ngOnInit() {
        this.getFaqAlls();
    }

}
