<template>
	<view class="detail-page" :data-theme="theme">
		<view v-if="loading" class="loading-wrap"><text>加载中...</text></view>
		<template v-else>
		<view
			v-if="detail"
			class="content"
			:class="{ 'content--with-paybar': canPay }"
		>
			<!-- 理疗项目（类目） / 中医项目 -->
			<view class="card card-block" v-if="categoryBlockShow">
				<view class="block-title">{{ isTcm ? '项目信息' : '理疗项目' }}</view>
				<view class="row">
					<text class="label">名称</text>
					<text class="val">{{ categoryNameText }}</text>
				</view>
				<view class="row" v-if="cate && cate.code">
					<text class="label">编码</text>
					<text class="val">{{ cate.code }}</text>
				</view>
				<view class="row" v-if="cate && cate.duration != null">
					<text class="label">时长</text>
					<text class="val">{{ cate.duration }} 分钟</text>
				</view>
				<view class="row" v-if="cate && cate.price != null">
					<text class="label">标价</text>
					<text class="val price">¥{{ cate.price }}</text>
				</view>
			</view>

			<!-- 医师（中医预约） -->
			<view class="card card-block" v-if="detail.doctorInfo">
				<view class="block-title">医师</view>
				<view class="thera-head">
					<image class="thera-avatar" :src="doctorImg" mode="aspectFill" />
					<view class="thera-head-text">
						<text class="thera-name">{{ detail.doctorInfo.name || '--' }}</text>
						<text class="thera-phone" v-if="detail.doctorInfo.phone">电话 {{ detail.doctorInfo.phone }}</text>
					</view>
				</view>
				<view class="row" v-if="detail.doctorInfo.hospitalTitle || detail.doctorInfo.hospitalSub">
					<text class="label">职称科室</text>
					<text class="val text-left">{{ [detail.doctorInfo.hospitalTitle, detail.doctorInfo.hospitalSub].filter(Boolean).join(' ') }}</text>
				</view>
				<view class="row" v-if="detail.doctorInfo.hospitalDomain">
					<text class="label">擅长</text>
					<text class="val text-left">{{ detail.doctorInfo.hospitalDomain }}</text>
				</view>
			</view>

			<!-- 理疗师 -->
			<view class="card card-block" v-if="detail.therapistInfo">
				<view class="block-title">理疗师</view>
				<view class="thera-head">
					<image class="thera-avatar" :src="therapistImg" mode="aspectFill" />
					<view class="thera-head-text">
						<text class="thera-name">{{ detail.therapistInfo.name || '--' }}</text>
						<text class="thera-phone" v-if="detail.therapistInfo.phone">电话 {{ detail.therapistInfo.phone }}</text>
					</view>
				</view>
				<view class="row" v-if="detail.therapistInfo.hospitalDomain">
					<text class="label">擅长</text>
					<text class="val text-left">{{ detail.therapistInfo.hospitalDomain }}</text>
				</view>
				<view class="row" v-if="detail.therapistInfo.selfInfo">
					<text class="label">简介</text>
					<text class="val text-left">{{ detail.therapistInfo.selfInfo }}</text>
				</view>
				<view class="row" v-if="detail.therapistInfo.score != null && detail.therapistInfo.score !== ''">
					<text class="label">评分</text>
					<text class="val">{{ detail.therapistInfo.score }}</text>
				</view>
				<view class="row" v-if="detail.therapistInfo.treatNum != null">
					<text class="label">服务人次</text>
					<text class="val">{{ detail.therapistInfo.treatNum }}</text>
				</view>
				<view class="row" v-if="therapistRegion">
					<text class="label">地区</text>
					<text class="val">{{ therapistRegion }}</text>
				</view>
				<view class="row" v-if="detail.therapistInfo.addressDetail">
					<text class="label">地址</text>
					<text class="val text-left">{{ detail.therapistInfo.addressDetail }}</text>
				</view>
			</view>

			<!-- 预约单 -->
			<view class="card card-block">
				<view class="block-title">预约信息</view>
				<view class="row title-row inner">
					<text class="proj">{{ headerTitle }}</text>
					<text class="status-tag" :class="statusBadgeClass(detail.status)">{{ detailStatusLabel(detail.status) }}</text>
				</view>
				<view class="row" v-if="!detail.therapistInfo && therapistDisplayName">
					<text class="label">理疗师</text>
					<text class="val">{{ therapistDisplayName }}</text>
				</view>
				<view class="row">
					<text class="label">预约时间</text>
					<text class="val">{{ detail.appointTime || '--' }}</text>
				</view>
				<view class="row" v-if="detail.address || detail.userAddress">
					<text class="label">{{ isTcm ? '地址' : '理疗地点' }}</text>
					<text class="val text-left">{{ detail.address || detail.userAddress }}</text>
				</view>
				<view class="row">
					<text class="label">应付金额</text>
					<text class="val price">¥{{ formatMoney(detailFeeDisplay) }}</text>
				</view>
				<view class="row">
					<text class="label">支付状态</text>
					<text class="val">{{ detail.payStatus | payStatusFilter }}</text>
				</view>
				<view class="row" v-if="detail.payOrderNo">
					<text class="label">支付单号</text>
					<text class="val small">{{ detail.payOrderNo }}</text>
				</view>
				<view class="row" v-if="detail.remark">
					<text class="label">备注</text>
					<text class="val text-left">{{ detail.remark }}</text>
				</view>
				<view class="row" v-if="detail.createTime">
					<text class="label">创建时间</text>
					<text class="val small">{{ detail.createTime }}</text>
				</view>
				<view class="row" v-if="detail.updateTime">
					<text class="label">更新时间</text>
					<text class="val small">{{ detail.updateTime }}</text>
				</view>
			</view>

			<view class="actions">
				<!-- <button
					v-if="detail.payOrderNo"
					class="btn-order plain"
					@click="goOrderDetail"
				>
					查看商品订单
				</button> -->
				<button
					v-if="canCancel"
					class="btn-cancel plain"
					@click="onCancel"
				>
					取消预约
				</button>
			</view>
		</view>

		<!-- 未支付：底部固定支付条，避免遗漏 -->
		<view v-if="detail && canPay" class="pay-bar-fixed">
			<view class="pay-bar-inner">
				<view class="pay-bar-left">
					<text class="pay-bar-label">待支付</text>
					<text class="pay-bar-fee">¥{{ formatMoney(detailFeeDisplay) }}</text>
				</view>
				<button
					class="pay-bar-btn bg-color"
					:disabled="paying"
					@click="doPay"
				>
					{{ paying ? '支付中…' : '立即支付' }}
				</button>
			</view>
		</view>

		<view v-else-if="!detail" class="empty-wrap">
			<text>未找到预约信息</text>
		</view>
		</template>

		<physio-cancel-reason-popup
			:visible.sync="cancelReasonPopupVisible"
			@confirm="submitCancelWithReason"
		/>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import orderPay from '@/mixins/OrderPay.js';
