<template>
	<view :data-theme="theme">
		<view class='payment-status'>
			<!--失败时： 用icon-iconfontguanbi fail替换icon-duihao2 bg-color-->
			<view class='iconfont icons icon-duihao2 bg-color' v-if="order_pay_info.paid === 1"></view>
			<view v-if="order_pay_info.paid === 2" class='iconfont icons icon-iconfontguanbi'></view>
			<!-- 失败时：订单支付失败 -->
			<view class='status'>{{payResult}}</view>
			<view class='wrapper'>
				<view v-if="fromType !=='svip'" class='item acea-row row-between-wrapper'>
					<view>订单编号</view>
					<view class='itemCom'>{{orderId}}</view>
				</view>
				<view v-if="fromType !=='svip'" class='item acea-row row-between-wrapper'>
					<view>下单时间</view>
					<view class='itemCom'>{{order_pay_info.createTime?order_pay_info.createTime:'-'}}</view>
				</view>
				<view class='item acea-row row-between-wrapper'>
					<view>支付方式</view>
					<view class='itemCom'>支付宝支付</view>
				</view>
				<view v-if="fromType !=='svip'" class='item acea-row row-between-wrapper'>
					<view>支付金额</view>
					<view class='itemCom'>{{order_pay_info.payPrice}}</view>
				</view>
				<!--失败时加上这个  -->
				<view class='item acea-row row-between-wrapper' v-if="order_pay_info.paid === 2">
					<view>失败原因</view>
					<view class='itemCom'>{{msg}}</view>
				</view>
			</view>
			<!--失败时： 重新购买 -->
			<view @tap="goOrderDetails">
				<button formType="submit" class='returnBnt bg-color' hover-class='none'>{{ primaryButtonText() }}</button>
			</view>
			<button @click="goIndex" class='returnBnt cart-color' formType="submit" hover-class='none'>返回首页</button>
		</view>
	</view>
</template>

