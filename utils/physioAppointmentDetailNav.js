/**
 * 理疗预约详情页导航参数（与 physio_appointment_detail 读取一致）
 * 列表跳转只存本地，避免 URL 过长、编码问题
 */
export const PHYSIO_APPT_DETAIL_NAV_KEY = 'physio_appointment_detail_nav';

/**
 * @param {{ appointmentId: number|string, mchId?: number|string, therapistName?: string }} payload
 */
export function setPhysioAppointmentDetailNav(payload) {
	if (!payload || payload.appointmentId == null) return;
	try {
		uni.setStorageSync(PHYSIO_APPT_DETAIL_NAV_KEY, JSON.stringify(payload));
	} catch (e) {}
}

/** 读取并清除（一次跳转一次消费，避免返回再进读到旧数据） */
export function consumePhysioAppointmentDetailNav() {
	try {
		const raw = uni.getStorageSync(PHYSIO_APPT_DETAIL_NAV_KEY);
		if (raw) {
			uni.removeStorageSync(PHYSIO_APPT_DETAIL_NAV_KEY);
			return JSON.parse(raw);
		}
	} catch (e) {
		try {
			uni.removeStorageSync(PHYSIO_APPT_DETAIL_NAV_KEY);
		} catch (e2) {}
	}
	return null;
}
