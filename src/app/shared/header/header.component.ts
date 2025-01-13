import { Component } from '@angular/core';
import { MenuCategoriesComponent } from './menu-categories/menu-categories.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenuCategoriesComponent, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
    constructor(private router: Router) { }
  
    navigateToHome() {
      if (this.router.url === '/') {
        // Si ya estás en el home, desplázate hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Si no estás en el home, redirige al home
        this.router.navigate(['/']);
      }
    }
}
