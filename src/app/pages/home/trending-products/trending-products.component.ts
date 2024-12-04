import { afterNextRender, Component } from '@angular/core';
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
  
  TRENDING_PRODUCT_NEW: any = [];
  TRENDING_PRODUCT_FEATURED: any = [];
  TRENDING_PRODUCT_TOP_SELLER: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    afterNextRender(() => {
      this.homeService.products().subscribe((resp: any) => {
        console.log(resp);
        this.TRENDING_PRODUCT_NEW = resp.product_trending_new.data;
        this.TRENDING_PRODUCT_FEATURED = resp.product_trending_featured.data;
        this.TRENDING_PRODUCT_TOP_SELLER = resp.product_trending_top_sellers.data;

      }, (error) => {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
      );
    });
  }
}
