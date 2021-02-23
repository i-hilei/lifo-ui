import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InternalSearchComponent } from './internal-search.component';
import { InfluencerInfoComponent } from './influencer-info/influencer-info.component';
import { AudienceInfoComponent } from './audience-info/audience-info.component';
import { InfluencerListComponent } from './influencer-list/influencer-list.component';
import { FormsModule } from '@angular/forms';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { NgSelectModule } from '@ng-select/ng-select';

import { InternalSearchService } from './internal-search.service';

@NgModule({
    declarations: [InternalSearchComponent, InfluencerInfoComponent, AudienceInfoComponent, InfluencerListComponent],
    imports: [
        CommonModule,
        NzIconModule,
        NzCheckboxModule,
        NgSelectModule,
        FormsModule,
        NzInputModule,
        NzInputNumberModule,
        NzSelectModule,
        NzButtonModule,
    ],
    providers: [InternalSearchService],
})
export class InternalSearchModule {}
