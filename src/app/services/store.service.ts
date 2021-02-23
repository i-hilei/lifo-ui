import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UserNameService {

    private idToken = new BehaviorSubject<any>([]);

    currentReserve = this.idToken.asObservable();
  
    constructor() { }
  
    changeReserve(idToken: any[]) {
      this.idToken.next(idToken)
    }

    get currentIdToken() {
        return this.idToken.asObservable();
    }
}