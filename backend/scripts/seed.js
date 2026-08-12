import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Registration from '../src/models/Registration.model.js';
import Counter from '../src/models/Counter.model.js';
import { buildSignedPayload } from '../src/services/hmac.service.js';

dotenv.config();

const EVENT_YEAR = Number(process.env.EVENT_YEAR || 2026);

function entryCode(seq) {
  return `JN${EVENT_YEAR}-${String(seq).padStart(5, '0')}`;
}

/** UTC date-only — matches HTML date inputs (YYYY-MM-DD) without timezone drift. */
function dob(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function primaryDoc(fields) {
  const doc = {
    fullName: fields.fullName,
    phone: fields.phone,
    dob: dob(fields.dob),
    city: fields.city ?? 'Pune',
    familyGroupId: fields.familyGroupId ?? null,
    isPrimaryRegistrant: true,
    entryCode: entryCode(fields.entrySeq),
    wantsReferral: fields.wantsReferral ?? false,
    referredBy: fields.referredBy ?? null,
    referralCount: fields.referralCount ?? 0,
    registrationSource: fields.registrationSource ?? 'web',
  };
  if (fields.referralCode) {
    doc.referralCode = fields.referralCode;
  }
  return doc;
}

function memberDoc(fields, primary) {
  const doc = {
    fullName: fields.fullName,
    dob: dob(fields.dob),
    city: primary.city ?? 'Pune',
    familyGroupId: primary.familyGroupId,
    isPrimaryRegistrant: false,
    entryCode: entryCode(fields.entrySeq),
    wantsReferral: false,
    referredBy: null,
    referralCount: 0,
    registrationSource: primary.registrationSource ?? 'web',
  };
  if (fields.phone) {
    doc.phone = fields.phone;
  }
  return doc;
}

const seedData = [
  {
    primary: {
      fullName: 'Radhika Iyer',
      phone: '9876543210',
      dob: '1992-04-18',
      wantsReferral: true,
      referralCode: 'Murari219',
      referralCount: 3,
      entrySeq: 1,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Aarav Deshmukh',
      phone: '9876543211',
      dob: '1990-08-03',
      wantsReferral: true,
      referralCode: 'Gopal482',
      referralCount: 2,
      entrySeq: 2,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Meera Nair',
      phone: '9876543212',
      dob: '1995-01-22',
      wantsReferral: true,
      referralCode: 'Kanha667',
      referralCount: 1,
      entrySeq: 3,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Ram Sharma',
      phone: '9876543213',
      dob: '1994-03-12',
      wantsReferral: true,
      referralCode: 'Shyam331',
      referralCount: 5,
      entrySeq: 4,
      familyGroupId: 'famSharma01',
    },
    members: [
      { fullName: 'Sita Sharma', dob: '1996-07-02', entrySeq: 5 },
      { fullName: 'Gopal Sharma', dob: '2018-11-23', entrySeq: 6, phone: '9876543214' },
    ],
  },
  {
    primary: {
      fullName: 'Vivaan Sharma',
      phone: '9876543215',
      dob: '1988-06-15',
      wantsReferral: true,
      referralCode: 'Govinda451',
      referralCount: 0,
      entrySeq: 7,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Ananya Joshi',
      phone: '9876543216',
      dob: '1993-11-09',
      wantsReferral: true,
      referralCode: 'Hari773',
      referralCount: 0,
      entrySeq: 8,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Kabir Menon',
      phone: '9876543217',
      dob: '1991-02-28',
      wantsReferral: true,
      referralCode: 'Madhav118',
      referralCount: 0,
      entrySeq: 9,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Ishita Rao',
      phone: '9876543218',
      dob: '1997-05-14',
      wantsReferral: true,
      referralCode: 'Damodar904',
      referralCount: 0,
      entrySeq: 10,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Rohan Gupta',
      phone: '9876543219',
      dob: '1989-12-01',
      wantsReferral: true,
      referralCode: 'Murari335',
      referralCount: 0,
      entrySeq: 11,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Sanya Kulkarni',
      phone: '9876543220',
      dob: '1996-09-30',
      wantsReferral: true,
      referralCode: 'Keshav552',
      referralCount: 0,
      entrySeq: 12,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Dev Patel',
      phone: '9876543221',
      dob: '1994-07-07',
      wantsReferral: true,
      referralCode: 'BankeBihari609',
      referralCount: 0,
      entrySeq: 13,
    },
    members: [],
  },
  // Referred registrants — credits already reflected in referrer referralCount above
  {
    primary: {
      fullName: 'Priya Kulkarni',
      phone: '9876543222',
      dob: '1998-03-25',
      wantsReferral: false,
      referredBy: 'Murari219',
      registrationSource: 'referral-link',
      entrySeq: 14,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Arjun Pillai',
      phone: '9876543223',
      dob: '1993-06-10',
      wantsReferral: false,
      referredBy: 'Murari219',
      registrationSource: 'referral-link',
      entrySeq: 15,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Tara Bhatt',
      phone: '9876543224',
      dob: '1991-09-05',
      wantsReferral: false,
      referredBy: 'Murari219',
      registrationSource: 'referral-link',
      entrySeq: 16,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Neha Deshpande',
      phone: '9876543225',
      dob: '1994-01-15',
      wantsReferral: false,
      referredBy: 'Gopal482',
      registrationSource: 'referral-link',
      entrySeq: 17,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Kiran Joshi',
      phone: '9876543226',
      dob: '1987-11-20',
      wantsReferral: false,
      referredBy: 'Gopal482',
      registrationSource: 'referral-link',
      entrySeq: 18,
    },
    members: [],
  },
  {
    primary: {
      fullName: 'Aditi Rao',
      phone: '9876543227',
      dob: '1999-02-14',
      wantsReferral: false,
      referredBy: 'Kanha667',
      registrationSource: 'referral-link',
      entrySeq: 19,
    },
    members: [],
  },
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is required');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Registration.deleteMany({});
  await Counter.deleteMany({});
  try {
    await Registration.collection.dropIndex('referralCode_1');
  } catch {
    /* index may not exist yet */
  }
  await Registration.syncIndexes();

  const docs = [];
  let maxSeq = 0;

  for (const batch of seedData) {
    const primaryFields = batch.primary;
    const primary = primaryDoc(primaryFields);
    docs.push(primary);
    maxSeq = Math.max(maxSeq, primaryFields.entrySeq);

    for (const member of batch.members ?? []) {
      docs.push(memberDoc(member, primaryFields));
      maxSeq = Math.max(maxSeq, member.entrySeq);
    }
  }

  await Registration.insertMany(docs);
  await Counter.create({ _id: 'entryCode', seq: maxSeq });

  const total = await Registration.countDocuments();
  console.log(
    `Seeded ${total} registrations (entry codes JN${EVENT_YEAR}-00001 to JN${EVENT_YEAR}-${String(maxSeq).padStart(5, '0')})`,
  );

  console.log('\n--- Test credentials ---');
  console.log('Find My Registration (Ram Sharma, family primary):');
  console.log('  phone: 9876543213');
  console.log('  dob:   1994-03-12');
  console.log('\nFind My Registration (Radhika Iyer):');
  console.log('  phone: 9876543210');
  console.log('  dob:   1992-04-18');
  console.log('\nValid referral codes to test: Murari219, Gopal482, Kanha667, Shyam331');
  console.log('\nSample signed payloads for scanner:');
  const ram = await Registration.findOne({ entryCode: entryCode(4) });
  const sita = await Registration.findOne({ entryCode: entryCode(5) });
  if (ram) console.log(`  ${ram.fullName}: ${buildSignedPayload(ram.entryCode)}`);
  if (sita) console.log(`  ${sita.fullName}: ${buildSignedPayload(sita.entryCode)}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
