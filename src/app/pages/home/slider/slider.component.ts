import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../service/home.service';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})

export class SliderComponent {

  @Input() SLIDERS: any[] = [];  // Usamos @Input() para recibir los datos
  @Input() VIEW_READY: boolean = false;

  constructor(
    public homeService: HomeService,
  ) { }

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
