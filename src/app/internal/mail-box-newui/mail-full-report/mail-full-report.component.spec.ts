/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MailFullReportComponent } from './mail-full-report.component';

describe('MailFullReportComponent', () => {
  let component: MailFullReportComponent;
  let fixture: ComponentFixture<MailFullReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailFullReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailFullReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
