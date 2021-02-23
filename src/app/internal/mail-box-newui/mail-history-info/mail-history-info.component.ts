import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-mail-history-info',
    templateUrl: './mail-history-info.component.html',
    styleUrls: ['./mail-history-info.component.scss'],
})
export class MailHistoryInfoComponent implements OnInit {
    @Input() historyAllInfo = [];
    @Input() authName = '';

    constructor() { }

    ngOnInit() {
    }
}
