<template>
	<view class="consult-book-page" :data-theme="theme">
		<view v-show="step === 1" class="step-panel step-1">
			<scroll-view scroll-y class="step-scroll" :style="{ paddingBottom: bottomPad }">
				<view class="consult-hero">
					<image
						class="hero-img"
						src="/static/images/consult_book_header.png"
						mode="widthFix"
					/>
					<view class="brand-header">
						<view class="brand-left">
							<image
								v-if="navLogoSrc"
								class="brand-home-logo"
								:src="navLogoSrc"
								mode="aspectFit"
							/>
							<text v-else class="brand-cn-fallback">乐康</text>
						</view>
						<text class="brand-slogan">隐私保护 · 真实医生 · 超时可退</text>
						<view class="brand-close" @click="closePage">
							<text class="iconfont icon-ic_close brand-close-ico"></text>
						</view>
					</view>
				</view>

				<view class="step-1-body">
				<view class="doctor-card">
					<image class="doc-avatar" :src="doctorAvatar" mode="aspectFill" />
					<view class="doc-meta">
						<text class="doc-name">{{ doctorName || '—' }}</text>
						<text class="doc-title line2" v-if="hospitalTitle || hospitalSub">
							{{ hospitalTitle }}{{ hospitalTitle && hospitalSub ? ' | ' : '' }}{{ hospitalSub }}
						</text>
						<view class="hosp-line" v-if="hospitalName || hospitalLevel">
							<text v-if="hospitalLevel" class="tag-level">{{ hospitalLevel }}</text>
							<text class="hosp-name line2">{{ hospitalName }}</text>
						</view>
					</view>
				</view>

				<view class="info-block">
					<view class="info-row">
						<text class="info-label">问诊类型</text>
						<text class="info-val">{{ consultTypeLabel }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">问诊价格</text>
						<text class="info-val price">¥ {{ priceDisplay }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">服务时长</text>
						<text class="info-val">{{ durationLabel }}</text>
					</view>
				</view>

				<view class="section-title">选择就诊患者</view>
				<view class="add-patient" @click="onAddPatientHint">
					<text class="iconfont icon-ic_add add-ico"></text>
					<text class="add-txt">新增患者</text>
				</view>
				<view v-if="patientLoading" class="hint">加载就诊人...</view>
				<view v-else-if="!patientList.length" class="hint empty-hint">暂无关联就诊人，请先在个人中心维护就诊人信息</view>
				<view
					v-else
					class="patient-card"
					:class="{ selected: selectedPatientId === p.id }"
					v-for="p in patientList"
					:key="p.id"
					@click="selectedPatientId = p.id"
				>
					<view class="patient-card-body">
						<view class="pc-avatar-box">
							<image class="pc-avatar" :src="defaultAvatar" mode="aspectFill" />
						</view>
						<view class="pc-main">
							<view class="pc-head">
								<text class="pc-name">{{ p.name || '—' }}</text>
								<text v-if="p.relationType === 1" class="pc-tag">本人</text>
							</view>
							<view class="pc-sub-row">
								<text class="pc-sub">{{ sexLabel(p.sex) }}</text>
								<text class="pc-age" v-if="p.age != null">{{ p.age }}岁</text>
							</view>
						</view>
					</view>
				</view>
				</view>
			</scroll-view>

			<view class="footer footer-step1">
				<text class="legal">
					购买前请您仔细阅读
					<text class="legal-link">《互联网诊疗风险告知及同意书》</text>
					，继续代表您已知悉相关规则及同意相关条款。
				</text>
				<view class="footer-btn-row">
					<button class="footer-btn-confirm bg-color" :disabled="submitting" @click="confirmPatient">
						确认患者
					</button>
				</view>
			</view>
		</view>

		<view v-show="step === 2" class="step-panel step-2">
			<view class="step2-safe-top" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="pay-head">
				<text class="pay-title">挂号信息</text>
				<text class="pay-close iconfont icon-ic_close" @click="backToPatient"></text>
			</view>
			<scroll-view scroll-y class="step-scroll pay-scroll" :style="{ paddingBottom: bottomPad }">
				<view class="sheet-section">
					<view class="cell-row">
						<text class="cell-label">就诊医生</text>
						<text class="cell-val">{{ doctorName }}</text>
					</view>
					<view class="cell-row">
						<text class="cell-label">就诊科室</text>
						<text class="cell-val">{{ hospitalSub || '—' }}</text>
					</view>
					<view class="cell-row">
						<text class="cell-label">就诊类型</text>
						<text class="cell-val">{{ consultTypeLabel }}</text>
					</view>
				</view>

				<view class="sheet-section">
					<text class="sub-title">支付信息</text>
					<text class="pay-method-label">支付方式</text>
					<view class="pay-option" @click="payMethod = 'weixin'">
						<text class="po-name">微信支付</text>
						<text
							class="iconfont"
							:class="payMethod === 'weixin' ? 'icon-a-ic_CompleteSelect check' : 'icon-ic_unselect unsel'"
						></text>
					</view>
					<view class="pay-option" @click="payMethod = 'alipay'">
						<text class="po-name">支付宝支付</text>
						<text
							class="iconfont"
							:class="payMethod === 'alipay' ? 'icon-a-ic_CompleteSelect check' : 'icon-ic_unselect unsel'"
						></text>
					</view>
				</view>

				<view class="sheet-section fee-block">
					<view class="cell-row">
						<text class="cell-label">挂号费用</text>
						<text class="cell-val">¥{{ priceDisplay }}</text>
					</view>
					<view class="cell-row tap" @click="onDiscountTap">
						<text class="cell-label">优惠金额</text>
						<text class="cell-val danger">¥{{ discountDisplay }}</text>
						<text class="iconfont icon-ic_rightarrow chev"></text>
					</view>
					<view class="cell-row">
						<text class="cell-label">实际付费</text>
						<text class="cell-val danger strong">¥{{ actualPayDisplay }}</text>
					</view>
				</view>
			</scroll-view>

			<view class="footer footer-pay">
				<button class="footer-btn bg-color" :disabled="submitting" @click="submitPay">
					{{ submitting ? '处理中…' : `去支付 ¥${actualPayDisplay}` }}
				</button>
			</view>
		</view>

		<!-- #ifdef H5 -->
		<view v-if="formContent" class="alipaysubmit" v-html="formContent"></view>
		<!-- #endif -->
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import orderPay from '@/mixins/OrderPay.js';
import {
	getPatientIdentityListApi,
	doctorConsultationSaveApi,
	doctorConsultationPayApi,
	getDoctorConsultationListApi
} from '@/api/clinic.js';

const PREFILL_KEY = 'consult_book_prefill';

let app = getApp();

export default {
	mixins: [orderPay],
	data() {
		return {
			theme: app.globalData.theme,
			step: 1,
			doctorId: 0,
			consultType: 1,
			consultFee: 0,
			diseaseType: '',
			durationLabel: '48小时',
			doctorName: '',
			doctorPicture: '',
			hospitalTitle: '',
			hospitalSub: '',
			hospitalName: '',
			hospitalLevel: '',
			patientList: [],
			patientLoading: false,
			selectedPatientId: null,
			payMethod: 'weixin',
			discountAmount: 0,
			/** 确认患者后 save 返回的问诊单 id，去支付仅调 pay */
			consultationId: null,
			/** 与 loadPatients 并发去重，避免重复请求 */
			_patientLoadPromise: null,
			/** 跳过 onShow 首次触发，避免与 onLoad 重复拉取就诊人 */
			_consultBookSkipFirstShow: true,
			submitting: false,
			safeBottom: 0,
			statusBarHeight: 20,
			formContent: ''
		};
	},
	computed: {
		...mapGetters(['systemPlatform', 'globalData']),
		/** 与首页导航栏一致：login/config 的 logo / mobileLoginLogo */
		navLogoSrc() {
			const g = this.globalData || {};
			const u = g.logo || g.mobileLoginLogo || '';
			return u ? this.resolveImgUrl(String(u).trim()) : '';
		},
		defaultAvatar() {
			const raw = this.$Cache.get('imgHost') || '';
			if (!raw) return '';
			const host = raw.replace(/\/?$/, '/');
			return `${host}crmebimage/presets/morenT.png`;
		},
		doctorAvatar() {
			const u = this.resolveImgUrl(this.doctorPicture);
			return u || this.defaultAvatar;
		},
		consultTypeLabel() {
			return this.consultType === 2 ? '视频问诊' : '图文问诊';
		},
		priceDisplay() {
			const n = Number(this.consultFee);
			return Number.isFinite(n) ? n.toFixed(2) : '0.00';
		},
		discountDisplay() {
			const n = Number(this.discountAmount);
			return Number.isFinite(n) ? n.toFixed(2) : '0.00';
		},
		actualPayDisplay() {
			const t = Number(this.consultFee) - Number(this.discountAmount);
			const x = Number.isFinite(t) ? Math.max(0, t) : 0;
			return x.toFixed(2);
		},
		bottomPad() {
			return `calc(280rpx + ${this.safeBottom}px)`;
		}
	},
	onLoad() {
		const sys = uni.getSystemInfoSync();
		this.safeBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
		this.statusBarHeight = sys.statusBarHeight || 20;
		this.readPrefill();
		this.loadPatients();
	},
	onShow() {
		if (this.step !== 1) return;
		if (this._consultBookSkipFirstShow) {
			this._consultBookSkipFirstShow = false;
			return;
		}
		this._patientLoadPromise = null;
		this.loadPatients();
	},
	onBackPress() {
		if (this.step === 2) {
			this.step = 1;
			this.consultationId = null;
			return true;
		}
		return false;
	},
	methods: {
		closePage() {
			const pages = getCurrentPages();
			if (pages.length > 1) {
				uni.navigateBack({ delta: 1 });
			} else {
				uni.switchTab({ url: '/pages/index/index' });
			}
		},
		resolveImgUrl(path) {
			if (!path || !String(path).trim()) return '';
			const p = String(path).trim();
			if (/^https?:\/\//i.test(p)) return p;
			const base = (this.$Cache.get('imgHost') || '').replace(/\/?$/, '');
			if (!base) return p;
			return p.startsWith('/') ? base + p : `${base}/${p}`;
		},
		readPrefill() {
			try {
				const raw = uni.getStorageSync(PREFILL_KEY);
				if (raw) {
					const o = JSON.parse(raw);
					this.doctorId = o.doctorId || 0;
					this.consultType = o.consultType === 2 ? 2 : 1;
					this.consultFee = o.consultFee != null ? Number(o.consultFee) : 0;
					this.diseaseType = o.diseaseType || '';
					this.durationLabel = o.durationLabel || (this.consultType === 2 ? '60分钟' : '48小时');
					this.doctorName = o.doctorName || '';
					this.doctorPicture = o.doctorPicture || '';
					this.hospitalTitle = o.hospitalTitle || '';
					this.hospitalSub = o.hospitalSub || '';
					this.hospitalName = o.hospitalName || '';
					this.hospitalLevel = o.hospitalLevel || '';
				}
				uni.removeStorageSync(PREFILL_KEY);
			} catch (e) {}
			if (!this.doctorId) {
				this.$util.Tips({ title: '缺少医生信息' });
			}
		},
		/** 解析 GET patient-identity/list 分页体（CommonPage：data.list） */
		parsePatientListRes(res) {
			const inner = res && res.data;
			if (!inner) return [];
			let list = inner.list;
			if (!list && Array.isArray(inner)) list = inner;
			if (!Array.isArray(list)) list = [];
			return list;
		},
		applyDefaultPatient(list) {
			if (!list || !list.length || this.selectedPatientId != null) return;
			const self = list.find((p) => p.relationType === 1);
			const first = list[0];
			const id = (self && self.id) || (first && first.id);
			if (id != null && id !== '') this.selectedPatientId = id;
		},
		loadPatients() {
			if (this._patientLoadPromise) return this._patientLoadPromise;
			this.patientLoading = true;
			this._patientLoadPromise = getPatientIdentityListApi({ page: 1, limit: 100 })
				.then((res) => {
					const list = this.parsePatientListRes(res);
					this.patientList = list;
					this.applyDefaultPatient(list);
				})
				.catch(() => {})
				.finally(() => {
					this.patientLoading = false;
					this._patientLoadPromise = null;
				});
			return this._patientLoadPromise;
		},
		sexLabel(sex) {
			if (sex === 1) return '男';
			if (sex === 2) return '女';
			return '—';
		},
		onAddPatientHint() {
			this.$util.navigateTo('/pages/users/patient_identity/form');
		},
		buildSaveBody() {
			const feeNum = Number(this.consultFee);
			return {
				doctorId: this.doctorId,
				patientId: this.selectedPatientId,
				consultType: this.consultType,
				consultFee: feeNum,
				diseaseDesc: '',
				diseaseType: this.diseaseType || this.hospitalSub || ''
			};
		},
		async confirmPatient() {
			// 就诊人列表异步加载：未完成或未选中时先等列表接口（与 consultation/save 的 patientId 一致）
			if (!this.selectedPatientId || this.patientLoading) {
				await this.loadPatients();
			}
			if (!this.selectedPatientId) {
				return this.$util.Tips({
					title: '暂无就诊人，请先在个人中心添加就诊人'
				});
			}
			if (!this.doctorId) {
				return this.$util.Tips({ title: '信息不完整' });
			}
			if (this.submitting) return;
			const feeNum = Number(this.consultFee);
			const needPay = Number.isFinite(feeNum) && feeNum > 0;
			const body = this.buildSaveBody();
			this.submitting = true;
			uni.showLoading({ title: '提交中…' });
			doctorConsultationSaveApi(body)
				.then(async (saveRes) => {
					const appointmentId = await this.resolveConsultationIdAfterSave(saveRes);
					this.consultationId =
						appointmentId != null && appointmentId !== '' ? appointmentId : null;
					uni.hideLoading();
					this.submitting = false;
					if (needPay && (this.consultationId == null || this.consultationId === '')) {
						this.$util.Tips({
							title: '创建成功，未返回问诊编号，请稍后在「我的」中查看'
						});
						return;
					}
					if (!needPay) {
						this.$util.Tips({ title: '问诊已提交' });
						this.finishNav();
						return;
					}
					this.step = 2;
				})
				.catch((err) => {
					uni.hideLoading();
					this.submitting = false;
					this.consultationId = null;
					this.$util.Tips({ title: err || '提交失败' });
				});
		},
		backToPatient() {
			this.step = 1;
			this.consultationId = null;
		},
		onDiscountTap() {
			this.$util.Tips({ title: '暂无可用优惠券' });
		},
		/** 与 interface.md 下单 data: { id, orderNo } 对齐；id 为 0 视为无效 */
		parseConsultationId(inner) {
			if (inner == null || inner === '') return null;
			if (typeof inner === 'number' && !isNaN(inner)) return inner > 0 ? inner : null;
			if (typeof inner === 'string') {
				const t = inner.trim();
				if (!t) return null;
				if (/^\d+$/.test(t)) {
					const n = parseInt(t, 10);
					return n > 0 ? n : null;
				}
				return t;
			}
			if (typeof inner === 'object') {
				if (inner.id != null && inner.id !== '') {
					const raw = inner.id;
					if (typeof raw === 'number' && !isNaN(raw)) return raw > 0 ? raw : null;
					if (typeof raw === 'string') {
						const s = raw.trim();
						if (/^\d+$/.test(s)) {
							const n = parseInt(s, 10);
							return n > 0 ? n : null;
						}
						return s || null;
					}
				}
				if (inner.data != null) return this.parseConsultationId(inner.data);
			}
			return null;
		},
		async resolveConsultationIdAfterSave(saveRes) {
			let id = this.parseConsultationId(saveRes && saveRes.data);
			if (id != null && id !== '') return id;
			try {
				const res = await getDoctorConsultationListApi({ page: 1, limit: 10 });
				const list = (res.data && res.data.list) || [];
				if (!Array.isArray(list) || !list.length) return null;
				const hit =
					list.find((c) => {
						const did =
							c.doctorId != null
								? c.doctorId
								: c.doctorInfo && c.doctorInfo.id;
						const pid =
							c.patientId != null
								? c.patientId
								: c.patientInfo && c.patientInfo.id;
						return (
							did === this.doctorId && pid === this.selectedPatientId
						);
					}) || list[0];
				return hit && hit.id != null ? hit.id : null;
			} catch (e) {
				return null;
			}
		},
		resolvePayChannel() {
			if (this.payMethod === 'alipay') {
				// #ifdef H5
				return { payChannel: 'alipay', payType: 'alipay' };
				// #endif
				// #ifdef APP-PLUS
				return { payChannel: 'alipayApp', payType: 'alipay' };
				// #endif
				// #ifdef MP
				return { payChannel: 'mini', payType: 'weixin' };
				// #endif
			}
			const payType = 'weixin';
			let payChannel = 'mini';
			// #ifdef H5
			payChannel = this.$wechat.isWeixin() ? 'public' : 'h5';
			// #endif
			// #ifdef APP-PLUS
			payChannel = this.systemPlatform === 'ios' ? 'wechatIos' : 'wechatAndroid';
			// #endif
			// #ifdef MP
			payChannel = 'mini';
			// #endif
			return { payChannel, payType };
		},
		submitPay() {
			if (this.submitting) return;
			if (!this.doctorId || !this.selectedPatientId) {
				return this.$util.Tips({ title: '信息不完整' });
			}
			if (this.consultationId == null || this.consultationId === '') {
				return this.$util.Tips({ title: '问诊单未创建，请返回重新确认患者' });
			}
			// #ifdef MP
			if (this.payMethod === 'alipay') {
				return this.$util.Tips({ title: '小程序暂不支持支付宝，请使用微信支付' });
			}
			// #endif
			const feeNum = Number(this.consultFee);
			const needPay = Number.isFinite(feeNum) && feeNum > 0;
			if (!needPay) {
				this.$util.Tips({ title: '问诊已提交' });
				this.finishNav();
				return;
			}
			this.submitting = true;
			uni.showLoading({ title: '提交中…' });
			this.doPay(this.consultationId, feeNum);
		},
		doPay(consultationId, payPrice) {
			const { payChannel, payType } = this.resolvePayChannel();
			doctorConsultationPayApi({
				id: consultationId,
				consultType: this.consultType,
				payChannel,
				payType,
				from: ''
			})
				.then((payRes) => {
					const d = payRes.data || {};
					const goPages = '/pages/clinic/consultation_pay_success/index';
					if (d.jsConfig) {
						this.weixinPay(
							d.jsConfig,
							String(d.payOrderNo != null ? d.payOrderNo : consultationId),
							goPages,
							'normal',
							''
						);
						return;
					}
					if (d.alipayRequest) {
						uni.hideLoading();
						this.submitting = false;
						this.handleOrderPay(
							payRes,
							String(d.payOrderNo != null ? d.payOrderNo : consultationId),
							'normal',
							'',
							'alipay',
							payPrice
						);
						return;
					}
					uni.hideLoading();
					this.submitting = false;
					this.$util.Tips({ title: '支付已处理' });
					uni.reLaunch({ url: goPages });
				})
				.catch((err) => {
					uni.hideLoading();
					this.submitting = false;
					this.$util.Tips({ title: err || '支付发起失败' });
				});
		},
		finishNav() {
			setTimeout(() => {
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 });
				} else {
					uni.redirectTo({ url: '/pages/clinic/my_consultation/index' });
				}
			}, 400);
		}
	}
};
</script>

