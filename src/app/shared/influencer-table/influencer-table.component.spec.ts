import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfluencerTableComponent } from './influencer-table.component';

describe('InfluencerTableComponent', () => {
  let component: InfluencerTableComponent;
  let fixture: ComponentFixture<InfluencerTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfluencerTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfluencerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
