import { Component, EventEmitter, Output } from '@angular/core';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-trending-products',
  standalone: true,
  imports: [],
  templateUrl: './trending-products.component.html',
  styleUrl: './trending-products.component.css'
})
export class TrendingProductsComponent {

  @Output() productSelected = new EventEmitter<any>();

  TRENDING_PRODUCT_NEW: any = [];
  TRENDING_PRODUCT_FEATURED: any = [];
  TRENDING_PRODUCT_TOP_SELLER: any = [];
  product_selected: any = null;

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    this.homeService.products().subscribe((resp: any) => {
      console.log(resp);
      this.TRENDING_PRODUCT_NEW = resp.product_trending_new.data;
      this.TRENDING_PRODUCT_FEATURED = resp.product_trending_featured.data;
      this.TRENDING_PRODUCT_TOP_SELLER = resp.product_trending_top_sellers.data;

    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
  }

  getNewTotal(PRODUCT: any, DISCOUNT_FLASH_P: any) {
    if (DISCOUNT_FLASH_P.type_discount == 1) {
      return (PRODUCT.price_cop - PRODUCT.price_cop * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2);
    } else {
      return (PRODUCT.price_cop - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
  }

  getTotalPrice(product: any) {
    if (product.discount_g) {
      return this.getNewTotal(product, product.discount_g);
    }
    return product.price_cop;
  }

  OpenDetailProduct(product: any) {
    this.productSelected.emit(product);
  }
}
