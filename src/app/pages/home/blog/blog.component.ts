import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  @Input() BLOG_STATE: boolean = true;
  @Input() MANTINANCE_STATUS: boolean = false;
}
