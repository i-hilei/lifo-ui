import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, mergeMap, take } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '@src/environments/environment';

interface IRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    data?: object;
}

@Injectable({
    providedIn: 'root',
})
export class RequestService {
    constructor(private http: HttpClient, private auth: AngularFireAuth) {}

    sendRequest$<T>(requestOptions: IRequestOptions, host: string): Observable<T> {
        return this.auth.idToken.pipe(
            mergeMap((token) => {
                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                    }),
                };

                const url = `${host ?? environment.campaignService}${requestOptions.url}`;

                switch (requestOptions.method) {
                    case 'GET':
                        return this.http.get<T>(url, httpOptions);
                    case 'DELETE':
                        return this.http.delete<T>(url, httpOptions);
                    case 'POST':
                        return this.http.post<T>(url, requestOptions.data, httpOptions);
                    case 'PUT':
                        return this.http.put<T>(url, requestOptions.data, httpOptions);
                }
            }),
            catchError((error) => this.handleError(error))
        );
    }

    sendRequest<T>(requestOptions: IRequestOptions, host?: string): Promise<T> {
        return this.sendRequest$<T>(requestOptions, host).pipe(take(1)).toPromise();
    }

    private handleError(error: HttpErrorResponse) {
        let error_message = '';
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            error_message = `An error occurred:', ${error.error.message}`;
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            error_message = `Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`;
        }
        // return an observable with a user-facing error message
        return throwError(error_message);
    }
}
