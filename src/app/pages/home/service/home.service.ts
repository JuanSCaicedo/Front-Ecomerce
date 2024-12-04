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

  header() {
    let URL = URL_SERVICIOS + "/ecommerce/header";
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
}
