import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cart = new BehaviorSubject<Array<any>>([]);
  public currentDataCart$ = this.cart.asObservable();

  constructor(
    public authService: AuthService,
    public http: HttpClient,
  ) { }

  changeCart(DATA: any) {
    let listCart = this.cart.getValue();

    let INDEX = listCart.findIndex((item: any) => item.id === DATA.id);

    if (INDEX != -1) {
      listCart[INDEX] = DATA;
    } else {
      listCart.unshift(DATA);
    }

    this.cart.next(listCart);
  }

  resetCart() {
    let listCart: any = [];
    this.cart.next(listCart);
  }

  removeCart(DATA: any) {
    let listCart = this.cart.getValue();

    let INDEX = listCart.findIndex((item: any) => item.id === DATA.id);

    if (INDEX != -1) {
      listCart.slice(INDEX, 1);
    }

    this.cart.next(listCart);
  }

  listCart() {
    let headers = new HttpHeaders({ "Authorization": 'Bearer' + this.authService.token });
    let URL = URL_SERVICIOS + "/ecommerce/cart";
    return this.http.get(URL, { headers: headers });
  }

  registerCart(data: any) {
    let headers = new HttpHeaders({ "Authorization": 'Bearer' + this.authService.token });
    let URL = URL_SERVICIOS + "/ecommerce/cart";
    return this.http.post(URL, data, { headers: headers });
  }

  updateCart(cart_id: string, data: any) {
    let headers = new HttpHeaders({ "Authorization": 'Bearer' + this.authService.token });
    let URL = URL_SERVICIOS + "/ecommerce/cart" + cart_id;
    return this.http.put(URL, data, { headers: headers });
  }

  deleteCart(cart_id: string) {
    let headers = new HttpHeaders({ "Authorization": 'Bearer' + this.authService.token });
    let URL = URL_SERVICIOS + "/ecommerce/cart" + cart_id;
    return this.http.delete(URL, { headers: headers });
  }
}
