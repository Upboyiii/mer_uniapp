<template>
	<view class="physio-book-page" :data-theme="theme">
		<view class="card therapist-bar">
			<image
				class="avatar"
				:src="therapistPicture || defaultAvatar"
				mode="aspectFill"
			/>
			<view class="bar-info">
				<view class="name">{{ therapistName || '理疗师' }}</view>
				<view class="sub line1" v-if="therapistDomain">{{ therapistDomain }}</view>
			</view>
		</view>

		<view class="card form-card">
			<!-- 理疗类目选择 -->
			<view class="cell" @click="showCatePicker = true">
				<text class="label">理疗项目</text>
				<view class="picker-val" :class="{ ph: !selectedCate }">
					{{ selectedCate ? selectedCate.name : '请选择理疗项目' }}
					<text class="iconfont icon-ic_rightarrow" style="font-size: 22rpx; margin-left: 8rpx; color: #ccc;"></text>
				</view>
			</view>
			<!-- 价格（类目自动带出，只读） -->
			<view class="cell">
				<text class="label">预约费用</text>
				<view class="cell-val">¥{{ fee }}</view>
			</view>
			<!-- 时长（类目自动带出，只读） -->
			<view class="cell" v-if="duration">
				<text class="label">服务时长</text>
				<view class="cell-val">{{ duration }} 分钟</view>
			</view>
			<!-- 预约日期 -->
			<view class="cell">
				<text class="label">预约日期</text>
				<picker mode="date" :value="datePart" :start="dateStart" @change="onDateChange">
					<view class="picker-val">{{ datePart || '请选择' }}</view>
				</picker>
			</view>
			<!-- 预约时间 -->
			<view class="cell">
				<text class="label">预约时间</text>
				<picker mode="time" :value="timePart" @change="onTimeChange">
					<view class="picker-val">{{ timePart || '请选择' }}</view>
				</picker>
			</view>
		</view>

		<view class="tip">选择理疗项目后费用将自动填入；提交后若费用大于 0 需在线支付。</view>

		<view class="footer">
			<button class="submit-btn bg-color" :disabled="submitting" @click="submit">
				{{ submitting ? '提交中…' : '提交预约' }}
			</button>
		</view>

		<!-- 理疗类目选择弹层 -->
		<view v-if="showCatePicker" class="picker-mask" @click="showCatePicker = false">
			<view class="picker-panel" @click.stop>
				<view class="picker-head">
					<text class="picker-title">选择理疗项目</text>
					<text class="picker-close" @click="showCatePicker = false">关闭</text>
				</view>
				<scroll-view scroll-y class="picker-scroll">
					<view v-if="cateLoading" class="loading-wrap"><text>加载中...</text></view>
					<view
						v-else
						class="cate-row"
						:class="{ active: selectedCate && selectedCate.code === item.code }"
						v-for="(item, idx) in categoryList"
						:key="item.code || idx"
						@click="pickCategory(item)"
					>
						<view class="cate-name">{{ item.name }}</view>
						<view class="cate-extra">
							<text class="cate-price">¥{{ item.price != null ? item.price : 0 }}</text>
							<text class="cate-dur" v-if="item.duration">{{ item.duration }}分钟</text>
						</view>
					</view>
					<view v-if="!cateLoading && categoryList.length === 0" class="empty-txt">暂无理疗项目</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import orderPay from '@/mixins/OrderPay.js';
import {
	getPhysiotherapyCategoryListApi,
	physiotherapyAppointmentSaveApi,
	physiotherapyAppointmentPayApi
} from '@/api/clinic.js';

