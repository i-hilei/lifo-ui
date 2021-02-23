import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignPerformanceCounterComponent } from './campaign-performance-counter.component';

describe('CampaignPerformanceCounterComponent', () => {
  let component: CampaignPerformanceCounterComponent;
  let fixture: ComponentFixture<CampaignPerformanceCounterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignPerformanceCounterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignPerformanceCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
