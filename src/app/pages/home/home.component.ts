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
import { CookieService } from 'ngx-cookie-service';
import { CartService } from './service/cart.service';
import { AuthService } from '../auth/service/auth.service';

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

  [key: string]: any; // Agrega este índice dinámico para evitar errores de compilación
  product_selected: any = null;
  is_flash: boolean = false;
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
  VIEW_READY_LAST_PRODUCTS: boolean = false;
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
  PRODUCTS_CARUSEL_STATE: boolean = true;
  LAST_PRODUCTS_STATE: boolean = true;
  BLOG_STATE: boolean = true;
  IG_IMAGES_STATE: boolean = true;
  FEATURE_STATE: boolean = true;
  SUBSCRIBE_STATE: boolean = true;
  MANTINANCE_STATUS: boolean = false;
  user: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public homeService: HomeService,
    private toastr: ToastrService,
    private cartService: CartService,
    private authService: AuthService,
  ) {
    this.mantinanceStatus();

    if (isPlatformBrowser(this.platformId)) {
      this.dataHome();
      this.listadoCarrito();
    }
  }

  ngOnInit() {
    this.scrollUp();
  }

  listadoCarrito() {
    const token = localStorage.getItem('token');

    if (token) {
      this.authService.tokenSubject.next(token); // Sincroniza el token

      this.cartService.listCart().subscribe((resp: any) => {
        resp.carts.data.forEach((cart: any) => {
          this.cartService.changeCart(cart);
        });
      }, (error) => {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      });
    } else {
      this.authService.tokenSubject.next(token); // Sincroniza el token
      this.cartService.clearCart();
    }
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

      this.SLIDERS.length > 0 ? this.VIEW_READY_SLIDERS = true : this.VIEW_READY_SLIDERS = false;

      this.CATEGORIES_RANDOMS.length > 0 ? this.VIEW_READY_CATEGORIES_RAMDOMS = true : this.VIEW_READY_CATEGORIES_RAMDOMS = false;

      this.TRENDING_PRODUCT_NEW && this.TRENDING_PRODUCT_FEATURED && this.TRENDING_PRODUCT_TOP_SELLER ? this.VIEW_READY_TRENDING = true : this.VIEW_READY_TRENDING = false;

      this.SLIDERS_SECUNDARIOS.length > 0 ? this.VIEW_READY_SLIDERS_SECUNDARIOS = true : this.VIEW_READY_SLIDERS_SECUNDARIOS = false;

      this.DISCOUNT_FLASH_PRODUCTS.length > 0 ? this.VIEW_READY_FLASH = true : this.VIEW_READY_FLASH = false;

      this.ELECTRONIC_PRODUCTS ? this.VIEW_READY_ELECTRONIC_PRODUCTS = true : this.VIEW_READY_ELECTRONIC_PRODUCTS = false;

      this.SLIDERS_PRODUCTS.length > 0 ? this.VIEW_READY_SLIDERS_PRODUCTS = true : this.VIEW_READY_SLIDERS_PRODUCTS = false;

      this.PRODUCTS_CARUSEL ? this.VIEW_READY_CARUSEL = true : this.VIEW_READY_CARUSEL = false;

      this.LAST_PRODUCT_DISCOUNTS && this.LAST_PRODUCT_FEATURED && this.LAST_PRODUCT_SELLING ? this.VIEW_READY_LAST_PRODUCTS = true : this.VIEW_READY_LAST_PRODUCTS = false;

      this.llamarHomeViews(this.HOME_VIEWS);

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

  viewFlash(viewFlash: any) {
    this.is_flash = viewFlash;
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

    const statesMap: { [key: string]: string } = {
      sliders: "SLIDERS_STATE",
      categories: "CATEGORIES_STATE",
      feature: "FEATURE_STATE",
      trending: "TRENDING_STATE",
      sldiers_second: "SLIDERS_SECUNDARIOS_STATE",
      campaing_flash: "DISCOUNT_FLASH_PRODUCTS_STATE",
      product_electronics: "ELECTRONIC_PRODUCTS_STATE",
      sliders_products: "SLIDERS_PRODUCTS_STATE",
      carusel_products: "PRODUCTS_CARUSEL_STATE",
      last_products: "LAST_PRODUCTS_STATE",
      blog: "BLOG_STATE",
      ig_imagenes: "IG_IMAGES_STATE",
      subscribe: "SUBSCRIBE_STATE",
    };

    Object.keys(statesMap).forEach((key) => {
      const view = HOME_VIEWS.find((view: HomeView) => view.name === key);
      this[statesMap[key]] = view?.state === 1;
    });
  }

  mantinanceStatus() {
    this.homeService.homeView().subscribe();
  }
}