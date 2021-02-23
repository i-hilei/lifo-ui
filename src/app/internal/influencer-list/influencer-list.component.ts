import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

// Component
import { CreateNewListDialogComponent } from '@internal/campaign-outreach/create-new-list-dialog/create-new-list-dialog.component';

// Service
import { CampaignService } from '@services/campaign.service';
import { InternalService } from '@services/internal.service';
import { AlertType, NotificationService } from '@services/notification.service';

// Others
import { environment } from '@src/environments/environment';

@Component({
    selector: 'app-influencer-list',
    templateUrl: './influencer-list.component.html',
    styleUrls: ['./influencer-list.component.scss'],
})
export class InfluencerListComponent implements OnInit {
    copyList = [];
    influencerList = [];
    labelTagList = [];
    attributesArr = [];
    platformArr = [];
    contentArr = [];
    subscriptions: Subscription[] = [];
    expandSet = new Set<number>();

    nameSort = (a, b) => {
        return String(a.name).localeCompare(String(b.name));
    };

    renameDialogVisible: boolean = false;
    deleteDialogVisible: boolean = false;

    selectedList;
    newName: string;

    @ViewChild('newList') newList: CreateNewListDialogComponent;
    @ViewChild('listLabel') listLabel;

    constructor(
        private notificationService: NotificationService,
        public campaignService: CampaignService,
        public internalService: InternalService,
        public router: Router
    ) {}

    ngOnInit() {
        this.loadInfluencerList();
    }

    showDialog(listItem, type: 'rename' | 'delete') {
        this.selectedList = listItem;
        if (type === 'rename') {
            this.newName = listItem.name;
            this.renameDialogVisible = true;
        }
        if (type === 'delete') {
            this.deleteDialogVisible = true;
        }
    }

    onExpandChange(id: number, checked: boolean): void {
        if (checked) {
          this.expandSet.add(id);
          this.getLabelList(id);
        } else {
          for (const i of this.influencerList) {
            if (i.id === id) {
                i['label_list'] = [];
            }
        }
          this.expandSet.delete(id);
        }
      }

    getData(msg) {
        this.onExpandChange(msg, true);
    }

    renameList() {
        if (!this.selectedList.id || !this.newName.trim()) {
            return;
        }
        this.campaignService
            .renameInfluencerList(this.selectedList.id, this.newName)
            .then(() => {
                this.selectedList.name = this.newName;
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Success',
                    message: 'Rename list success',
                    duration: 3000,
                });
            })
            .catch(() => {
                this.notificationService.addMessage({
                    type: AlertType.Error,
                    title: 'Error',
                    message: 'Rename list failed, please try agian later',
                    duration: 3000,
                });
            })
            .finally(() => (this.selectedList = null));

        this.renameDialogVisible = false;
    }

    deleteList() {
        this.campaignService
            .deleteInfluencerList(this.selectedList.id)
            .then(() => {
                this.influencerList = this.influencerList.filter((item) => item !== this.selectedList);
                this.notificationService.addMessage({
                    type: AlertType.Success,
                    title: 'Success',
                    message: 'Delete list success',
                    duration: 3000,
                });
            })
            .catch((err) => {
                this.notificationService.addMessage({
                    type: AlertType.Error,
                    message: 'Delete list failed, please try agian later',
                    duration: 3000,
                });
            })
            .finally(() => (this.selectedList = null));

        this.deleteDialogVisible = false;
    }

    isShowList(value, arr) {
        this.copyList = arr;
        this.newList.names = '';
        if (value === 'create') {
            this.newList.title = 'create';
        } else {
            this.newList.title = 'copy';
        }
        this.newList.isVisible = true;
    }

    isShowListLabel(ids) {
        console.log(ids);
        this.listLabel.listId = ids;
        this.listLabel.showModal();
    }

    loadInfluencerList() {
        this.campaignService.getInfluencerList().subscribe((result) => {
            this.influencerList = result;
            for (const i of this.influencerList) {
                i['label_list'] = [];
            }
            if (!environment.production) {
                console.log(this.influencerList);
            }
        });
    }

    getLabelList(id) {
        this.subscriptions.push(
            this.campaignService.getLabelAllList(id).subscribe((result) => {
            //   console.log(result, 'list');
              this.labelTagList = result;
            for (const i of this.influencerList) {
                if (i.id === id) {
                    i['label_list'] = this.calChildren(result);
                }
            }
            }, err => {})
          );
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

    showSubList(key) {
        this.router.navigate([`/internal/influencer-list-detail/${key.id}`]);
    }

    addInfluencer(id) {
        this.router.navigateByUrl(`/internal/influencer-discovery/campaign/${id}`);
    }

    openInsPage(influencer) {
        window.open(influencer.profile.url, '_blank');
    }

    createList(msg) {
        this.campaignService
            .setInfluencer({
                name: msg.name,
                ins_list: msg.title === 'create' ? [] : this.copyList,
                platform: msg.platform,
            })
            .subscribe((result) => {
                this.loadInfluencerList();
                this.newList.isConfirmLoading = false;
                this.newList.isVisible = false;
            });
    }
}
