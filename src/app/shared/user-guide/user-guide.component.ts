import { Component, OnInit, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CampaignService } from 'src/app/services/campaign.service';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

@Component({
    selector: 'app-user-guide',
    templateUrl: './user-guide.component.html',
    styleUrls: ['./user-guide.component.scss'],
})
export class UserGuideComponent implements OnInit {
    skipMessage = false;
    isShowOld = false;
    // 轮播数据
    testSwiper: SwiperConfigInterface;
    index = 0;
    swiperList = [
        {
            imgUrl: 'assets/images/Group_01.jpg',
            step: '',
            title: this.campaignService.translates('Create a new influencer marketing campaign.'),
        },
        {
            imgUrl: 'assets/images/Group_02.jpg',
            step: this.campaignService.translates('We match the best influencers for you'),
            title: this.campaignService.translates('and order free samples for them'),
        },
        {
            imgUrl: 'assets/svg/Shipping.svg',
            step: '',
            title: this.campaignService.translates('Fulfill the orders to get content kicked off!'),
        },
        {
            imgUrl: 'assets/images/Group_04.jpg',
            step: '',
            title: this.campaignService.translates('Get high-quality social media posts, and enjoy the marketing outcome!'),
        },
    ];

    constructor(
        public dialogRef: MatDialogRef<UserGuideComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public campaignService: CampaignService,
    ) {

        if (localStorage.getItem('skipUserGuide') && localStorage.getItem('skipUserGuide') === 'true') {
            this.skipMessage = true;
        }
    }

    ngOnInit() {}

    // 轮播图初始化
    ngAfterViewInit() {
        // tslint:disable-next-line: no-unused-expression
        this.testSwiper = {
            direction: 'horizontal', // 水平切换选项
            // loop: true, // 循环模式选项
            // speed: 600, // 滑动时间
            // grabCursor: true, // 鼠标指针形状
            // autoplay: {
            //     delay: 1500,
            //     stopOnLastSlide: false,
            //     disableOnInteraction: false, // 手动滑动之后依然自动轮播
            // }, // 自动滑动
            effect : 'slide', // 切换效果
            observer: true, // 修改swiper自己或子元素时，自动初始化swiper
            observeParents: true, // 修改swiper的父元素时，自动初始化swiper
            navigation: {  // 分页器
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: { // 如果需要前进后退按钮
                el: '.swiper-pagination',
                clickable: true,
            },
            // scrollbar: { // 如果需要滚动条
            //     el: '.swiper-scrollbar',
            // },
        };
    }

    search() {
        if (this.index < 3) {
            this.index = this.index + 1;
        } else {
            this.close();
        }
    }

    close() {
        this.dialogRef.close();
    }

    clickCheckbox(checked: MatCheckboxChange) {
        localStorage.setItem('skipUserGuide', checked.checked ? 'true' : 'false');
    }

}
