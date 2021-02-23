import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalBrandCampaignComponent } from './internal-brand-campaign.component';

describe('InternalBrandCampaignComponent', () => {
    let component: InternalBrandCampaignComponent;
    let fixture: ComponentFixture<InternalBrandCampaignComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InternalBrandCampaignComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InternalBrandCampaignComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
