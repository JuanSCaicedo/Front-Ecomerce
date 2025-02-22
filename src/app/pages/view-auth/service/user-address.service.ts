import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root'
})
export class UserAddressService {

  token: any;

  constructor(
    public authService: AuthService,
    private http: HttpClient,
  ) {
    this.authService.tokenSubject.subscribe((token) => {
      this.token = token; // Actualiza el token del servicio
    });
  }

  listAddress() {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/user_address";
    return this.http.get(URL, { headers: headers });
  }

  registerAddress(data: any) {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/user_address";
    return this.http.post(URL, data, { headers: headers });
  }

  updateAddress(address_id: string, data: any) {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/user_address/" + address_id;
    return this.http.put(URL, data, { headers: headers });
  }

  deleteAddress(address_id: string) {
    let headers = new HttpHeaders({
      "Authorization": `Bearer ${this.token}` // Usa el token actualizado
    });
    let URL = URL_SERVICIOS + "/ecommerce/user_address/" + address_id;
    return this.http.delete(URL, { headers: headers });
  }
}
