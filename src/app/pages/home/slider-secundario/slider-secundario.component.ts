import { afterNextRender, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

declare var $: any;
declare function DATA_VALUES([]):any;

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
    afterNextRender(() => {
      this.homeService.slider_secundario().subscribe((resp: any) => {
        console.log(resp);
        this.SLIDERS_SECUNDARIOS = resp.sliders_secundario;

        setTimeout(() => {
          DATA_VALUES($);
        }, 50);
      }, (error) => {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
      );
    });
  }

  getTitleBannerSecundario(BANNER:any, ID_BANNER:string) {
    var miDiv: any = document.getElementById(ID_BANNER);
    miDiv.innerHTML = BANNER.title;
    return '';
  }
}
