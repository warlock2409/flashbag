import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="side-panel-container" [class.open]="isOpen">
      <div class="side-panel">
        <div class="panel-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="panel-content">
          <ng-content></ng-content>
        </div>
      </div>
      <div class="overlay" (click)="close()"></div>
    </div>
  `,
  styles: [`
    .side-panel-container {
      visibility: hidden;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1000;

      &.open {
        visibility: visible;

        .side-panel {
          transform: translateX(0);
        }

        .overlay {
          opacity: 1;
        }
      }
    }

    .side-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100%;
      background: white;
      box-shadow: -2px 0 8px rgba(0,0,0,0.1);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 1001;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;

      h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #666;

        &:hover {
          color: #333;
        }
      }
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .overlay {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(0,0,0,0.5);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    @media (max-width: 480px) {
      .side-panel {
        width: 100%;
      }
    }
  `]
})
export class SidePanelComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closePanel = new EventEmitter<void>();

  close() {
    this.closePanel.emit();
  }
} 