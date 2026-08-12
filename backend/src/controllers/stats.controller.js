import Registration from '../models/Registration.model.js';
import { success } from '../utils/apiResponse.js';

export async function getRegistrantCount(req, res) {
  const totalRegistrants = await Registration.countDocuments({});
  return success(res, { totalRegistrants });
}
