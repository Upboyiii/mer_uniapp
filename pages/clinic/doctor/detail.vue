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

				<view class="tabs-wrap">
					<view class="detail-tabs">
						<view
							class="detail-tab"
							:class="{ on: activeTab === 'book' }"
							@click="activeTab = 'book'"
						>
							预订
						</view>
						<view
							class="detail-tab"
							:class="{ on: activeTab === 'review' }"
							@click="activeTab = 'review'"
						>
							评价
						</view>
					</view>
				</view>

				<!-- 套餐列表（mchId） -->
				<view v-if="activeTab === 'book' && hasMchForCate" class="pkg-from-therapist">
					<view class="cate-section">
						<view class="cate-sec-head">
							<text class="cate-sec-badge">医</text>
							<text class="cate-sec-title">中医项目</text>
						</view>
						<view class="cate-guarantee">未服务全额退 | 按门店规则履约</view>
						<view v-if="cateLoading" class="cate-loading"><text>加载项目中...</text></view>
						<block v-else>
							<view
								v-for="(item, idx) in categoryList"
								:key="'pkg-' + (item.id != null ? item.id : idx)"
								class="pkg-row"
								@click="bookCategory(item)"
							>
								<image
									class="pkg-cover"
									:src="categoryCoverSrc(item)"
									mode="aspectFill"
								/>
								<view class="pkg-mid">
									<text class="pkg-name">{{ item.name || '中医项目' }}</text>
									<text class="pkg-sub line-clamp-1">{{ categorySubLine(item) }}</text>
									<view class="pkg-price-row">
										<text class="pkg-price">¥{{ formatPkgPrice(item.price) }}</text>
										<text
											v-if="item.homeService && item.homePrice != null"
											class="pkg-home"
										>
											上门 ¥{{ formatPkgPrice(item.homePrice) }}
										</text>
									</view>
								</view>
								<view class="pkg-right">
									<text class="pkg-sales">接诊人次 {{ treatNumDisplay }}</text>
									<button
										class="pkg-book-btn"
										hover-class="pkg-book-hover"
										@click.stop="bookCategory(item)"
									>
										预订
									</button>
								</view>
							</view>
							<view v-if="categoryList.length === 0" class="cate-empty">暂无中医项目</view>
						</block>
					</view>
				</view>
				<view v-else-if="activeTab === 'book'" class="cate-empty cate-empty--box">暂无中医项目</view>

				<view v-if="activeTab === 'review'" class="review-section">
					<view class="review-head">
						<text class="review-head-title">用户评价 ({{ reviewTotalText }})</text>
						<text class="review-head-rate">近半年内好评率高达{{ reviewPositiveText }} ></text>
					</view>
					
					<view class="review-tags-row">
						<view class="review-tag-item" v-for="(tag, tidx) in reviewTags" :key="tidx">
							{{ tag.name }} {{ tag.count }}
						</view>
					</view>

					<view v-if="reviewLoading" class="cate-loading">评论加载中...</view>
					<view v-else-if="reviewListDisplay.length === 0" class="cate-empty cate-empty--box">暂无评论</view>
					<view v-else>
						<view
							v-for="(item, idx) in reviewListDisplay"
							:key="'review-' + (item.id != null ? item.id : idx)"
							class="review-card"
						>
							<view class="review-user-row">
								<image class="review-avatar" :src="item.userAvatar" mode="aspectFill"></image>
								<view class="review-user-main">
									<view class="review-user-top">
										<text class="review-user-name">{{ item.userName }}</text>
										<text class="review-user-level">V 大众</text>
									</view>
									<view class="review-user-sub">
										<text>{{ item.createTimeDate }}</text>
										<text class="sub-split">|</text>
										<text>{{ item.categoryName }}</text>
									</view>
								</view>
							</view>
							
							<view class="review-rating-row">
								<text class="rating-icon">🤩 超赞</text>
								<view class="rating-stars">{{ item.starText }}</view>
								<text class="rating-metrics">| {{ item.metricTextShort }}</text>
							</view>

							<view class="review-labels">
								<text v-for="(tag, tidx) in item.labelTags" :key="tidx" class="review-label-chip">
									{{ tag }}
								</text>
							</view>

							<text class="review-content">{{ item.commentText }}</text>
							
							<view v-if="item.picList.length" class="review-pics">
								<image
									v-for="(pic, pidx) in item.picList"
									:key="pidx"
									class="review-pic"
									:src="pic"
									mode="aspectFill"
									@click="previewImage(item.picList, pidx)"
								/>
							</view>

							<view class="review-therapist-tag" v-if="doctor">
								<image class="t-tag-avatar" :src="avatarUrl" mode="aspectFill"></image>
								<text class="t-tag-name">{{ doctor.name }}</text>
								<view class="t-tag-btn">约Ta ></view>
							</view>

							<view class="review-footer">
								<text class="view-count">浏览{{ item.viewCount || 0 }}</text>
								<view class="footer-actions">
									<view class="action-item"><text class="iconfont icon-ic_love"></text> 没用</view>
									<view class="action-item"><text class="iconfont icon-ic_love"></text> 有用</view>
									<text class="iconfont icon-ic_more"></text>
								</view>
							</view>
						</view>
						<view class="review-more-btn" @click="onViewAllReviews">查看全部{{ reviewTotalText }}条评价 ></view>
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
import {
	getDoctorListApi,
	getTcmCategoryListApi,
	getTherapistByMchApi,
	getDoctorReplyListApi,
	getDoctorReplyStatApi
} from '@/api/clinic.js';
import { setPhysioBookNav } from '@/utils/physioBookNav.js';
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
		},
		resolvedMchId() {
			const route = Number(this.mchId);
			if (Number.isFinite(route) && route > 0) return route;
			const d = this.doctor;
			if (!d) return 0;
			const raw = d.mchId != null && d.mchId !== '' ? d.mchId : d.merId;
			const n = Number(raw);
			return Number.isFinite(n) && n > 0 ? n : 0;
		},
		hasMchForCate() {
			return this.resolvedMchId > 0;
		},
		treatNumDisplay() {
			const n = this.doctor && this.doctor.treatNum;
			if (n != null && n !== '' && !isNaN(Number(n))) return String(n);
			return '0';
		},
		reviewScoreText() {
			const avg = this.reviewStat && this.reviewStat.avgStar;
			const n = Number(avg);
			if (!Number.isFinite(n) || n <= 0) return '暂无';
			return n.toFixed(1);
		},
		reviewTotalText() {
			const total = this.reviewStat && this.reviewStat.totalCount;
			const n = Number(total);
			return Number.isFinite(n) && n > 0 ? String(n) : '0';
		},
		reviewPositiveText() {
			const val = this.reviewStat && this.reviewStat.positiveRate;
			const n = Number(val);
			if (!Number.isFinite(n) || n < 0) return '--';
			return `${n.toFixed(0)}%`;
		},
		reviewListDisplay() {
			const list = Array.isArray(this.reviewList) ? this.reviewList : [];
			return list.map((item) => {
				const star = Number(item.star);
				const starNum = Number.isFinite(star) && star > 0 ? Math.min(5, Math.round(star)) : 5;
				const eff = Number(item.effectStar);
				const pro = Number(item.professionalStar);
				const srv = Number(item.serviceStar);
				const labels = [];
				if (Number.isFinite(eff) && eff >= 4) labels.push('疗效好');
				if (Number.isFinite(pro) && pro >= 4) labels.push('医生专业');
				if (Number.isFinite(srv) && srv >= 4) labels.push('态度好');
				if (!labels.length && starNum >= 4) labels.push('总体满意');
				
				// 格式化日期
				let dateStr = '';
				if (item.createTime) {
					dateStr = item.createTime.split(' ')[0];
				}

				return {
					...item,
					userName: item.isAnonymous ? '匿名用户' : (item.nickname || '用户'),
					userAvatar: this.resolveImgUrl(item.avatar) || this.defaultAvatar,
					commentText: (item.comment || '').trim() || '用户未填写文字评价',
					replyText: (item.merchantReplyContent || '').trim(),
					starText: `${'★'.repeat(starNum)}${'☆'.repeat(5 - starNum)}`,
					metricText: `总分${this.scoreNumText(item.star)}星 疗效${this.scoreNumText(item.effectStar)}星 服务${this.scoreNumText(item.serviceStar)}星`,
					metricTextShort: `总分${this.scoreNumText(item.star)} 疗效${this.scoreNumText(item.effectStar)} 服务${this.scoreNumText(item.serviceStar)}`,
					labelTags: labels,
					createTimeDate: dateStr,
					picList: this.parseReviewPics(item.pics)
				};
			});
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
			activeTab: 'book',
			expandSpecialty: false,
			expandIntro: false,
			mchId: 0,
			categoryList: [],
			cateLoading: false,
			reviewLoading: false,
			reviewStat: null,
			reviewList: [],
			reviewPageLimit: 8,
			reviewTags: [
				{ name: '很耐心', count: 1 },
				{ name: '态度好', count: 1 },
				{ name: '高大上', count: 1 },
				{ name: '医生专业', count: 1 }
			],
			safeBottom: 0,
			/** 底栏与屏幕底之间的内边距（安全区 + 额外留白，避免贴边） */
			bottomBarPad: 16,
			/** 中间滚动区高度（窗口高 - 底部固钉栏；顶栏为系统导航） */
			scrollAreaHeight: 400
		};
	},
	onLoad(options) {
		this.doctorId = options.id ? parseInt(options.id, 10) : 0;
		this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
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
				this.reviewStat = null;
				this.reviewList = [];
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
					this.loadCategories();
					this.loadReviews();
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
					this.reviewStat = null;
					this.reviewList = [];
				})
				.finally(() => {
					this.loading = false;
					this.applyNavTitle();
					if (this.doctor) {
						this.loadCategories();
						this.loadReviews();
					}
					this.$nextTick(() => this.measureScrollAreaHeight());
				});
		},
		loadCategories() {
			const mid = this.resolvedMchId;
			if (!mid) {
				this.categoryList = [];
				return;
			}
			this.cateLoading = true;
			getTcmCategoryListApi({ page: 1, limit: 200, mchId: mid })
				.then((res) => {
					const data = res.data;
					let list = [];
					if (data && Array.isArray(data.list)) {
						list = data.list;
					} else if (Array.isArray(data)) {
						list = data;
					}
					this.categoryList = list.filter(
						(it) => it && (it.status === undefined || it.status === 1)
					);
				})
				.catch(() => {
					this.categoryList = [];
				})
				.finally(() => {
					this.cateLoading = false;
				});
		},
		loadReviews() {
			if (!this.doctorId) {
				this.reviewStat = null;
				this.reviewList = [];
				return;
			}
			this.reviewLoading = true;
			const query = { doctorId: this.doctorId };
			Promise.all([
				getDoctorReplyStatApi(query).catch(() => null),
				getDoctorReplyListApi({ ...query, page: 1, limit: this.reviewPageLimit }).catch(() => null)
			])
				.then(([statRes, listRes]) => {
					const statData = statRes && statRes.data ? statRes.data : null;
					this.reviewStat = statData || null;
					const pageData = listRes && listRes.data;
					if (pageData && Array.isArray(pageData.list)) {
						this.reviewList = pageData.list;
					} else {
						this.reviewList = [];
					}
				})
				.finally(() => {
					this.reviewLoading = false;
				});
		},
		parseReviewPics(pics) {
			if (!pics) return [];
			if (Array.isArray(pics)) {
				return pics.map((p) => this.resolveImgUrl(p)).filter(Boolean);
			}
			return String(pics)
				.split(',')
				.map((item) => this.resolveImgUrl(item.trim()))
				.filter(Boolean);
		},
		scoreNumText(v) {
			const n = Number(v);
			if (!Number.isFinite(n) || n <= 0) return '5.0';
			return n.toFixed(1);
		},
		onViewAllReviews() {
			const did = this.doctorId;
			const mid = this.resolvedMchId || this.mchId || '';
			const name = (this.doctor && this.doctor.name) || '';
			if (!did) {
				return this.$util.Tips({ title: '缺少医生信息' });
			}
			const q = `doctorId=${did}&mchId=${mid}&name=${encodeURIComponent(name)}`;
			this.$util.navigateTo(`/pages/clinic/therapist/reviews/index?${q}`);
		},
		previewImage(urls, index) {
			uni.previewImage({
				urls: urls,
				current: index
			});
		},
		categoryCoverSrc(item) {
			const u = item && item.coverImage ? String(item.coverImage).trim() : '';
			if (!u) {
				const raw = this.$Cache.get('imgHost') || '';
				if (!raw) return '/static/images/f.png';
				const host = raw.replace(/\/?$/, '/');
				return `${host}crmebimage/presets/morenT.png`;
			}
			if (/^https?:\/\//i.test(u)) return u;
			const raw = this.$Cache.get('imgHost') || '';
			if (!raw) return u;
			const base = raw.replace(/\/?$/, '');
			return u.startsWith('/') ? base + u : `${base}/${u}`;
		},
		categorySubLine(item) {
			if (!item) return '';
			const parts = [];
			if (item.duration != null && item.duration !== '') {
				parts.push(`${item.duration}分钟`);
			}
			parts.push(item.homeService ? '可上门' : '到店服务');
			return parts.join(' | ');
		},
		formatPkgPrice(v) {
			if (v == null || v === '') return '0';
			const n = Number(v);
			if (isNaN(n)) return '0';
			return Number.isInteger(n) ? String(n) : n.toFixed(2);
		},
		bookCategory(cat) {
			if (!this.isLogin) {
				return this.$util.navigateTo('/pages/users/login/index');
			}
			const mid = this.resolvedMchId;
			if (!mid) {
				return this.$util.Tips({ title: '该医生暂未关联门店' });
			}
			uni.showLoading({ title: '请稍候…' });
			getTherapistByMchApi({ mchId: mid, page: 1, limit: 1 })
				.then((res) => {
					const list = (res.data && res.data.list) || [];
					const t = list[0];
					if (!t || !t.id) {
						uni.hideLoading();
						return this.$util.Tips({ title: '该门店暂无理疗师，暂无法预订套餐' });
					}
					const payload = {
						therapistId: t.id,
						mchId: mid,
						name: t.name || '',
						domain: t.hospitalDomain || '',
						picture: t.picture || '',
						categoryListSource: 'tcm',
						doctorId: this.doctorId
					};
					if (cat && cat.id != null) {
						payload.preselectedCategoryId = cat.id;
					}
					setPhysioBookNav(payload);
					uni.hideLoading();
					this.$util.navigateTo('/pages/clinic/physio_book/index');
				})
				.catch(() => {
					uni.hideLoading();
					this.$util.Tips({ title: '加载失败' });
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
	// margin: 16rpx 24rpx 0;
	background: #fff;
	// border-radius: 16rpx;
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
	margin: 20rpx 0rpx 0;
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

.tabs-wrap {
	margin: 0;
	background: #fff;
	padding: 0;
}

.detail-tabs {
	display: flex;
	justify-content: space-around;
	padding: 20rpx 60rpx;
	position: relative;
}

.detail-tab {
	font-size: 32rpx;
	color: #666;
	padding: 10rpx 0;
	position: relative;
}

.detail-tab.on {
	font-weight: 700;
	color: #333;
}

.detail-tab.on::after {
	content: '';
	position: absolute;
	left: 50%;
	bottom: -4rpx;
	transform: translateX(-50%);
	width: 44rpx;
	height: 10rpx;
	background: #ffc107;
	border-radius: 100rpx;
}

.review-section {
	margin-top: 13rpx;
	background: #fff;
	padding: 30rpx 24rpx;
}

.review-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.review-head-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #333;
}

.review-head-rate {
	font-size: 24rpx;
	color: #ff9f00;
}

.review-tags-row {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 30rpx;
}

.review-tag-item {
	font-size: 24rpx;
	color: #d59600;
	background: #fff9e6;
	padding: 12rpx 24rpx;
	border-radius: 8rpx;
}

.review-card {
	background: #fff;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}

.review-card:last-child {
	border-bottom: none;
}

.review-user-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 20rpx;
}

.review-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: #f1f1f1;
}

.review-user-main {
	flex: 1;
}

.review-user-top {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.review-user-name {
	font-size: 30rpx;
	font-weight: 700;
	color: #333;
}

.review-user-level {
	font-size: 18rpx;
	color: #fff;
	background: #4a90e2;
	padding: 2rpx 10rpx;
	border-radius: 4rpx;
}

.review-user-sub {
	font-size: 24rpx;
	color: #999;
	margin-top: 6rpx;
}

.sub-split {
	margin: 0 12rpx;
}

.review-rating-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.rating-icon {
	font-size: 26rpx;
	color: #333;
}

.rating-stars {
	font-size: 28rpx;
	color: #ff4d4f;
	letter-spacing: 2rpx;
}

.rating-metrics {
	font-size: 24rpx;
	color: #ccc;
}

.review-labels {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.review-label-chip {
	font-size: 24rpx;
	color: #666;
	background: #f5f5f5;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
}

.review-content {
	font-size: 30rpx;
	color: #333;
	line-height: 1.6;
	margin-bottom: 24rpx;
	display: block;
}

.review-pics {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.review-pic {
	width: 220rpx;
	height: 220rpx;
	border-radius: 12rpx;
}

.review-therapist-tag {
	display: inline-flex;
	align-items: center;
	background: #f8f8f8;
	padding: 10rpx 20rpx;
	border-radius: 40rpx;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.t-tag-avatar {
	width: 44rpx;
	height: 44rpx;
	border-radius: 50%;
}

.t-tag-name {
	font-size: 26rpx;
	color: #333;
}

.t-tag-btn {
	font-size: 24rpx;
	color: #333;
	background: #ffc107;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
	font-weight: 700;
}

.review-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 10rpx;
}

.view-count {
	font-size: 24rpx;
	color: #999;
}

.footer-actions {
	display: flex;
	align-items: center;
	gap: 30rpx;
	color: #999;
}

.action-item {
	display: flex;
	align-items: center;
	gap: 10rpx;
	font-size: 26rpx;
}

.review-more-btn {
	text-align: center;
	font-size: 30rpx;
	color: #666;
	padding: 40rpx 0 20rpx;
}

.review-overview {
	display: none;
}

/* 套餐区：仅「套餐预订」白卡片，与上方模块左右对齐 */
.pkg-from-therapist {
	margin: 16rpx 24rpx 0;
}

.pkg-from-therapist .cate-section {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx 20rpx 8rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.03);
}

.cate-sec-head {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.cate-sec-badge {
	width: 40rpx;
	height: 40rpx;
	line-height: 40rpx;
	text-align: center;
	font-size: 22rpx;
	color: #fff;
	font-weight: 600;
	background: linear-gradient(135deg, #ff7a45, #fa541c);
	border-radius: 8rpx;
}

.cate-sec-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
}

.cate-guarantee {
	font-size: 22rpx;
	color: #d48806;
	background: #fff7e6;
	padding: 12rpx 16rpx;
	border-radius: 8rpx;
	margin-bottom: 16rpx;
	line-height: 1.4;
}

.cate-loading,
.cate-empty {
	text-align: center;
	padding: 40rpx 0;
	font-size: 26rpx;
	color: #999;
}

.cate-empty--box {
	margin: 16rpx 24rpx 0;
	background: #fff;
	border-radius: 16rpx;
}

.pkg-row {
	display: flex;
	align-items: stretch;
	padding: 20rpx 0;
	gap: 16rpx;
	border-bottom: 1rpx solid #f5f5f5;
}

.pkg-row:last-of-type {
	border-bottom: none;
}

.pkg-cover {
	width: 144rpx;
	height: 144rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
	background: #f0f0f0;
}

.pkg-mid {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 4rpx 0;
}

.pkg-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #111;
	line-height: 1.35;
}

.pkg-sub {
	font-size: 22rpx;
	color: #999;
	margin-top: 6rpx;
	line-height: 1.4;
}

.line-clamp-1 {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.pkg-price-row {
	display: flex;
	align-items: baseline;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 8rpx;
}

.pkg-price {
	font-size: 32rpx;
	font-weight: 700;
	color: #e6285f;
}

.pkg-home {
	font-size: 22rpx;
	color: #666;
}

.pkg-right {
	flex-shrink: 0;
	width: 160rpx;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: space-between;
	padding: 4rpx 0 8rpx;
}

.pkg-sales {
	font-size: 20rpx;
	color: #bbb;
}

.pkg-book-btn {
	width: 132rpx;
	height: 56rpx;
	line-height: 56rpx;
	padding: 0;
	margin: 0;
	font-size: 26rpx;
	font-weight: 600;
	color: #333;
	background: linear-gradient(180deg, #ffe14d, #ffc107);
	border-radius: 28rpx;
	border: none;
	box-sizing: border-box;
}

.pkg-book-btn::after {
	border: none;
}

.pkg-book-hover {
	opacity: 0.9;
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
