import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignInfluencerComponent } from './campaign-influencer.component';

describe('CampaignInfluencerComponent', () => {
  let component: CampaignInfluencerComponent;
  let fixture: ComponentFixture<CampaignInfluencerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignInfluencerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignInfluencerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
