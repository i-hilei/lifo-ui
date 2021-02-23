import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NegotiationStepsComponent } from './negotiation-steps.component';

describe('NegotiationStepsComponent', () => {
    let component: NegotiationStepsComponent;
    let fixture: ComponentFixture<NegotiationStepsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ NegotiationStepsComponent ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NegotiationStepsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
