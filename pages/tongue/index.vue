<template>
	<view class="tongue-page" :data-theme="theme">
		<!-- 顶部背景装饰 -->
		<view class="header-section">
			<view class="header-bg">
				<view class="bg-circle bg-circle-1"></view>
				<view class="bg-circle bg-circle-2"></view>
				<view class="bg-circle bg-circle-3"></view>
			</view>
			<view class="header-content">
				<text class="main-title">智能舌诊</text>
				<view class="sub-badge">
					<text class="sub-badge-text">5秒快速体验</text>
				</view>

				<!-- 舌诊圆形插图区 -->
				<view class="tongue-circle-wrap">
					<view class="tongue-ring">
						<view class="tongue-inner">
							<image class="tongue-img" src="/static/images/tongue-icon.png" mode="aspectFit"></image>
						</view>
					</view>
					<view class="label-bubble label-left-top">
						<text class="label-text">舌诊报告1V1解读</text>
					</view>
					<view class="label-bubble label-right-top">
						<text class="label-text">健康诊断分析</text>
					</view>
					<view class="label-bubble label-left-bottom">
						<text class="label-text">舌象全面分析</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 注意事项区 -->
		<view class="tips-section">
			<view class="tips-icons">
				<view class="tip-item">
					<image class="tip-img" src="/static/images/tip-face.svg" mode="aspectFit"></image>
					<text class="tip-name">面部遮挡</text>
				</view>
				<view class="tip-item">
					<image class="tip-img" src="/static/images/tip-food.svg" mode="aspectFit"></image>
					<text class="tip-name">有色食物</text>
				</view>
				<view class="tip-item">
					<image class="tip-img" src="/static/images/tip-blur.svg" mode="aspectFit"></image>
					<text class="tip-name">相机模糊</text>
				</view>
				<view class="tip-item">
					<image class="tip-img" src="/static/images/tip-dark.svg" mode="aspectFit"></image>
					<text class="tip-name">光线过暗</text>
				</view>
			</view>
			<text class="tips-warn">光线会影响舌诊判断，最好在自然光下体验</text>
		</view>

		<!-- 操作按钮区 -->
		<view class="action-section">
			<view class="history-link" @click="goHistory">
				<text class="history-text">查看历史记录</text>
			</view>
			<view class="btn-primary" @click="startDiagnosis">
				<text class="btn-primary-text">立即体验</text>
			</view>
			<view class="btn-share" @click="shareToWechat">
				<image class="wechat-icon" src="/static/images/wechat-icon.svg" mode="aspectFit"></image>
				<text class="btn-share-text">分享到微信</text>
			</view>
		</view>

		<view v-if="bottomNavigationIsCustom" class="footerBottom"></view>
		<pageFooter></pageFooter>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import pageFooter from '@/components/pageFooter/index.vue';
export default {
	components: { pageFooter },
	data() {
		return {};
	},
	computed: {
		...mapGetters(['viewColor', 'keyColor', 'bottomNavigationIsCustom']),
		theme() {
			return this.viewColor || '';
		}
	},
	onLoad(options) {},
	methods: {
		startDiagnosis() {
			this.$util.Tips({ title: '舌诊功能开发中' });
		},
		goHistory() {
			this.$util.Tips({ title: '历史记录开发中' });
		},
		shareToWechat() {
			// #ifdef MP
			// 小程序分享由 onShareAppMessage 处理
			// #endif
			// #ifndef MP
			this.$util.Tips({ title: '分享功能开发中' });
			// #endif
		}
	},
	onShareAppMessage() {
		return {
			title: '智能舌诊 - 5秒快速体验',
			path: '/pages/tongue/index'
		};
	}
};
</script>

<style lang="scss" scoped>
.tongue-page {
	min-height: 100vh;
	background: #fff;
}