<style lang="scss" scoped>
.consult-book-page {
	min-height: 100vh;
	background: #fff;
	box-sizing: border-box;
}

.step-panel {
	min-height: 100vh;
	background: #fff;
	box-sizing: border-box;
}

.step-scroll {
	max-height: calc(100vh - 120rpx);
	width: 100%;
	padding: 0;
	margin: 0;
	box-sizing: border-box;
}

.step-1 {
	padding: 0;
}

.step-1-body {
	padding: 24rpx 24rpx 32rpx;
	box-sizing: border-box;
	background: transparent;
	min-height: 120rpx;
	border-top: 1rpx solid #e8e8e8;
}

.consult-hero {
	width: 100%;
	margin: 0;
	padding: 0;
	margin-bottom: 0;
	background: #fff;
	box-sizing: border-box;
}

.brand-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 24rpx 20rpx;
	background: #fff;
	box-sizing: border-box;
}

.brand-left {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	max-width: 38%;
}

.brand-home-logo {
	width: 100rpx;
	height: 52rpx;
	display: block;
	flex-shrink: 0;
}

.brand-cn-fallback {
	font-size: 30rpx;
	font-weight: 700;
	color: var(--view-theme);
	line-height: 1.2;
}

.brand-slogan {
	flex: 1;
	min-width: 0;
	padding: 0 12rpx;
	text-align: center;
	font-size: 20rpx;
	line-height: 1.35;
	color: #6d9889;
}

