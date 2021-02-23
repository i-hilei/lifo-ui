/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MailTemplateModalComponent } from './mail-template-modal.component';

describe('MailTemplateModalComponent', () => {
    let component: MailTemplateModalComponent;
    let fixture: ComponentFixture<MailTemplateModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ MailTemplateModalComponent ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MailTemplateModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
