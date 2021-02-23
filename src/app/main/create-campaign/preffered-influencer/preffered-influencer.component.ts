import { Component, OnInit } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-preffered-influencer',
    templateUrl: './preffered-influencer.component.html',
    styleUrls: ['./preffered-influencer.component.scss'],
})
export class PrefferedInfluencerComponent implements OnInit {
    subscriptions: Subscription[] = [];
    genderOptions = ['All', 'MALE', 'FEMALE'];
    ageOptions = ['All', '18-24', '25-34', '35-44', '45-64', '65-'];
    followerOptions = [1000, 5000, 10000, 20000];
    influencerCount = 100000;
    languageOptions = [];
    selectAudienceAge = ['All'];
    selectAudienceInterest = 'All';
    selectAudienceLanguage = 'All';
    selectAudienceFollower: number = 10000;
    regionalRadio = 'all';
    influencerRadio = 'all';
    regionalSelectValue = [];
    influencerSelectValue = [];
    influencerLocationOptions = [];
    defaultLocationOptions = [];
    selectInfluencerLocation = [];
    isShowDownIcon = true;
    regionalContent = [
        {name: 'AL', value: 'Alabama'},
        {name: 'AK', value: 'Alaska'},
        {name: 'CA', value: 'California'},
        {name: 'KS', value: 'Kansas'},
        {name: 'MI', value: 'Michigan'},
        {name: 'ND', value: 'North Dakota'},
        {name: 'MS', value: 'Mississippi'},
        {name: 'MT', value: 'Montana'},
        {name: 'NV', value: 'Nevada'},
        {name: 'NJ', value: 'New Jersey'},
    ];

    userImagesList = [
        {src: 'Ellipse-0.png'},
        {src: 'Ellipse-1.png'},
        {src: 'Ellipse-2.png'},
        {src: 'Ellipse-3.png'},
        {src: 'Ellipse-4.png'},
        {src: 'Ellipse-5.png'},
        {src: 'Ellipse-6.png'},
        {src: 'Ellipse-7.png'},
        {src: 'Ellipse-8.png'},
        {src: 'Ellipse-9.png'},
        {src: 'Ellipse-10.png'},
        {src: 'Ellipse-11.png'},
        {src: 'Ellipse-12.png'},
        {src: 'Ellipse-13.png'},
        {src: 'Ellipse-14.png'},
        {src: 'Ellipse-15.png'},
        {src: 'Ellipse-16.png'},
        {src: 'Ellipse-17.png'},
        {src: 'Ellipse-18.png'},
        {src: 'Ellipse-19.png'},
        {src: 'Ellipse-20.png'},
        {src: 'Ellipse-21.png'},
        {src: 'Ellipse-22.png'},
        {src: 'Ellipse-23.png'},
        {src: 'Ellipse-24.png'},
        {src: 'Ellipse-25.png'},
        {src: 'Ellipse-26.png'},
        {src: 'Ellipse-27.png'},
        {src: 'Ellipse-28.png'},
        {src: 'Ellipse-29.png'},
        {src: 'Ellipse-30.png'},
        {src: 'Ellipse-31.png'},
        {src: 'Ellipse-32.png'},
        {src: 'Ellipse-33.png'},
        {src: 'Ellipse-34.png'},
        {src: 'Ellipse-35.png'},
    ];

    userRandomImage = [];

    influencerContent = [
        {value: 'Beauty&Skin'},
        {value: 'Health&Wellness'},
        {value: 'Sport/Gym'},
        {value: 'Fashion'},
        {value: 'Food'},
        {value: 'Retail/Shopping'},
        {value: 'Art'},
        {value: 'Pets&Animals'},
    ];

    constructor(
      private internalService: InternalService,
    ) { }

    ngOnInit() {
        this.userRandomImage = [];
        for (let i = 0; i < 6; i++) {
            const ran = Math.floor(Math.random() * (this.userImagesList.length - i));
            if (this.userRandomImage.includes(this.userImagesList[ran])) {
                continue;
            }
            this.userRandomImage.push(this.userImagesList[ran]);
            this.userImagesList[ran] = this.userImagesList[this.userImagesList.length - i - 1];
        };
        this.getlanguageOptions();
    }

    getlanguageOptions() {
        this.subscriptions.push(
            this.internalService.getInfluencerSearchOptions('languages').subscribe((language) => {
                this.languageOptions = [{code: 'All', name: 'All'}, ...language.languages];
            })
        );
    }

    updataInfluencerLocationOptions(term) {
        this.influencerLocationOptions = [];
        if (term !== '') {
            this.subscriptions.push(
                this.internalService.getInfluencerSearchlocations(term).subscribe((result) => {
                    for (const i of result) {
                        this.influencerLocationOptions.push({name: i});
                    }
                })
            );
        } else {
            this.influencerLocationOptions = JSON.parse(JSON.stringify(this.defaultLocationOptions));
        }

    }

    log(types, value: string[]): void {
        if ( types === 'regional') {
          this.regionalSelectValue = value;
          // console.log(value, 'regional');
        } else {
          this.influencerSelectValue = value;
          // console.log(value, 'influencer');
        }
    }

    regionalChange(item) {
        if (item === 'regional') {
            if (this.regionalRadio === 'all') {
                this.regionalSelectValue = [];
            }
        } else {
            if (this.influencerRadio === 'all') {
                this.influencerSelectValue = [];
            }
        }
    }

    clearItem(item) {
        if (item === 'regional') {
            this.regionalSelectValue = [];
        } else {
            this.influencerSelectValue = [];
            this.influencerContent.forEach(interest => {
                interest['checked'] = false;
            });
        }
    }

}
