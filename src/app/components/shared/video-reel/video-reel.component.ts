import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface VideoReel {
  id: string;
  url: string;
  title: string;
  views: number;
  thumbnail?: string;
}

@Component({
  selector: 'app-video-reel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="reels-container">
      <h2>Flashback</h2>
      <div class="reels-scroll" #reelsScroll>
        <div class="reel-card" 
             *ngFor="let reel of reels; let i = index"
             (click)="scrollToPlay(i)">
          <div class="video-container">
            <video #videoElement
                  [src]="reel.url"
                  [loop]="false"
                  [muted]="i !== 0"
                  >
            </video>
            <div class="video-overlay">
              <div class="video-info">
                <h3>{{ reel.title }}</h3>
                <span class="views">
                  <mat-icon>visibility</mat-icon>
                  {{ reel.views | number }} views
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reels-container {
      margin: 48px 0;
      text-align: left;
      padding: 0;

      h2 {
        margin-bottom: 24px;
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
        padding: 0 32px;
        font-size: 24px;
        font-weight: 600;
        color: #333;
      }
    }

    .reels-scroll {
      display: flex;
      overflow-x: auto;
      gap: 16px;
      scroll-behavior: smooth;
      -ms-overflow-style: none;
      scrollbar-width: none;
      padding: 0 32px;
      margin: 0;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .reel-card {
      flex: 0 0 280px;
      width: 280px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
      }

      .video-container {
        position: relative;
        width: 100%;
        height: 500px;

        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
        }

        .video-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          color: white;

          .video-info {
            h3 {
              margin: 0 0 8px;
              font-size: 16px;
            }

            .views {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 14px;
              opacity: 0.8;

              mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
              }
            }
          }
        }
      }
    }
  `]
})
export class VideoReelComponent implements OnInit {
  @ViewChild('reelsScroll') reelsScroll!: ElementRef;
  private currentPlayingIndex: number = 0;

  reels: VideoReel[] = [
    {
      id: '1',
      url: 'assets/sampleReal.mp4',
      title: 'Coffee Art Masterpiece',
      views: 12500
    },
    {
      id: '2',
      url: 'assets/sampleReal.mp4',
      title: 'Barista Special',
      views: 8300
    },
    {
      id: '3',
      url: 'assets/sampleReal.mp4',
      title: 'Morning Brew',
      views: 15700
    },
    {
      id: '4',
      url: 'assets/sampleReal.mp4',
      title: 'Perfect Pour',
      views: 9800
    },
    {
        id: '5',
        url: 'assets/sampleReal.mp4',
        title: 'Perfect Pour',
        views: 9800
      }
  ];

  ngOnInit() {
    if (this.reelsScroll) {
      this.reelsScroll.nativeElement.style.scrollSnapType = 'x mandatory';
      const cards = this.reelsScroll.nativeElement.getElementsByClassName('reel-card');
      Array.from(cards as HTMLCollectionOf<HTMLElement>).forEach(card => {
        card.style.scrollSnapAlign = 'start';
      });
    }
  }

  scrollToPlay(index: number) {
    const cards = this.reelsScroll.nativeElement.getElementsByClassName('reel-card');
    const selectedCard = cards[index];
    const selectedVideo = selectedCard.querySelector('video') as HTMLVideoElement;
    
    // If clicking the same video, toggle play/pause
    if (index === this.currentPlayingIndex) {
      if (selectedVideo.paused) {
        selectedVideo.muted = false;
        selectedVideo.play();
      } else {
        selectedVideo.pause();
      }
      return;
    }

    // Pause and mute all videos
    const videos = Array.from(this.reelsScroll.nativeElement.getElementsByTagName('video')) as HTMLVideoElement[];
    videos.forEach(video => {
      video.pause();
      video.muted = true;
    });

    // Scroll to selected card
    selectedCard.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest',
      inline: 'center'
    });

    // Play selected video with sound
    selectedVideo.muted = false;
    selectedVideo.play();
    this.currentPlayingIndex = index;
  }
} 