.brand-close {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: #9e9e9e;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.brand-close-ico {
	font-size: 28rpx;
	color: #fff;
}

.hero-img {
	width: 100%;
	display: block;
	vertical-align: top;
}

.step2-safe-top {
	width: 100%;
	background: #fff;
}

.doctor-card {
	background: #fff;
	border-radius: 16rpx;
	padding: 28rpx 24rpx;
	display: flex;
	margin-bottom: 24rpx;
	border: 1rpx solid #eee;
	box-sizing: border-box;
}

.doc-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	flex-shrink: 0;
	margin-right: 24rpx;
}

.doc-meta {
	flex: 1;
	min-width: 0;
}

.doc-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #282828;
	display: block;
}

.doc-title {
	font-size: 24rpx;
	color: #666;
	margin-top: 8rpx;
	display: block;
}

.hosp-line {
	margin-top: 12rpx;
	display: flex;
	align-items: flex-start;
	gap: 8rpx;
}

.tag-level {
	font-size: 20rpx;
	color: #999;
	border: 1px solid var(--view-coupons-border, #ddd);
	border-radius: 6rpx;
	padding: 2rpx 8rpx;
	flex-shrink: 0;
}

.hosp-name {
	font-size: 24rpx;
	color: #999;
	flex: 1;
	min-width: 0;
}

.line2 {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.info-block {
	background: #fff;
	border-radius: 16rpx;
	padding: 8rpx 24rpx 16rpx;
	margin-bottom: 32rpx;
	border: 1rpx solid #eee;
	box-sizing: border-box;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #f2f2f2;
}

.info-row:last-child {
	border-bottom: none;
}

.info-label {
	font-size: 28rpx;
	color: #888;
}

.info-val {
	font-size: 28rpx;
	color: #282828;
	font-weight: 500;
}

.info-val.price {
	color: var(--view-priceColor, #e93323);
}

.section-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
	margin-bottom: 16rpx;
}

.add-patient {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding: 32rpx 24rpx;
	margin-bottom: 20rpx;
	background: #fff;
	border: 2rpx dashed #ccc;
	border-radius: 12rpx;
}

.add-ico {
	font-size: 32rpx;
	color: #999;
}

.add-txt {
	font-size: 28rpx;
	color: #999;
}

.hint {
	text-align: center;
	font-size: 26rpx;
	color: #999;
	padding: 24rpx;
}

.empty-hint {
	padding: 32rpx 24rpx;
	line-height: 1.5;
}

.patient-card {
	background: #fff;
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	border: 2rpx solid transparent;
}

.patient-card.selected {
	border-color: var(--view-theme);
	background: var(--view-main-rgba);
}

.patient-card-body {
	display: flex;
	align-items: flex-start;
}

.pc-avatar-box {
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	overflow: hidden;
	flex-shrink: 0;
	margin-right: 20rpx;
	background: #f0f0f0;
}

.pc-avatar {
	width: 88rpx;
	height: 88rpx;
	display: block;
}

.pc-main {
	flex: 1;
	min-width: 0;
}

.pc-head {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.pc-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
}

.pc-tag {
	font-size: 22rpx;
	color: var(--view-theme);
	border: 1px solid var(--view-theme);
	border-radius: 6rpx;
	padding: 2rpx 12rpx;
	flex-shrink: 0;
	margin-left: 12rpx;
}

.pc-sub-row {
	display: flex;
	align-items: center;
	gap: 24rpx;
	margin-top: 12rpx;
}

.pc-sub {
	font-size: 24rpx;
	color: #666;
}

.pc-age {
	font-size: 24rpx;
	color: #666;
}

.footer-step1 {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
	background: #fff;
	border-top: 1rpx solid #eee;
}

.footer-step1 .legal {
	display: block;
	font-size: 20rpx;
	color: #999;
	line-height: 1.55;
	margin-bottom: 20rpx;
}

.legal-link {
	color: var(--view-theme);
}

.footer-btn-row {
	display: flex;
	justify-content: flex-end;
}

.footer-btn-confirm {
	min-width: 280rpx;
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 40rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	color: #fff;
	border: none;
}

.footer-btn-confirm[disabled] {
	opacity: 0.6;
}

.footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
	background: #fff;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.footer-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 44rpx;
	font-size: 30rpx;
	color: #fff;
	border: none;
}

.footer-btn[disabled] {
	opacity: 0.6;
}

/* 步骤2 */
.step-2 {
	background: #fff;
}

.pay-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx 32rpx 16rpx;
	border-bottom: 1px solid #f0f0f0;
}

