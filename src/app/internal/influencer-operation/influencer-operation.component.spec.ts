import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfluencerOperationComponent } from './influencer-operation.component';

describe('InfluencerOperationComponent', () => {
  let component: InfluencerOperationComponent;
  let fixture: ComponentFixture<InfluencerOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfluencerOperationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfluencerOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
