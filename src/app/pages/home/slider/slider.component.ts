import { afterNextRender, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

declare var Swiper: any;
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
      this.homeService.home().subscribe((resp: any) => {
        console.log(resp);
        this.SLIDERS = resp.sliders_principal;

        setTimeout(() => {
          var tp_rtl = localStorage.getItem('tp_dir');
          let rtl_setting = tp_rtl == 'rtl' ? true : false;
          var mainSlider = new Swiper('.tp-slider-active', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            rtl: rtl_setting,
            effect: 'fade',
            // Navigation arrows
            navigation: {
              nextEl: ".tp-slider-button-next",
              prevEl: ".tp-slider-button-prev",
            },
            pagination: {
              el: ".tp-slider-dot",
              clickable: true,
              renderBullet: function (index:any, className:any) {
                return '<span class="' + className + '">' + '<button>' + (index + 1) + '</button>' + "</span>";
              },
            },
          });

          mainSlider.on('slideChangeTransitionStart', function (realIndex:any) {
            if ($('.swiper-slide.swiper-slide-active, .tp-slider-item .is-light').hasClass('is-light')) {
              $('.tp-slider-variation').addClass('is-light');
            } else {
              $('.tp-slider-variation').removeClass('is-light');
            }
          });
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
