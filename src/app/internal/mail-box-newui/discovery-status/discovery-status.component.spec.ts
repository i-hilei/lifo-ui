/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DiscoveryStatusComponent } from './discovery-status.component';

describe('DiscoveryStatusComponent', () => {
    let component: DiscoveryStatusComponent;
    let fixture: ComponentFixture<DiscoveryStatusComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ DiscoveryStatusComponent ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DiscoveryStatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
