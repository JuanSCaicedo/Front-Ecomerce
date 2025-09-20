import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
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
  ) { }

  homeView(mode?: string): Observable<string | null> {
    // Si se envía un modo específico, lo establece
    if (mode) {
      this.homeViewSubject.next(mode);
      return of(mode);
    }

    // Si no se envía modo, establece a null
    this.homeViewSubject.next(null);
    return of(null);
  }

  getHomeViewData(): any {
    return this.homeViewSubject.value;
  }

  // Métodos existentes (sin cambios)
  home() {
    const URL = `${URL_SERVICIOS}/ecommerce/home`;
    return this.http.get(URL);
  }

  getConfigFilter() {
    const URL = `${URL_SERVICIOS}/ecommerce/config-filter-advance`;
    return this.http.get(URL);
  }

  menu() {
    const URL = `${URL_SERVICIOS}/ecommerce/menu`;
    return this.http.get(URL);
  }

  filterAdvanceProduct(data: any) {
    const URL = `${URL_SERVICIOS}/ecommerce/filter-advance-product`;
    return this.http.post(URL, data);
  }

  showProduct(slug: string, code_discount: string) {
    const URL = `${URL_SERVICIOS}/ecommerce/product/${slug}?campaing_discount=${code_discount}`;
    return this.http.get(URL);
  }
}
