/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InternalSettingComponent } from './internal-setting.component';

describe('InternalSettingComponent', () => {
    let component: InternalSettingComponent;
    let fixture: ComponentFixture<InternalSettingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ InternalSettingComponent ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InternalSettingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
