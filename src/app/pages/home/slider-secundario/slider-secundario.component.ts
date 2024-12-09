import { Component, afterRender } from '@angular/core';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

declare var $: any;
declare function DATA_VALUES([]): any;

@Component({
  selector: 'app-slider-secundario',
  standalone: true,
  imports: [],
  templateUrl: './slider-secundario.component.html',
  styleUrl: './slider-secundario.component.css'
})

export class SliderSecundarioComponent {

  SLIDERS_SECUNDARIOS: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    this.homeService.slider_secundario().subscribe((resp: any) => {
      console.log(resp);
      this.SLIDERS_SECUNDARIOS = resp.sliders_secundario;
    }, (error) => {
      console.error(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });

    afterRender(() => {
      setTimeout(() => {
        DATA_VALUES($);
      }, 50);
    })
  }

  getTitleBannerSecundario(BANNER: any, ID_BANNER: string) {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const miDiv: HTMLElement | null = document.getElementById(ID_BANNER);
      if (miDiv) {
        miDiv.innerHTML = BANNER.title;
      }
    }
    return '';
  }
}