<script>
	// +----------------------------------------------------------------------
	// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
	// +----------------------------------------------------------------------
	// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
	// +----------------------------------------------------------------------
	// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
	// +----------------------------------------------------------------------
	// | Author: CRMEB Team <admin@crmeb.com>
	// +----------------------------------------------------------------------
	import {
		getOrderDetail,
		alipayQueryPayResult
	} from '@/api/order.js';
	import {
		getTcmAppointmentInfoApi,
		getPhysiotherapyAppointmentInfoApi,
		findClinicAppointmentMetaByPayKey,
		getDoctorConsultationInfoApi,
		findConsultationMetaByPayKey
	} from '@/api/clinic.js';

	const CLINIC_APPOINT_STORAGE_ID = 'clinicAppointmentPayAppointmentId';
	const CLINIC_APPOINT_STORAGE_CAT = 'clinicAppointmentPayCategory';
	const CONSULT_PAY_STORAGE_ID = 'clinicConsultPayConsultationId';

	let app = getApp();
	export default {
		data() {
			return {
				orderId: '',
				payPrice: '',
				order_pay_info: {
					paid: 0,
					_status: {}
				},
				isAuto: false, //没有授权的不会自动授权
				isShowAuth: false, //是否隐藏授权
				status: 0,
				msg: '',
				payResult: '订单查询中...',
				payTime: '',
				theme: app.globalData.theme,
				fromType: '', //会员支付 还是商品支付
				clinicQueryId: '',
				clinicQueryCategory: '',
				consultQueryId: ''
			};
		},
		onLoad(options) {
			// #ifdef H5
			var url = window.location.search;
			let that = this
			try {
				const ft = uni.getStorageSync('payResultfromType');
				if (ft) that.fromType = ft;
			} catch (e) {}
			uni.getStorage({
				key: 'payResultfromType',
				success: function(res) {
					if (res.data) that.fromType = res.data;
				}
			});
			if (url) {
				var theRequest = new Object();
				if (url.indexOf("?") != -1) {
					var str = url.substr(1);
					var strs = str.split("&");
					for (var i = 0; i < strs.length; i++) {
						theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
					}
				}
				this.orderId = theRequest.out_trade_no; //返回的订单号
				this.clinicQueryId = theRequest.clinicAppointmentId || '';
				this.clinicQueryCategory = theRequest.clinicPayCategory || '';
				this.consultQueryId = theRequest.clinicConsultationId || '';
				this.getShowInfo(options)
			} else {
				uni.getStorage({
					key: 'orderNo',
					success: function(res) {
						that.orderId = res.data; //如果是支付宝中途放弃支付跳转到这个页面，就从缓存读取订单号查询订单详情和支付结果
						that.getShowInfo(options)
					}
				});
			}
			// #endif

			// #ifdef APP-PLUS
			this.fromType = options.fromType
			this.orderId = options.out_trade_no;
			this.clinicQueryId = options.clinicAppointmentId || '';
			this.clinicQueryCategory = options.clinicPayCategory || '';
			this.consultQueryId = options.clinicConsultationId || '';
			this.getShowInfo(options)
			// #endif
		},
		methods: {
			getShowInfo(options) {
				if (this.fromType !== 'svip') {
					setTimeout(() => {
						this.getOrderPayInfo();
					}, 200)
				} else {
					this.alipayQueryPay();
					this.order_pay_info.payPrice = options.payPrice
				}
			},
			resolveClinicAppointmentCategory() {
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
			resolveClinicAppointmentDetailId() {
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
			mapClinicAppointmentDetailToPayInfo(data) {
				return {
					paid: data.payStatus === 1 ? 1 : 2,
					createTime: data.createTime,
					payPrice: data.amount != null ? data.amount : data.payPrice,
					payType: data.payType,
					orderNo: data.orderNo
				};
			},
			resolveConsultationDetailId() {
				const qid = this.consultQueryId;
				if (qid != null && String(qid).trim() !== '') {
					return String(qid).trim();
				}
				const s = uni.getStorageSync(CONSULT_PAY_STORAGE_ID);
				if (s != null && String(s).trim() !== '') {
					return String(s).trim();
				}
				return this.orderId;
			},
			mapConsultationDetailToPayInfo(data) {
				return {
					paid: data.payStatus === 1 ? 1 : 2,
					createTime: data.createTime,
					payPrice: data.consultFee,
					orderNo: data.payOrderNo
				};
			},
			/** 诊所详情接口返回的 payStatus：0未支付 1已支付 2已退款（不请求 pay/query/ali） */
			applyPayStatusFromClinicDetail(data, kind) {
				const ps = data.payStatus;
				if (ps === 1) {
					this.payResult = '支付成功';
					uni.setNavigationBarTitle({ title: '支付成功' });
				} else if (ps === 2) {
					this.payResult = '已退款';
					this.msg = kind === 'consult' ? '问诊订单已退款' : '预约订单已退款';
					uni.setNavigationBarTitle({ title: '支付结果' });
				} else {
					this.payResult = '支付未完成';
					this.msg =
						kind === 'consult'
							? '问诊仍为未支付状态，请稍后刷新或重新支付'
							: '预约仍为未支付状态，请稍后刷新或重新支付';
					uni.setNavigationBarTitle({ title: '支付失败' });
				}
				uni.hideLoading();
			},
			applyPayStatusFromMallOrderDetail(d) {
				const paid = d.paid === true || d.paid === 1;
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
			getOrderPayInfo: function() {
				let that = this;
				uni.showLoading({
					title: '正在加载中'
				});
				const applyConsult = (id) =>
					getDoctorConsultationInfoApi(id).then((res) => {
						const data = res.data || {};
						that.$set(that, 'order_pay_info', that.mapConsultationDetailToPayInfo(data));
						that.applyPayStatusFromClinicDetail(data, 'consult');
					});
				const applyAppointment = (cat, id) => {
					const api =
						cat === 'tcm'
							? getTcmAppointmentInfoApi(id)
							: getPhysiotherapyAppointmentInfoApi(id);
					return api.then((res) => {
						const data = res.data || {};
						that.$set(that, 'order_pay_info', that.mapClinicAppointmentDetailToPayInfo(data));
						that.applyPayStatusFromClinicDetail(data, 'appointment');
					});
				};
				const fallbackMallOrder = () =>
					getOrderDetail(that.orderId).then((res) => {
						const d = res.data || {};
						that.$set(that, 'order_pay_info', d);
						that.applyPayStatusFromMallOrderDetail(d);
					});

				if (that.fromType === 'clinic_consult') {
					const detailId = that.resolveConsultationDetailId();
					const runConsult = () =>
						applyConsult(detailId).catch(() =>
							findConsultationMetaByPayKey(that.orderId).then((meta) => {
								if (!meta) return fallbackMallOrder();
								return applyConsult(meta.id);
							})
						);
					runConsult().catch(() => {
						uni.hideLoading();
					});
					return;
				}

				if (!that.isClinicFromType()) {
					fallbackMallOrder()
						.catch(() => {
							uni.hideLoading();
						});
					return;
				}

				const category = that.resolveClinicAppointmentCategory();
				const detailId = that.resolveClinicAppointmentDetailId();

				const run = () => {
					if (category === 'tcm' || category === 'physio') {
						return applyAppointment(category, detailId).catch(() =>
							findClinicAppointmentMetaByPayKey(that.orderId).then((meta) => {
								if (!meta) return fallbackMallOrder();
								return applyAppointment(meta.category, meta.id);
							})
						);
					}
					return findClinicAppointmentMetaByPayKey(that.orderId).then((meta) => {
						if (!meta) return fallbackMallOrder();
						return applyAppointment(meta.category, meta.id);
					});
				};

				run().catch(() => {
					uni.hideLoading();
				});
			},
			alipayQueryPay() {
				alipayQueryPayResult(this.orderId).then(res => {
					if (res.data) {
						this.payResult = '支付成功';
						uni.setNavigationBarTitle({
							title: '支付成功'
						});
						this.order_pay_info.paid = 1;
					} else {
						this.payResult = '支付失败';
						uni.setNavigationBarTitle({
							title: '支付失败'
						});
						this.order_pay_info.paid = 2;
					}
					uni.hideLoading();
				}).catch(err => {
					this.order_pay_info.paid = 2;
					this.payResult = err;
					this.msg = err;
					uni.hideLoading();
					return this.$util.Tips({
						title: err
					});
				})
			},
			isClinicFromType() {
				return (
					this.fromType === 'clinic_consult' ||
					this.fromType === 'clinic_appointment' ||
					this.fromType === 'clinic_appointment_tcm' ||
					this.fromType === 'clinic_appointment_physio'
				);
			},
			primaryButtonText() {
				if (this.fromType === 'svip') return '查看会员';
				if (!this.isClinicFromType()) return '查看订单';
				return this.order_pay_info.paid === 1 ? '返回业务页' : '重新处理';
			},
			goOrderDetails() {
				if (this.fromType === 'clinic_consult') {
					try {
						uni.removeStorageSync(CONSULT_PAY_STORAGE_ID);
					} catch (e) {}
					const target =
						this.order_pay_info.paid === 1
							? '/pages/clinic/my_consultation/index'
							: '/pages/clinic/consult_book/index';
					uni.redirectTo({ url: target });
					return;
				}
				if (
					this.fromType === 'clinic_appointment' ||
					this.fromType === 'clinic_appointment_tcm' ||
					this.fromType === 'clinic_appointment_physio'
				) {
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

					const raw = uni.getStorageSync('clinicAppointmentPayCategory');
					const categoryFromStorage = raw === 'tcm' || raw === 'physio' ? raw : '';

					const category = categoryFromFromType || categoryFromQuery || categoryFromStorage;

					try {
						uni.removeStorageSync(CLINIC_APPOINT_STORAGE_CAT);
						uni.removeStorageSync(CLINIC_APPOINT_STORAGE_ID);
					} catch (e) {}

					uni.redirectTo({
						url: category
							? `/pages/clinic/appointment/index?category=${encodeURIComponent(category)}`
							: '/pages/clinic/appointment/index'
					});
					return;
				}
				uni.navigateTo({
					url: this.fromType !=='svip'?'/pages/goods/order_list/index':'/pages/activity/vip_paid/index'
				});
			},
			goIndex() {
        this.$util.navigateTo('/pages/index/index');
			}
		}
	}
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

	.payment-status .iconfont.fail {
		text-shadow: 0px 4px 0px #7a7a7a;
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

	.payment-status .wrapper .item~.item {
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