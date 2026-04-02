<template>
	<view class="doctor-detail-page" :data-theme="theme">
		<view v-if="loading" class="state-wrap state-wrap--center"><text>加载中...</text></view>

		<view v-else-if="!doctor" class="state-wrap">
			<emptyPage title="未找到医生信息" mTop="20%" :imgSrc="emptyImg"></emptyPage>
		</view>

		<view v-else class="detail-page-body">
			<scroll-view
				scroll-y
				class="detail-scroll"
				:style="{ height: scrollAreaHeight + 'px' }"
			>
				<view class="detail-scroll-inner">
				<view class="white-sheet-top">
				<view class="cert-strip">
					<text class="cert-main">{{ certTitle }}</text>
					<text v-if="licenseTail" class="cert-num"> · {{ licenseTail }}</text>
				</view>

				<view class="profile-card">
					<view class="profile-head">
						<view class="avatar-block">
							<view class="avatar-inner">
								<easy-loadimage
									class="avatar-img"
									:image-src="avatarUrl"
									mode="aspectFill"
									width="140rpx"
									height="140rpx"
									radius="50%"
								/>
							</view>
							<view v-if="doctor.onlineStatus === 1" class="badge-online">接诊中</view>
						</view>
						<view class="head-text">
							<view class="name-row">
								<text class="d-name">{{ doctor.name || '—' }}</text>
								<!-- 关注：待接口对接后再开
								<view class="follow-pill" @click="toggleFollow">
									<text class="iconfont icon-ic_love"></text>
									<text>关注</text>
								</view>
								-->
							</view>
							<view class="title-line" v-if="doctor.hospitalTitle || doctor.hospitalSub">
								<text v-if="doctor.hospitalTitle">{{ doctor.hospitalTitle }}</text>
								<text v-if="doctor.hospitalTitle && doctor.hospitalSub"> · </text>
								<text v-if="doctor.hospitalSub">{{ doctor.hospitalSub }}</text>
							</view>
							<view class="hosp-row" v-if="doctor.hospitalName || doctor.hospitalLevel">
								<text v-if="doctor.hospitalLevel" class="tag-level">{{ doctor.hospitalLevel }}</text>
								<text class="hosp-n line2">{{ doctor.hospitalName }}</text>
							</view>
							<view v-if="showPrescribeTag" class="tag-prescribe">可开方</view>
						</view>
					</view>
				</view>
				</view>

				<view class="block-card">
					<view class="block-h">
						<text class="block-title">擅长</text>
						<text v-if="specialtyFull.length > 80" class="block-more" @click="toggleSpecialty">
							{{ expandSpecialty ? '收起' : '查看' }}
						</text>
					</view>
					<text class="block-body">{{ specialtyDisplay }}</text>
				</view>

				<view class="block-card" v-if="introFull">
					<view class="block-h">
						<text class="block-title">简介</text>
						<text v-if="introFull.length > 80" class="block-more" @click="toggleIntro">
							{{ expandIntro ? '收起' : '查看' }}
						</text>
					</view>
					<text class="block-body">{{ introDisplay }}</text>
				</view>

				<view class="stats-row">
					<view class="stat-col">
						<text class="iconfont icon-ic_love_2 stat-ico"></text>
						<text class="stat-label">用户推荐</text>
					</view>
					<view class="stat-col">
						<text class="stat-val">{{ scoreDisplay }}</text>
						<text class="stat-label">综合评分</text>
					</view>
					<view class="stat-col">
						<text class="stat-val">{{ doctor.treatNum != null ? doctor.treatNum : '—' }}</text>
						<text class="stat-label">接诊人次</text>
					</view>
					<view class="stat-col">
						<text class="stat-val sm">{{ responseDisplay }}</text>
						<text class="stat-label">平均响应</text>
					</view>
				</view>

				<view class="service-title">选择问诊方式</view>
				<view class="service-cards">
					<view
						class="svc-card"
						:class="{ active: selectedMode === 'text' }"
						@click="selectedMode = 'text'"
						v-if="imageFeeVal != null"
					>
						<view class="svc-icon svc-icon-text">
							<text class="iconfont icon-ic_edit"></text>
						</view>
						<text class="svc-name">图文问诊</text>
						<text class="svc-price">¥{{ formatPrice(imageFeeVal) }} / 48小时</text>
						<view v-if="selectedMode === 'text'" class="svc-check">✓</view>
					</view>
					<view
						class="svc-card"
						:class="{ active: selectedMode === 'video' }"
						@click="selectedMode = 'video'"
						v-if="videoFeeVal != null"
					>
						<view class="svc-icon svc-icon-video">
							<text class="iconfont icon-ic_video1"></text>
						</view>
						<text class="svc-name">视频问诊</text>
						<text class="svc-price">¥{{ formatPrice(videoFeeVal) }} / 60分钟</text>
						<view v-if="selectedMode === 'video'" class="svc-check">✓</view>
					</view>
				</view>

				<view class="notice-box">
					<text class="notice-title">{{ noticeTitle }}</text>
					<view class="notice-item" v-for="(line, i) in noticeLines" :key="i">
						<text class="notice-dot">·</text>
						<text class="notice-txt">{{ line }}</text>
					</view>
				</view>
				</view>
			</scroll-view>

			<view class="bottom-bar" :style="{ paddingBottom: bottomBarPad + 'px' }">
				<!-- #ifdef MP -->
				<button class="btn-share" open-type="share">
					<text class="iconfont icon-ic_share btn-share-ico"></text>
					<text class="btn-share-txt">分享</text>
				</button>
				<!-- #endif -->
				<!-- #ifndef MP -->
				<view class="btn-share" @click="shareHint">
					<text class="iconfont icon-ic_share btn-share-ico"></text>
					<text class="btn-share-txt">分享</text>
				</view>
				<!-- #endif -->
				<view class="btn-primary" @click="startConsult">
					<view class="btn-primary-ico">
						<text class="iconfont icon-ic_edit"></text>
					</view>
					<view class="btn-primary-texts">
						<text class="btn-primary-title">立即问诊</text>
						<text class="btn-primary-sub">（{{ consultLabel }}）</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import { getDoctorListApi } from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';
