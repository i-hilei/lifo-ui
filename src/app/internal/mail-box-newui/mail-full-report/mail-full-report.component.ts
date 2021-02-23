import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { Influencer } from 'src/types/influencer';
import { InfluencerRecommendBody } from '@src/types/influencer';
import { InternalService } from 'src/app/services/internal.service';
import { CampaignDetail } from '@src/types/campaign';
import { EmailEditorComponent } from 'src/app/shared/email-editor/email-editor.component';

@Component({
    selector: 'app-mail-full-report',
    templateUrl: './mail-full-report.component.html',
    styleUrls: ['./mail-full-report.component.scss'],
})
export class MailFullReportComponent implements OnInit {
    @Input() templateData;
    @Input() influencer: InfluencerRecommendBody;
    @Input() campaign: CampaignDetail;
    @ViewChild('emailEditor') emailEditor: EmailEditorComponent;
    @Output('checked') checkedBack = new EventEmitter<any>();

    isModalVisible = false;
    templateArr = [];
    templates = [];
    allTemplateInfo = {
        template_name: 'alltemplate',
    };
    emailContent = '';
    emailTitle;
    setModalStyle = {
        position: 'relative',
        top: 0,
        bottom: 0,
        'padding-bottom': 0,
    };

    constructor(
        private modal: NzModalService,
        private message: NzMessageService,
        private internalService: InternalService,
    ) { }

    handleOk(): void {
        this.isModalVisible = false;
    }

    handleCancel(): void {
        console.log(this.influencer, 666);
        console.log(this.campaign, 666);
        this.isModalVisible = false;
    }

    ngOnInit() {
    }

}
