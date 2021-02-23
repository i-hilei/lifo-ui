import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartFriendReferralComponent } from './line-chart-friend-referral.component';

describe('LineChartFriendReferralComponent', () => {
  let component: LineChartFriendReferralComponent;
  let fixture: ComponentFixture<LineChartFriendReferralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartFriendReferralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartFriendReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
