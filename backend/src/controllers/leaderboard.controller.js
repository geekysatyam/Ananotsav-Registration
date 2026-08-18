// REFERRAL DISABLED
import Registration from '../models/Registration.model.js';
import { success } from '../utils/apiResponse.js';

export async function getLeaderboard(req, res) {
  // const rows = await Registration.find({ wantsReferral: true })
  //   .sort({ referralCount: -1 })
  //   .limit(50)
  //   .select('fullName referralCount');
  //
  // const data = rows.map((row, index) => ({
  //   rank: index + 1,
  //   fullName: row.fullName,
  //   referralCount: row.referralCount,
  // }));
  //
  // return success(res, data);
  return success(res, []);
}
