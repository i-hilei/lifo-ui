import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()

export class TokenInterceptor implements HttpInterceptor {

    constructor(
        private auth: AngularFireAuth
    ) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.auth.idToken.pipe(
            mergeMap((token: any) => {
                const newHeader = request.headers.set('Authorization', `${token}`);

                // if (request.url.indexOf('file') >= 0) {
                //     newHeader.set('Content-Type', 'multipart/form-data');
                //     cloneObj['method'] = 'POST';
                // }
                if (token) {
                    request = request.clone(
                        {
                            headers: newHeader,
                        }
                    );
                }

                return next.handle(request);

            }));
    }
}
