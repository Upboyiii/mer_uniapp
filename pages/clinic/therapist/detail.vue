<template>
	<view class="therapist-detail-page" :data-theme="theme">
		<view v-if="loading" class="state-wrap"><text>加载中...</text></view>
		<view v-else-if="!therapist" class="state-wrap">
			<emptyPage title="未找到理疗师信息" mTop="20%" :imgSrc="emptyImg"></emptyPage>
		</view>
		<view v-else class="page-body">
			<scroll-view scroll-y class="detail-scroll" :style="{ height: scrollH + 'px' }">
				<view class="hero-card">
					<view class="avatar-wrap">
						<easy-loadimage
							class="avatar-img"
							:image-src="avatarUrl"
							mode="aspectFill"
							width="160rpx"
							height="160rpx"
							radius="50%"
						/>
					</view>
					<text class="t-name">{{ therapist.name || '—' }}</text>
					<view class="t-stats" v-if="therapist.score != null || therapist.treatNum != null">
						<text v-if="therapist.score != null" class="t-stat">{{ therapist.score }} 评分</text>
						<text v-if="therapist.score != null && therapist.treatNum != null" class="t-split">·</text>
						<text v-if="therapist.treatNum != null" class="t-stat">{{ therapist.treatNum }} 已服务</text>
					</view>
					<text v-if="responseLine" class="t-resp">{{ responseLine }}</text>
				</view>

				<view class="block-card" v-if="therapist.hospitalDomain">
					<view class="block-h"><text class="block-title">擅长</text></view>
					<text class="block-body">{{ therapist.hospitalDomain }}</text>
				</view>

				<view class="block-card" v-if="selfInfoDisplay">
					<view class="block-h">
						<text class="block-title">简介</text>
						<text v-if="selfInfoFull.length > 120" class="block-more" @click="expandSelf = !expandSelf">
							{{ expandSelf ? '收起' : '查看' }}
						</text>
					</view>
					<text class="block-body">{{ selfInfoDisplay }}</text>
				</view>

				<view class="block-card" v-if="addrLine">
					<view class="block-h"><text class="block-title">服务地址</text></view>
					<text class="block-body">{{ addrLine }}</text>
				</view>

				<view class="tip-box">
					<text class="tip-t">到店理疗需提前预约，提交后按提示完成支付（如有费用）。</text>
				</view>
			</scroll-view>

			<view class="footer-bar">
				<button class="book-main bg-color" hover-class="book-main-hover" @click="bookNow">立即预约</button>
			</view>
		</view>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import { getTherapistPageListApi } from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';
import easyLoadimage from '@/components/base/easy-loadimage.vue';
import { THERAPIST_DETAIL_PREFILL_KEY as PREFILL_KEY } from '@/utils/therapistDetailPrefill.js';

