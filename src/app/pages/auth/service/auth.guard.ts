import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class PermisionAuth {

  constructor(
    public authService: AuthService,
    public router: Router,
  ) { }

  canActivate(): boolean {
    if (!this.authService.tokenSubject.value) {
      this.router.navigateByUrl("/login");
      return false;
    }

    let token = this.authService.tokenSubject.value;

    let expiration = (JSON.parse(atob(token.split('.')[1]))).exp;

    if (Math.floor(Date.now() / 1000) >= expiration) {
      this.authService.sessionExpired();
      return false;
    }

    return true;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return inject(PermisionAuth).canActivate();
};
