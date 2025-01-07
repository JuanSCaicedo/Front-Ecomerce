import { Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})
export class LandingProductComponent {
  PRODUCT_SLUG: any;
  PRODUCT_SELECTED: any;
  filtered_images: any[] = []; // Lista de imágenes aleatorias

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

  ngOnInit() {
    console.log(this.PRODUCT_SELECTED);
    if (this.PRODUCT_SELECTED?.images) {
      this.filtered_images = this.getRandomImages(this.PRODUCT_SELECTED.images, 4);
    }
  }

    // Método para obtener N elementos aleatorios
    getRandomImages(images: any[], count: number): any[] {
      return [...images]
        .sort(() => Math.random() - 0.5) // Baraja las imágenes
        .slice(0, count); // Obtiene los primeros 'count' elementos
    }
}
