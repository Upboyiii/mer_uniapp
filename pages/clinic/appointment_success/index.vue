<template>
	<view class="appointment-success-page" :data-theme="theme">
		<!-- 自定义顶栏：仅标题，无返回 -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-inner" :style="{ minHeight: navContentPx + 'px' }">
				<text class="nav-title">{{ navTitle }}</text>
			</view>
		</view>

		<view v-if="statusReady" class="card">
			<view class="result-tag" :class="resultStateClass">{{ resultTag }}</view>
			<view class="icon-wrap">
				<text class="iconfont" :class="[resultIcon, iconStateClass]" />
			</view>
			<text class="title">{{ resultTitle }}</text>
			<text class="desc">{{ resultDesc }}</text>
			<text v-if="orderNoText" class="order-no line1">订单号：{{ orderNoText }}</text>
		</view>

		<view class="btns">
			<button class="btn plain" @click="goHome">回到首页</button>
			<button class="btn primary bg-color" @click="goMyAppointment">{{ primaryBtnText }}</button>
		</view>
		<view v-if="!statusReady" class="loading-card">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在确认支付状态...</text>
		</view>
	</view>
</template>

<script>
import {
	getPhysiotherapyAppointmentInfoApi,
	getTcmAppointmentInfoApi
} from '@/api/clinic.js';

let app = getApp();
export default {
	data() {
		return {
			theme: app.globalData.theme,
			/** physio | tcm，传给「我的预约」默认 Tab */
			category: 'physio',
			appointmentId: null,
			orderNoText: '',
			statusBarHeight: 20,
			navContentPx: 44,
			statusReady: false,
			/** success | pending | failed | refunded */
			resultState: 'pending',
			defaultDesc: '您可在「我的预约」中查看订单并支付或管理预约。',
			paySuccessDesc: '您可在「我的预约」中查看详情。',
			pendingDesc: '订单已创建，尚未完成支付。您可在「我的预约」中继续支付。',
			failDesc: '支付未完成，请在「我的预约」中重新发起支付。',
			refundedDesc: '该订单已退款，您可在「我的预约」中查看退款状态。'
		};
	},
	computed: {
		resultStateClass() {
			return `state-${this.resultState}`;
		},
		navTitle() {
			return this.statusReady ? this.resultTitle : '支付结果';
		},
		iconStateClass() {
			return `icon-${this.resultState}`;
		},
		resultIcon() {
			if (this.resultState === 'success') return 'icon-a-ic_CompleteSelect';
			if (this.resultState === 'failed') return 'icon-ic_close';
			return 'icon-a-ic_CompleteSelect';
		},
		resultTag() {
			if (this.resultState === 'success') return '支付结果';
			if (this.resultState === 'failed') return '支付异常';
			if (this.resultState === 'refunded') return '退款状态';
			return '订单状态';
		},
		resultTitle() {
			if (this.resultState === 'success') return '支付成功';
			if (this.resultState === 'failed') return '支付失败';
			if (this.resultState === 'refunded') return '支付已退款';
			return '待支付';
		},
		resultDesc() {
			if (this.resultState === 'success') return this.paySuccessDesc;
			if (this.resultState === 'failed') return this.failDesc;
			if (this.resultState === 'refunded') return this.refundedDesc;
			return this.pendingDesc;
		},
		primaryBtnText() {
			if (this.resultState === 'pending' || this.resultState === 'failed') return '去我的预约支付';
			return '我的预约';
		}
	},
	onLoad(options) {
		const sys = uni.getSystemInfoSync();
		this.statusBarHeight = sys.statusBarHeight || 20;
		const c = options.category === 'tcm' ? 'tcm' : 'physio';
		this.category = c;
		this.appointmentId = options.id != null && String(options.id).trim() ? options.id : null;
		this.orderNoText = options.orderNo != null ? String(options.orderNo).trim() : '';

		const st = options.status;
		const payCancelled = st === '2' || st === 2 || st === 'fail';
		const paySuccess = options.paySuccess === '1' || options.paySuccess === 'true';
		if (payCancelled) {
			this.resultState = 'failed';
			this.statusReady = true;
			return;
		}
		if (paySuccess) {
			this.resultState = 'success';
			this.statusReady = true;
			return;
		}
		this.fetchPayStatusById();
	},
	methods: {
		fetchPayStatusById() {
			if (this.appointmentId == null || this.appointmentId === '') {
				this.statusReady = true;
				return;
			}
			const req =
				this.category === 'tcm'
					? getTcmAppointmentInfoApi(this.appointmentId)
					: getPhysiotherapyAppointmentInfoApi(this.appointmentId);
			req
				.then((res) => {
					const d = (res && res.data) || {};
					const ps = Number(d.payStatus);
					if (ps === 1) this.resultState = 'success';
					else if (ps === 2) this.resultState = 'refunded';
					else this.resultState = 'pending';
					if (!this.orderNoText && d.orderNo != null) {
						this.orderNoText = String(d.orderNo).trim();
					}
					this.statusReady = true;
				})
				.catch(() => {
					// 详情失败时保留待支付，避免误判为成功
					this.resultState = 'pending';
					this.statusReady = true;
				});
		},
		goHome() {
			uni.switchTab({ url: '/pages/index/index' });
		},
		goMyAppointment() {
			const q = `category=${encodeURIComponent(this.category)}&fromPaySuccess=1`;
			uni.navigateTo({ url: `/pages/clinic/appointment/index?${q}` });
		}
	}
};
</script>

