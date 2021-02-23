/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MailStatusComponent } from './mail-status.component';

describe('MailStatusComponent', () => {
    let component: MailStatusComponent;
    let fixture: ComponentFixture<MailStatusComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ MailStatusComponent ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MailStatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
