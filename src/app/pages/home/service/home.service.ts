import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../auth/service/auth.service';
import { URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  // Almacena y comparte los datos de homeView
  private homeViewSubject = new BehaviorSubject<any>(null);
  public homeViewData$ = this.homeViewSubject.asObservable();

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) {}

  // Método original de homeView con integración de BehaviorSubject
  homeView(): Observable<any> {
    const URL = `${URL_SERVICIOS}/ecommerce/homeView`;
    return this.http.get(URL).pipe(
      tap((data: any) => {
        this.homeViewSubject.next(data); // Actualiza el BehaviorSubject con los datos obtenidos
      })
    );
  }

  // Permite obtener el valor actual de los datos (sin suscripción)
  getHomeViewData(): any {
    return this.homeViewSubject.value;
  }

  // Métodos existentes (sin cambios)
  home() {
    const URL = `${URL_SERVICIOS}/ecommerce/home`;
    return this.http.get(URL);
  }

  menu() {
    const URL = `${URL_SERVICIOS}/ecommerce/menu`;
    return this.http.get(URL);
  }

  showProduct(slug: string, code_discount: string) {
    const URL = `${URL_SERVICIOS}/ecommerce/product/${slug}?campaing_discount=${code_discount}`;
    return this.http.get(URL);
  }
}