<style lang="scss" scoped>
.appointment-success-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #f7fbff 0%, #f5f5f5 180rpx, #f5f5f5 100%);
	padding: 0 32rpx 48rpx;
	box-sizing: border-box;
}

.loading-card {
	margin-top: 24rpx;
	background: #fff;
	border-radius: 20rpx;
	padding: 120rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
}

.loading-spinner {
	width: 52rpx;
	height: 52rpx;
	border: 5rpx solid #e8e8e8;
	border-top-color: var(--view-theme);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

.loading-text {
	margin-top: 20rpx;
	font-size: 28rpx;
	color: #999;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.custom-nav {
	background: #fff;
	border-bottom: 1rpx solid #f0f0f0;
	margin: 0 -32rpx 24rpx;
	padding-left: 32rpx;
	padding-right: 32rpx;
}

.nav-inner {
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #282828;
}

.card {
	background: #fff;
	border-radius: 20rpx;
	padding: 44rpx 40rpx 48rpx;
	text-align: center;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
}

.result-tag {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 46rpx;
	padding: 0 24rpx;
	border-radius: 23rpx;
	font-size: 22rpx;
	margin-bottom: 22rpx;
}

.state-success {
	color: #0b8f4d;
	background: rgba(7, 193, 96, 0.14);
}

.state-pending {
	color: #b06a00;
	background: rgba(255, 171, 0, 0.16);
}

.state-failed {
	color: #c7353a;
	background: rgba(238, 67, 75, 0.15);
}

.state-refunded {
	color: #2979ff;
	background: rgba(41, 121, 255, 0.14);
}

.icon-wrap {
	margin-bottom: 24rpx;
}

.icon-success,
.icon-pending,
.icon-failed,
.icon-refunded {
	font-size: 120rpx;
	line-height: 1;
}

.icon-success {
	color: #07c160;
}

.icon-pending {
	color: #ff9f00;
}

.icon-failed {
	color: #ee434b;
}

.icon-refunded {
	color: #2979ff;
}

.title {
	display: block;
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 16rpx;
}

.desc {
	display: block;
	font-size: 28rpx;
	color: #999;
	line-height: 1.5;
}

.order-no {
	display: block;
	margin-top: 20rpx;
	font-size: 24rpx;
	color: #8f8f8f;
	background: #f8f8f8;
	padding: 14rpx 18rpx;
	border-radius: 12rpx;
}

.btns {
	margin-top: 48rpx;
	padding: 0 8rpx;
}

.btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 44rpx;
	font-size: 30rpx;
	margin-bottom: 24rpx;
	border: none;
}

.btn.primary {
	color: #fff;
}

.btn.plain {
	background: #fff;
	color: #333;
	border: 1rpx solid #e5e5e5;
}

.line1 {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
