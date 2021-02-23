import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionViewComponent } from './commission-view.component';

describe('CommissionViewComponent', () => {
  let component: CommissionViewComponent;
  let fixture: ComponentFixture<CommissionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
