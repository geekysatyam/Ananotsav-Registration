import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import config from '../config/env.js';
import Admin from '../models/Admin.model.js';
import Registration from '../models/Registration.model.js';
import { success, error } from '../utils/apiResponse.js';
import { createRegistrationBatch } from '../services/registration.service.js';
import { pagesForRole, DESK_PAGES } from '../constants/adminPages.js';

function shapeAdminUser(doc) {
  const pages = pagesForRole(doc.role, doc.pages);
  return {
    id: doc._id.toString(),
    username: doc.username,
    role: doc.role,
    pages,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function adminLogin(req, res) {
  const { username, password } = req.validated;
  const normalized = username.trim().toLowerCase();

  const admin = await Admin.findOne({ username: normalized });
  if (!admin || !admin.isActive) {
    return error(res, 'INVALID_CREDENTIALS', 'Invalid credentials', 401);
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return error(res, 'INVALID_CREDENTIALS', 'Invalid credentials', 401);
  }

  const pages = pagesForRole(admin.role, admin.pages);
  const token = jwt.sign(
    {
      sub: admin._id.toString(),
      role: admin.role,
      pages,
      tokenVersion: admin.tokenVersion,
      jti: nanoid(),
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry },
  );

  return success(res, {
    token,
    admin: {
      id: admin._id.toString(),
      username: admin.username,
      role: admin.role,
      pages,
    },
  });
}

export async function adminMe(req, res) {
  return success(res, {
    id: req.admin.id,
    username: req.admin.username,
    role: req.admin.role,
    pages: req.admin.pages,
  });
}

export async function listAdmins(req, res) {
  const rows = await Admin.find().sort({ createdAt: 1 }).lean();
  return success(res, { rows: rows.map(shapeAdminUser) });
}

export async function createAdmin(req, res) {
  const { username, password, role, pages } = req.validated;
  const normalized = username.trim().toLowerCase();

  const existing = await Admin.findOne({ username: normalized });
  if (existing) {
    return error(res, 'USERNAME_TAKEN', 'Username already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const effectivePages = role === 'desk' ? DESK_PAGES : (pages ?? []).filter((p) => p !== 'admins');

  const doc = await Admin.create({
    username: normalized,
    passwordHash,
    role,
    pages: role === 'admin' ? effectivePages : [],
    createdBy: req.admin.id,
  });

  return success(res, shapeAdminUser(doc), 201);
}

export async function updateAdmin(req, res) {
  const { id } = req.params;
  const patch = req.validated;

  const admin = await Admin.findById(id);
  if (!admin) {
    return error(res, 'NOT_FOUND', 'Admin not found', 404);
  }
  if (admin.role === 'super_admin') {
    return error(res, 'FORBIDDEN', 'Cannot modify super_admin via this endpoint', 403);
  }
  if (admin._id.toString() === req.admin.id && patch.isActive === false) {
    return error(res, 'FORBIDDEN', 'Cannot deactivate your own account', 403);
  }

  if (patch.role !== undefined) admin.role = patch.role;
  if (patch.isActive !== undefined) admin.isActive = patch.isActive;

  const nextRole = admin.role;
  if (nextRole === 'desk') {
    admin.pages = [];
  } else if (patch.pages !== undefined) {
    admin.pages = patch.pages.filter((p) => p !== 'admins');
  }

  if (patch.password) {
    admin.passwordHash = await bcrypt.hash(patch.password, 10);
    admin.tokenVersion += 1;
  }
  if (patch.isActive === false) {
    admin.tokenVersion += 1;
  }

  await admin.save();
  return success(res, shapeAdminUser(admin));
}

function formatDob(date) {
  if (!date) return '';
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shapeAdminRow(doc) {
  return {
    id: doc._id.toString(),
    fullName: doc.fullName,
    phone: doc.phone ?? '',
    dob: formatDob(doc.dob),
    city: doc.city ?? '',
    checkedIn: doc.checkedIn,
    entryCode: doc.entryCode,
    registrationSource: doc.registrationSource,
    createdAt: doc.createdAt,
  };
}

function buildListFilter({ search, checkedIn }) {
  const filter = {};
  if (checkedIn === 'true') filter.checkedIn = true;
  if (checkedIn === 'false') filter.checkedIn = false;
  if (search) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ fullName: re }, { phone: re }, { city: re }, { entryCode: re }];
  }
  return filter;
}

export async function listRegistrations(req, res) {
  const { search, checkedIn, page, limit } = req.validated;
  const filter = buildListFilter({ search, checkedIn });
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Registration.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Registration.countDocuments(filter),
  ]);

  return success(res, {
    rows: rows.map(shapeAdminRow),
    total,
    page,
    limit,
  });
}

