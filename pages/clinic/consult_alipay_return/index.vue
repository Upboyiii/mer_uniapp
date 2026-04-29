<template>
	<view :data-theme="theme">
		<view class="payment-status">
			<view class="iconfont icons icon-duihao2 bg-color" v-if="order_pay_info.paid === 1"></view>
			<view v-if="order_pay_info.paid === 2" class="iconfont icons icon-iconfontguanbi"></view>
			<view class="status">{{ payResult }}</view>
			<view class="wrapper">
				<view class="item acea-row row-between-wrapper">
					<view>订单编号</view>
					<view class="itemCom">{{ orderId }}</view>
				</view>
				<view class="item acea-row row-between-wrapper">
					<view>下单时间</view>
					<view class="itemCom">{{ order_pay_info.createTime ? order_pay_info.createTime : '-' }}</view>
				</view>
				<view class="item acea-row row-between-wrapper">
					<view>支付方式</view>
					<view class="itemCom">支付宝支付</view>
				</view>
				<view class="item acea-row row-between-wrapper">
					<view>支付金额</view>
					<view class="itemCom">{{ order_pay_info.payPrice }}</view>
				</view>
				<view class="item acea-row row-between-wrapper" v-if="order_pay_info.paid === 2">
					<view>失败原因</view>
					<view class="itemCom">{{ msg || '支付未完成或已取消' }}</view>
				</view>
			</view>
			<view @tap="goPrimary">
				<button formType="submit" class="returnBnt bg-color" hover-class="none">
					{{ order_pay_info.paid === 1 ? '返回问诊列表' : '返回问诊页' }}
				</button>
			</view>
			<button @click="goIndex" class="returnBnt cart-color" formType="submit" hover-class="none">
				返回首页
			</button>
		</view>
	</view>
</template>

<script>
import { getDoctorConsultationInfoApi } from '@/api/clinic.js';
let app = getApp();

/** 与 interface.md 一致，便于控制台对照 */
const CONSULT_INFO_PATH = '/api/front/doctor/consultation/info';

const CONSULT_PAY_STORAGE_ID = 'clinicConsultPayConsultationId';