.pay-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #282828;
}

.pay-close {
	font-size: 36rpx;
	color: #999;
	padding: 8rpx;
}

.pay-scroll {
	max-height: calc(100vh - 200rpx);
}

.sheet-section {
	padding: 24rpx 32rpx;
	border-bottom: 12rpx solid #f5f5f5;
}

.cell-row {
	display: flex;
	align-items: center;
	padding: 22rpx 0;
	border-bottom: 1px solid #f5f5f5;
}

.cell-row:last-child {
	border-bottom: none;
}

.cell-row.tap {
	cursor: pointer;
}

.cell-label {
	width: 200rpx;
	flex-shrink: 0;
	font-size: 28rpx;
	color: #999;
}

.cell-val {
	flex: 1;
	font-size: 28rpx;
	color: #282828;
	text-align: right;
}

.cell-val.danger {
	color: var(--view-priceColor, #e93323);
}

.cell-val.strong {
	font-weight: 600;
}

.chev {
	font-size: 22rpx;
	color: #ccc;
	margin-left: 8rpx;
}

.sub-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
	display: block;
	margin-bottom: 8rpx;
}

.pay-method-label {
	font-size: 26rpx;
	color: #999;
	margin-bottom: 16rpx;
	display: block;
}

.pay-option {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx 0;
	border-bottom: 1px solid #f5f5f5;
}

.pay-option:last-child {
	border-bottom: none;
}

.po-name {
	font-size: 28rpx;
	color: #282828;
}

.check {
	color: var(--view-theme);
	font-size: 40rpx;
}

.unsel {
	color: #ccc;
	font-size: 40rpx;
}

.fee-block {
	border-bottom: none;
}

.footer-pay {
	background: #fff;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}
</style>
