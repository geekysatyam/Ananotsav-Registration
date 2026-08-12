import Registration from '../models/Registration.model.js';
import { success } from '../utils/apiResponse.js';

export async function validateReferral(req, res) {
  const code = req.params.code;
  const referrer = await Registration.findOne({ referralCode: code, wantsReferral: true });
  return success(res, { valid: !!referrer });
}
