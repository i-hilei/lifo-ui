import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractReviewComponent } from './contract-review.component';

describe('ContractReviewComponent', () => {
  let component: ContractReviewComponent;
  let fixture: ComponentFixture<ContractReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