let app = getApp();
export default {
	mixins: [orderPay],
	data() {
		return {
			theme: app.globalData.theme,
			therapistId: 0,
			mchId: 0,
			therapistName: '',
			therapistDomain: '',
			therapistPicture: '',
			categoryList: [],
			cateLoading: false,
			showCatePicker: false,
			selectedCate: null,
			fee: 0,
			duration: 0,
			datePart: '',
			timePart: '09:00',
			submitting: false
		};
	},
	computed: {
		...mapGetters(['systemPlatform']),
		defaultAvatar() {
			const raw = this.$Cache.get('imgHost') || '';
			if (!raw) return '';
			const host = raw.replace(/\/?$/, '/');
			return `${host}crmebimage/presets/morenT.png`;
		},
		dateStart() {
			const d = new Date();
			const y = d.getFullYear();
			const m = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			return `${y}-${m}-${day}`;
		},
		appointTimeStr() {
			if (!this.datePart || !this.timePart) return '';
			return `${this.datePart} ${this.timePart}:00`;
		}
	},
	onLoad(options) {
		this.therapistId = options.therapistId ? parseInt(options.therapistId, 10) : 0;
		this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
		this.therapistName = options.name ? decodeURIComponent(options.name) : '';
		this.therapistDomain = options.domain ? decodeURIComponent(options.domain) : '';
		this.therapistPicture = options.picture ? decodeURIComponent(options.picture) : '';
		if (!this.datePart) {
			this.datePart = this.dateStart;
		}
		this.loadCategories();
	},
	methods: {
		loadCategories() {
			this.cateLoading = true;
			getPhysiotherapyCategoryListApi({})
				.then(res => {
					let list = res.data || [];
					if (!Array.isArray(list)) {
						list = (res.data && res.data.list) || [];
					}
					this.categoryList = list;
					this.cateLoading = false;
				})
				.catch(() => {
					this.cateLoading = false;
				});
		},
		pickCategory(item) {
			this.selectedCate = item;
			this.fee = item.price != null ? Number(item.price) : 0;
			this.duration = item.duration != null ? Number(item.duration) : 0;
			this.showCatePicker = false;
		},
		onDateChange(e) {
			this.datePart = e.detail.value;
		},
		onTimeChange(e) {
			this.timePart = e.detail.value;
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
		markAppointmentListNeedRefresh() {
			const app = getApp();
			if (app.globalData) {
				app.globalData.physioAppointmentNeedRefresh = true;
			}
		},
		/** 全局标记 + 直接让上一页重拉列表（不依赖 onShow 时序） */
		notifyPrevPageRefresh() {
			const app = getApp();
			if (app.globalData) {
				app.globalData.physioBookJustCreated = true;
				app.globalData.physioAppointmentNeedRefresh = true;
			}
			try {
				const pages = getCurrentPages();
				if (pages.length < 2) return;
				const prev = pages[pages.length - 2];
				const vm = prev.$vm;
				if (!vm) return;
				if (typeof vm.resetList === 'function') vm.resetList();
				vm.loading = false;
				if (typeof vm.getAppointmentList === 'function' && vm.mchId) {
					vm.getAppointmentList();
				} else if (typeof vm.getList === 'function') {
					vm.getList();
				}
			} catch (e) {}
		},
		goBackAfterSubmit() {
			setTimeout(() => {
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 });
				} else {
					uni.redirectTo({ url: '/pages/clinic/appointment/index' });
				}
			}, 400);
		},
		parseAppointmentId(inner) {
			if (inner == null || inner === '') return null;
			if (typeof inner === 'number' && !isNaN(inner)) return inner;
			if (typeof inner === 'string') {
				const t = inner.trim();
				if (!t) return null;
				if (/^\d+$/.test(t)) return parseInt(t, 10);
				return t;
			}
			if (typeof inner === 'object') {
				if (inner.id != null) return inner.id;
				if (inner.data != null) return this.parseAppointmentId(inner.data);
			}
			return null;
		},
		submit() {
			if (!this.therapistId) {
				return this.$util.Tips({ title: '缺少理疗师信息' });
			}
			if (!this.selectedCate) {
				return this.$util.Tips({ title: '请选择理疗项目' });
			}
			if (!this.appointTimeStr) {
				return this.$util.Tips({ title: '请选择预约日期与时间' });
			}
			const body = {
				therapistId: this.therapistId,
				physiotherapyCategory: this.selectedCate.code,
				appointTime: this.appointTimeStr,
				fee: this.fee
			};
			const feeNum = this.fee === '' || this.fee == null ? 0 : Number(this.fee);
			this.submitting = true;
			uni.showLoading({ title: '提交中…' });
			physiotherapyAppointmentSaveApi(body)
				.then((res) => {
					const appointmentId = this.parseAppointmentId(res.data);
					const needPay = !isNaN(feeNum) && feeNum > 0;
					if (needPay && appointmentId != null && appointmentId !== '') {
						return this.doPay(appointmentId, feeNum);
					}
					uni.hideLoading();
					this.submitting = false;
					if (needPay && (appointmentId == null || appointmentId === '')) {
						this.$util.Tips({
							title: '创建成功，未返回预约编号，请到「我的预约」中完成支付'
						});
					} else {
						this.$util.Tips({ title: '预约已提交' });
					}
					this.notifyPrevPageRefresh();
					this.goBackAfterSubmit();
				})
				.catch((err) => {
					uni.hideLoading();
					this.submitting = false;
					this.$util.Tips({ title: err || '提交失败' });
				});
		},
		doPay(appointmentId, payPrice) {
			const { payChannel, payType } = this.resolvePayChannel();
			physiotherapyAppointmentPayApi({
				id: appointmentId,
				payChannel,
				payType,
				from: ''
			})
				.then((payRes) => {
					uni.hideLoading();
					this.submitting = false;
					const d = payRes.data;
					this.markAppointmentListNeedRefresh();
					if (d && d.jsConfig) {
						const goPages = '/pages/clinic/appointment/index';
						this.weixinPay(d.jsConfig, String(d.payOrderNo || appointmentId), goPages, 'normal', '');
					} else {
						this.$util.Tips({ title: '预约已提交' });
						uni.navigateTo({ url: '/pages/clinic/appointment/index' });
					}
				})
				.catch((err) => {
					uni.hideLoading();
					this.submitting = false;
					this.$util.Tips({ title: err || '支付发起失败' });
				});
		}
	}
};
</script>