/* 顶部区域 */
.header-section {
	position: relative;
	overflow: hidden;
	padding-bottom: 40rpx;
}
.header-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 100%;
	background: linear-gradient(180deg, var(--view-theme, #e93323) 0%, rgba(255,255,255,0) 100%);
	opacity: 0.1;
}
.bg-circle {
	position: absolute;
	border-radius: 50%;
	opacity: 0.15;
	background: var(--view-theme, #e93323);
}
.bg-circle-1 {
	width: 400rpx;
	height: 400rpx;
	top: -100rpx;
	right: -80rpx;
	opacity: 0.08;
}
.bg-circle-2 {
	width: 300rpx;
	height: 300rpx;
	top: 60rpx;
	left: -100rpx;
	opacity: 0.06;
}
.bg-circle-3 {
	width: 200rpx;
	height: 200rpx;
	top: 300rpx;
	right: 40rpx;
	opacity: 0.04;
}

.header-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 40rpx;
}
.main-title {
	font-size: 56rpx;
	font-weight: bold;
	color: #333;
	letter-spacing: 4rpx;
}
.sub-badge {
	margin-top: 20rpx;
	padding: 10rpx 36rpx;
	background: rgba(255, 255, 255, 0.85);
	border-radius: 30rpx;
	border: 1rpx solid rgba(0,0,0,0.05);
}
.sub-badge-text {
	font-size: 26rpx;
	color: #666;
}

/* 舌诊圆形区 */
.tongue-circle-wrap {
	position: relative;
	width: 500rpx;
	height: 500rpx;
	margin-top: 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}
.tongue-ring {
	width: 380rpx;
	height: 380rpx;
	border-radius: 50%;
	background: var(--view-theme, #e93323);
	opacity: 0.85;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 0 60rpx rgba(0, 0, 0, 0.08);
}
.tongue-inner {
	width: 280rpx;
	height: 280rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.75);
	display: flex;
	justify-content: center;
	align-items: center;
}
.tongue-img {
	width: 160rpx;
	height: 200rpx;
}

/* 标签气泡 */
.label-bubble {
	position: absolute;
	padding: 12rpx 24rpx;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	background: #fff;
}
.label-text {
	font-size: 24rpx;
	font-weight: 500;
	white-space: nowrap;
}
.label-left-top {
	top: 40rpx;
	left: -20rpx;
	.label-text { color: #4caf50; }
}
.label-right-top {
	top: 80rpx;
	right: -30rpx;
	.label-text { color: #4285f4; }
}
.label-left-bottom {
	bottom: 60rpx;
	left: -30rpx;
	.label-text { color: var(--view-theme, #e93323); }
}

/* 注意事项 */
.tips-section {
	padding: 40rpx 40rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.tips-icons {
	display: flex;
	justify-content: center;
	gap: 40rpx;
	margin-bottom: 20rpx;
}
.tip-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.tip-img {
	width: 90rpx;
	height: 90rpx;
	margin-bottom: 10rpx;
	border-radius: 50%;
	background: #f5f5f5;
}
.tip-name {
	font-size: 22rpx;
	color: #666;
}
.tips-warn {
	font-size: 24rpx;
	color: var(--view-theme, #e93323);
	margin-top: 16rpx;
	font-weight: 500;
}

/* 操作按钮区 */
.action-section {
	padding: 40rpx 60rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.history-link {
	margin-bottom: 30rpx;
}
.history-text {
	font-size: 28rpx;
	color: #666;
}
.btn-primary {
	width: 100%;
	height: 90rpx;
	background: var(--view-theme, #e93323);
	border-radius: 45rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}
.btn-primary-text {
	font-size: 32rpx;
	color: #fff;
	font-weight: bold;
	letter-spacing: 4rpx;
}
.btn-share {
	width: 100%;
	height: 88rpx;
	background: #fff;
	border: 2rpx solid #e0e0e0;
	border-radius: 44rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 12rpx;
}
.wechat-icon {
	width: 40rpx;
	height: 40rpx;
}
.btn-share-text {
	font-size: 28rpx;
	color: #333;
}
</style>
