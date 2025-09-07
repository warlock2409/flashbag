import { Component } from '@angular/core';

@Component({
  selector: 'app-gym-check-in',
  standalone: true,
  imports: [],
  templateUrl: './gym-check-in.component.html',
  styleUrl: './gym-check-in.component.scss'
})
export class GymCheckInComponent {


  constructor() {
    window.addEventListener("DOMContentLoaded", () => {
      // Select all elements with the 'bodymap' class
      const parts = document.querySelectorAll<HTMLElement>(".bodymap");

      parts.forEach((part) => {
        part.addEventListener("click", (event: Event) => {
          // Type guard to ensure target is an HTMLElement
          const target = event.currentTarget as HTMLElement;

          // Remove 'active' from all parts
          parts.forEach((p) => p.classList.remove("active"));

          // Add 'active' to clicked element
          target.classList.add("active");

          // Example action: log the selected body part's ID
          console.log(`Selected body part: ${target.id}`);
        });
      });
    });
  }



}
