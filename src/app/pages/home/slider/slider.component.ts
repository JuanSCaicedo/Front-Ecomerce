import { afterNextRender, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

declare function SLIDER_PRINCIPAL([]): any;
declare var $: any;

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {

  SLIDERS: any = [];
  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    afterNextRender(() => {
      this.homeService.header().subscribe((resp: any) => {
        console.log(resp);
        this.SLIDERS = resp.sliders_principal;

        setTimeout(() => {
          SLIDER_PRINCIPAL($);
        }, 50);
      }, (error) => {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
      );
    });
  }

  getLabelSlider(SLIDER: any) {
    var miDiv: any = document.getElementById('label-' + SLIDER.id);
    miDiv.innerHTML = SLIDER.label;
    return '';
  }

  getSubtitleSlider(SLIDER: any) {
    var miDiv: any = document.getElementById('subtitle-' + SLIDER.id);
    miDiv.innerHTML = SLIDER.subtitle;
    return '';
  }
}
