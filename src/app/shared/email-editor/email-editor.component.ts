import { Component, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';
import { InternalService } from 'src/app/services/internal.service';

import { ToolbarService, LinkService, ImageService, HtmlEditorService,
    RichTextEditorComponent, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';

@Component({
    selector: 'app-email-editor',
    templateUrl: './email-editor.component.html',
    styleUrls: ['./email-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService],
})
export class EmailEditorComponent implements OnInit {
    @Input() htmlContent = '';
    @Input() isHeight = '175px';
    @ViewChild('defaultRTE')

    public rteObj: RichTextEditorComponent;

    public tools: ToolbarModule = {
        items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
            'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|', 'Alignments', 'OrderedList', 'UnorderedList',
            'Outdent', 'Indent', 'Image', 'CreateLink', '|', 'ClearFormat', '|', 'Undo', 'Redo'],
    };

    public quickTools: object = {
        image: [
            'Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension'],
    };

    public maxLength = 10000;
    public textArea: HTMLElement;
    public myCodeMirror: any;

    token = '';
    id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

    public insertImageSettings = {
        saveUrl: 'https://auth.lifo.ai/files',
    };

    ngAfterViewInit(): void {
        const rteObj: RichTextEditorComponent = this.rteObj;

        rteObj.value = this.htmlContent;
        setTimeout(() => { this.textArea = rteObj.contentModule.getEditPanel() as HTMLElement; }, 600);
    }

    constructor(
        private internalService: InternalService,
    ) {
    }

    async ngOnInit() {
    }


    getHtmlContent() {
        const rteValue: string = this.rteObj.getHtml();
        if (rteValue) {
            return rteValue.replace('@image', '<img src="cid:eawvfiitnhpo6kdr0oobjtrgj">');
        }
        return '';
    }

    setHtmlContent(htmlContent) {
        this.rteObj.value = htmlContent;
    }

    public onToolbarClick(e: any): void {
        if (e.item != null && e.item.id === 'imageRTE_toolbar_Image') { // Checked if image toolbar is clicked
            const element: any = document.getElementById('imageRTE_upload'); // Image uploader element

            element.ej2_instances[0].drop = function upload(args) { // Added updating event on image uploader
                args.currentRequest.setRequestHeader('Authorization', 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ5YWQ5YmM1ZThlNDQ3OTNhMjEwOWI1NmUzNjFhMjNiNDE4ODA4NzUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiU2h1byBTaGFuIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWFNwUlJTc3puYXMvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVjbmFSZmY2VEtKLVZUampGSDdRQkxjX1Y0OE9tUS9waG90by5qcGciLCJhY2NvdW50X21hbmFnZXIiOnRydWUsImFjY2Vzc19sZXZlbCI6OSwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2luZmx1ZW5jZXItMjcyMjA0IiwiYXVkIjoiaW5mbHVlbmNlci0yNzIyMDQiLCJhdXRoX3RpbWUiOjE1OTk1ODEyNjgsInVzZXJfaWQiOiJ1Q3Jnb3FwNnpPWjdtNlFLRnBFMFNpTnl6TUcyIiwic3ViIjoidUNyZ29xcDZ6T1o3bTZRS0ZwRTBTaU55ek1HMiIsImlhdCI6MTU5OTU4MTI2OCwiZXhwIjoxNTk5NTg0ODY4LCJlbWFpbCI6InNodW8uc2hhbkBsaWZvLmFpIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMDgwNzc0Njc1OTgwNDI1NDQwMzQiXSwiZW1haWwiOlsic2h1by5zaGFuQGxpZm8uYWkiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.dVDT0DZyrpNXNU8CXEdcwER3HYXZYRwTa4BVFG91YZ40NGbokBY9-BGbg4h5CpP9yRE3IQniGDG5M0XNxBE-0k-LAMbnlD-vDMHPor65-AVbHa2-huh2QfwbYZeGkTk94il4nyFEKH-HeqqjZ05PH2STihvmd04JQuE4rJ15GIixKF5_zbMU73QEJB3wJc6GWRYwuTu88rLGiWOUjYrXA6siTITM9g9k4mpRWqXrc3GuadFiK3lJHbQBpOq0ZJ1z2r8zbZMsIhkCDxlqoaP-HKjDfO4DstHrQ8hCllfFADnaIhQ318ZL9kerD30fMosVfhOP8I1_dw4J5jkVT2QA1g');
            };

            element.ej2_instances[0].uploading = function upload(args) { // Added updating event on image uploader
                args.currentRequest.setRequestHeader('Authorization', 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ5YWQ5YmM1ZThlNDQ3OTNhMjEwOWI1NmUzNjFhMjNiNDE4ODA4NzUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiU2h1byBTaGFuIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWFNwUlJTc3puYXMvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVjbmFSZmY2VEtKLVZUampGSDdRQkxjX1Y0OE9tUS9waG90by5qcGciLCJhY2NvdW50X21hbmFnZXIiOnRydWUsImFjY2Vzc19sZXZlbCI6OSwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2luZmx1ZW5jZXItMjcyMjA0IiwiYXVkIjoiaW5mbHVlbmNlci0yNzIyMDQiLCJhdXRoX3RpbWUiOjE1OTk1ODEyNjgsInVzZXJfaWQiOiJ1Q3Jnb3FwNnpPWjdtNlFLRnBFMFNpTnl6TUcyIiwic3ViIjoidUNyZ29xcDZ6T1o3bTZRS0ZwRTBTaU55ek1HMiIsImlhdCI6MTU5OTU4MTI2OCwiZXhwIjoxNTk5NTg0ODY4LCJlbWFpbCI6InNodW8uc2hhbkBsaWZvLmFpIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMDgwNzc0Njc1OTgwNDI1NDQwMzQiXSwiZW1haWwiOlsic2h1by5zaGFuQGxpZm8uYWkiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.dVDT0DZyrpNXNU8CXEdcwER3HYXZYRwTa4BVFG91YZ40NGbokBY9-BGbg4h5CpP9yRE3IQniGDG5M0XNxBE-0k-LAMbnlD-vDMHPor65-AVbHa2-huh2QfwbYZeGkTk94il4nyFEKH-HeqqjZ05PH2STihvmd04JQuE4rJ15GIixKF5_zbMU73QEJB3wJc6GWRYwuTu88rLGiWOUjYrXA6siTITM9g9k4mpRWqXrc3GuadFiK3lJHbQBpOq0ZJ1z2r8zbZMsIhkCDxlqoaP-HKjDfO4DstHrQ8hCllfFADnaIhQ318ZL9kerD30fMosVfhOP8I1_dw4J5jkVT2QA1g');
                // args.currentRequest.setRequestHeader('Content-Type', 'multipart/form-data'); // Setting additional headers
            };

            element.ej2_instances[0].success = function upload(args) { // Added updating event on image uploader
            };
        }
    }

}
