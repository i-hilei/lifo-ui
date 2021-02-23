import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedViewComponent } from './completed-view.component';

describe('CompletedViewComponent', () => {
  let component: CompletedViewComponent;
  let fixture: ComponentFixture<CompletedViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompletedViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
