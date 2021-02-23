import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-performance',
  templateUrl: './add-performance.component.html',
  styleUrls: ['./add-performance.component.scss'],
})
export class AddPerformanceComponent implements OnInit {

  @Output() private childOuter = new EventEmitter();
    isVisible = false;
    isConfirmLoading = false;
    names = '';
    platform = 'instagram';
    title = 'Add Performance';

    average = '3.0';
    responsivenesSelect = '3';
    timelinesSelect = '3';
    demandSelect = '3';
    engagementSelect = '3';
    qualitySelect = '3';
    responsivenesArr = ['1', '2', '3', '4', '5'];
    timelinesArr = ['1', '2', '3', '4', '5'];
    demandArr = ['1', '2', '3', '4', '5'];
    engagementArr = ['1', '2', '3', '4', '5'];
    qualityArr = ['1', '2', '3', '4', '5'];

    constructor() {}
    ngOnInit() {}

    showModal(): void {
        this.average = '3.0';
        this.responsivenesSelect = '3';
        this.timelinesSelect = '3';
        this.demandSelect = '3';
        this.engagementSelect = '3';
        this.qualitySelect = '3';
        this.isVisible = true;
    }

    averageFun() {
      const avg = Number(this.responsivenesSelect) + Number(this.timelinesSelect) + Number(this.demandSelect) +
      Number(this.engagementSelect) + Number(this.qualitySelect);
      this.average = (Number(avg) / 5).toFixed(1);
    }

    handleOk(): void {
        this.childOuter.emit({
          email_rest: Number(this.responsivenesSelect),
          instruction_timelines: Number(this.timelinesSelect),
          commission_demand: Number(this.demandSelect),
          content_eng: Number(this.engagementSelect),
          instruction_quality: Number(this.qualitySelect),
        });
        this.isVisible = false;
    }

    handleCancel(): void {
        this.isVisible = false;
    }

}
