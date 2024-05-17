import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

declare var $: any;
declare function HOMEINIT([]): any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ecommerce';
  
  constructor(

  ) {
    setTimeout(() => {
      HOMEINIT($);
    }, 50);
  }
}
