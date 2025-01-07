import { Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})
export class LandingProductComponent {
  PRODUCT_SLUG: any;
  PRODUCT_SELECTED: any;

  constructor(
    public homeService: HomeService,
    public activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.activatedRoute.params.subscribe((resp: any) => {
      this.PRODUCT_SLUG = resp.slug;
    }, (err: any) => {
      console.log(err);
      this.toastr.error('API Response - Comuniquese con el desarrollador', err.error.message || err.error.error || err.message);
    });

    this.homeService.showProduct(this.PRODUCT_SLUG).subscribe((resp: any) => {
      console.log(resp);

      if (resp.message == 403) {
        this.router.navigateByUrl("/error/404");
        this.toastr.error("Validación", resp.message_text);
      }

      this.PRODUCT_SELECTED = resp.product;
    }, (err: any) => {
      console.log(err);
      this.toastr.error('API Response - Comuniquese con el desarrollador', err.error.message || err.error.error || err.message);
    });
  }
}
