import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable, Subscription } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-single-image-uploader',
  templateUrl: './single-image-uploader.component.html',
  styleUrls: ['./single-image-uploader.component.scss']
})
export class SingleImageUploaderComponent implements OnInit, OnDestroy {

    @Input() filePrefix = '';
    @Output() onUploadSucceed = new EventEmitter<String>();

    uploadTask: AngularFireUploadTask;
    snapshot: Observable<any>;

    subscriptions: Subscription[] = [];
    displayImage = '';

    constructor(
        private storage: AngularFireStorage,
    ) { }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }

    onDrop(fileList: FileList) {
        const path = `${this.filePrefix}/${Date.now()}`;

        // Reference to storage bucket
        const ref = this.storage.ref(path);

        // The main task
        this.uploadTask = this.storage.upload(path, fileList[0]);

        this.uploadTask.percentageChanges();

        this.snapshot = this.uploadTask.snapshotChanges().pipe(
            tap(console.log),
            // The file's download URL
            finalize(async () => {
                const downloadURL = await ref.getDownloadURL().toPromise();
                this.displayImage = downloadURL;
                this.onUploadSucceed.emit(downloadURL);
            })
        );
    }

    removeImage() {
        this.displayImage = '';
        this.onUploadSucceed.emit('');
    }
}
