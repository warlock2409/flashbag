import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings-placeholder',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="setting_placeholder">
    <router-outlet></router-outlet>
    </div>
  `,
  styles: `
  .setting_placeholder{
    margin-top:80px;
  }
  `
})
export class SettingsPlaceholderComponent {

}
