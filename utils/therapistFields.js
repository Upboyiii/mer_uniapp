/**
 * 理疗师列表/详情共用：年龄、性别、擅长（与接口 Therapist 字段一致）
 * sex：0 未知 1 男 2 女 3 保密
 */

function parseAgeYearsFromIdcard(idcard) {
	if (!idcard) return null;
	const s = String(idcard).trim();
	const m = s.match(/^\d{6}(\d{8})\d{3}[\dXx]$/);
	if (!m) return null;
	const ymd = m[1];
	const y = parseInt(ymd.slice(0, 4), 10);
	const mo = parseInt(ymd.slice(4, 6), 10) - 1;
	const d = parseInt(ymd.slice(6, 8), 10);
	const birth = new Date(y, mo, d);
	if (isNaN(birth.getTime())) return null;
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const md = today.getMonth() - birth.getMonth();
	if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
	return age >= 0 && age < 120 ? age : null;
}

/** @returns {number|null} 周岁 */
export function parseTherapistAgeYears(item) {
	if (!item) return null;
	const a = item.age;
	if (a != null && a !== '' && !isNaN(Number(a))) {
		const n = Math.floor(Number(a));
		if (n > 0 && n < 120) return n;
	}
	return parseAgeYearsFromIdcard(item.idcardNum);
}

export function formatTherapistAgeLabel(item) {
	const n = parseTherapistAgeYears(item);
	return n != null ? `${n}岁` : '';
}

export function formatTherapistSex(item) {
	const s = item && item.sex;
	if (s === 1) return '男';
	if (s === 2) return '女';
	if (s === 3) return '保密';
	return '';
}

/** 擅长：优先 specialization，否则 hospitalDomain（接口文档称擅长领域介绍） */
export function formatTherapistSkill(item) {
	if (!item) return '';
	const a = (item.specialization || '').trim();
	const b = (item.hospitalDomain || '').trim();
	return a || b;
}
