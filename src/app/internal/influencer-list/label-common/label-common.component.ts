import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CampaignService } from '@services/campaign.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-label-common',
  templateUrl: './label-common.component.html',
  styleUrls: ['./label-common.component.scss'],
})
export class LabelCommonComponent implements OnInit {
  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef;
  @Input() labelType;
  constructor(
    public campaignService: CampaignService
  ) { }

  leftSelected = false;
  subscriptions: Subscription[] = [];
  leftSelectedValue = '';
  rightSelectValue = [];
  leftSelectValue = [];
  popVisible: boolean = false;
  collectSubList = [];
  inputCategoryInputVisible = false;
  inputCategoryValue = '';

  influencerContent = [];


  ngOnInit() {}

  isShowDefault() {
    this.influencerContent = this.calChildren(this.labelType);
  }

  isMode(arr) {
    const res = arr.some(item => {
      return item.checked === true;
    });
    return res;
  }

  onTagClose(title, left, right) {
    if (title === 'title') {
      for (const i of this.influencerContent) {
        if (i.name === left) {
          i.checked = false;
          for (const j of i['children']) {
              j.checked = false;
          }
        }
      }
    } else {
      for (const i of this.influencerContent) {
        if (i.name === left) {
          for (const j of i['children']) {
            if (j.name === right) {
              j.checked = false;
            }
          }
        }
      }
    }
  }

  sliceTagName(tag: string): string {
    const isLongTag = tag.length > 20;
    return isLongTag ? `${tag.slice(0, 20)}...` : tag;
  }

  changeVisible(name: boolean): void {
    console.log(name);
  }

  isSelectedFun(val) {
    for (const i of this.influencerContent) {
      // i['checked'] = false;
      i['selected'] = false;
      if (i.name === val) {
        i['checked'] = true;
        i['selected'] = true;
        this.leftSelectedValue = val;
        // this.leftSelected = true;
      }
    }
  }

  showInput(visible): void {
    this[visible] = true;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
    }, 10);
  }

  log(types, arr): void {
    if ( types === 'left') {
      this.leftSelectValue = arr;
      for (const i of this.influencerContent) {
        i.checked = false;
        for (const k of this.leftSelectValue) {
          if (k === i.name ) {
            i.checked = true;
          }
        }
      }
      // console.log(arr, 'influencer');
      // console.log(this.influencerContent, 'left');
    }else {
      this.rightSelectValue = arr;
      for (const i of this.influencerContent) {
        if (i.name === this.leftSelectedValue) {
          // i.checked = false;
          for (const j of i.children) {
            j.checked = false;
            for (const k of this.rightSelectValue) {
              if (k === j.name) {
                j.checked = true;
              }
            }
          }
        }
      }
      // console.log(arr, 'right');
      // console.log(this.influencerContent, 'right');
    }
  }

  removeAllSpace(obj, newval, val, visible) {
    if (newval && this[obj].indexOf(newval) === -1) {
      // this[obj] = [...this[obj], newval];
      this.inputAddValue(newval);
    }
    this[val] = '';
    this[visible] = false;
  }

  handleInputConfirm(obj, val, visible) { // 正则匹配a-z0-9_Please enter a-z0-9_
    const noSpace = this[val].toLowerCase().replace(/\s+/g, '');
    const res = /^[a-z0-9_]+$/g;
    if (res.test(noSpace)) {
      this.removeAllSpace(obj, noSpace, val, visible);
    }
  }

  inputAddValue(val) {
    // console.log(this.influencerContent, 'input');
    for (const i of this.influencerContent) {
      if (i['selected']) {
        // i['children'].push({name: this.inputCategoryValue, checked: true,
        //   parent: i['id'], type: i['type']});
        this.subscriptions.push(
          this.campaignService.addLabelItem({name: val, parent: i['id'], type: i['type']}).subscribe((result) => {
            result['checked'] = true;
            i['children'].push(result);
            // console.log(result, 'addss');
          }, err => {})
        );
      }
    }
  }

  calChildren(arr) {
    const filtParent = arr.filter(function (x) {
      return x.parent === null;
    });
    const filtChild = arr.filter(function (x) {
      return x.parent !== null;
    });
   for (const k of filtParent) {
     k.children = [];
     for (const j of filtChild) {
        if (j.parent === k.id ) {
          k.children.push(j);
          // console.log(j,555)
         }
       }
    }
   return filtParent;
 }

  calLabelId() {
    const arrParam = [];
    // console.log(this.influencerContent, 'cal');
    for (const i of this.influencerContent) {
      if (i.checked) {
        arrParam.push(i['id']);
        for (const k of i['children']) {
          if (k['checked']) {
            arrParam.push(k['id']);
          }
        }
      }
    }
    return arrParam;
  }

}
