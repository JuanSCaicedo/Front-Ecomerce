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

  home(){
    let URL = URL_SERVICIOS + "/ecommerce/home";
    return this.http.get(URL);
  }

  menu() {
    let URL = URL_SERVICIOS + "/ecommerce/menu";
    return this.http.get(URL);
  }

  slider() {
    let URL = URL_SERVICIOS + "/ecommerce/slider";
    return this.http.get(URL);
  }

  slider_secundario() {
    let URL = URL_SERVICIOS + "/ecommerce/slider_secundario";
    return this.http.get(URL);
  }

  slider_products() {
    let URL = URL_SERVICIOS + "/ecommerce/slider_products";
    return this.http.get(URL);
  }

  categories() {
    let URL = URL_SERVICIOS + "/ecommerce/categories";
    return this.http.get(URL);
  }

  products() {
    let URL = URL_SERVICIOS + "/ecommerce/products";
    return this.http.get(URL);
  }

  last_products() {
    let URL = URL_SERVICIOS + "/ecommerce/last_products";
    return this.http.get(URL);
  }

  products_electronics() {
    let URL = URL_SERVICIOS + "/ecommerce/products_electronics";
    return this.http.get(URL);
  }

  products_carusel() {
    let URL = URL_SERVICIOS + "/ecommerce/products_carusel";
    return this.http.get(URL);
  }
}
