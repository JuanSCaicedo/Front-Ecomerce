import { afterNextRender, Component } from '@angular/core';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-electronic-products',
  standalone: true,
  imports: [],
  templateUrl: './electronic-products.component.html',
  styleUrl: './electronic-products.component.css'
})
export class ElectronicProductsComponent {
  
  ELECTRONIC_PRODUCTS: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    afterNextRender(() => {
      this.homeService.products_electronics().subscribe((resp: any) => {
        console.log(resp);
        this.ELECTRONIC_PRODUCTS = resp.product_electronics.data;

      }, (error) => {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
      );
    });
  }
}