import {
	getPhysiotherapyAppointmentInfoApi,
	getTcmAppointmentInfoApi,
	physiotherapyAppointmentPayApi,
	physiotherapyAppointmentCancelApi,
	tcmAppointmentPayApi,
	tcmAppointmentCancelApi
} from '@/api/clinic.js';
import { consumePhysioAppointmentDetailNav } from '@/utils/physioAppointmentDetailNav.js';
import physioCancelReasonPopup from '@/components/physioCancelReasonPopup/index.vue';

let app = getApp();
export default {
	components: { physioCancelReasonPopup },
	mixins: [orderPay],
	filters: {
		payStatusFilter(ps) {
			if (ps == null || ps === '') return '未支付';
			const map = { 0: '未支付', 1: '已支付', 2: '已退款' };
			return map[ps] != null ? map[ps] : '';
		}
	},
	data() {
		return {
			theme: app.globalData.theme,
			appointmentId: 0,
			mchId: 0,
			therapistNameHint: '',
			detail: null,
			loading: true,
			paying: false,
			cancelReasonPopupVisible: false,
			/** 来自列表 ?tcm=1，走 doctor/tcm-appointment/info */
			isTcm: false
		};
	},
	computed: {
		...mapGetters(['systemPlatform']),
		cate() {
			if (!this.detail) return null;
			if (this.detail.tcmCategoryInfo) return this.detail.tcmCategoryInfo;
			return this.detail.physiotherapyCategoryInfo || null;
		},
		categoryBlockShow() {
			if (this.isTcm && this.detail) {
				const d = this.detail;
				return !!(
					(d.tcmCategoryInfo && d.tcmCategoryInfo.name) ||
					d.serviceName ||
					d.projectName ||
					d.tcmServiceName ||
					(this.cate && (this.cate.name || this.cate.code || this.cate.duration != null || this.cate.price != null))
				);
			}
			return !!(this.cate && (this.cate.name || this.cate.code || this.cate.duration != null || this.cate.price != null));
		},
		categoryNameText() {
			if (!this.detail) return '';
			if (this.isTcm) {
				const d = this.detail;
				const tc = d.tcmCategoryInfo;
				if (tc && tc.name) return tc.name;
				return (
					d.serviceName ||
					d.projectName ||
					d.tcmServiceName ||
					(this.cate && this.cate.name) ||
					d.physiotherapyCategory ||
					'--'
				);
			}
			if (this.cate && this.cate.name) return this.cate.name;
			return (
				this.detail.physiotherapyCategory ||
				this.detail.physiotherapyType ||
				'--'
			);
		},
		headerTitle() {
			if (this.isTcm) {
				const t = this.categoryNameText;
				return t && t !== '--' ? t : '中医预约';
			}
			return this.categoryNameText !== '--' ? this.categoryNameText : '理疗预约';
		},
		therapistDisplayName() {
			if (!this.detail) return '';
			const t = this.detail.therapistInfo;
			if (t && t.name) return t.name;
			if (this.therapistNameHint) return this.therapistNameHint;
			return '';
		},
		therapistImg() {
			const t = this.detail && this.detail.therapistInfo;
			const p = t && t.picture;
			return this.resolveImgUrl(p) || this.defaultAvatar;
		},
		doctorImg() {
			const d = this.detail && this.detail.doctorInfo;
			const p = d && (d.picture || d.avatar || d.headImg);
			return this.resolveImgUrl(p) || this.defaultAvatar;
		},
		defaultAvatar() {
			const raw = (this.$Cache.get('imgHost') || '').replace(/\/?$/, '/');
			return raw ? `${raw}crmebimage/presets/morenT.png` : '';
		},
		therapistRegion() {
			const t = this.detail && this.detail.therapistInfo;
			if (!t) return '';
			const parts = [t.province, t.city, t.district].filter(Boolean);
			return parts.length ? parts.join(' ') : '';
		},
		/** 与列表页一致；兼容 payStatus 缺省=未付、fee/amount 字段名 */
		detailFeeDisplay() {
			const d = this.detail;
			if (!d) return 0;
			const raw = this.isTcm
				? d.amount != null && d.amount !== ''
					? d.amount
					: d.fee
				: d.fee != null && d.fee !== ''
					? d.fee
					: d.amount;
			const n = Number(raw);
			return isNaN(n) ? 0 : n;
		},
		canPay() {
			const d = this.detail;
			if (!d) return false;
			const s = Number(d.status);
			if (this.isTcm) {
				if (s === 2 || s === 3) return false;
			} else {
				if (s === 1 || s === 2 || s === 3) return false;
			}
			const fee = this.detailFeeDisplay;
			if (isNaN(fee) || fee <= 0) return false;
			const ps = d.payStatus;
			if (ps === 1 || ps === '1' || ps === true) return false;
			if (ps === 2 || ps === '2') return false;
			if (ps == null || ps === '') return true;
			return Number(ps) === 0;
		},
		/** 仅已支付且待服务可取消；未支付 / 已退款 / 已结束不可 */
		canCancel() {
			const d = this.detail;
			if (!d) return false;
			const s = Number(d.status);
			if (this.isTcm) {
				if (s === 2 || s === 3) return false;
			} else {
				if (s === 1 || s === 2 || s === 3) return false;
			}
			const ps = d.payStatus;
			if (ps === 2 || ps === '2') return false;
			return ps === 1 || ps === '1' || ps === true || Number(ps) === 1;
		}
	},
	onLoad(options) {
		const nav = consumePhysioAppointmentDetailNav();
		let appointmentId = 0;
		let mchId = 0;
		let therapistNameHint = '';

		if (nav && nav.appointmentId != null && nav.appointmentId !== '') {
			appointmentId = parseInt(nav.appointmentId, 10) || 0;
			mchId = nav.mchId != null && nav.mchId !== '' ? parseInt(nav.mchId, 10) : 0;
			therapistNameHint = nav.therapistName ? String(nav.therapistName) : '';
		} else {
			appointmentId = options.id ? parseInt(options.id, 10) : 0;
			mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
			therapistNameHint = options.therapistName
				? decodeURIComponent(options.therapistName)
				: '';
		}

		this.isTcm = options.tcm === '1' || options.tcm === 'true' || options.tcm === 1;

		this.appointmentId = appointmentId;
		this.mchId = mchId;
		this.therapistNameHint = therapistNameHint;

		if (!this.appointmentId) {
			this.loading = false;
			return this.$util.Tips({ title: '缺少预约编号' });
		}
		this.loadDetail();
	},
	methods: {
		resolveImgUrl(path) {
			if (!path || !String(path).trim()) return '';
			const p = String(path).trim();
			if (/^https?:\/\//i.test(p)) return p;
			const base = (this.$Cache.get('imgHost') || '').replace(/\/?$/, '');
			if (!base) return p;
			return p.startsWith('/') ? base + p : `${base}/${p}`;
		},
		formatMoney(v) {
			if (v == null || v === '') return '0';
			const n = Number(v);
			return isNaN(n) ? v : n;
		},
		detailStatusLabel(status) {
			if (this.isTcm) {
				const map = { 0: '待确认', 1: '已确认', 2: '已完成', 3: '已取消' };
				return map[status] != null ? map[status] : '未知';
			}
			const map = { 0: '待服务', 1: '已完成', 2: '已取消', 3: '已取消' };
			return map[status] != null ? map[status] : '未知';
		},
		statusBadgeClass(status) {
			const s = Number(status);
			if (this.isTcm) {
				if (s === 2) return 'badge-done';
				if (s === 3) return 'badge-off';
				return 'badge-wait';
			}
			if (s === 1) return 'badge-done';
			if (s === 2 || s === 3) return 'badge-off';
			return 'badge-wait';
		},
		loadDetail() {
			this.loading = true;
			const req = this.isTcm
				? getTcmAppointmentInfoApi(this.appointmentId)
				: getPhysiotherapyAppointmentInfoApi(this.appointmentId);
			req
				.then((res) => {
					this.detail = res.data || null;
					this.loading = false;
				})
				.catch((err) => {
					this.loading = false;
					this.$util.Tips({ title: err || '加载失败' });
				});
		},
		resolvePayChannel() {
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
		markListRefresh() {
			const app = getApp();
			if (app.globalData) {
				if (this.isTcm) {
					app.globalData.tcmAppointmentNeedRefresh = true;
				} else {
					app.globalData.physioAppointmentNeedRefresh = true;
					app.globalData.physioBookJustCreated = true;
				}
			}
		},
		doPay() {
			if (!this.detail || !this.canPay) return;
			this.paying = true;
			const { payChannel, payType } = this.resolvePayChannel();
			const payPayload = {
				id: this.detail.id,
				payChannel,
				payType,
				from: ''
			};
			const payReq = this.isTcm
				? tcmAppointmentPayApi(payPayload)
				: physiotherapyAppointmentPayApi(payPayload);
			payReq
				.then((payRes) => {
					const d = payRes.data;
					this.markListRefresh();
					if (d && d.jsConfig) {
						const goPages =
							this.mchId > 0
								? `/pages/clinic/therapist/index?mchId=${this.mchId}`
								: '/pages/clinic/appointment/index';
						this.paying = false;
						this.weixinPay(
							d.jsConfig,
							String(d.payOrderNo || this.detail.id),
							goPages,
							'normal',
							''
						);
					} else {
						this.paying = false;
						this.$util.Tips({ title: '支付已发起' });
						this.loadDetail();
					}
				})
				.catch((err) => {
					this.paying = false;
					this.$util.Tips({ title: err || '支付发起失败' });
				});
		},
		goOrderDetail() {
			if (!this.detail || !this.detail.payOrderNo) return;
			this.$util.navigateTo(
				`/pages/goods/order_details/index?orderNo=${this.detail.payOrderNo}`
			);
		},
		onCancel() {
			if (!this.canCancel || !this.detail) return;
			this.cancelReasonPopupVisible = true;
		},
		submitCancelWithReason(cancelReason) {
			const reason = (cancelReason || '').trim();
			if (!reason) {
				return this.$util.Tips({ title: '请填写取消原因' });
			}
			if (!this.canCancel || !this.detail) return;
			const d = this.detail;
			const appointmentRaw = d.id != null ? d.id : d.appointmentId;
			const appointmentId =
				typeof appointmentRaw === 'number'
					? appointmentRaw
					: parseInt(appointmentRaw, 10);
			if (appointmentRaw == null || appointmentRaw === '' || isNaN(appointmentId)) {
				return this.$util.Tips({ title: '缺少预约信息，无法取消' });
			}
			this.cancelReasonPopupVisible = false;
			const cancelReq = this.isTcm
				? tcmAppointmentCancelApi({ appointmentId, cancelReason: reason })
				: physiotherapyAppointmentCancelApi({ appointmentId, cancelReason: reason });
			cancelReq
				.then(() => {
					this.$util.Tips({ title: '取消成功' });
					this.markListRefresh();
					this.loadDetail();
				})
				.catch((err) => {
					this.$util.Tips({ title: err || '取消失败' });
				});
		}
	}
};
</script>

<style lang="scss" scoped>
.detail-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 24rpx;
	box-sizing: border-box;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.loading-wrap,
.empty-wrap {
	padding: 80rpx;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}

.content {
	padding-bottom: 48rpx;
}

.content--with-paybar {
	padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.pay-bar-fixed {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	padding: 16rpx 24rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
	background: #fff;
	box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
	box-sizing: border-box;
}

.pay-bar-inner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24rpx;
}

.pay-bar-left {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	min-width: 0;
}

.pay-bar-label {
	font-size: 24rpx;
	color: #999;
}

.pay-bar-fee {
	font-size: 36rpx;
	font-weight: 600;
	color: var(--view-theme);
}

.pay-bar-btn {
	flex-shrink: 0;
	min-width: 220rpx;
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 40rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	color: #fff;
	border: none;
	margin: 0;
}

.card {
	background: #fff;
	border-radius: 16rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 24rpx;
}

.card-block .block-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
	margin-bottom: 16rpx;
	padding-bottom: 16rpx;
	border-bottom: 1px solid #eee;
}

.thera-head {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.thera-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
	margin-right: 20rpx;
	background: #f5f5f5;
}

.thera-head-text {
	flex: 1;
	min-width: 0;
}

.thera-name {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
}

.thera-phone {
	display: block;
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
}

.row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 16rpx 0;
	font-size: 28rpx;
	border-bottom: 1px solid #f5f5f5;

	&:last-child {
		border-bottom: none;
	}
}

