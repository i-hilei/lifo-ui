import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable()
export class AdminRoleGuard implements CanActivate {
    constructor(
        private auth: AngularFireAuth,
        private router: Router,
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ) {
        this.auth.idTokenResult.subscribe(idToken => {
            if (!idToken || !idToken.claims || !idToken.claims.email || idToken.claims.email.indexOf('lifo.ai') <= 0) {
                this.router.navigateByUrl('/app/brand-home');
                return false;
            }
        });
        return true;
    }
}

@Injectable()
export class UserRoleGuard implements CanActivate {
    constructor(
        private auth: AngularFireAuth,
        private router: Router,
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ) {
        this.auth.idTokenResult.subscribe(idToken => {
            if (idToken &&
                idToken.claims &&
                idToken.claims.email &&
                idToken.claims.email.indexOf('lifo.ai') > 0) {
                this.router.navigateByUrl('/internal/home');
                return false;
            }
        });
        return true;
    }
}
