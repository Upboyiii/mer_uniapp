/**
 * 理疗预约下单页（physio_book）导航参数
 * 首页理疗专区、理疗 Tab、门店列表、详情「预约」等统一先写入再跳转，避免 query 过长
 */
export const PHYSIO_BOOK_NAV_KEY = 'physio_book_nav';

/**
 * @param {{ therapistId: number|string, mchId: number|string, name?: string, domain?: string, picture?: string, preselectedCategoryId?: number|string }} payload
 */
export function setPhysioBookNav(payload) {
	if (!payload || payload.therapistId == null || payload.therapistId === '') return;
	try {
		uni.setStorageSync(PHYSIO_BOOK_NAV_KEY, JSON.stringify(payload));
	} catch (e) {}
}

export function consumePhysioBookNav() {
	try {
		const raw = uni.getStorageSync(PHYSIO_BOOK_NAV_KEY);
		if (raw) {
			uni.removeStorageSync(PHYSIO_BOOK_NAV_KEY);
			return JSON.parse(raw);
		}
	} catch (e) {
		try {
			uni.removeStorageSync(PHYSIO_BOOK_NAV_KEY);
		} catch (e2) {}
	}
	return null;
}
