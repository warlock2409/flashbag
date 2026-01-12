import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: false
})
export class SettingsComponent {

  webhookUrl = 'https://discord.com/api/webhooks/1425611379301290148/w0kciQAox8SX75J5__ze-OFjR76RSOL-f1NmGRL8K8qrxrVUXjL4aaLKVetruTyiX7tF';


  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    }
  }


  constructor(private router: Router) { }



  cards = {
    settingsCards: [
      {
        title: 'Business setup',
        desc: 'Customise business details, manage locations, and client referral sources.',
        icon: 'business',
        locked: false,
        routerLink: './business-setup'
      },
      // {
      //   title: 'Product Inventory',
      //   desc: 'Manage your products and inventory, set availability, and configure online booking preferences.',
      //   icon: 'inventory',
      //   locked: false,
      //   routerLink: './scheduling'
      // },
      {
        title: 'Scheduling',
        desc: 'Set your availability, manage bookable resources and online booking preferences.',
        icon: 'event',
        locked: true,
        routerLink: './scheduling'
      },
      {
        title: 'Sales',
        desc: 'Configure payment methods, taxes, receipts, service charges and gift cards.',
        icon: 'sell',
        locked: true,
        routerLink: './sales'
      },
      {
        title: 'Billing',
        desc: 'Manage invoices, text messages, add-ons and billing.',
        icon: 'account_balance',
        locked: true,
        routerLink: './billing'
      },
      {
        title: 'Team',
        desc: 'Manage permissions, compensation and time-off.',
        icon: 'groups',
        locked: true,
        routerLink: './team'
      },
      {
        title: 'Forms',
        desc: 'Configure templates for client forms.',
        icon: 'description',
        locked: true,
        routerLink: './forms'
      },
      {
        title: 'Payments',
        desc: 'Configure payment methods, terminals and your payment policy.',
        icon: 'credit_card',
        locked: true,
        routerLink: './payments'
      }
    ],
    onlinePresence: [
      {
        title: 'Instagram Management',
        desc: 'Every comment becomes a conversation',
        locked: false,
        routerLink: '/insta-automate'
      },
      {
        title: 'Marketplace profile',
        desc: 'Attract new clients with online bookings.',
        locked: true,
        routerLink: '#'
      },
      {
        title: 'Link builder',
        desc: 'Create shareable booking links and QR codes.',
        locked: true,
        routerLink: '#'
      },
      {
        title: 'Reserve with Google',
        desc: 'Get online bookings from Google Search and Maps.',
        comment: 'Connect your business with Google for reservations.',
        locked: true,
        routerLink: '#'
      },
      {
        title: 'Book with Facebook and Instagram',
        desc: 'Get online bookings from your social media pages.',
        comment: 'Integrate your social profiles to accept bookings online.',
        locked: true,
        routerLink: '#'
      }
    ],
    marketing: [
      {
        title: 'Blast marketing',
        desc: 'Share special offers and important updates over email and text message.',
        locked: true,
        routerLink: '#'
      },
      {
        title: 'Automations',
        desc: 'Engage with your clients and keep them up to date with automations.',
        locked: true,
        routerLink: '#'
      },
      {
        title: 'Deals',
        desc: 'Reward and retain clients with discount codes, flash sales and promotion offers.',
        locked: true,
        routerLink: '#'
      },
      {
        title: 'Smart pricing',
        desc: 'Adjust your prices to charge different amounts during more or less busy hours.',
        locked: true,
        routerLink: '#'
      },
      {
        title: 'Sent messages',
        desc: 'View the list of all email, text and push messages sent to your clients.',
        locked: true,
        routerLink: '#'
      },
      {
        title: 'Ratings and reviews',
        desc: 'View star ratings and reviews left by clients after their visit.',
        locked: true,
        routerLink: '#'
      }
    ]
  };

  navigate(link: string) {
    this.router.navigate([link]);
  }

  openLockedDialog(card: any) {
    console.log(card);

    const userString = localStorage.getItem('currentUser');
    let userData: any = null;

    if (userString) {
      userData = JSON.parse(userString);
    }

    const userName = userData?.firstName || "Unknown User";
    const userEmail = userData?.email || "Not provided";
    const organization = userData?.organizationDto?.[0]?.name || "N/A";


    Swal.fire({
      icon: 'info',
      title: 'Feature Coming Soon!',
      html: `We'll update our team to check and stay tuned for availability.<br><br>
           Would you like to inform our team about your interest?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, notify team',
      cancelButtonText: 'No, thanks'
    }).then((result) => {
      if (result.isConfirmed) {
        this.notifyTeam(card.title, userName, userEmail, organization, true);

        Swal.fire({
          icon: 'success',
          title: 'Thank you!',
          text: 'Your interest has been shared with our team.'
        });
      } else {
        this.notifyTeam(card.title, userName, userEmail, organization, false);
      }
    });
  }


  notifyTeam(feature: string, firstName: string, email: string, organization: string, intrest: boolean) {
    const payload = {
      content: "May be New feature request received!",
      embeds: [
        {
          title: "Feature Interest",
          description: `A user ${intrest ? 'is interested in' : 'saw'} the feature: **${feature}**`,
          color: 0x7C3AED,
          fields: [
            { name: "Name", value: firstName, inline: true },
            { name: "Email", value: email, inline: true },
            { name: "Organization", value: organization, inline: false }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => console.log(response))
      .then(data => console.log('Message sent:', data))
      .catch(error => console.error('Error sending message:', error));
  }

}




