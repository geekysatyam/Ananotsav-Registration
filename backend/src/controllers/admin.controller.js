import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import config from '../config/env.js';
import Registration from '../models/Registration.model.js';
import { success, error } from '../utils/apiResponse.js';
import { createRegistrationBatch } from '../services/registration.service.js';

export async function adminLogin(req, res) {
  const { username, password } = req.validated;

  if (username !== config.adminUsername) {
    return error(res, 'INVALID_CREDENTIALS', 'Invalid credentials', 401);
  }

  const valid = await bcrypt.compare(password, config.adminPasswordHash);
  if (!valid) {
    return error(res, 'INVALID_CREDENTIALS', 'Invalid credentials', 401);
  }

  const token = jwt.sign(
    { sub: config.adminUsername, role: 'admin', jti: nanoid() },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry },
  );
  return success(res, { token });
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
