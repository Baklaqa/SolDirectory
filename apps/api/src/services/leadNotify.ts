import Notification from '../models/Notification.js';
import { EmailService } from './email.service.js';
import { SmsService } from './sms.service.js';

/**
 * Tells a member provider about an enquiry that was matched or shared with them: an email with the brief only (the
 * requester's name and contact details come with an unlock), an optional text, and an in-app notification. Never throws.
 */
export async function notifyProviderOfLead(lead: any, provider: any): Promise<void> {
  const origin = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').replace(/\/$/, '');
  const dashboardUrl = `${origin}/leads/${lead._id}`;
  try {
    if (provider.intakeEmail) {
      await EmailService.sendProviderLeadTeaser(provider.intakeEmail, lead.need, lead.suburb, dashboardUrl);
    }
    await SmsService.sendToProvider(provider, `SolDirectory: new request for ${lead.need} in ${lead.suburb}, ${lead.fundingType}. View: ${dashboardUrl}`);
    if (provider.userId) {
      await Notification.create({ userId: provider.userId, type: 'new_lead', message: `New ${lead.need} request in ${lead.suburb}`, link: `/leads/${lead._id}` });
    }
  } catch (err) {
    console.error('[leadNotify] could not notify provider:', err);
  }
}
