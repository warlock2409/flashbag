import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-shop-team',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="team-section">
      <h2>Team</h2>
      <div class="team-grid">
        <div *ngFor="let member of team" class="team-member">
          <img [src]="member.avatar" [alt]="member.name">
          <h3>{{member.name}}</h3>
          <p>{{member.role}}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .team-section {
      padding: 24px 0;

      .team-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 24px;
        margin-top: 24px;

        .team-member {
          text-align: center;

          img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 12px;
          }

          h3 {
            margin: 0;
            font-size: 16px;
          }

          p {
            color: #666;
            font-size: 14px;
            margin: 4px 0 0;
          }
        }
      }
    }
  `]
})
export class ShopTeamComponent {
  @Input() team: TeamMember[] = [];
} 