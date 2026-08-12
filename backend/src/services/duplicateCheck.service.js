import Registration from '../models/Registration.model.js';

export async function checkDuplicates(people) {
  const duplicates = [];

  for (const person of people) {
    if (!person.phone || !person.dob) continue;

    const existing = await Registration.findOne({
      phone: person.phone,
      dob: person.dob,
    });

    if (existing) {
      duplicates.push({
        name: person.fullName || person.name,
        matchedRegistrationId: existing._id,
        suggestion: 'use-find-my-registration',
      });
    }
  }

  return duplicates;
}
