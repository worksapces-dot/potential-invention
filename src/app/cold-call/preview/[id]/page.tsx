import { client } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PreviewClient from './preview-client'

type Props = {
  params: { id: string }
}

export default async function PreviewPage({ params }: Props) {
  const website = await (client as any).generatedWebsite.findUnique({
    where: { id: params.id },
    include: {
      ColdCallLead: true,
      services: { where: { active: true } },
    },
  })

  if (!website) {
    notFound()
  }

  const content = website.content as any
  const html = content?.html || '<p>No website generated yet</p>'

  // Inject booking widget and analytics tracking into HTML
  const enhancedHtml = injectBookingWidget(html, {
    websiteId: website.id,
    businessName: website.ColdCallLead?.businessName || '',
    phone: website.ColdCallLead?.phone || '',
    services: website.services || [],
    bookingEnabled: website.bookingEnabled,
  })

  return (
    <PreviewClient
      websiteId={website.id}
      businessName={website.ColdCallLead?.businessName || ''}
      html={enhancedHtml}
    />
  )
}

function injectBookingWidget(
  html: string,
  config: {
    websiteId: string
    businessName: string
    phone: string
    services: any[]
    bookingEnabled: boolean
  }
): string {
  const bookingWidgetScript = `
<style>
  #booking-widget-btn {
    position: fixed;
    bottom: 100px;
    right: 24px;
    z-index: 9998;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  #booking-widget-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 30px rgba(16, 185, 129, 0.5);
  }
  #booking-widget-btn svg {
    width: 26px;
    height: 26px;
    color: white;
  }
  #booking-modal {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  #booking-modal.open { display: flex; }
  #booking-modal-content {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  }
  #booking-header {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 24px;
    border-radius: 20px 20px 0 0;
  }
  #booking-header h2 { font-size: 20px; font-weight: 700; margin: 0 0 4px 0; }
  #booking-header p { font-size: 14px; opacity: 0.9; margin: 0; }
  #booking-form { padding: 24px; }
  .booking-field { margin-bottom: 16px; }
  .booking-field label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #374151; }
  .booking-field input, .booking-field select, .booking-field textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .booking-field input:focus, .booking-field select:focus, .booking-field textarea:focus {
    outline: none;
    border-color: #10b981;
  }
  #booking-submit {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }
  #booking-submit:hover { transform: translateY(-2px); }
  #booking-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  #booking-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(255,255,255,0.2);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #booking-success {
    display: none;
    text-align: center;
    padding: 40px 24px;
  }
  #booking-success.show { display: block; }
  #booking-success svg { width: 64px; height: 64px; color: #10b981; margin-bottom: 16px; }
  #booking-success h3 { font-size: 20px; font-weight: 700; margin: 0 0 8px 0; }
  #booking-success p { color: #6b7280; margin: 0 0 8px 0; }
  #booking-success .code { font-family: monospace; font-size: 18px; font-weight: 700; color: #10b981; }
</style>

${config.bookingEnabled ? `
<button id="booking-widget-btn" onclick="openBookingModal()" aria-label="Book Appointment">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
</button>

<div id="booking-modal">
  <div id="booking-modal-content">
    <div id="booking-header" style="position: relative;">
      <button id="booking-close" onclick="closeBookingModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <h2>Book an Appointment</h2>
      <p>${config.businessName}</p>
    </div>
    
    <form id="booking-form" onsubmit="submitBooking(event)">
      ${config.services.length > 0 ? `
      <div class="booking-field">
        <label for="booking-service">Service</label>
        <select id="booking-service" required>
          <option value="">Select a service</option>
          ${config.services.map((s: any) => `<option value="${s.id}" data-duration="${s.duration}">${s.name} (${s.duration} min)${s.price ? ' - $' + (s.price / 100).toFixed(2) : ''}</option>`).join('')}
        </select>
      </div>
      ` : ''}
      
      <div class="booking-field">
        <label for="booking-name">Your Name *</label>
        <input type="text" id="booking-name" required placeholder="John Smith">
      </div>
      
      <div class="booking-field">
        <label for="booking-email">Email *</label>
        <input type="email" id="booking-email" required placeholder="john@example.com">
      </div>
      
      <div class="booking-field">
        <label for="booking-phone">Phone</label>
        <input type="tel" id="booking-phone" placeholder="(555) 123-4567">
      </div>
      
      <div class="booking-field">
        <label for="booking-date">Preferred Date *</label>
        <input type="date" id="booking-date" required min="${new Date().toISOString().split('T')[0]}">
      </div>
      
      <div class="booking-field">
        <label for="booking-time">Preferred Time *</label>
        <select id="booking-time" required>
          <option value="">Select a time</option>
          <option value="09:00">9:00 AM</option>
          <option value="09:30">9:30 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="10:30">10:30 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="11:30">11:30 AM</option>
          <option value="12:00">12:00 PM</option>
          <option value="12:30">12:30 PM</option>
          <option value="13:00">1:00 PM</option>
          <option value="13:30">1:30 PM</option>
          <option value="14:00">2:00 PM</option>
          <option value="14:30">2:30 PM</option>
          <option value="15:00">3:00 PM</option>
          <option value="15:30">3:30 PM</option>
          <option value="16:00">4:00 PM</option>
          <option value="16:30">4:30 PM</option>
          <option value="17:00">5:00 PM</option>
        </select>
      </div>
      
      <div class="booking-field">
        <label for="booking-notes">Notes (optional)</label>
        <textarea id="booking-notes" rows="2" placeholder="Any special requests..."></textarea>
      </div>
      
      <button type="submit" id="booking-submit">Book Appointment</button>
    </form>
    
    <div id="booking-success">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <h3>Booking Confirmed!</h3>
      <p>Your confirmation code:</p>
      <p class="code" id="confirmation-code"></p>
      <p style="margin-top: 16px; font-size: 14px;">We'll send you a confirmation email shortly.</p>
    </div>
  </div>
</div>

<script>
  const WEBSITE_ID = '${config.websiteId}';
  
  function openBookingModal() {
    document.getElementById('booking-modal').classList.add('open');
    trackEvent('booking_click');
  }
  
  function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('open');
  }
  
  document.getElementById('booking-modal').addEventListener('click', function(e) {
    if (e.target === this) closeBookingModal();
  });
  
  async function submitBooking(e) {
    e.preventDefault();
    const btn = document.getElementById('booking-submit');
    btn.disabled = true;
    btn.textContent = 'Booking...';
    
    try {
      const response = await fetch('/api/cold-call/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: WEBSITE_ID,
          serviceId: document.getElementById('booking-service')?.value || null,
          customerName: document.getElementById('booking-name').value,
          customerEmail: document.getElementById('booking-email').value,
          customerPhone: document.getElementById('booking-phone').value || null,
          date: document.getElementById('booking-date').value,
          startTime: document.getElementById('booking-time').value,
          notes: document.getElementById('booking-notes').value || null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      document.getElementById('booking-form').style.display = 'none';
      document.getElementById('confirmation-code').textContent = data.confirmationCode;
      document.getElementById('booking-success').classList.add('show');
      trackEvent('booking_created');
    } catch (error) {
      alert(error.message || 'Failed to book. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Book Appointment';
    }
  }
</script>
` : ''}

<script>
  // Analytics tracking
  const WEBSITE_ID = '${config.websiteId}';
  let tracked = false;
  
  function trackEvent(event) {
    fetch('/api/cold-call/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ websiteId: WEBSITE_ID, event }),
    }).catch(() => {});
  }
  
  // Track page view
  if (!tracked) {
    tracked = true;
    trackEvent('page_view');
    if (!sessionStorage.getItem('visited_' + WEBSITE_ID)) {
      sessionStorage.setItem('visited_' + WEBSITE_ID, '1');
      trackEvent('unique_visitor');
    }
  }
  
  // Track phone clicks
  document.querySelectorAll('a[href^="tel:"]').forEach(el => {
    el.addEventListener('click', () => trackEvent('phone_click'));
  });
  
  // Track chat opens (if chatbot exists)
  const originalToggleChat = window.toggleChat;
  if (typeof originalToggleChat === 'function') {
    window.toggleChat = function() {
      trackEvent('chat_open');
      originalToggleChat();
    };
  }
</script>
`

  // Inject before closing body tag
  return html.replace('</body>', bookingWidgetScript + '</body>')
}

export async function generateMetadata({ params }: Props) {
  const website = await (client as any).generatedWebsite.findUnique({
    where: { id: params.id },
    include: { ColdCallLead: true },
  })

  if (!website) {
    return { title: 'Preview Not Found' }
  }

  return {
    title: `${website.ColdCallLead?.businessName} - Website Preview`,
    description: `Preview website for ${website.ColdCallLead?.businessName}`,
  }
}