export default {
	components: { emptyPage, easyLoadimage },
	computed: {
		...mapGetters(['isLogin']),
		emptyImg() {
			const raw = this.$Cache.get('imgHost') || '';
			const host = String(raw).replace(/\/?$/, '/');
			return `${host}crmebimage/presets/noJilu.png`;
		},
		defaultAvatar() {
			const raw = this.$Cache.get('imgHost') || '';
			if (!raw) return '';
			const host = raw.replace(/\/?$/, '/');
			return `${host}crmebimage/presets/morenT.png`;
		},
		avatarUrl() {
			const p = this.therapist && this.therapist.picture;
			if (p && String(p).trim()) {
				const u = this.resolveImgUrl(String(p).trim());
				if (u) return u;
			}
			return this.defaultAvatar;
		},
		selfInfoFull() {
			return (this.therapist && this.therapist.selfInfo) || '';
		},
		selfInfoDisplay() {
			const t = this.selfInfoFull;
			if (!t) return '';
			if (!this.expandSelf && t.length > 120) return t.slice(0, 120) + '…';
			return t;
		},
		addrLine() {
			if (!this.therapist) return '';
			const p = [this.therapist.province, this.therapist.city, this.therapist.district]
				.filter(Boolean)
				.join('');
			const d = (this.therapist.addressDetail || '').trim();
			const line = [p, d].filter(Boolean).join(' ');
			return line || '';
		},
		responseLine() {
			const t = this.therapist && this.therapist.responseTime;
			if (t == null || t === '' || Number(t) === 0) return '';
			return `平均响应约 ${t} 分钟`;
		}
	},
	data() {
		return {
			/** 与 physio_book、login/config 主题色一致，供 data-theme 驱动 .bg-color */
			theme: this.$Cache.get('theme') || getApp().globalData.theme,
			loading: true,
			therapist: null,
			therapistId: 0,
			mchId: 0,
			expandSelf: false,
			safeBottom: 0,
			scrollH: 500
		};
	},
	onLoad(options) {
		this.therapistId = options.therapistId ? parseInt(options.therapistId, 10) : 0;
		this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
		const sys = uni.getSystemInfoSync();
		this.safeBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
		const wh = sys.windowHeight || 667;
		const ww = sys.windowWidth || 375;
		// 与 .footer-bar 一致：上 24 + 按钮 88 + 下 24（rpx），安全区另减
		const footerRpx = 24 + 88 + 24;
		const barPx = (footerRpx * ww) / 750;
		this.scrollH = Math.max(240, Math.floor(wh - barPx - this.safeBottom));
		this.loadTherapist();
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
		loadTherapist() {
			this.loading = true;
			if (!this.therapistId) {
				this.therapist = null;
				this.loading = false;
				return;
			}
			try {
				const raw = uni.getStorageSync(PREFILL_KEY + this.therapistId);
				if (raw) {
					this.therapist = JSON.parse(raw);
					this.loading = false;
					this.applyTitle();
					return;
				}
			} catch (e) {}
			getTherapistPageListApi({ page: 1, limit: 200 })
				.then((res) => {
					const list = (res.data && res.data.list) || [];
					const found = list.find((t) => String(t.id) === String(this.therapistId));
					this.therapist = found || null;
				})
				.catch(() => {
					this.therapist = null;
				})
				.finally(() => {
					this.loading = false;
					this.applyTitle();
				});
		},
		applyTitle() {
			const t =
				(this.therapist && this.therapist.name && String(this.therapist.name).trim()) ||
				'理疗师详情';
			uni.setNavigationBarTitle({ title: t });
		},
		bookNow() {
			if (!this.isLogin) {
				return this.$util.navigateTo('/pages/users/login/index');
			}
			const item = this.therapist;
			if (!item || !item.id) {
				return this.$util.Tips({ title: '数据异常' });
			}
			const mid = item.mchId || this.mchId;
			if (!mid) {
				return this.$util.Tips({ title: '该理疗师暂未关联门店' });
			}
			const q = [
				`therapistId=${item.id}`,
				`mchId=${mid}`,
				`name=${encodeURIComponent(item.name || '')}`,
				`domain=${encodeURIComponent(item.hospitalDomain || '')}`,
				`picture=${encodeURIComponent(item.picture || '')}`
			].join('&');
			this.$util.navigateTo(`/pages/clinic/physio_book/index?${q}`);
		}
	}
};
</script>

<style lang="scss" scoped>
.therapist-detail-page {
	min-height: 100vh;
	background: #f5f6f8;
}

.state-wrap {
	padding: 120rpx 40rpx;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}

.page-body {
	min-height: 100vh;
	position: relative;
	box-sizing: border-box;
}

.detail-scroll {
	box-sizing: border-box;
}

.hero-card {
	background: #fff;
	padding: 40rpx 32rpx 36rpx;
	margin-bottom: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.avatar-wrap {
	margin-bottom: 20rpx;
}

.t-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #282828;
}

.t-stats {
	margin-top: 12rpx;
	font-size: 26rpx;
	color: #666;
}

.t-split {
	margin: 0 8rpx;
	color: #ccc;
}

.t-resp {
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #999;
}

.block-card {
	background: #fff;
	margin: 0 24rpx 20rpx;
	border-radius: 16rpx;
	padding: 28rpx 24rpx;
}

.block-h {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.block-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
}

.block-more {
	font-size: 26rpx;
	color: var(--view-theme, #56c2b8);
}

.block-body {
	font-size: 28rpx;
	color: #555;
	line-height: 1.55;
}

.tip-box {
	padding: 0 32rpx 32rpx;
}

.tip-t {
	font-size: 24rpx;
	color: #999;
	line-height: 1.45;
}

/* 与 pages/clinic/physio_book 底部一致：白底 + 安全区内边距，避免贴齐屏幕底 / Home 条 */
.footer-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	background: #fff;
	padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
	box-sizing: border-box;
}

.book-main {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 44rpx;
	font-size: 30rpx;
	font-weight: 600;
	color: #fff;
	border: none;
	padding: 0;
	margin: 0;
	box-sizing: border-box;
}

.book-main::after {
	border: none;
}

.book-main-hover {
	opacity: 0.92;
}
</style>
