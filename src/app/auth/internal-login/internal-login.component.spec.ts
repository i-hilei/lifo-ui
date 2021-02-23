import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalLoginComponent } from './internal-login.component';

describe('InternalLoginComponent', () => {
  let component: InternalLoginComponent;
  let fixture: ComponentFixture<InternalLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternalLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
