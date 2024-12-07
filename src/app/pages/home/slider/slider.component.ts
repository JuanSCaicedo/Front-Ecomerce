import { Component } from '@angular/core';
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
  ) { }

  ngOnInit(): void {
    this.homeService.slider().subscribe((resp: any) => {
      console.log(resp);
      this.SLIDERS = resp.sliders_principal;
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    }
    );
  }

  ngAfterViewInit(): void {
    // Usar ngAfterViewInit para realizar acciones relacionadas con la vista
    setTimeout(() => {
      // Esperar un poco antes de ejecutar la función DATA_VALUES
      if (typeof SLIDER_PRINCIPAL === 'function') {
        SLIDER_PRINCIPAL($); // Asegurarse de que la función está definida
      }
    }, 50);
  }

  getLabelSlider(SLIDER: any) {
    if (typeof document !== 'undefined') {
      const miDiv: any = document.getElementById('label-' + SLIDER.id);
      if (miDiv) {
        miDiv.innerHTML = SLIDER.label;
      }
    }
    return '';
  }
  
  getSubtitleSlider(SLIDER: any) {
    if (typeof document !== 'undefined') {
      const miDiv: any = document.getElementById('subtitle-' + SLIDER.id);
      if (miDiv) {
        miDiv.innerHTML = SLIDER.subtitle;
      }
    }
    return '';
  }
}
