import { Component, OnInit } from '@angular/core';
import { InternalService } from '@src/app/services/internal.service';
import { AlertType, NotificationService } from '@src/app/services/notification.service';

@Component({
    selector: 'app-transaction-history',
    templateUrl: './transaction-history.component.html',
    styleUrls: ['./transaction-history.component.scss'],
})
export class TransactionHistoryComponent implements OnInit {
    payoutTransactions = [];
    campaignTransactions = [];

    listOfStatus = [
        { text: 'PENDING', value: 'PENDING' },
        { text: 'DONE', value: 'DONE' },
    ];

    shouldShowConvertCredit = false;
    shouldShowPayout = false;
    activeTransaction;

    constructor(
        private internalService: InternalService,
        private notification: NotificationService,
    ) { }

    ngOnInit(): void {
        this.internalService.getAllTransactionHistory('CASH_OUT', '2020-12-31').then(result => {
            console.log(result);
            this.payoutTransactions = result.sort((a, b) => b.transaction_time.localeCompare(a.transaction_time));
        });
        this.internalService.getAllTransactionHistory('CAMPAIGN_PAY', '2020-12-31').then(result => {
            console.log(result);
            this.campaignTransactions = result.sort((a, b) => b.transaction_time.localeCompare(a.transaction_time));
        });
    }

    convertCredit() {
        const transaction = this.activeTransaction;
        this.internalService.convertCredit(transaction.influencer_id, transaction.id).then(result => {
            console.log(result);
            transaction.status = 'DONE';
            this.shouldShowConvertCredit = false;
        });
    }

    payout() {
        const transaction = this.activeTransaction;
        this.internalService.clearCashout(transaction.influencer_id, transaction.id, transaction.amount).then(result => {
            console.log(result);
            transaction.status = 'DONE';
            this.shouldShowPayout = false;
        }).catch(error => {
            this.notification.addMessage({
                type: AlertType.Error,
                title: 'Error',
                message: error,
                duration: 3000,
            });
            this.shouldShowPayout = false;
        });
    }

    cancelConvertCredit() {
        this.shouldShowConvertCredit = false;
    }

    showConvertCredit(transaction) {
        this.shouldShowConvertCredit = true;
        this.activeTransaction = transaction;
    }

    cancelPayout() {
        this.shouldShowPayout = false;
    }

    showPayout(transaction) {
        this.activeTransaction = transaction;
        this.shouldShowPayout = true;
    }

    sortByTime = (a, b) => a.transaction_time.localeCompare(b.transaction_time);
    filterByStatus = (list, inf) => list.some(status => inf.status === status);

}
