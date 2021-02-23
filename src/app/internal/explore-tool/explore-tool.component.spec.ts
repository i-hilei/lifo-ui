import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreToolComponent } from './explore-tool.component';

describe('ExploreToolComponent', () => {
  let component: ExploreToolComponent;
  let fixture: ComponentFixture<ExploreToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
