import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InternalService } from 'src/app/services/internal.service';
import { OfferDetailComponent } from '../../offer-detail/offer-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { OfferDetail, CampaignDetail } from 'src/types/campaign';
import { EmailEditorComponent } from 'src/app/shared/email-editor/email-editor.component';

@Component({
    selector: 'app-discovery-status',
    templateUrl: './discovery-status.component.html',
    styleUrls: ['./discovery-status.component.scss'],
})
export class DiscoveryStatusComponent implements OnInit {
    @Input() templateData;
    @Input() campaign: CampaignDetail;
    @ViewChild('emailEditor') emailEditor: EmailEditorComponent;
    @Output('checked') checkedBack = new EventEmitter<any>();
    isModalVisible = false;
    showOfferBtn = true;
    templateArr = [];
    templates = [];
    currentOfferDetail: OfferDetail;
    allTemplateInfo = {
        template_name: 'alltemplate',
    };
    emailContent = '';
    emailTitle;
    isFocus = false;
    setModalStyle = {
        position: 'relative',
        top: 0,
        bottom: 0,
        'padding-bottom': 0,
    };

    constructor(
        private dialog: MatDialog,
        private modal: NzModalService,
        private message: NzMessageService,
        private internalService: InternalService,
    ) { }

    handleOk(): void {
        this.isModalVisible = false;
    }

    handleCancel(): void {
        this.isModalVisible = false;
    }

    ngOnInit() {
    }

}
