import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ig-images',
  standalone: true,
  imports: [],
  templateUrl: './ig-images.component.html',
  styleUrl: './ig-images.component.css'
})
export class IgImagesComponent {
  @Input() IG_IMAGES_STATE: boolean = false;
}
