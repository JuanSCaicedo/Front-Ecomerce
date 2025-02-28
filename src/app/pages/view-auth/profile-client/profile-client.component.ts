import { Component } from '@angular/core';
import { EditProfileClientComponent } from './edit-profile-client/edit-profile-client.component';
import { AddressProfileClientComponent } from './address-profile-client/address-profile-client.component';
import { OrdersProfileClientComponent } from './orders-profile-client/orders-profile-client.component';
import { PasswordProfileClientComponent } from './password-profile-client/password-profile-client.component';

@Component({
  selector: 'app-profile-client',
  standalone: true,
  imports: [EditProfileClientComponent, AddressProfileClientComponent, OrdersProfileClientComponent, PasswordProfileClientComponent],
  templateUrl: './profile-client.component.html',
  styleUrl: './profile-client.component.css'
})
export class ProfileClientComponent {

}
