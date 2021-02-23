/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MailHistoryInfoComponent } from './mail-history-info.component';

describe('MailHistoryInfoComponent', () => {
    let component: MailHistoryInfoComponent;
    let fixture: ComponentFixture<MailHistoryInfoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ MailHistoryInfoComponent ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MailHistoryInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
