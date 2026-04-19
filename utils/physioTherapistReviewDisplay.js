/**
 * 理疗师评价列表行展示（详情页 / 评价列表页共用）
 */

export function formatPhysioReviewCnDate(iso) {
	if (!iso) return '';
	const d = String(iso).split(' ')[0];
	const parts = d.split('-');
	if (parts.length >= 3) {
		const y = parts[0];
		const m = Number(parts[1]);
		const day = Number(parts[2]);
		return `${y}年${m}月${day}日`;
	}
	return d;
}

export function parsePhysioReviewPics(pics, resolveImgUrl) {
	if (!pics) return [];
	if (Array.isArray(pics)) {
		return pics.map((p) => resolveImgUrl(p)).filter(Boolean);
	}
	return String(pics)
		.split(',')
		.map((item) => resolveImgUrl(item.trim()))
		.filter(Boolean);
}

function scoreNumText(v) {
	const n = Number(v);
	if (!Number.isFinite(n) || n <= 0) return '5.0';
	return n.toFixed(1);
}

/** @param {Function} resolveImgUrl @param {string} defaultAvatar */
export function mapPhysioReplyToRow(item, resolveImgUrl, defaultAvatar) {
	const star = Number(item.star);
	const starNum = Number.isFinite(star) && star > 0 ? Math.min(5, Math.round(star)) : 5;
	const eff = Number(item.effectStar != null ? item.effectStar : item.professionalStar);
	const pro = Number(item.professionalStar);
	const srv = Number(item.serviceStar);
	const labels = [];
	if (Number.isFinite(eff) && eff >= 4) labels.push('体验很棒');
	if (Number.isFinite(pro) && pro >= 4) labels.push('技师专业');
	if (Number.isFinite(srv) && srv >= 4) labels.push('态度好');
	if (!labels.length && starNum >= 4) labels.push('总体满意');
	const c = (item.comment || '').trim();
	if (/准时|按时|准点/.test(c)) labels.push('准时到达');
	if (/性价比|实惠|划算/.test(c)) labels.push('性价比高');
	if (/耐心/.test(c)) labels.push('耐心');
	if (/高大|环境|高端/.test(c)) labels.push('高大上');

	return {
		...item,
		userName: item.isAnonymous ? '匿名评价' : (item.nickname || '用户'),
		userAvatar: resolveImgUrl(item.avatar) || defaultAvatar,
		commentText: c || '用户未填写文字评价',
		starText: `${'★'.repeat(starNum)}${'☆'.repeat(5 - starNum)}`,
		metricText: `总分${scoreNumText(item.star)}星 手法${scoreNumText(
			item.effectStar != null ? item.effectStar : item.professionalStar
		)}星 服务${scoreNumText(item.serviceStar)}星`,
		metricTextShort: `总分${scoreNumText(item.star)} 手法${scoreNumText(
			item.effectStar != null ? item.effectStar : item.professionalStar
		)} 服务${scoreNumText(item.serviceStar)}`,
		labelTags: labels.filter((x, i, a) => a.indexOf(x) === i).slice(0, 6),
		createTimeDate: formatPhysioReviewCnDate(item.createTime),
		picList: parsePhysioReviewPics(item.pics, resolveImgUrl)
	};
}

/** 中医师评价列表行（与 pages/clinic/doctor/detail 预览区一致） */
export function mapDoctorTcmReplyToRow(item, resolveImgUrl, defaultAvatar) {
	const star = Number(item.star);
	const starNum = Number.isFinite(star) && star > 0 ? Math.min(5, Math.round(star)) : 5;
	const eff = Number(item.effectStar);
	const pro = Number(item.professionalStar);
	const srv = Number(item.serviceStar);
	const labels = [];
	if (Number.isFinite(eff) && eff >= 4) labels.push('疗效好');
	if (Number.isFinite(pro) && pro >= 4) labels.push('医生专业');
	if (Number.isFinite(srv) && srv >= 4) labels.push('态度好');
	if (!labels.length && starNum >= 4) labels.push('总体满意');
	const c = (item.comment || '').trim();
	if (/准时|按时|准点/.test(c)) labels.push('准时到达');
	if (/耐心/.test(c)) labels.push('耐心');
	if (/高大|环境|高端/.test(c)) labels.push('高大上');

	return {
		...item,
		userName: item.isAnonymous ? '匿名用户' : (item.nickname || '用户'),
		userAvatar: resolveImgUrl(item.avatar) || defaultAvatar,
		commentText: c || '用户未填写文字评价',
		starText: `${'★'.repeat(starNum)}${'☆'.repeat(5 - starNum)}`,
		metricText: `总分${scoreNumText(item.star)}星 疗效${scoreNumText(item.effectStar)}星 服务${scoreNumText(item.serviceStar)}星`,
		metricTextShort: `总分${scoreNumText(item.star)} 疗效${scoreNumText(item.effectStar)} 服务${scoreNumText(item.serviceStar)}`,
		labelTags: labels.filter((x, i, a) => a.indexOf(x) === i).slice(0, 6),
		createTimeDate: formatPhysioReviewCnDate(item.createTime),
		picList: parsePhysioReviewPics(item.pics, resolveImgUrl)
	};
}
