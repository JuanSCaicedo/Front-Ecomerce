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
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable(); // Observable que otros componentes pueden suscribirse

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
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        this.user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") ?? '') : null;
        this.token = storedToken;
        this.tokenSubject.next(storedToken); // Notificar el token
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
        this.userSubject.next(resp.user); // Actualiza el usuario en el servicio
        localStorage.setItem('user', JSON.stringify(resp.user)); // Guarda en localStorage si es necesario
        return result;
      }),
      catchError((err: any) => {
        if (err.status != 503) {
          console.log(err);
        }
        return of(err);
      }),

      finalize(() => this.isLoadingSubject.next(false))
    )
  }

  getUser() {
    return this.userSubject.value; // Devuelve el usuario actual
  }

  saveLocalStorage(resp: any) {

    if (resp && resp.access_token) {
      localStorage.setItem("token", resp.access_token);
      localStorage.setItem("user", JSON.stringify(resp.user));
      this.tokenSubject.next(resp.access_token); // Notifica cambios
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
    // Obtener el token del almacenamiento local
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No se encontró el token'); // Para debug
      return; // Si no hay token, no hacer nada
    } else {
      // URL de la API de logout
      const api = URL_SERVICIOS + "/auth/logout";

      // Crear los encabezados para la solicitud HTTP
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      // Realizar la solicitud POST para hacer logout
      this.isLoadingSubject.next(true); // Activar estado de carga

      this.http.post(api, {}, { headers: headers }).subscribe({
        next: () => {
          this.isLoadingSubject.next(false); // Desactivar estado de carga
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          this.tokenSubject.next(null);
          this.userSubject.next(null); // Importante para actualizar el header
          this.user = null;
          this.token = '';

          setTimeout(() => {
            this.router.navigateByUrl("/login");
          }, 500);
        },
      });
    }
  }

  sessionExpired() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.userSubject.next(null); // Importante para actualizar el header
    this.user = null;
    this.token = '';

    setTimeout(() => {
      this.toastr.warning('Por favor, inicia sesión de nuevo', 'Sesión expirada');
    }, 50);
  }
}
