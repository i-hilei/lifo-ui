import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignOperationComponent } from './campaign-operation.component';

describe('CampaignOperationComponent', () => {
  let component: CampaignOperationComponent;
  let fixture: ComponentFixture<CampaignOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignOperationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
