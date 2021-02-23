import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfluencerDiscoveryListComponent } from './influencer-discovery-list.component';

describe('InfluencerDiscoveryListComponent', () => {
  let component: InfluencerDiscoveryListComponent;
  let fixture: ComponentFixture<InfluencerDiscoveryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfluencerDiscoveryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfluencerDiscoveryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
