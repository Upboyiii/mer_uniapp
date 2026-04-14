<template>
	<view class="pay-success-page" :data-theme="theme">
		<view class="card">
			<view class="icon-wrap">
				<text class="iconfont icon-a-ic_CompleteSelect ok-icon" />
			</view>
			<text class="title">支付成功</text>
			<text class="desc">问诊已提交，您可前往「我的问诊」查看进度</text>
		</view>

		<view class="btns">
			<button class="btn primary bg-color" @click="goMyConsultation">查看我的问诊</button>
			<button class="btn plain" @click="goHome">回到首页</button>
		</view>
	</view>
</template>

<script>
let app = getApp();
export default {
	data() {
		return {
			theme: app.globalData.theme
		};
	},
	methods: {
		goHome() {
			uni.switchTab({ url: '/pages/index/index' });
		},
		goMyConsultation() {
			uni.reLaunch({ url: '/pages/clinic/my_consultation/index' });
		}
	}
};
</script>

<style lang="scss" scoped>
.pay-success-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 48rpx 32rpx;
	box-sizing: border-box;
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
