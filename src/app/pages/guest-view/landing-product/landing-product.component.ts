import { Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ModalProductoComponent } from '../../home/modal-producto/modal-producto.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare function MODAL_PRODUCT_DETAIL([]): any;
declare function LANDING_PRODUCT([]): any;
declare function LINEA([]): any;
declare var $: any;

@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalProductoComponent],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})

export class LandingProductComponent {
  PRODUCT_SLUG: any;
  PRODUCT_SELECTED: any;
  filtered_images: any = []; // Lista de imágenes aleatorias
  variation_selected: any;
  PRODUCT_RELATEDS: any = [];
  product_relateds_count: boolean = false;
  product_selected_modal: any;

  sanitizedDescription!: SafeHtml;

  constructor(
    public homeService: HomeService,
    public activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    // Escuchar cambios en los parámetros de la ruta
    this.activatedRoute.params.subscribe((params: any) => {
      this.PRODUCT_SLUG = params.slug; // Actualiza el slug
      this.loadProductDetails(); // Llama a la función para cargar los datos del producto
    });
  }

  // Función para cargar los detalles del producto
  loadProductDetails() {
    this.homeService.showProduct(this.PRODUCT_SLUG).subscribe((resp: any) => {
      console.log(resp);

      if (resp.message == 403) {
        this.router.navigateByUrl("/error/404");
        this.toastr.error("Validación", resp.message_text);
      } else {
        this.PRODUCT_SELECTED = resp.product;

        // Sanitizar la descripción después de cargar los datos
        this.sanitizedDescription = this.sanitizer.bypassSecurityTrustHtml(
          this.PRODUCT_SELECTED.description
        );

        this.PRODUCT_RELATEDS = resp.product_relateds.data;
        this.product_relateds_count = this.PRODUCT_RELATEDS.length > 0;
      }

      if (typeof $ !== 'undefined') {
        setTimeout(() => {
          MODAL_PRODUCT_DETAIL($);
          LANDING_PRODUCT($);
        }, 50);
      }

      if (this.PRODUCT_SELECTED?.images) {
        this.filtered_images = this.getRandomImages(this.PRODUCT_SELECTED.images, 5);
      }

      // Restablece las clases activas al cargar un nuevo producto
      this.resetActiveClasses();

      // Realiza scroll hacia la parte superior de la página
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
        }
      }, 0);
    }, (err: any) => {
      console.log(err);
      this.toastr.error('API Response - Comuniquese con el desarrollador', err.error.message || err.error.error || err.message);
    });
  }

  // Método para obtener N elementos aleatorios
  getRandomImages(images: any[], count: number): any[] {
    return [...images]
      .sort(() => Math.random() - 0.5) // Baraja las imágenes
      .slice(0, count); // Obtiene los primeros 'count' elementos
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

  selectedVariation(variation: any) {
    this.variation_selected = null;

    setTimeout(() => {
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  OpenDetailProduct(PRODUCT: any) {
    // Primero establecemos el producto a null
    this.product_selected_modal = null;

    // Usando setTimeout para dar un pequeño delay
    setTimeout(() => {
      // Emitimos el producto seleccionado
      this.product_selected_modal = PRODUCT;
    }, 50);
  }

  // Nueva función para resetear las clases activas
  resetActiveClasses() {
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        // Busca los elementos con las clases activas y las remueve
        const activeNavLinks = document.querySelectorAll('.nav-link.active');
        activeNavLinks.forEach((element) => {
          element.classList.remove('active');
          element.setAttribute('aria-selected', 'false');
        });

        const activeTabPanes = document.querySelectorAll('.tab-pane.show.active');
        activeTabPanes.forEach((element) => {
          element.classList.remove('show', 'active');
        });

        // Activa los elementos por defecto (el primer botón y el primer panel)
        const firstNavLink = document.querySelector('.nav-link');
        const firstTabPane = document.querySelector('.tab-pane');
        const opcSelect = document.querySelector('.opc-select');
        const InfSelect = document.querySelector('.inf-select');

        if (firstNavLink) {
          firstNavLink.classList.add('active');
          firstNavLink.setAttribute('aria-selected', 'true');
        }

        if (firstTabPane) {
          firstTabPane.classList.add('show', 'active');
        }

        if (opcSelect) {
          opcSelect.classList.add('show', 'active');
        }

        if (InfSelect) {
          InfSelect.classList.add('show', 'active');
        }

        // Llamada a tp_tab_line_2 para actualizar la posición del marcador
        setTimeout(() => {
          LINEA($);
        }, 50);
      }, 50); // Da un pequeño tiempo para asegurarse de que el DOM esté cargado
    }
  }
}