import easyLoadimage from '@/components/base/easy-loadimage.vue';
import onShare from '@/mixins/onShare';
import { formatDoctorScoreDisplay } from '@/utils/doctorScoreDisplay.js';

const CACHE_PREFIX = 'doctor_detail_prefill_';
const CONSULT_BOOK_PREFILL = 'consult_book_prefill';

export default {
	components: { emptyPage, easyLoadimage },
	mixins: [onShare],
	computed: {
		...mapGetters(['isLogin']),
		emptyImg() {
			const raw = this.$Cache.get('imgHost') || '';
			const host = String(raw).replace(/\/?$/, '/');
			return `${host}crmebimage/presets/noJilu.png`;
		},
		defaultAvatar() {
			const raw = this.$Cache.get('imgHost') || '';
			const host = String(raw).replace(/\/?$/, '/');
			return `${host}crmebimage/presets/morenT.png`;
		},
		avatarUrl() {
			const p = this.doctor && this.doctor.picture;
			if (p && String(p).trim()) {
				const u = this.resolveImgUrl(String(p).trim());
				if (u) return u;
			}
			return this.defaultAvatar;
		},
		certTitle() {
			if (!this.doctor) return '';
			const a = this.doctor.auditStatus;
			if (a === 1) return '资质已认证';
			if (a === 0 || a === -1) return '资质审核中';
			if (a === 2) return '资质未通过';
			return '资质已认证';
		},
		licenseTail() {
			const idc = this.doctor && this.doctor.idcardNum;
			if (!idc || String(idc).length < 6) return '';
			const s = String(idc);
			return `********${s.slice(-4)}`;
		},
		specialtyFull() {
			if (!this.doctor) return '';
			return (
				this.doctor.hospitalDomain ||
				this.doctor.specialization ||
				''
			);
		},
		specialtyDisplay() {
			const t = this.specialtyFull || '—';
			if (!this.expandSpecialty && t.length > 80) return t.slice(0, 80) + '…';
			return t;
		},
		introFull() {
			return (this.doctor && this.doctor.selfInfo) || '';
		},
		introDisplay() {
			const t = this.introFull || '';
			if (!t) return '';
			if (!this.expandIntro && t.length > 80) return t.slice(0, 80) + '…';
			return t;
		},
		scoreDisplay() {
			const s = this.doctor && this.doctor.score;
			if (s == null || s === '') return '—';
			const t = formatDoctorScoreDisplay(s);
			return t || '—';
		},
		responseDisplay() {
			const t = this.doctor && this.doctor.responseTime;
			if (t == null || t === '' || Number(t) === 0) return '—';
			return `${t}分钟内`;
		},
		imageFeeVal() {
			return this.pickFee(this.doctor, 'imageFee', 'textPrice');
		},
		videoFeeVal() {
			return this.pickFee(this.doctor, 'videoFee', 'videoPrice');
		},
		consultLabel() {
			return this.selectedMode === 'video' ? '视频问诊' : '图文问诊';
		},
		noticeTitle() {
			return this.selectedMode === 'video'
				? '与医生视频沟通，面对面交流病情。'
				: '通过文字、图片、语音与医生在线沟通病情。';
		},
		noticeLines() {
			if (this.selectedMode === 'video') {
				return [
					'请提前准备好相关检查资料，保持网络畅通。',
					'问诊过程请遵守平台规范，保护个人隐私。',
					'具体服务规则以平台说明为准。'
				];
			}
			return [
				'沟通内容仅您与医生可见，平台保护您的隐私。',
				'若医生未在约定时效内回复，可申请退款（以平台规则为准）。',
				'急重症请尽快线下就医。'
			];
		},
		showPrescribeTag() {
			const c = this.doctor && this.doctor.hospitalCareer;
			return c && String(c).indexOf('处方') !== -1;
		}
	},
	data() {
		return {
			theme: getApp().globalData.theme,
			title: '医生详情',
			loading: true,
			doctor: null,
			doctorId: 0,
			selectedMode: 'text',
			expandSpecialty: false,
			expandIntro: false,
			safeBottom: 0,
			/** 底栏与屏幕底之间的内边距（安全区 + 额外留白，避免贴边） */
			bottomBarPad: 16,
			/** 中间滚动区高度（窗口高 - 底部固钉栏；顶栏为系统导航） */
			scrollAreaHeight: 400
		};
	},
	onLoad(options) {
		this.doctorId = options.id ? parseInt(options.id, 10) : 0;
		if (options.mode === 'video') this.selectedMode = 'video';
		else this.selectedMode = 'text';
		const sys = uni.getSystemInfoSync();
		const inset = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
		this.safeBottom = inset;
		this.bottomBarPad = inset + (inset > 0 ? 10 : 16);
		this.updateScrollAreaHeightEstimate();
		this.loadDoctor();
	},
	onShow() {
		if (this.doctor && !this.loading) {
			this.$nextTick(() => this.measureScrollAreaHeight());
		}
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
		pickFee(doc, primary, legacy) {
			if (!doc) return null;
			const v = doc[primary] != null && doc[primary] !== '' ? doc[primary] : doc[legacy];
			if (v === null || v === undefined || v === '') return null;
			const n = Number(v);
			if (!Number.isFinite(n) || n <= 0) return null;
			return n;
		},
		formatPrice(v) {
			if (v == null) return '0.00';
			const n = Number(v);
			return Number.isFinite(n) ? n.toFixed(2) : String(v);
		},
		loadDoctor() {
			this.loading = true;
			if (!this.doctorId) {
				this.doctor = null;
				this.loading = false;
				uni.setNavigationBarTitle({ title: '医生详情' });
				return;
			}
			try {
				const raw = uni.getStorageSync(CACHE_PREFIX + this.doctorId);
				if (raw) {
					this.doctor = JSON.parse(raw);
					this.syncModeByFee();
					this.loading = false;
					this.applyNavTitle();
					this.$nextTick(() => this.measureScrollAreaHeight());
					return;
				}
			} catch (e) {}
			getDoctorListApi({ page: 1, limit: 200 })
				.then(res => {
					const list = (res.data && res.data.list) || [];
					const found = list.find(d => String(d.id) === String(this.doctorId));
					this.doctor = found || null;
					this.syncModeByFee();
				})
				.catch(() => {
					this.doctor = null;
				})
				.finally(() => {
					this.loading = false;
					this.applyNavTitle();
					this.$nextTick(() => this.measureScrollAreaHeight());
				});
		},
		applyNavTitle() {
			const t =
				(this.doctor && this.doctor.name && String(this.doctor.name).trim()) ||
				'医生详情';
			uni.setNavigationBarTitle({ title: t });
		},
		/** 按 rpx 估算底栏高度，先给 scroll-view 一个合理初值（顶栏为系统导航，不占页面内高度） */
		updateScrollAreaHeightEstimate() {
			const sys = uni.getSystemInfoSync();
			const wh = sys.windowHeight || 667;
			const ww = sys.windowWidth || 375;
			const pad = this.bottomBarPad || 0;
			const rpx = (v) => (v * ww) / 750;
			const barH = rpx(16 + 16) + Math.max(rpx(88), 88) + pad;
			this.scrollAreaHeight = Math.max(200, Math.floor(wh - barH));
		},
		/** 底栏渲染后测量，滚动区 = 窗口高 - 底栏高 */
		measureScrollAreaHeight() {
			if (!this.doctor || this.loading) return;
			this.$nextTick(() => {
				const q = uni.createSelectorQuery().in(this);
				q.select('.bottom-bar').boundingClientRect();
				q.exec(res => {
					const barRect = res && res[0];
					const sys = uni.getSystemInfoSync();
					const wh = sys.windowHeight || 667;
					if (!barRect || !barRect.height) {
						this.updateScrollAreaHeightEstimate();
						return;
					}
					this.scrollAreaHeight = Math.max(200, Math.floor(wh - barRect.height));
				});
			});
		},
		syncModeByFee() {
			const img = this.pickFee(this.doctor, 'imageFee', 'textPrice');
			const vid = this.pickFee(this.doctor, 'videoFee', 'videoPrice');
			if (this.selectedMode === 'video' && vid == null && img != null) {
				this.selectedMode = 'text';
			}
			if (this.selectedMode === 'text' && img == null && vid != null) {
				this.selectedMode = 'video';
			}
		},
		toggleSpecialty() {
			this.expandSpecialty = !this.expandSpecialty;
		},
		toggleIntro() {
			this.expandIntro = !this.expandIntro;
		},
		// toggleFollow() {
		// 	this.$util.Tips({ title: '关注功能即将开放' });
		// },
		shareHint() {
			this.$util.Tips({ title: '请使用右上角菜单分享' });
		},
		startConsult() {
			if (!this.isLogin) {
				return this.$util.navigateTo('/pages/users/login/index');
			}
			if (!this.doctor) return;
			if (this.doctor.onlineStatus !== 1) {
				return this.$util.Tips({ title: '医生当前离线' });
			}
			const fee =
				this.selectedMode === 'video' ? this.videoFeeVal : this.imageFeeVal;
			if (fee == null) {
				return this.$util.Tips({ title: '暂无可用的问诊价格' });
			}
			const consultType = this.selectedMode === 'video' ? 2 : 1;
			const payload = {
				doctorId: this.doctorId,
				consultType,
				consultFee: fee,
				diseaseType: this.doctor.hospitalSub || '',
				durationLabel: consultType === 2 ? '60分钟' : '48小时',
				doctorName: this.doctor.name || '',
				doctorPicture: this.doctor.picture || '',
				hospitalTitle: this.doctor.hospitalTitle || '',
				hospitalSub: this.doctor.hospitalSub || '',
				hospitalName: this.doctor.hospitalName || '',
				hospitalLevel: this.doctor.hospitalLevel || ''
			};
			try {
				uni.setStorageSync(CONSULT_BOOK_PREFILL, JSON.stringify(payload));
			} catch (e) {}
			this.$util.navigateTo('/pages/clinic/consult_book/index');
		}
	}
};
</script>