export async function exportRegistrations(req, res) {
  const { search, checkedIn } = req.validated;
  const filter = buildListFilter({ search, checkedIn });
  const rows = await Registration.find(filter).sort({ fullName: 1 }).lean();

  const header = ['Name', 'Phone', 'DOB', 'City'];
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [r.fullName, r.phone ?? '', formatDob(r.dob), r.city ?? '']
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ];

  const csv = `\uFEFF${lines.join('\r\n')}`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
  return res.status(200).send(csv);
}

function csvEscape(cell) {
  return `"${String(cell ?? '').replace(/"/g, '""')}"`;
}

function sendCsv(res, filename, header, rowArrays) {
  const lines = [header.join(','), ...rowArrays.map((cols) => cols.map(csvEscape).join(','))];
  const csv = `\uFEFF${lines.join('\r\n')}`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csv);
}

function buildSearchFilter(search) {
  if (!search) return {};
  const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return { $or: [{ fullName: re }, { phone: re }, { city: re }, { entryCode: re }] };
}

function shapeOptInRow(doc, extra = {}) {
  return {
    id: doc._id.toString(),
    fullName: doc.fullName,
    phone: doc.phone ?? '',
    city: doc.city ?? '',
    entryCode: doc.entryCode,
    createdAt: doc.createdAt,
    ...extra,
  };
}

async function listByFlag(req, res, flagField, mapRow) {
  const { search, page, limit } = req.validated;
  const filter = { [flagField]: true, isPrimaryRegistrant: true, ...buildSearchFilter(search) };
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Registration.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Registration.countDocuments(filter),
  ]);

  return success(res, {
    rows: rows.map(mapRow),
    total,
    page,
    limit,
  });
}

export async function listVolunteers(req, res) {
  return listByFlag(req, res, 'wantsVolunteer', (doc) => shapeOptInRow(doc));
}

export async function exportVolunteers(req, res) {
  const { search } = req.validated;
  const filter = { wantsVolunteer: true, isPrimaryRegistrant: true, ...buildSearchFilter(search) };
  const rows = await Registration.find(filter).sort({ fullName: 1 }).lean();
  return sendCsv(
    res,
    'volunteers.csv',
    ['Name', 'Phone', 'City', 'Entry Code', 'Registered At'],
    rows.map((r) => [r.fullName, r.phone ?? '', r.city ?? '', r.entryCode, r.createdAt?.toISOString?.() ?? '']),
  );
}

export async function listAbhishek(req, res) {
  return listByFlag(req, res, 'wantsPanchamritAbhishek', (doc) => shapeOptInRow(doc));
}

export async function exportAbhishek(req, res) {
  const { search } = req.validated;
  const filter = {
    wantsPanchamritAbhishek: true,
    isPrimaryRegistrant: true,
    ...buildSearchFilter(search),
  };
  const rows = await Registration.find(filter).sort({ fullName: 1 }).lean();
  return sendCsv(
    res,
    'panchamrit-abhishek.csv',
    ['Name', 'Phone', 'City', 'Entry Code', 'Registered At'],
    rows.map((r) => [r.fullName, r.phone ?? '', r.city ?? '', r.entryCode, r.createdAt?.toISOString?.() ?? '']),
  );
}

export async function listLadduGopal(req, res) {
  return listByFlag(req, res, 'wantsLadduGopal', (doc) =>
    shapeOptInRow(doc, { ladduGopalSize: doc.ladduGopalSize ?? '' }),
  );
}

export async function exportLadduGopal(req, res) {
  const { search } = req.validated;
  const filter = { wantsLadduGopal: true, isPrimaryRegistrant: true, ...buildSearchFilter(search) };
  const rows = await Registration.find(filter).sort({ fullName: 1 }).lean();
  return sendCsv(
    res,
    'laddu-gopal.csv',
    ['Name', 'Phone', 'City', 'Size', 'Entry Code', 'Registered At'],
    rows.map((r) => [
      r.fullName,
      r.phone ?? '',
      r.city ?? '',
      r.ladduGopalSize ?? '',
      r.entryCode,
      r.createdAt?.toISOString?.() ?? '',
    ]),
  );
}

function fancyDressNormalizeStage() {
  return {
    $addFields: {
      _fancyRows: {
        $cond: {
          if: { $gt: [{ $strLenCP: { $ifNull: ['$fancyDressParentPhone', ''] } }, 0] },
          then: [
            {
              childName: '$fullName',
              childDob: '$dob',
              getupDetail: {
                $ifNull: ['$fancyDressGetup', { $arrayElemAt: ['$fancyDressEntries.getupDetail', 0] }],
              },
              parentName: '',
              parentPhone: '$fancyDressParentPhone',
            },
          ],
          else: {
            $map: {
              input: { $ifNull: ['$fancyDressEntries', []] },
              as: 'e',
              in: {
                childName: '$$e.childName',
                childDob: '$$e.childDob',
                getupDetail: '$$e.getupDetail',
                parentName: '$fullName',
                parentPhone: '$phone',
              },
            },
          },
        },
      },
    },
  };
}

