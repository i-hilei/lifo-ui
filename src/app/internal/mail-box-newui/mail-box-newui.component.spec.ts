/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MailBoxNewuiComponent } from './mail-box-newui.component';

describe('MailBoxNewuiComponent', () => {
    let component: MailBoxNewuiComponent;
    let fixture: ComponentFixture<MailBoxNewuiComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ MailBoxNewuiComponent ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MailBoxNewuiComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