export default {
	data() {
		return {
			orderId: '',
			/** 回跳 URL 参数 clinicConsultationId，对应 GET doctor/consultation/info 的 id */
			consultationQueryId: '',
			order_pay_info: {
				paid: 0,
				_status: {}
			},
			msg: '',
			payResult: '订单查询中...',
			theme: app.globalData.theme
		};
	},
	onLoad() {
		const finish = () => {
			const hasConsult =
				this.consultationQueryId != null && String(this.consultationQueryId).trim() !== '';
			if (this.orderId || hasConsult) this.getShowInfo();
		};

		// #ifdef H5
		const url = window.location.search;
		if (url && url.indexOf('?') !== -1) {
			const str = url.substr(1);
			const parts = str.split('&');
			const query = {};
			for (let i = 0; i < parts.length; i++) {
				const kv = parts[i].split('=');
				query[kv[0]] = decodeURIComponent(kv[1] || '');
			}
			this.orderId = query.out_trade_no || '';
			this.consultationQueryId = query.clinicConsultationId || '';
		}
		if (!this.orderId) {
			this.orderId = uni.getStorageSync('orderNo') || '';
		}
		try {
			if (!this.consultationQueryId) {
				const c = uni.getStorageSync(CONSULT_PAY_STORAGE_ID);
				if (c) this.consultationQueryId = String(c).trim();
			}
		} catch (e) {}
		finish();
		// #endif

		// #ifdef APP-PLUS
		this.orderId = this.$Route && this.$Route.query ? this.$Route.query.out_trade_no : '';
		if (this.$Route && this.$Route.query) {
			this.consultationQueryId = this.$Route.query.clinicConsultationId || '';
		}
		if (!this.consultationQueryId) {
			try {
				const c = uni.getStorageSync(CONSULT_PAY_STORAGE_ID);
				if (c) this.consultationQueryId = String(c).trim();
			} catch (e) {}
		}
		finish();
		// #endif
	},
	methods: {
		resolveConsultationDetailId() {
			const qid = this.consultationQueryId;
			if (qid != null && String(qid).trim() !== '') {
				return String(qid).trim();
			}
			try {
				const s = uni.getStorageSync(CONSULT_PAY_STORAGE_ID);
				if (s != null && String(s).trim() !== '') {
					return String(s).trim();
				}
			} catch (e) {}
			return this.orderId;
		},
		/** 与 interface.md「Consultation 对象」：payStatus 0/1/2 */
		mapConsultationDetailToPayInfo(data) {
			return {
				paid: data.payStatus === 1 ? 1 : 2,
				createTime: data.createTime,
				payPrice: data.consultFee,
				orderNo: data.payOrderNo
			};
		},
		getShowInfo() {
			setTimeout(() => {
				this.getOrderPayInfo();
			}, 200);
		},
		getOrderPayInfo() {
			uni.showLoading({ title: '正在加载中' });
			const id = this.resolveConsultationDetailId();
			if (!id) {
				uni.hideLoading();
				this.payResult = '加载失败';
				this.msg = '缺少问诊单 id，无法查询详情';
				console.warn('[consult_alipay_return] 未请求接口：缺少 id', {
					页面: 'consult_alipay_return',
					预期接口: CONSULT_INFO_PATH,
					out_trade_no: this.orderId,
					clinicConsultationId: this.consultationQueryId
				});
				return;
			}
			console.log('[consult_alipay_return] 仅调用问诊详情（仅此一条业务接口）', {
				接口: CONSULT_INFO_PATH,
				query: { id },
				前端封装: 'getDoctorConsultationInfoApi → request.get("doctor/consultation/info", { id })',
				out_trade_no: this.orderId || '(无)'
			});
			getDoctorConsultationInfoApi(id)
				.then((res) => {
					console.log('[consult_alipay_return] 问诊详情响应', CONSULT_INFO_PATH, res);
					const data = res.data || {};
					this.$set(this, 'order_pay_info', this.mapConsultationDetailToPayInfo(data));
					const ps = data.payStatus;
					if (ps === 1) {
						this.payResult = '支付成功';
						uni.setNavigationBarTitle({ title: '支付成功' });
					} else if (ps === 2) {
						this.payResult = '已退款';
						this.msg = '问诊订单已退款';
						uni.setNavigationBarTitle({ title: '支付结果' });
					} else {
						this.payResult = '支付未完成';
						this.msg = '问诊仍为未支付状态，请稍后刷新或重新支付';
						uni.setNavigationBarTitle({ title: '支付失败' });
					}
					uni.hideLoading();
				})
				.catch((err) => {
					console.warn('[consult_alipay_return] 问诊详情失败', CONSULT_INFO_PATH, err);
					uni.hideLoading();
					this.payResult = '加载失败';
					this.msg = err || '问诊详情加载失败';
				});
		},
		goPrimary() {
			try {
				uni.removeStorageSync(CONSULT_PAY_STORAGE_ID);
			} catch (e) {}
			const target =
				this.order_pay_info.paid === 1
					? '/pages/clinic/my_consultation/index'
					: '/pages/clinic/consult_book/index';
			uni.redirectTo({ url: target });
		},
		goIndex() {
			this.$util.navigateTo('/pages/index/index');
		}
	}
};
</script>

<style lang="scss">
.icon-iconfontguanbi {
	background-color: #999 !important;
	text-shadow: none !important;
}

.cart_color {
	@include main_color(theme);
	@include coupons_border_color(theme);
}

.payment-status {
	background-color: #fff;
	margin: 195rpx 30rpx 0 30rpx;
	border-radius: 10rpx;
	padding: 1rpx 0 28rpx 0;
}

.payment-status .icons {
	font-size: 70rpx;
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	color: #fff;
	text-align: center;
	line-height: 140rpx;
	text-shadow: 0px 4px 0px #df1e14;
	border: 6rpx solid #f5f5f5;
	margin: -76rpx auto 0 auto;
	background-color: #999;
}

.payment-status .iconfont {
	font-size: 70rpx;
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	color: #fff;
	text-align: center;
	line-height: 140rpx;
	text-shadow: 0px 4px 0px #df1e14;
	border: 6rpx solid #f5f5f5;
	margin: -76rpx auto 0 auto;
	background-color: #999;
}

.payment-status .status {
	font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	margin: 25rpx 0 37rpx 0;
}

.payment-status .wrapper {
	border: 1rpx solid #eee;
	margin: 0 30rpx 47rpx 30rpx;
	padding: 35rpx 0;
	border-left: 0;
	border-right: 0;
}

.payment-status .wrapper .item {
	font-size: 28rpx;
	color: #282828;
}

.payment-status .wrapper .item ~ .item {
	margin-top: 20rpx;
}

.payment-status .wrapper .item .itemCom {
	color: #666;
}

.payment-status .returnBnt {
	width: 630rpx;
	height: 86rpx;
	border-radius: 50rpx;
	color: #fff;
	font-size: 30rpx;
	text-align: center;
	line-height: 86rpx;
	margin: 0 auto 20rpx auto;
}

.cart-color {
	@include main_color(theme);
	@include coupons_border_color(theme);
}
</style>
