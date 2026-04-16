/**
 * 预约评价：与列表/详情共用「是否已评」判断（接口字段 + 本地缓存）
 * category: 'physio' | 'tcm'
 */
export function isAppointmentReviewSubmitted(category, appointmentId, row) {
  if (!row) return false;
  const raw =
    row.hasReply ||
    row.isReply ||
    row.replyId ||
    row.evaluated ||
    row.isEvaluated;
  if (raw === true || raw === 1 || raw === '1') return true;
  if (row.replyStatus != null && Number(row.replyStatus) === 1) return true;
  if (appointmentId == null || appointmentId === '') return false;
  try {
    const k = `apt_reply_${category}_${appointmentId}`;
    return uni.getStorageSync(k) === '1';
  } catch (e) {
    return false;
  }
}

/** 预约已完成：理疗/中医均为 status === 2 */
export function isAppointmentStatusCompleted(status) {
  return Number(status) === 2;
}

/** 是否可评价：已支付 + 已完成 + 未评 */
export function canSubmitAppointmentReview(category, row) {
  if (!row) return false;
  if (Number(row.payStatus) !== 1) return false;
  if (!isAppointmentStatusCompleted(row.status)) return false;
  const id = row.id != null ? row.id : row.appointmentId;
  return !isAppointmentReviewSubmitted(category, id, row);
}
