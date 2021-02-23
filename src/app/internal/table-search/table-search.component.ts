import { Component, OnInit, Output, EventEmitter, Input} from '@angular/core';

@Component({
  selector: 'app-table-search',
  templateUrl: './table-search.component.html',
  styleUrls: ['./table-search.component.scss'],
})
export class TableSearchComponent implements OnInit {
  @Input() defaultData;
  @Input() searchData;
  @Input() isReset: string = 'show';
  @Input() title: string = 'shop_management';
  @Output() private refreshOuter = new EventEmitter();
  @Output() private searchOuter = new EventEmitter();

  constructor() { }

  searchValue = '';
  selectItem = 'product_name';
  searchItem = 'instagram';
  newData = [];
  // table头部数据
  tableHeader = [];

  ngOnInit() {
  }

  searchFun() {
    // console.log(this.selectItem);
    // console.log(this.searchValue);
    const dealData = this.searchFuc();
    this.searchOuter.emit(dealData);
  }

  refresh() {
    this.refreshOuter.emit();
  }

  searchFuc() {
    if (this.title === 'shop_management') {
      const newArr = [];
      let isOff = true;
      this.newData = JSON.parse(JSON.stringify(this.searchData));
      if (this.searchValue !== '') {
        for (const item of this.newData) {
          isOff = true;
          if (this.selectItem === 'product_name' && item['title'].includes(this.searchValue)) {
            isOff = false;
            newArr.push(item);
          }if (this.selectItem === 'vender_name' && item['vendor'].includes(this.searchValue)) {
            isOff = false;
            newArr.push(item);
          }
        }
        return newArr;
      } else {
        return this.searchData;
      }
    } else if (this.title === 'search_view') {
      return {
        option: this.searchItem,
        value: this.searchValue,
      };
    }


  }

}
