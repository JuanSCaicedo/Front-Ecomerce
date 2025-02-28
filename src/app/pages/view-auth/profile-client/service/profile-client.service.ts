import { Injectable } from '@angular/core';
import { AuthService } from '../../../auth/service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../../config/config';

@Injectable({
  providedIn: 'root'
})
export class ProfileClientService {

  token: any;

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

  updateProfile(data: any) {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/profile_client";
    return this.http.put(URL, data, { headers: headers });
  }

  showUsers() {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/profile_client/me";
    return this.http.get(URL, { headers: headers });
  }

  showOrders() {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/profile_client/orders";
    return this.http.get(URL, { headers: headers });
  }
}
