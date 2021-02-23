import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent implements OnInit {

  @Output() private childOuter = new EventEmitter();
    isVisible = false;
    isConfirmLoading = false;
    names = '';
    platform = 'instagram';
    title = 'Add Category';

    constructor() {}
    ngOnInit() {}

    showModal(): void {
        this.names = '';
        this.isVisible = true;
    }

    handleOk(): void {
        this.childOuter.emit(this.names);
        this.isVisible = false;
    }

    handleCancel(): void {
        this.isVisible = false;
    }

}
