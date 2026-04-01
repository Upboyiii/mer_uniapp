<template>
	<view class="detail-page" :data-theme="theme">
		<view v-if="loading" class="loading-wrap"><text>加载中...</text></view>

		<view v-else-if="detail" class="content">
			<!-- 理疗项目（类目） -->
			<view class="card card-block" v-if="categoryBlockShow">
				<view class="block-title">理疗项目</view>
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
					<text class="status-tag" :class="statusBadgeClass(detail.status)">{{ detail.status | physioRowStatusFilter }}</text>
				</view>
				<view class="row" v-if="!detail.therapistInfo && therapistDisplayName">
					<text class="label">理疗师</text>
					<text class="val">{{ therapistDisplayName }}</text>
				</view>
				<view class="row">
					<text class="label">预约时间</text>
					<text class="val">{{ detail.appointTime || '--' }}</text>
				</view>
				<view class="row" v-if="detail.address">
					<text class="label">理疗地点</text>
					<text class="val text-left">{{ detail.address }}</text>
				</view>
				<view class="row">
					<text class="label">应付金额</text>
					<text class="val price">¥{{ formatMoney(detail.fee) }}</text>
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
				<button v-if="canPay" class="btn-pay bg-color" :disabled="paying" @click="doPay">
					{{ paying ? '支付中…' : '立即支付' }}
				</button>
				<button
					v-if="detail.payOrderNo"
					class="btn-order plain"
					@click="goOrderDetail"
				>
					查看商品订单
				</button>
				<button
					v-if="canCancel"
					class="btn-cancel plain"
					@click="onCancel"
				>
					取消预约
				</button>
			</view>
		</view>

		<view v-else class="empty-wrap">
			<text>未找到预约信息</text>
		</view>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import orderPay from '@/mixins/OrderPay.js';
import {
	getPhysiotherapyAppointmentInfoApi,
	physiotherapyAppointmentPayApi
} from '@/api/clinic.js';
import { cancelReservationApi } from '@/api/order.js';

let app = getApp();
export default {
	mixins: [orderPay],
	filters: {
		physioRowStatusFilter(status) {
			const map = { 0: '待服务', 1: '已完成', 2: '已取消', 3: '已取消' };
			return map[status] != null ? map[status] : '未知';
		},
		payStatusFilter(ps) {
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
			paying: false
		};
	},
	computed: {
		...mapGetters(['systemPlatform']),
		cate() {
			return this.detail && this.detail.physiotherapyCategoryInfo
				? this.detail.physiotherapyCategoryInfo
				: null;
		},
		categoryBlockShow() {
			return !!(this.cate && (this.cate.name || this.cate.code || this.cate.duration != null || this.cate.price != null));
		},
		categoryNameText() {
			if (!this.detail) return '';
			if (this.cate && this.cate.name) return this.cate.name;
			return (
				this.detail.physiotherapyCategory ||
				this.detail.physiotherapyType ||
				'--'
			);
		},
		headerTitle() {
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
		canPay() {
			const d = this.detail;
			if (!d) return false;
			const s = Number(d.status);
			if (s === 2 || s === 3) return false;
			const fee = Number(d.fee);
			if (isNaN(fee) || fee <= 0) return false;
			return Number(d.payStatus) === 0;
		},
		canCancel() {
			const d = this.detail;
			if (!d || !d.payOrderNo) return false;
			const s = Number(d.status);
			if (s === 1 || s === 2 || s === 3) return false;
			return true;
		}
	},
	onLoad(options) {
		this.appointmentId = options.id ? parseInt(options.id, 10) : 0;
		this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
		this.therapistNameHint = options.therapistName
			? decodeURIComponent(options.therapistName)
			: '';
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
		statusBadgeClass(status) {
			const s = Number(status);
			if (s === 1) return 'badge-done';
			if (s === 2 || s === 3) return 'badge-off';
			return 'badge-wait';
		},
		loadDetail() {
			this.loading = true;
			getPhysiotherapyAppointmentInfoApi(this.appointmentId)
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
				app.globalData.physioAppointmentNeedRefresh = true;
				app.globalData.physioBookJustCreated = true;
			}
		},
		doPay() {
			if (!this.detail || !this.canPay) return;
			this.paying = true;
			const { payChannel, payType } = this.resolvePayChannel();
			physiotherapyAppointmentPayApi({
				id: this.detail.id,
				payChannel,
				payType,
				from: ''
			})
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
			if (!this.canCancel || !this.detail.payOrderNo) return;
			uni.showModal({
				title: '提示',
				content: '确定取消该预约吗？',
				success: (res) => {
					if (!res.confirm) return;
					cancelReservationApi(this.detail.payOrderNo)
						.then(() => {
							this.$util.Tips({ title: '取消成功' });
							this.markListRefresh();
							this.loadDetail();
						})
						.catch((err) => {
							this.$util.Tips({ title: err || '取消失败' });
						});
				}
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
