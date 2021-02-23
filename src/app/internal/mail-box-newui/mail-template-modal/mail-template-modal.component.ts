import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InternalService } from 'src/app/services/internal.service';
import { OfferDetailComponent } from '../../offer-detail/offer-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { OfferDetail, CampaignDetail } from 'src/types/campaign';
import { EmailEditorComponent } from 'src/app/shared/email-editor/email-editor.component';
import { AlertType, NotificationService } from '@src/app/services/notification.service';

@Component({
    selector: 'app-mail-template-modal',
    templateUrl: './mail-template-modal.component.html',
    styleUrls: ['./mail-template-modal.component.scss'],
})
export class MailTemplateModalComponent implements OnInit {
    @Input() templateData;
    @Input() campaign: CampaignDetail;
    @ViewChild('emailEditor') emailEditor: EmailEditorComponent;
    @Output('checked') checkedBack = new EventEmitter<any>();
    isModalVisible = false;
    showOfferBtn = true;
    templateArr = [];
    templates = [];
    currentOfferDetail: OfferDetail;
    isFocus = false;
    setModalStyle = {
        top: '10px',
        bottom: '10px',
        width: 'calc(100% - 20px)',
    };

    constructor(
        private dialog: MatDialog,
        private modal: NzModalService,
        private message: NzMessageService,
        private internalService: InternalService,
        private notification: NotificationService,
    ) { }

    handleOk(): void {
        this.isModalVisible = false;
    }

    handleCancel(): void {
        this.isModalVisible = false;
    }

    deleteTemplateInfo(val): void {
        // const this = this;
        this.modal.confirm({
            nzTitle: 'Are you sure delete this template?',
            //   nzContent: '<b style="color: red;">Some descriptions</b>',
            nzOkText: 'Yes',
            nzOkType: 'danger',
            nzOnOk: () => {
                const deleteConfirm = this.internalService.deleteTemplateByName(val.template_name, 'emails');
                deleteConfirm.subscribe(res => {
                    this.templates = [];
                    for (const i in this.templateArr) {
                        if (this.templateArr[i]['template_name'] === val['template_name']) {
                            this.templateArr.splice(Number(i), 1);
                        } else {
                            this.templates.push(this.templateArr[i]);
                        }
                    }
                    this.message.create('success', 'Delete success!');
                });
            },
            nzCancelText: 'No',
            nzOnCancel: () => {
                this.message.create('error', 'Delete Cancel!');
            },
        });
    }

    useTemplateInfo() {
        for (const item of this.templateArr) {
            if (item.checked) {
                if (item.require_offer_detail && !this.currentOfferDetail) {
                    this.notification.addMessage({
                        type: AlertType.Error,
                        title: 'No Offer Detail',
                        message: 'No offer detail attached.',
                        duration: 3000,
                    });
                    return;
                }
                this.selectTempalte(item);
                this.isModalVisible = false;
            }
        }
    }

    addOfferDetail() {
        const dialogRef = this.dialog.open(OfferDetailComponent, {
            width: 'calc(100% - 20px)',
            maxWidth: 'calc(100% - 20px)',
            height: 'calc(100% - 20px)',
            data: {
                offerDetail: this.currentOfferDetail,
                campaign: this.campaign,
            },
        });

        dialogRef.afterClosed().subscribe(offerDetail => {
            if (offerDetail) {
                this.currentOfferDetail = offerDetail;
            }
        });
    }

    clickTemplate(val, k) {
        for (const item of this.templateArr) {
            item['checked'] = false;
        }
        this.templateArr[k]['checked'] = !val.checked;
    }

    selectTempalte(template) {
        if (template.require_offer_detail && this.currentOfferDetail) {
            template.offerDetail = this.currentOfferDetail;
        }
        this.checkedBack.emit(template);
    }

    ngOnInit() {

    }

}