export async function listFancyDress(req, res) {
  const { search, page, limit } = req.validated;
  const match = { wantsFancyDress: true, isPrimaryRegistrant: true, ...buildSearchFilter(search) };
  const skip = (page - 1) * limit;

  const [agg, countAgg] = await Promise.all([
    Registration.aggregate([
      { $match: match },
      fancyDressNormalizeStage(),
      { $unwind: '$_fancyRows' },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          childName: '$_fancyRows.childName',
          childDob: '$_fancyRows.childDob',
          getupDetail: '$_fancyRows.getupDetail',
          parentName: '$_fancyRows.parentName',
          parentPhone: '$_fancyRows.parentPhone',
          city: 1,
          entryCode: 1,
          createdAt: 1,
        },
      },
    ]),
    Registration.aggregate([
      { $match: match },
      fancyDressNormalizeStage(),
      { $unwind: '$_fancyRows' },
      { $count: 'total' },
    ]),
  ]);

  const total = countAgg[0]?.total ?? 0;
  const rows = agg.map((r) => ({
    id: `${r._id}-${r.childName}-${formatDob(r.childDob)}`,
    childName: r.childName,
    childDob: formatDob(r.childDob),
    getupDetail: r.getupDetail ?? '',
    parentName: r.parentName || '—',
    parentPhone: r.parentPhone ?? '',
    city: r.city ?? '',
    entryCode: r.entryCode,
    createdAt: r.createdAt,
  }));

  return success(res, { rows, total, page, limit });
}

export async function exportFancyDress(req, res) {
  const { search } = req.validated;
  const match = { wantsFancyDress: true, isPrimaryRegistrant: true, ...buildSearchFilter(search) };
  const rows = await Registration.aggregate([
    { $match: match },
    fancyDressNormalizeStage(),
    { $unwind: '$_fancyRows' },
    { $sort: { fullName: 1 } },
    {
      $project: {
        childName: '$_fancyRows.childName',
        childDob: '$_fancyRows.childDob',
        getupDetail: '$_fancyRows.getupDetail',
        parentName: '$_fancyRows.parentName',
        parentPhone: '$_fancyRows.parentPhone',
        city: 1,
        entryCode: 1,
        createdAt: 1,
      },
    },
  ]);

  return sendCsv(
    res,
    'fancy-dress.csv',
    ['Child Name', 'Child DOB', 'Getup', 'Parent Name', 'Parent Phone', 'City', 'Entry Code', 'Registered At'],
    rows.map((r) => [
      r.childName,
      formatDob(r.childDob),
      r.getupDetail ?? '',
      r.parentName || '',
      r.parentPhone ?? '',
      r.city ?? '',
      r.entryCode,
      r.createdAt?.toISOString?.() ?? '',
    ]),
  );
}

/* REFERRAL DISABLED
export async function adminLeaderboard(req, res) {
  const { search, page, limit } = req.validated;
  const filter = { wantsReferral: true, ...buildSearchFilter(search) };
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Registration.find(filter)
      .sort({ referralCount: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .select('fullName phone referralCode referralCount city createdAt')
      .lean(),
    Registration.countDocuments(filter),
  ]);

  return success(res, {
    rows: rows.map((r, i) => ({
      rank: skip + i + 1,
      fullName: r.fullName,
      phone: r.phone ?? '',
      referralCode: r.referralCode,
      referralCount: r.referralCount ?? 0,
      city: r.city ?? '',
      createdAt: r.createdAt,
    })),
    total,
    page,
    limit,
  });
}

export async function exportAdminLeaderboard(req, res) {
  const { search } = req.validated;
  const filter = { wantsReferral: true, ...buildSearchFilter(search) };
  const rows = await Registration.find(filter)
    .sort({ referralCount: -1, createdAt: 1 })
    .select('fullName phone referralCode referralCount city')
    .lean();

  return sendCsv(
    res,
    'referral-leaderboard.csv',
    ['Rank', 'Name', 'Phone', 'Code', 'Referrals', 'City'],
    rows.map((r, i) => [
      i + 1,
      r.fullName,
      r.phone ?? '',
      r.referralCode ?? '',
      r.referralCount ?? 0,
      r.city ?? '',
    ]),
  );
}
*/

export async function deskRegister(req, res) {
  try {
    const { primary, members } = req.validated;
    const { familyGroupId, registrations } = await createRegistrationBatch({
      primary,
      members,
      registrationSourceOverride: 'desk-manual',
    });
    return success(res, { familyGroupId, registrations }, 201);
  } catch (err) {
    if (err.code === 'DUPLICATE_REGISTRATION') {
      return error(res, 'DUPLICATE_REGISTRATION', err.message, 409, {
        data: { duplicates: err.duplicates },
      });
    }
    throw err;
  }
}
