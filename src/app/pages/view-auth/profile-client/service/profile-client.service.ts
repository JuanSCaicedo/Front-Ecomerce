import { Injectable } from '@angular/core';
import { AuthService } from '../../../auth/service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../../config/config';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileClientService {

  token: any;
  private userData = new BehaviorSubject<any>(null); // Almacena la información del usuario
  public userData$ = this.userData.asObservable(); // Observable para suscribirse desde otros componentes

  constructor(
    public authService: AuthService,
    public http: HttpClient,
  ) {
    this.authService.tokenSubject.subscribe((token) => {
      this.token = token; // Actualiza el token del servicio
    });
  }

  getInforProfileClient() {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/profile_client/";
    return this.http.get(URL, { headers: headers });
  }

  updateProfile(data: any): Observable<any> {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}`
    });
    let URL = URL_SERVICIOS + "/ecommerce/profile_client";

    return this.http.post(URL, data, { headers }).pipe(
      tap(() => {
        this.refreshUserData(); // Actualiza los datos del usuario después de la actualización
      })
    );
  }

  refreshUserData(): void {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}`
    });

    let URL = URL_SERVICIOS + "/ecommerce/profile_client/me";

    this.http.get(URL, { headers }).subscribe(data => {
      this.userData.next(data); // Actualiza el BehaviorSubject con los nuevos datos
    });
  }

  showUsers(): Observable<any> {
    if (this.userData.getValue()) {
      return this.userData$; // Si ya hay datos, los devuelve sin llamar la API
    }

    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}`
    });

    let URL = URL_SERVICIOS + "/ecommerce/profile_client/me";

    return this.http.get(URL, { headers }).pipe(
      tap(data => this.userData.next(data)) // Guarda los datos obtenidos
    );
  }

  showOrders(page: number = 1) {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = `${URL_SERVICIOS}/ecommerce/profile_client/orders?page=${page}`;
    return this.http.get(URL, { headers: headers });
  }

  registerReview(data: any) {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/reviews";
    return this.http.post(URL, data, { headers: headers });
  }

  updateReview(review_id: string, data: any) {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/reviews/" + review_id;
    return this.http.put(URL, data, { headers: headers });
  }
}
