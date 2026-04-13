import {
	formatTherapistAgeLabel,
	formatTherapistSex,
	formatTherapistSkill
} from '@/utils/therapistFields.js';

/**
 * 理疗师列表卡片展示逻辑（与 pages/physio/index 一致，供 physioTherapistCardList 组件使用）
 */
export default {
	methods: {
		formatTherapistAgeLabel,
		formatTherapistSex,
		formatTherapistSkill,
		ribbonMeta(item, index) {
			if (this.newcomerBadge(item)) {
				return { text: '新人', cls: 'rb-new' };
			}
			return index % 2 === 0
				? { text: '免车费', cls: 'rb-free' }
				: { text: '新人', cls: 'rb-new' };
		},
		statPrimary(item) {
			const s = item && item.score;
			if (s != null && Number(s) > 0) {
				return '★' + Number(s).toFixed(1) + ' 好评';
			}
			return '暂无评分';
		},
		showPromoRow(item, index) {
			const r = this.ribbonMeta(item, index);
			return (r && r.cls === 'rb-free') || index % 3 === 0;
		},
		badgeTags(item, index) {
			const arr = [];
			const s = item && item.score;
			if (s != null && Number(s) >= 4.8) arr.push('百分百好评');
			const rt = item && item.responseTime;
			if (rt != null && Number(rt) > 0 && Number(rt) <= 30) arr.push('回复超快');
			if (this.newcomerBadge(item)) arr.push('新人');
			if (index % 3 === 0) arr.push('特惠技师');
			return arr;
		},
		reviewPreview(item) {
			const s = item && item.selfInfo ? String(item.selfInfo).trim() : '';
			if (s) {
				return s.length > 26 ? s.slice(0, 26) + '…' : s;
			}
			return '小姐姐，实体店出来的手法非常专业';
		},
		distanceLine(item) {
			if (item && item.distance) {
				return String(item.distance);
			}
			return '直线≤1km';
		},
		therapistAvatarSrc(item) {
			const p = item && item.picture;
			if (p && String(p).trim()) {
				const u = this.resolveImgUrl(String(p).trim());
				if (u) return u;
			}
			const raw = this.$Cache.get('imgHost') || '';
			if (!raw) return '/static/images/f.png';
			const host = raw.replace(/\/?$/, '/');
			return `${host}crmebimage/presets/morenT.png`;
		},
		resolveImgUrl(url) {
			if (!url) return '';
			if (/^https?:\/\//i.test(url)) return url;
			const raw = this.$Cache.get('imgHost') || '';
			if (!raw) return url;
			const base = raw.replace(/\/?$/, '');
			return url.startsWith('/') ? base + url : `${base}/${url}`;
		},
		newcomerBadge(item) {
			const n = Number(item && item.treatNum);
			return !isNaN(n) && n > 0 && n <= 8;
		},
		areaLine(item) {
			if (!item) return '';
			const d = (item.district || '').trim();
			const c = (item.city || '').trim();
			if (d) return d + '附近';
			if (c) return c + ' · 可预约';
			return '';
		},
		availLine(item) {
			const rt = item && item.responseTime;
			if (rt == null || rt === '' || Number(rt) === 0) return '';
			if (Number(rt) <= 60) return '1小时内可约';
			return '';
		},
		responseMini(item) {
			const rt = item && item.responseTime;
			if (rt == null || rt === '' || Number(rt) === 0) return '';
			if (Number(rt) > 60) return `约${rt}分钟内响应`;
			return '';
		}
	}
};
