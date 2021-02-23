import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleEmailComponent } from './single-email.component';

describe('SingleEmailComponent', () => {
  let component: SingleEmailComponent;
  let fixture: ComponentFixture<SingleEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
