/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LookalikesComponent } from './lookalikes.component';

describe('LookalikesComponent', () => {
  let component: LookalikesComponent;
  let fixture: ComponentFixture<LookalikesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LookalikesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LookalikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