<style lang="scss" scoped>
.doctor-detail-page {
	min-height: 100vh;
	background: #f5f5f5;
	box-sizing: border-box;
}

.white-sheet-top {
	position: relative;
	z-index: 2;
	margin-top: 0;
	background: linear-gradient(
		180deg,
		var(--view-main-rgba) 0%,
		var(--view-coupons-light-color) 32%,
		#ffffff 58%,
		#ffffff 100%
	);
	border-radius: 24rpx 24rpx 0 0;
	overflow: hidden;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}

.state-wrap {
	min-height: 60vh;
}

.state-wrap--center {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}

.detail-page-body {
	position: relative;
	z-index: 1;
	width: 100%;
	min-height: 100vh;
	box-sizing: border-box;
}

.detail-scroll {
	width: 100%;
	box-sizing: border-box;
}

.detail-scroll-inner {
	padding-bottom: 24rpx;
}

.cert-strip {
	background: transparent;
	padding: 16rpx 24rpx;
	font-size: 22rpx;
	color: #666;
	border-bottom: 1rpx solid #f0f0f0;
}

.cert-main {
	font-weight: 500;
	color: var(--view-theme);
}

.cert-num {
	color: #999;
	letter-spacing: 1rpx;
}

.profile-card {
	margin: 0 24rpx 24rpx;
	background: transparent;
	border-radius: 0;
	padding: 28rpx 24rpx 28rpx;
	box-shadow: none;
}

