import { Component, Input } from '@angular/core';
import { HomeService } from '../service/home.service';

@Component({
  selector: 'app-slider-secundario',
  standalone: true,
  imports: [],
  templateUrl: './slider-secundario.component.html',
  styleUrl: './slider-secundario.component.css'
})

export class SliderSecundarioComponent {

  @Input() SLIDERS_SECUNDARIOS: any[] = [];  // Usamos @Input() para recibir los datos

  constructor(
    public homeService: HomeService,
  ) { }

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
