import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [],
  templateUrl: './subscribe.component.html',
  styleUrl: './subscribe.component.css'
})
export class SubscribeComponent {
  @Input() SUBSCRIBE_STATE: boolean = false; 
}
