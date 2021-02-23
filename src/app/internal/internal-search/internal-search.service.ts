import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { InfluencerFromApi, Influencer, Location, Language, Interest } from './models/index';
import { InternalService } from '@services/internal.service';

@Injectable()
export class InternalSearchService {
    locations: Location[] = [];
    languages: Language[] = [];
    interests: Interest[] = [];

    subscriptions: Subscription[] = [];

    constructor(private $http: HttpClient, private internalService: InternalService, public auth: AngularFireAuth) {
        this.subscriptions.push(
            this.internalService
                .getInfluencerSearchOptions('locations')
                .subscribe((location: { error: boolean; locations: Location[]; count: number }) => {
                    this.locations = location.locations;
                })
        );

        this.subscriptions.push(
            this.internalService
                .getInfluencerSearchOptions('interests')
                .subscribe((interest: { error: boolean; interests: Interest[]; count: number }) => {
                    console.log(interest);
                    this.interests = interest.interests;
                })
        );

        this.subscriptions.push(
            this.internalService
                .getInfluencerSearchOptions('languages')
                .subscribe((language: { error: boolean; languages: Language[]; count: number }) => {
                    console.log(language);
                    this.languages = language.languages;
                })
        );
    }

    getInfluencerList() {
        return new Promise<InfluencerFromApi[]>(async (resolve, reject) => {
            const token = await (await this.auth.currentUser).getIdToken();

            const httpOptions = {
                headers: new HttpHeaders({
                    Authorization: token,
                    'Content-Type': 'application/json',
                }),
            };
            const body = {
                prefix_filters: [
                    {
                        prefix: 'languages',
                        value: 'Chinese',
                        min: 0,
                        max: 0.1,
                    },
                ],
            };
            const reqeustUrl = 'https://discover.lifo.ai/am/modash/match';
            // return this.$http.post(reqeustUrl, body, httpOptions).subscribe((data: any | HttpErrorResponse) => {
            //     console.log(data);
            //     if (data instanceof HttpErrorResponse) {
            //         resolve();
            //     } else {
            //         resolve(data);
            //     }
            // });

            const fakeData: Influencer[] = new Array(223)
                .fill({
                    name: 'influencer',
                    follower: 'adfa',
                    fake_followers: 'adfa',
                    engagement: 'adfa',
                    avg_comment: 'adfa',
                    spp: 'adfa',
                    gender: 'adfa',
                    age: 'adfa',
                    location: 'adfa',
                    language: 'adfa',
                })
                .map((item, i) => {
                    return {
                        ...item,
                        age: String(i),
                        name: `${item.name} ${i}`,
                    };
                });
            setTimeout(() => {
                resolve(fakeData);
            }, 1000);
        });
    }

    translateData(list: InfluencerFromApi[]) {
        return list.map((item, i) => {
            return {
                ...item,
                selected: false,
            };
        });
    }
}
