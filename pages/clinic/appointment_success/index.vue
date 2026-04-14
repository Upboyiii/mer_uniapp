<template>
	<view class="appointment-success-page" :data-theme="theme">
		<!-- 自定义顶栏：仅标题，无返回（避免用户返回支付栈） -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-inner" :style="{ minHeight: navContentPx + 'px' }">
				<text class="nav-title">预约成功</text>
			</view>
		</view>

		<view class="card">
			<view class="icon-wrap">
				<text class="iconfont icon-a-ic_CompleteSelect ok-icon" />
			</view>
			<text class="title">预约成功</text>
			<text class="desc">您可在「我的预约」中查看订单并支付或管理预约</text>
		</view>

		<view class="btns">
			<button class="btn plain" @click="goHome">回到首页</button>
			<button class="btn primary bg-color" @click="goMyAppointment">我的预约</button>
		</view>
	</view>
</template>

<script>
let app = getApp();
export default {
	data() {
		return {
			theme: app.globalData.theme,
			/** physio | tcm，传给「我的预约」默认 Tab */
			category: 'physio',
			statusBarHeight: 20,
			navContentPx: 44
		};
	},
	onLoad(options) {
		const sys = uni.getSystemInfoSync();
		this.statusBarHeight = sys.statusBarHeight || 20;
		const c = options.category === 'tcm' ? 'tcm' : 'physio';
		this.category = c;
	},
	methods: {
		goHome() {
			uni.switchTab({ url: '/pages/index/index' });
		},
		goMyAppointment() {
			const q = `category=${encodeURIComponent(this.category)}`;
			uni.navigateTo({ url: `/pages/clinic/appointment/index?${q}` });
		}
	}
};
</script>

<style lang="scss" scoped>
.appointment-success-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 0 32rpx 48rpx;
	box-sizing: border-box;
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
	border-radius: 16rpx;
	padding: 56rpx 40rpx 48rpx;
	text-align: center;
}

.icon-wrap {
	margin-bottom: 24rpx;
}

.ok-icon {
	font-size: 120rpx;
	color: #07c160;
	line-height: 1;
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
</style>
