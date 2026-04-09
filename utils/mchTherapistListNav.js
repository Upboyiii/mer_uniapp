/**
 * 门店内理疗师列表页（therapist/mch_list）导航参数
 * 避免 URL 带 ?mchId= 在 H5/分享场景出问题，与 physio_book、预约详情一致走本地存储
 */
export const MCH_THERAPIST_LIST_NAV_KEY = 'mch_therapist_list_nav';

/**
 * @param {{ mchId: number|string }} payload
 */
export function setMchTherapistListNav(payload) {
	if (!payload || payload.mchId == null || payload.mchId === '') return;
	try {
		uni.setStorageSync(MCH_THERAPIST_LIST_NAV_KEY, JSON.stringify(payload));
	} catch (e) {}
}

export function consumeMchTherapistListNav() {
	try {
		const raw = uni.getStorageSync(MCH_THERAPIST_LIST_NAV_KEY);
		if (raw) {
			uni.removeStorageSync(MCH_THERAPIST_LIST_NAV_KEY);
			return JSON.parse(raw);
		}
	} catch (e) {
		try {
			uni.removeStorageSync(MCH_THERAPIST_LIST_NAV_KEY);
		} catch (e2) {}
	}
	return null;
}
