 // +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
//移动端商城API 网络接口修改此配置，小程序域名要求https 例如：https://xxx
 let domain = 'http://114.55.14.245:8081'

/** 去掉末尾 /，便于拼接 /pages/... */
function trimTrailingSlash(u) {
	if (u === undefined || u === null || u === '') return ''
	return String(u).replace(/\/+$/, '')
}

/**
 * H5 前端访问根地址（开发机或正式 CDN）。
 * 非空时覆盖接口返回的 frontDomain，避免后台配错端口（如 9527）导致分享/跳转错误。
 */
const H5_FRONT_URL_RAW = 'http://192.168.5.131:8080'
/**
 * 分销海报二维码落地根地址（用户扫码打开的公网 H5，需与线上部署一致）。
 * 非空时优先用于海报/分享链接；置空则回退 H5_FRONT_URL、再回退接口 frontDomain。
 */
const H5_SPREAD_QR_BASE_RAW = 'http://114.55.14.245:8088'

module.exports = {
	// 请求域名 格式： https://您的域名
	HTTP_REQUEST_URL:domain,
	// H5 根地址与分销扫码落地（见上方注释）
	H5_FRONT_URL: trimTrailingSlash(H5_FRONT_URL_RAW),
	H5_SPREAD_QR_BASE: trimTrailingSlash(H5_SPREAD_QR_BASE_RAW),
	// #ifdef MP || APP-PLUS
	// H5商城地址
	HTTP_H5_URL: 'http://h5.xxx.com',
	// #endif
	HEADER:{
		'content-type': 'application/json'
	},
	HEADERPARAMS:{
		'content-type': 'application/x-www-form-urlencoded'
	},
	// 回话密钥名称 请勿修改此配置
	TOKENNAME: 'Authori-zation',
	// 缓存时间 0 永久
	EXPIRE:0,
	//分页最多显示条数
	LIMIT: 10
};
