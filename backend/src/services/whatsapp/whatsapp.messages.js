import config from '../../config/env.js';

/**
 * Caption for registration confirmation + Entry QR image.
 * No DOB, IDs, HMAC, or other sensitive internals.
 */
export function buildRegistrationCaption({ fullName, entryCode, totalPeople }) {
  const findUrl = config.publicAppUrl
    ? `${config.publicAppUrl}/find`
    : '/find';

  const lines = [
    `Hare Krishna ${fullName} 🙏`,
    '',
    'Hari Bol!!',
    '',
    'Your Anandotsav 2026 registration has been successfully completed.',
    '',
    `Entry Code: ${entryCode}`,
    '',
    `Date: ${config.whatsapp.eventDate}`,
    `Venue: ${config.whatsapp.eventVenue}`,
    '',
    'Please keep this QR safe and show it at the entry desk on the event day.',
  ];

  if (totalPeople > 1) {
    lines.push(
      '',
      `Your registration includes ${totalPeople} people.`,
      '',
      'Your primary Entry Pass is attached above.',
      '',
      'You can view/recover all family passes from:',
      findUrl,
    );
  }

  return lines.join('\n');
}