.title-row.inner {
	border-bottom: 1px solid #eee;
	padding-bottom: 20rpx;
	margin-bottom: 8rpx;
}

.proj {
	flex: 1;
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
	padding-right: 16rpx;
}

.status-tag {
	font-size: 24rpx;
	flex-shrink: 0;
}

.badge-wait {
	color: #ff9900;
}

.badge-done {
	color: #19be6b;
}

.badge-off {
	color: #999;
}

.label {
	color: #999;
	width: 170rpx;
	flex-shrink: 0;
}

.val {
	flex: 1;
	text-align: right;
	color: #333;
	word-break: break-all;
}

.val.text-left {
	text-align: left;
}

.val.price {
	color: var(--view-theme);
	font-weight: 600;
}

.val.small {
	font-size: 24rpx;
	color: #666;
}

.actions {
	margin-top: 16rpx;
	padding: 0 8rpx;
}

.btn-pay {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 44rpx;
	font-size: 30rpx;
	color: #fff;
	border: none;
	margin-bottom: 24rpx;
}

.btn-order,
.btn-cancel {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	margin-bottom: 20rpx;
	background: #fff;
	color: #333;
	border: 1px solid #e5e5e5;
}

.btn-cancel {
	color: #e54d42;
	border-color: #f5c4c1;
}
</style>
