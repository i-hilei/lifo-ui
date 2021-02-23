import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'app-html-content',
  templateUrl: './html-content.component.html',
  styleUrls: ['./html-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HtmlContentComponent implements OnInit {

    @Input() htmlContent = '';

    constructor() { }

    ngOnInit(): void {
    }

}
