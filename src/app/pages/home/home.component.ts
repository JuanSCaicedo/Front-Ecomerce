import { Component, Inject, PLATFORM_ID } from '@angular/core';
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
import { BlogComponent } from './blog/blog.component';
import { IgImagesComponent } from './ig-images/ig-images.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { FeatureComponent } from './feature/feature.component';
import { isPlatformBrowser } from '@angular/common';

declare function CARUSEL_PRODUCTS([]): any;
declare function SLIDER_PRINCIPAL([]): any;
declare function CAMPAING_FLASH([]): any;
declare function DATA_VALUES([]): any;
declare function SLIDER_PRODUCT([]): any;
declare function SLIDER_PRODUCT_ELECTRONIC([]): any;
declare function BLOG([]): any;
declare function IGIMAGEN([]): any;
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
    ModalProductoComponent,
    BlogComponent,
    IgImagesComponent,
    SubscribeComponent,
    FeatureComponent],

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
  VIEW_READY: boolean = false;

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.dataHome();
  }

  ngOnInit() {
    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);
  }

  dataHome() {
    this.homeService.home().subscribe((resp: any) => {
      // console.log(resp);
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

      if (this.SLIDERS.length > 0
        && this.CATEGORIES_RANDOMS.length > 0
        && this.TRENDING_PRODUCT_NEW.length > 0
        && this.TRENDING_PRODUCT_FEATURED.length > 0
        && this.TRENDING_PRODUCT_TOP_SELLER.length > 0
        && this.DISCOUNT_FLASH_PRODUCTS.length > 0
        && this.ELECTRONIC_PRODUCTS.length > 0
        && this.PRODUCTS_CARUSEL.length > 0
        && this.LAST_PRODUCT_DISCOUNTS.length > 0
        && this.LAST_PRODUCT_FEATURED.length > 0
        && this.LAST_PRODUCT_SELLING.length > 0) {
        this.VIEW_READY = true;
      }

      if (isPlatformBrowser(this.platformId)) {
        this.callPlugin();
      }
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
  }

  handleProductSelect(product: any) {
    this.product_selected = product;
  }

  callPlugin() {
    setTimeout(() => {
      CARUSEL_PRODUCTS($);
      SLIDER_PRINCIPAL($);
      CAMPAING_FLASH($);
      DATA_VALUES($);
      SLIDER_PRODUCT($);
      SLIDER_PRODUCT_ELECTRONIC($);
      BLOG($);
      IGIMAGEN($);
    }, 50);
  }
}