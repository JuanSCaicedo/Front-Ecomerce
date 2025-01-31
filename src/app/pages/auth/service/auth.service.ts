import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { URL_SERVICIOS } from '../../../config/config';
import { catchError, BehaviorSubject, Observable, finalize, map, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public tokenSubject = new BehaviorSubject<string | null>(null);

  get token_t() {
    return this.tokenSubject.value;
  }

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  token!: string;
  user!: any;
  private readonly apiUrl = URL_SERVICIOS + "/auth/me";

  constructor(
    public http: HttpClient,
    public router: Router,
    private toastr: ToastrService,
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
      localStorage.setItem("user", JSON.stringify(resp.user));
      this.tokenSubject.next(resp.token); // Notifica cambios
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

  me(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null); // Devolver un Observable vacío
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http.post(this.apiUrl, {}, { headers }).pipe(
      catchError((err) => {
        return of(null); // Retornar un Observable con valor `null` en caso de error
      })
    );
  }

  validarToken(token: any): Observable<any> {
    return this.me().pipe(
      tap((response: any) => {
        if (!response) {
          if (token) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            this.toastr.warning('Sesión expirada', 'Por favor, inicia sesión de nuevo');
          }
        }
      }),
      catchError((err) => {
        console.error('Error al validar el token:', err);
        return of(null);
      })
    );
  }

}
