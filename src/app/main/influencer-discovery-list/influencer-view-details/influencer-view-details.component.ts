import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { Influencer } from 'src/types/influencer';
// import { InfluencerRecommendBody } from '@src/types/influencer';
import { InternalService } from 'src/app/services/internal.service';
import * as moment from 'moment';
import { EmailEditorComponent } from 'src/app/shared/email-editor/email-editor.component';

@Component({
    selector: 'app-influencer-view-details',
    templateUrl: './influencer-view-details.component.html',
    styleUrls: ['./influencer-view-details.component.scss'],
})
export class InfluencerViewDetailsComponent implements OnInit {
    @Input() influencer;

    isModalVisible = false;
    setModalStyle = {
        position: 'relative',
        top: 0,
        bottom: 0,
        'padding-bottom': 0,
    };

    constructor() { }


    handleOk(): void {
        this.isModalVisible = false;
    }

    handleCancel(): void {
        this.isModalVisible = false;
    }

    ngOnInit() {
    }

}

