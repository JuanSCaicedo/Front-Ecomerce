import { Component } from '@angular/core';
import { HomeService } from './service/home.service';
import { ToastrService } from 'ngx-toastr';
import { SliderComponent } from './slider/slider.component';
import { CategoriesComponent } from './categories/categories.component';
import { TrendingProductsComponent } from './trending-products/trending-products.component';
import { SliderSecundarioComponent } from './slider-secundario/slider-secundario.component';
import { ElectronicProductsComponent } from './electronic-products/electronic-products.component';
import { CaruselProductsComponent } from './carusel-products/carusel-products.component';
import { SliderProductsComponent } from './slider-products/slider-products.component';
import { LastProductsComponent } from './last-products/last-products.component';
import { DiscountFlashComponent } from './discount-flash/discount-flash.component';
import { ModalProductoComponent } from './modal-producto/modal-producto.component';

declare function CARUSEL_PRODUCTS([]): any;
declare function SLIDER_PRINCIPAL([]): any;
declare function CAMPAING_FLASH([]): any;
declare var $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SliderComponent,
    CategoriesComponent,
    TrendingProductsComponent,
    SliderSecundarioComponent,
    ElectronicProductsComponent,
    CaruselProductsComponent,
    SliderProductsComponent,
    LastProductsComponent,
    DiscountFlashComponent,
    ModalProductoComponent],

  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  product_selected: any = null;
  SLIDERS: any = [];
  CATEGORIES_RANDOMS: any = [];
  TRENDING_PRODUCT_NEW: any = [];
  TRENDING_PRODUCT_FEATURED: any = [];
  TRENDING_PRODUCT_TOP_SELLER: any = [];
  SLIDERS_SECUNDARIOS: any = [];
  DISCOUNT_FLASH: any;
  DISCOUNT_FLASH_PRODUCTS: any = [];
  SLIDERS_PRODUCTS: any = [];
  ELECTRONIC_PRODUCTS: any = [];
  PRODUCTS_CARUSEL: any = [];
  LAST_PRODUCT_DISCOUNTS: any = [];
  LAST_PRODUCT_FEATURED: any = [];
  LAST_PRODUCT_SELLING: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    this.homeService.home().subscribe((resp: any) => {
      console.log(resp);
      this.SLIDERS = resp.sliders_principal;
      this.CATEGORIES_RANDOMS = resp.categories_randoms;
      this.TRENDING_PRODUCT_NEW = resp.product_trending_new.data;
      this.TRENDING_PRODUCT_FEATURED = resp.product_trending_featured.data;
      this.TRENDING_PRODUCT_TOP_SELLER = resp.product_trending_top_sellers.data;
      this.SLIDERS_SECUNDARIOS = resp.sliders_secundario;
      this.DISCOUNT_FLASH = resp.discount_flash;
      this.DISCOUNT_FLASH_PRODUCTS = resp.discount_flash_products;
      this.SLIDERS_PRODUCTS = resp.sliders_products;
      this.ELECTRONIC_PRODUCTS = resp.product_electronics.data;
      this.PRODUCTS_CARUSEL = resp.product_carusel.data;
      this.LAST_PRODUCT_DISCOUNTS = resp.product_last_discounts.data;
      this.LAST_PRODUCT_FEATURED = resp.product_last_featured.data;
      this.LAST_PRODUCT_SELLING = resp.product_last_selling.data;

      if (typeof $ !== 'undefined') {
        setTimeout(() => {
          CARUSEL_PRODUCTS($);
          SLIDER_PRINCIPAL($);
          CAMPAING_FLASH($);
        }, 50);
      }

    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
  }

  handleProductSelect(product: any) {
    this.product_selected = product;
  }
}