import { HttpClient } from '@angular/common/http';
import { Injectable, afterNextRender } from '@angular/core';
import { Router } from '@angular/router';
import { URL_SERVICIOS } from '../../../config/config';
import { isPlatformBrowser } from '@angular/common';
import { catchError, BehaviorSubject, Observable, finalize, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  token!: string;
  user!: any;

  constructor(
    public http: HttpClient,
    public router: Router,
  ) {
    this.initAuth();
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  initAuth() {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (localStorage.getItem("token")) {
        this.user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") ?? '') : null;
        this.token = localStorage.getItem("token") + "";
      }
    }
  }

  login(email: string, password: string) {

    this.isLoadingSubject.next(true);

    let URL = URL_SERVICIOS + "/auth/login_ecommerce";

    return this.http.post(URL, { email, password }).pipe(
      map((resp: any) => {
        console.log(resp);
        const result = this.saveLocalStorage(resp);
        return result;
      }),
      catchError((err: any) => {
        console.log(err);
        return of(err);
      }),

      finalize(() => this.isLoadingSubject.next(false))
    )
  }

  saveLocalStorage(resp: any) {

    if (resp && resp.access_token) {
      localStorage.setItem("token", resp.access_token);
      localStorage.setItem("user", JSON.stringify(resp.access_token));
      return true;
    }
    return false;
  }

  register(data: any) {

    this.isLoadingSubject.next(true);

    const URL = `${URL_SERVICIOS}/auth/register`;
    return this.http.post(URL, data).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err: any) => {
        // Handle error and return an observable with error message
        return of({ error: true, message: err.error.message || 'Error desconocido' });
      }),

      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  verifiedAuth(data: any) {

    this.isLoadingSubject.next(true);

    const URL = `${URL_SERVICIOS}/auth/verified_auth`;
    return this.http.post(URL, data).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  verifiedMail(data: any) {

    this.isLoadingSubject.next(true);

    const URL = `${URL_SERVICIOS}/auth/verified_email`;
    return this.http.post(URL, data).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  verifiedCode(data: any) {

    this.isLoadingSubject.next(true);

    const URL = `${URL_SERVICIOS}/auth/verified_code`;
    return this.http.post(URL, data).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  verifiedNewPassword(data: any) {

    this.isLoadingSubject.next(true);

    const URL = `${URL_SERVICIOS}/auth/new_password`;
    return this.http.post(URL, data).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.user = null;
    this.token = '';

    setTimeout(() => {
      this.router.navigateByUrl("/login");
    }, 500);
  }
}