<style lang="scss" scoped>
.physio-book-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 24rpx;
	padding-bottom: 160rpx;
	box-sizing: border-box;
}

.card {
	background: #fff;
	border-radius: 16rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 24rpx;
}

.therapist-bar {
	display: flex;
	align-items: center;
}

.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	flex-shrink: 0;
	margin-right: 24rpx;
}

.bar-info {
	flex: 1;
	min-width: 0;
}

.name {
	font-size: 32rpx;
	font-weight: 600;
	color: #282828;
}

.sub {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
}

.form-card .cell {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.form-card .cell:last-child {
	border-bottom: none;
}

.label {
	width: 180rpx;
	flex-shrink: 0;
	font-size: 28rpx;
	color: #333;
}

.cell-val {
	flex: 1;
	font-size: 28rpx;
	color: #282828;
	text-align: right;
	font-weight: 500;
}

.input {
	flex: 1;
	font-size: 28rpx;
	text-align: right;
}

.ph {
	color: #ccc;
}

.picker-val {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	text-align: right;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.tip {
	font-size: 24rpx;
	color: #999;
	line-height: 1.5;
	padding: 0 8rpx;
}

.footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
	background: #fff;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 44rpx;
	font-size: 30rpx;
	color: #fff;
	border: none;
}

.line1 {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* ========== 类目弹层 ========== */
.picker-mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.45);
	z-index: 1000;
	display: flex;
	align-items: flex-end;
}

.picker-panel {
	width: 100%;
	max-height: 70vh;
	background: #fff;
	border-radius: 24rpx 24rpx 0 0;
	overflow: hidden;
}

.picker-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx 32rpx;
	border-bottom: 1px solid #f0f0f0;
}

.picker-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #282828;
}

.picker-close {
	font-size: 28rpx;
	color: #999;
}

.picker-scroll {
	max-height: 55vh;
	padding: 0 24rpx 40rpx;
}

.cate-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx 0;
	border-bottom: 1px solid #f5f5f5;

	&.active {
		background: rgba(0, 0, 0, 0.02);
	}
}

.cate-name {
	font-size: 28rpx;
	color: #282828;
	font-weight: 500;
}

.cate-extra {
	display: flex;
	align-items: center;
}

.cate-price {
	font-size: 28rpx;
	color: var(--view-theme);
	font-weight: 600;
	margin-right: 16rpx;
}

.cate-dur {
	font-size: 24rpx;
	color: #999;
}

.empty-txt {
	text-align: center;
	padding: 60rpx 0;
	font-size: 26rpx;
	color: #999;
}

.loading-wrap {
	text-align: center;
	padding: 40rpx 0;
	font-size: 24rpx;
	color: #999;
}
</style>
