import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfluencerManagementComponent } from './influencer-management.component';

describe('InfluencerManagementComponent', () => {
  let component: InfluencerManagementComponent;
  let fixture: ComponentFixture<InfluencerManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfluencerManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfluencerManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
