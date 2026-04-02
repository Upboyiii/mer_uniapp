/**
 * 医生评分展示：不经过 parseFloat 等浮点运算，避免 4.95 显示成 5.0。
 * - 接口为 string（如 "4.95"）时按字符串去尾零后展示
 * - 接口为 number 时先用 toFixed(4) 定长再按字符串去尾零
 */

function stripTrailingZerosFromDecimalString(str) {
	if (!str || typeof str !== 'string') return '';
	if (!str.includes('.')) return str;
	const parts = str.split('.');
	const intPart = parts[0] || '0';
	let decPart = parts[1] || '';
	decPart = decPart.replace(/0+$/, '');
	return decPart === '' ? intPart : `${intPart}.${decPart}`;
}

export function formatDoctorScoreDisplay(score) {
	if (score === null || score === undefined || score === '') return '';

	if (typeof score === 'string') {
		const raw = score.trim();
		if (raw === '') return '';
		if (!/^-?\d+(\.\d+)?$/.test(raw)) return raw;
		return stripTrailingZerosFromDecimalString(raw);
	}

	if (typeof score === 'number' && Number.isFinite(score)) {
		const raw = score.toFixed(4);
		return stripTrailingZerosFromDecimalString(raw);
	}

	return String(score);
}
