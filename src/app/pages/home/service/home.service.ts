import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/service/auth.service';
import { URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  home() {
    let URL = URL_SERVICIOS + "/ecommerce/home";
    return this.http.get(URL);
  }

  homeView() {
    let URL = URL_SERVICIOS + "/ecommerce/homeView";
    return this.http.get(URL);
  }

  menu() {
    let URL = URL_SERVICIOS + "/ecommerce/menu";
    return this.http.get(URL);
  }

  showProduct(slug: string, code_discount: string) {
    let URL = URL_SERVICIOS + "/ecommerce/product/" + slug + "?campaing_discount=" + code_discount;
    return this.http.get(URL);
  }
}