.profile-head {
	display: flex;
	align-items: flex-start;
}

.avatar-block {
	position: relative;
	width: 140rpx;
	flex-shrink: 0;
	margin-right: 24rpx;
}

.avatar-inner {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	overflow: hidden;
	background: #eee;
}

.avatar-img {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
}

.badge-online {
	position: absolute;
	left: 50%;
	bottom: -8rpx;
	transform: translateX(-50%);
	background: var(--view-theme);
	color: #fff;
	font-size: 18rpx;
	padding: 4rpx 14rpx;
	border-radius: 20rpx;
	white-space: nowrap;
	z-index: 2;
}

.head-text {
	flex: 1;
	min-width: 0;
}

.name-row {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 16rpx;
	margin-bottom: 8rpx;
}

.d-name {
	font-size: 36rpx;
	font-weight: 700;
	color: #222;
}

/* 关注按钮样式，与模板一并恢复
.follow-pill {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
	font-size: 24rpx;
	color: var(--view-theme);
	padding: 6rpx 18rpx;
	border: 1rpx solid var(--view-theme);
	border-radius: 28rpx;
	flex-shrink: 0;
	opacity: 0.85;
	.iconfont { font-size: 26rpx; }
}
*/

.title-line {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.hosp-row {
	display: flex;
	align-items: flex-start;
	flex-wrap: wrap;
	gap: 10rpx;
	margin-bottom: 10rpx;
}

.tag-level {
	background: var(--view-coupons-light-color);
	color: var(--view-second-theme);
	font-size: 20rpx;
	padding: 2rpx 10rpx;
	border-radius: 6rpx;
	flex-shrink: 0;
}

.hosp-n {
	font-size: 26rpx;
	color: #333;
	flex: 1;
	min-width: 0;
}

.tag-prescribe {
	display: inline-block;
	font-size: 22rpx;
	color: var(--view-theme);
	background: var(--view-main-rgba);
	padding: 4rpx 14rpx;
	border-radius: 8rpx;
}

.block-card {
	margin: 16rpx 24rpx 0;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.03);
}

