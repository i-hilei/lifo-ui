/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditFaqsListComponent } from './edit-faqs-list.component';

describe('EditFaqsListComponent', () => {
    let component: EditFaqsListComponent;
    let fixture: ComponentFixture<EditFaqsListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ EditFaqsListComponent ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditFaqsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
