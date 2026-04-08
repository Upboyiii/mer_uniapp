/**
 * 理疗师详情页预填（与 detail.vue 读取逻辑一致）
 * 列表跳转只带 therapistId、mchId，完整 item 存本地，避免 URL 过长
 */
export const THERAPIST_DETAIL_PREFILL_KEY = 'therapist_detail_prefill_';

export function setTherapistDetailPrefill(item) {
	if (!item || item.id == null) return;
	try {
		uni.setStorageSync(THERAPIST_DETAIL_PREFILL_KEY + item.id, JSON.stringify(item));
	} catch (e) {}
}