.block-h {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.block-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.block-more {
	font-size: 24rpx;
	color: var(--view-theme);
}

.block-body {
	font-size: 26rpx;
	color: #666;
	line-height: 1.55;
}

.stats-row {
	display: flex;
	margin: 20rpx 24rpx 0;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx 12rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.03);
}

.stat-col {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	text-align: center;
}

.stat-ico {
	font-size: 32rpx;
	color: var(--view-theme);
}

.stat-val {
	font-size: 30rpx;
	font-weight: 700;
	color: var(--view-second-theme);

	&.sm {
		font-size: 24rpx;
		font-weight: 600;
		color: #333;
	}
}

.stat-label {
	font-size: 20rpx;
	color: #999;
}

.service-title {
	margin: 28rpx 24rpx 16rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.service-cards {
	display: flex;
	gap: 20rpx;
	padding: 0 24rpx;
	flex-wrap: wrap;
}

.svc-card {
	position: relative;
	flex: 1;
	min-width: 280rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx 20rpx;
	border: 2rpx solid #eee;
	box-sizing: border-box;

	&.active {
		border-color: var(--view-theme);
		background: var(--view-main-rgba);
	}
}

.svc-icon {
	width: 72rpx;
	height: 72rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 14rpx;
	position: relative;

	&::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 20rpx;
		border: 2rpx solid rgba(255, 255, 255, 0.35);
		pointer-events: none;
	}

	.iconfont {
		font-size: 40rpx;
		color: #fff;
		line-height: 1;
	}
}

