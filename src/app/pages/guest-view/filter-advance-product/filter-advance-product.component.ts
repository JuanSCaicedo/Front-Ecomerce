import { Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalProductoComponent } from '../../home/modal-producto/modal-producto.component';

@Component({
  selector: 'app-filter-advance-product',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, ModalProductoComponent],
  templateUrl: './filter-advance-product.component.html',
  styleUrl: './filter-advance-product.component.css'
})
export class FilterAdvanceProductComponent {
  categories: any = [];
  colors: any = [];
  brands: any = [];
  PRODUCTOS: any = [];
  product_relateds: any = [];
  currency: string = 'COP';

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
    public cookieService: CookieService
  ) {
    this.homeService.getConfigFilter().subscribe((resp: any) => {
      console.log(resp);
      this.categories = resp.categories;
      this.colors = resp.colors;
      this.brands = resp.brands;
      this.product_relateds = resp.product_relateds.data;
    }), (error: any) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    };

    this.homeService.filterAdvanceProduct({}).subscribe((resp: any) => {
      console.log(resp);
    }), (error: any) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    };
  }

  ngOnInit() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';
  }

  getTotalCurrency(PRODUCT: any) {
    if (this.currency == 'COP') {
      return PRODUCT.price_cop;
    } else {
      return PRODUCT.price_usd;
    }
  }
}
