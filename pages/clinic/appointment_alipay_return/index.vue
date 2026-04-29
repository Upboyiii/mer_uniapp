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
					{{ order_pay_info.paid === 1 ? '返回我的预约' : '返回预约列表' }}
				</button>
			</view>
			<button @click="goIndex" class="returnBnt cart-color" formType="submit" hover-class="none">
				返回首页
			</button>
		</view>
	</view>
</template>

<script>
import { getOrderDetail } from '@/api/order.js';
import {
	getTcmAppointmentInfoApi,
	getPhysiotherapyAppointmentInfoApi,
	findClinicAppointmentMetaByPayKey
} from '@/api/clinic.js';
let app = getApp();

const CLINIC_APPOINT_STORAGE_ID = 'clinicAppointmentPayAppointmentId';
const CLINIC_APPOINT_STORAGE_CAT = 'clinicAppointmentPayCategory';

export default {
	data() {
		return {
			orderId: '',
			// 支付来源类型：用于区分 tcm / physio
			// 例如：clinic_appointment_tcm、clinic_appointment_physio
			fromType: '',
			// 支付回跳 URL 上携带（不依赖本地缓存）
			clinicQueryId: '',
			clinicQueryCategory: '',
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
			const hasAppoint =
				this.clinicQueryId != null && String(this.clinicQueryId).trim() !== '';
			if (this.orderId || hasAppoint) this.getShowInfo();
		};

		// #ifdef H5
		const url = window.location.search;
		if (url && url.indexOf('?') !== -1) {
			const str = url.substr(1);
			const parts = str.split('&');
			const query = {};
			for (let i = 0; i < parts.length; i++) {
				const kv = parts[i].split('=');
				query[kv[0]] = decodeURI(kv[1] || '');
			}
			this.orderId = query.out_trade_no || '';
			this.fromType = query.fromType || query.from || '';
			this.clinicQueryId = query.clinicAppointmentId || '';
			this.clinicQueryCategory = query.clinicPayCategory || '';
		}
		if (!this.orderId) {
			this.orderId = uni.getStorageSync('orderNo') || '';
		}
		try {
			if (!this.clinicQueryId) {
				const aid = uni.getStorageSync(CLINIC_APPOINT_STORAGE_ID);
				if (aid) this.clinicQueryId = String(aid).trim();
			}
			const fromStore = uni.getStorageSync('payResultfromType');
			if (fromStore && !this.fromType) {
				this.fromType = fromStore;
			}
		} catch (e) {}
		finish();
		// #endif

		// #ifdef APP-PLUS
		this.orderId = this.$Route && this.$Route.query ? this.$Route.query.out_trade_no : '';
		this.fromType =
			this.$Route && this.$Route.query
				? this.$Route.query.fromType || this.$Route.query.from || ''
				: '';
		if (this.$Route && this.$Route.query) {
			this.clinicQueryId = this.$Route.query.clinicAppointmentId || '';
			this.clinicQueryCategory = this.$Route.query.clinicPayCategory || '';
		}
		if (!this.clinicQueryId) {
			try {
				const aid = uni.getStorageSync(CLINIC_APPOINT_STORAGE_ID);
				if (aid) this.clinicQueryId = String(aid).trim();
			} catch (e) {}
		}
		finish();
		// #endif
	},
	methods: {
		resolveAppointmentPayCategory() {
			const qc = this.clinicQueryCategory;
			if (qc === 'tcm' || qc === 'physio') return qc;
			if (this.fromType === 'clinic_appointment_tcm') return 'tcm';
			if (this.fromType === 'clinic_appointment_physio') return 'physio';
			if (this.fromType === 'clinic_appointment') {
				const raw = uni.getStorageSync(CLINIC_APPOINT_STORAGE_CAT);
				return raw === 'tcm' || raw === 'physio' ? raw : '';
			}
			const raw = uni.getStorageSync(CLINIC_APPOINT_STORAGE_CAT);
			return raw === 'tcm' || raw === 'physio' ? raw : '';
		},
		resolveAppointmentDetailId() {
			const qid = this.clinicQueryId;
			if (qid != null && String(qid).trim() !== '') {
				return String(qid).trim();
			}
			const s = uni.getStorageSync(CLINIC_APPOINT_STORAGE_ID);
			if (s != null && String(s).trim() !== '') {
				return String(s).trim();
			}
			return this.orderId;
		},
		/** interface.md：payStatus 0未支付 1已支付 2已退款 */
		mapAppointmentDetailToPayInfo(data) {
			return {
				paid: data.payStatus === 1 ? 1 : 2,
				createTime: data.createTime,
				payPrice: data.amount != null ? data.amount : data.payPrice,
				payType: data.payType,
				orderNo: data.orderNo
			};
		},
		applyPayStatusFromAppointmentDetail(data) {
			const ps = data.payStatus;
			if (ps === 1) {
				this.payResult = '支付成功';
				uni.setNavigationBarTitle({ title: '支付成功' });
			} else if (ps === 2) {
				this.payResult = '已退款';
				this.msg = '预约订单已退款';
				uni.setNavigationBarTitle({ title: '支付结果' });
			} else {
				this.payResult = '支付未完成';
				this.msg = '预约仍为未支付状态，请稍后刷新或重新支付';
				uni.setNavigationBarTitle({ title: '支付失败' });
			}
			uni.hideLoading();
		},
		applyPayStatusFromMallOrderDetail(data) {
			const paid = data.paid === true || data.paid === 1;
			if (paid) {
				this.payResult = '支付成功';
				this.order_pay_info.paid = 1;
				uni.setNavigationBarTitle({ title: '支付成功' });
			} else {
				this.payResult = '支付失败';
				this.order_pay_info.paid = 2;
				this.msg = '支付未完成或已取消';
				uni.setNavigationBarTitle({ title: '支付失败' });
			}
			uni.hideLoading();
		},
		getShowInfo() {
			setTimeout(() => {
				this.getOrderPayInfo();
			}, 200);
		},
		getOrderPayInfo() {
			uni.showLoading({ title: '正在加载中' });
			const applyAppointment = (cat, id) => {
				const req =
					cat === 'tcm'
						? getTcmAppointmentInfoApi(id)
						: getPhysiotherapyAppointmentInfoApi(id);
				return req.then((res) => {
					const d = res.data || {};
					this.$set(this, 'order_pay_info', this.mapAppointmentDetailToPayInfo(d));
					this.applyPayStatusFromAppointmentDetail(d);
				});
			};
			const fallbackMallOrder = () =>
				getOrderDetail(this.orderId)
					.then((res) => {
						this.$set(this, 'order_pay_info', res.data);
						this.applyPayStatusFromMallOrderDetail(res.data || {});
					})
					.catch(() => {
						uni.hideLoading();
					});

			let category = this.resolveAppointmentPayCategory();
			const detailId = this.resolveAppointmentDetailId();

			const run = () => {
				if (category === 'tcm' || category === 'physio') {
					return applyAppointment(category, detailId).catch(() =>
						findClinicAppointmentMetaByPayKey(this.orderId).then((meta) => {
							if (!meta) return fallbackMallOrder();
							return applyAppointment(meta.category, meta.id);
						})
					);
				}
				return findClinicAppointmentMetaByPayKey(this.orderId).then((meta) => {
					if (!meta) return fallbackMallOrder();
					return applyAppointment(meta.category, meta.id);
				});
			};

			run().catch(() => {
				uni.hideLoading();
			});
		},
		goPrimary() {
			const categoryFromFromType =
				this.fromType === 'clinic_appointment_tcm'
					? 'tcm'
					: this.fromType === 'clinic_appointment_physio'
						? 'physio'
						: '';

			const categoryFromQuery =
				this.clinicQueryCategory === 'tcm' || this.clinicQueryCategory === 'physio'
					? this.clinicQueryCategory
					: '';

			const raw = uni.getStorageSync(CLINIC_APPOINT_STORAGE_CAT);
			const categoryFromStorage = raw === 'tcm' || raw === 'physio' ? raw : '';
			const category = categoryFromFromType || categoryFromQuery || categoryFromStorage;

			// 读取后清理，避免后续未相关支付误用旧分类
			try {
				uni.removeStorageSync(CLINIC_APPOINT_STORAGE_CAT);
				uni.removeStorageSync(CLINIC_APPOINT_STORAGE_ID);
			} catch (e) {}

			uni.redirectTo({
				url: category
					? `/pages/clinic/appointment/index?category=${encodeURIComponent(category)}`
					: '/pages/clinic/appointment/index'
			});
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
