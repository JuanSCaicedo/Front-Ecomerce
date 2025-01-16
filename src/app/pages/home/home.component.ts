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
  VIEW_READY_SLIDERS_PRODUCTS: boolean = false;
  VIEW_READY_ELECTRONIC_PRODUCTS: boolean = false;
  VIEW_READY_SLIDERS_SECUNDARIOS: boolean = false;
  VIEW_READY_TRENDING: boolean = false;
  VIEW_READY_SLIDERS: boolean = false;
  VIEW_READY_CATEGORIES_RAMDOMS: boolean = false;
  VIEW_READY_CARUSEL: boolean = false;
  VIEW_READY_FLASH: boolean = false;
  HOME_VIEWS: any;
  SLIDERS_STATE: boolean = true;
  CATEGORIES_STATE: boolean = true;
  TRENDING_STATE: boolean = true;
  SLIDERS_SECUNDARIOS_STATE: boolean = true;
  DISCOUNT_FLASH_PRODUCTS_STATE: boolean = true;
  ELECTRONIC_PRODUCTS_STATE: boolean = true;
  SLIDERS_PRODUCTS_STATE: boolean = true;

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.dataHome();
  }

  ngOnInit() {
    this.scrollUp();
  }

  dataHome() {
    this.homeService.home().subscribe((resp: any) => {
      // console.log(resp);
      this.HOME_VIEWS = resp.home_views;
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

      // if (this.SLIDERS.length > 0
      //   || this.TRENDING_PRODUCT_NEW.length > 0
      //   || this.TRENDING_PRODUCT_FEATURED.length > 0
      //   || this.TRENDING_PRODUCT_TOP_SELLER.length > 0
      //   || this.ELECTRONIC_PRODUCTS.length > 0
      //   || this.LAST_PRODUCT_DISCOUNTS.length > 0
      //   || this.LAST_PRODUCT_FEATURED.length > 0
      //   || this.LAST_PRODUCT_SELLING.length > 0) {
      //   this.VIEW_READY = true;
      // }

      this.SLIDERS.length > 0 ? this.VIEW_READY_SLIDERS = true : this.VIEW_READY_SLIDERS = false;

      this.CATEGORIES_RANDOMS.length > 0 ? this.VIEW_READY_CATEGORIES_RAMDOMS = true : this.VIEW_READY_CATEGORIES_RAMDOMS = false;

      this.TRENDING_PRODUCT_NEW && this.TRENDING_PRODUCT_FEATURED && this.TRENDING_PRODUCT_TOP_SELLER ? this.VIEW_READY_TRENDING = true : this.VIEW_READY_TRENDING = false;

      this.SLIDERS_SECUNDARIOS.length > 0 ? this.VIEW_READY_SLIDERS_SECUNDARIOS = true : this.VIEW_READY_SLIDERS_SECUNDARIOS = false;

      this.DISCOUNT_FLASH_PRODUCTS.length > 0 ? this.VIEW_READY_FLASH = true : this.VIEW_READY_FLASH = false;

      this.ELECTRONIC_PRODUCTS ? this.VIEW_READY_ELECTRONIC_PRODUCTS = true : this.VIEW_READY_ELECTRONIC_PRODUCTS = false;

      this.SLIDERS_PRODUCTS.length > 0 ? this.VIEW_READY_SLIDERS_PRODUCTS = true : this.VIEW_READY_SLIDERS_PRODUCTS = false;

      this.llamarHomeViews(this.HOME_VIEWS);

      if (this.PRODUCTS_CARUSEL) {
        this.VIEW_READY_CARUSEL = true;
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

  scrollUp() {
    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);
  }

  llamarHomeViews(HOME_VIEWS: any) {
    interface HomeView {
      id: number;
      name: string;
      state: number;
    }

    const sliders = this.HOME_VIEWS.find((view: HomeView) => view.name === 'sliders');
    const categories = this.HOME_VIEWS.find((view: HomeView) => view.name === 'categories');
    const trending = this.HOME_VIEWS.find((view: HomeView) => view.name === 'trending');
    const sldiers_second = this.HOME_VIEWS.find((view: HomeView) => view.name === 'sldiers_second');
    const campaing_flash = this.HOME_VIEWS.find((view: HomeView) => view.name === 'campaing_flash');
    const product_electronics = this.HOME_VIEWS.find((view: HomeView) => view.name === 'product_electronics');
    const sliders_products = this.HOME_VIEWS.find((view: HomeView) => view.name === 'sliders_products');
    const carusel_products = this.HOME_VIEWS.find((view: HomeView) => view.name === 'carusel_products');
    const last_products = this.HOME_VIEWS.find((view: HomeView) => view.name === 'last_products');
    const blog = this.HOME_VIEWS.find((view: HomeView) => view.name === 'blog');
    const ig_imagenes = this.HOME_VIEWS.find((view: HomeView) => view.name === 'ig_imagenes');

    if (categories.state === 1) {
      this.CATEGORIES_STATE = true;
    } else {
      this.CATEGORIES_STATE = false;
    }

    if (sliders.state === 1) {
      this.SLIDERS_STATE = true;
    } else {
      this.SLIDERS_STATE = false;
    }

    if (trending.state === 1) {
      this.TRENDING_STATE = true;
    } else {
      this.TRENDING_STATE = false;
    }

    if (sldiers_second.state === 1) {
      this.SLIDERS_SECUNDARIOS_STATE = true;
    } else {
      this.SLIDERS_SECUNDARIOS_STATE = false;
    }

    if (campaing_flash.state === 1) {
      this.DISCOUNT_FLASH_PRODUCTS_STATE = true;
    } else {
      this.DISCOUNT_FLASH_PRODUCTS_STATE = false;
    }

    if (product_electronics.state === 1) {
      this.ELECTRONIC_PRODUCTS_STATE = true;
    } else {
      this.ELECTRONIC_PRODUCTS_STATE = false;
    }

    if (sliders_products.state === 1) {
      this.SLIDERS_PRODUCTS_STATE = true;
    } else {
      this.SLIDERS_PRODUCTS_STATE = false;
    }
  }
}