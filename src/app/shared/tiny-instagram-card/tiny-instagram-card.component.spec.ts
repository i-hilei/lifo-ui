import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TinyInstagramCardComponent } from './tiny-instagram-card.component';

describe('TinyInstagramCardComponent', () => {
  let component: TinyInstagramCardComponent;
  let fixture: ComponentFixture<TinyInstagramCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TinyInstagramCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TinyInstagramCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