.svc-icon-text {
	background: linear-gradient(145deg, var(--view-theme), var(--view-second-theme));
}

.svc-icon-video {
	background: var(--view-second-theme);
}

.svc-name {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 8rpx;
}

.svc-price {
	font-size: 24rpx;
	color: var(--view-second-theme);
	font-weight: 600;
}

.svc-check {
	position: absolute;
	top: 10rpx;
	right: 10rpx;
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	background: var(--view-main-rgba);
	font-size: 22rpx;
	line-height: 36rpx;
	text-align: center;
	color: var(--view-theme);
	font-weight: 700;
}

.notice-box {
	margin: 24rpx;
	padding: 24rpx;
	background: var(--view-coupons-light-color);
	border: 1rpx solid var(--view-coupons-border);
	border-radius: 12rpx;
}

.notice-title {
	display: block;
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 12rpx;
	line-height: 1.45;
}

.notice-item {
	display: flex;
	align-items: flex-start;
	gap: 8rpx;
	margin-bottom: 8rpx;
	font-size: 24rpx;
	color: #666;
	line-height: 1.5;
}

.notice-dot {
	color: var(--view-theme);
	flex-shrink: 0;
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	display: flex;
	align-items: stretch;
	gap: 20rpx;
	padding: 16rpx 24rpx 0;
	background: #fff;
	border-top: 1rpx solid #f0f0f0;
	box-sizing: border-box;
}

.btn-share {
	flex-shrink: 0;
	min-width: 132rpx;
	height: auto;
	min-height: 88rpx;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	padding: 12rpx 20rpx;
	font-size: 0;
	color: #555;
	background: #fff;
	border: 1rpx solid #e8e8e8;
	border-radius: 44rpx;
}

.btn-share-ico {
	font-size: 36rpx;
	color: var(--view-theme);
	line-height: 1;
}

.btn-share-txt {
	font-size: 22rpx;
	color: #666;
	line-height: 1.2;
}

.btn-share::after {
	border: none;
}

.btn-primary {
	flex: 1;
	min-height: 88rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 0 24rpx;
	border-radius: 44rpx;
	box-sizing: border-box;
	background: var(--view-theme);
}

.btn-primary-ico {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	background: rgba(255, 255, 255, 0.22);

	.iconfont {
		font-size: 30rpx;
		color: #fff;
		line-height: 1;
	}
}

.btn-primary-texts {
	display: flex;
	flex-direction: row;
	align-items: baseline;
	flex-wrap: wrap;
	justify-content: center;
}

.btn-primary-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #fff;
	line-height: 1.2;
}

.btn-primary-sub {
	font-size: 24rpx;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.92);
	line-height: 1.2;
}
</style>

<style lang="scss">
/* 本页占满屏幕高度，配合 flex 让 scroll-view 不再写死 796px 一类高度 */
page {
	height: 100%;
}
</style>
