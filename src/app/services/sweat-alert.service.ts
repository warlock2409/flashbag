import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Injectable({
  providedIn: 'root'
})
export class SweatAlertService {

  paymentRequestHook = 'https://discord.com/api/webhooks/1434582915307667701/8rrPHDlQoj0HUge6vmpWdGIiT6Vk9JvUNLRi7OWgomwKzp31zMEF_Y_eNpCGGC3jVch9';
  errorHook = 'https://discord.com/api/webhooks/1431925094229344310/VWAdfXEJD6MBr2kkzxJzlbcov5ONv7DI_83FRXmi2vSYuj7ltiKpNnVVVPZnT2rmReaj'
  leadHook = 'https://discord.com/api/webhooks/1448709483889950780/goU_BUQ87LRERdpwatnqEx5QSScWqR9ImJAdB62oRl4YOW9imTj3aDCFcHp-XXQGByUc'
  constructor(private notification: NzNotificationService) { }


  createNotification(type: string, title: string, message: string): void {
    this.notification.create(
      type,
      title,
      message
    );
  }

  success(message: string, duration: number = 1500) {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: message,
      showConfirmButton: false,
      timer: duration
    });
  }

  error(message: string, timer = 3500) {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: message,
      showConfirmButton: false,
      timer: timer
    });
  }

  errorHtml(errors: string) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Form',
      html: errors
    });
  }

  async sendLead(email: string) {
    const payload = {
      content: `New Lead Submission`,
      embeds: [
        {
          title: "Lead Information",
          description: `A new lead has expressed interest in our services.`,
          color: 0x7C3AED,
          fields: [
            { name: "Email", value: email, inline: false },
            { name: "Timestamp", value: new Date().toISOString(), inline: false }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const response = await fetch(this.leadHook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Webhook failed: ${text}`);
      }

      console.log('Lead sent successfully');
      this.success('Our team will be in touch soon!');
      return true;
    } catch (err: any) {
      console.error('Error sending lead to Discord:', err);
      return false;
    }
  }
  
  async sendLeadWithDetails(leadData: { name: string, gym: string, email: string, phone: string, city: string, locations: number }) {
    const payload = {
      content: `New Lead Submission`,
      embeds: [
        {
          title: "Lead Information",
          description: `A new lead has expressed interest in our services.`,
          color: 0x7C3AED,
          fields: [
            { name: "Name", value: leadData.name, inline: false },
            { name: "Gym Name", value: leadData.gym, inline: false },
            { name: "Email", value: leadData.email, inline: false },
            { name: "Phone", value: leadData.phone, inline: false },
            { name: "City", value: leadData.city, inline: false },
            { name: "Locations", value: leadData.locations.toString(), inline: false },
            { name: "Timestamp", value: new Date().toISOString(), inline: false }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const response = await fetch(this.leadHook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Webhook failed: ${text}`);
      }

      console.log('Lead with details sent successfully');
      this.success('Our team will be in touch soon!');
      return true;
    } catch (err: any) {
      console.error('Error sending lead with details to Discord:', err);
      return false;
    }
  }

  async alertTeam(page: string, action: string, title: string, error: string) {
    let organization = localStorage.getItem("orgCode")!;
    const payload = {
      content: page,
      embeds: [
        {
          title: title,
          description: `User Action: ${action} Error: ${error}`,
          color: 0x7C3AED,
          fields: [
            { name: "Organization", value: organization, inline: false }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const response = await fetch(this.errorHook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Webhook failed: ${text}`);
      }

      console.log('Message sent successfully');
    } catch (err: any) {
      console.error('Error sending alert to team:', err);
    }
  }

  async paymentrequest(page: string, action: string, title: string) {
    let organization = localStorage.getItem("orgCode")!;
    const payload = {
      content: page,
      embeds: [
        {
          title: title,
          description: `Payment Request: ${action}`,
          color: 0x7C3AED,
          fields: [
            { name: "Organization", value: organization, inline: false }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const response = await fetch(this.paymentRequestHook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Webhook failed: ${text}`);
      }

      console.log('Message sent successfully');
    } catch (err: any) {
      console.error('Error sending alert to team:', err);
    }
  }


}