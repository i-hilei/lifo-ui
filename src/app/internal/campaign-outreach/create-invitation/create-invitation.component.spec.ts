/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CreateInvitationComponent } from './create-invitation.component';

describe('CreateInvitationComponent', () => {
    let component: CreateInvitationComponent;
    let fixture: ComponentFixture<CreateInvitationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ CreateInvitationComponent ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateInvitationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
