import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { URL_SERVICIOS } from '../../../config/config';
import { catchError, BehaviorSubject, Observable, finalize, map, of, tap, throwError } from 'rxjs';
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
      return of(null);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http.post(this.apiUrl, {}, { headers }).pipe(
      catchError((err) => {
        if (err) {
          if (err.status === 429) {
            this.toastr.warning('Por favor espera un momento', 'Demasiadas solicitudes');
            return of({ tooManyRequests: true });
          }

          if (err.status === 401) {
            return of(null);
          }
        }
        return of(true);
      })
    );

  }

  validarToken(token: any): Observable<any> {
    return this.me().pipe(
      tap((response: any) => {
        if (response?.tooManyRequests) {
          // Si es demasiadas solicitudes, no haces nada, pero retornamos un observable vacío
          return; // O simplemente, podrías retornar un observable vacío aquí
        }

        // Si no hay respuesta válida y hay token, cerramos sesión
        if (response === null && token) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          this.tokenSubject.next(null);
          this.toastr.warning('Por favor, inicia sesión de nuevo', 'Sesión expirada');
        }
      }, (error) => {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }),
    );
  }
}
