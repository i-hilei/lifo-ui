import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CampaignDetail } from 'src/types/campaign';

@Component({
    selector: 'app-uploader',
    templateUrl: './uploader.component.html',
    styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent {

    @Output() onUploadSuccess = new EventEmitter<any>();
    @Input() campaign: CampaignDetail;
    @Input() uploadPath: string;
    @Input() formatList: string[] = ['image/*'];

    isHovering: boolean;
    files: File[] = [];

    toggleHover(event: boolean) {
        this.isHovering = event;
    }

    onDrop(files: FileList) {
        for (let i = 0; i < files.length; i++) {
            this.files.push(files.item(i));
        }
    }

    uploadSuccess(file) {
        this.onUploadSuccess.emit(file);
    }
}
