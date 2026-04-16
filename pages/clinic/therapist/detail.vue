<template>
	<view class="therapist-detail-page" :data-theme="theme">
		<view v-if="loading" class="state-wrap"><text>加载中...</text></view>
		<view v-else-if="!therapist" class="state-wrap">
			<emptyPage title="未找到理疗师信息" mTop="20%" :imgSrc="emptyImg"></emptyPage>
		</view>
		<view v-else class="page-body">
			<scroll-view
				scroll-y
				class="detail-scroll"
				:style="{ height: scrollH + 'px' }"
				:scroll-top="detailScrollTop"
				scroll-with-animation
				@scroll="onDetailScroll"
			>
				<!-- 顶部大图（与参考稿一致：形象照全宽） -->
				<view class="hero-banner">
					<image class="hero-img" :src="avatarUrl" mode="aspectFill" />
					<view class="hero-fade" />
				</view>

				<view class="info-sheet">
					<view class="name-row">
						<text class="sheet-name">{{ therapist.name || '—' }}</text>
						<text v-if="ageLabel" class="pill-age">{{ ageLabel }}</text>
						<text v-if="sexLabel" class="pill-sex">{{ sexLabel }}</text>
					</view>
					<view class="sheet-sub">
						<text>{{ statLine }}</text>
						<text class="sub-split">|</text>
						<text>{{ distanceLineText }}</text>
					</view>

					<view class="attr-grid">
						<view v-for="(cell, i) in attrCells" :key="i" class="attr-cell">
							<text class="attr-k">{{ cell.k }}</text>
							<text class="attr-v line-clamp">{{ cell.v }}</text>
						</view>
					</view>

					<view v-if="skillText" class="service-row">
						<text class="service-t">擅长领域</text>
					</view>
					<text v-if="skillText" class="skill-block">{{ skillText }}</text>

					<view class="book-hint-pill">
						<text class="iconfont icon-ic_clock hint-ico"></text>
						<text>到店/上门请先提交预约，按提示完成支付</text>
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

				<!-- 接口 GET therapist/physiotherapy-category/list（mchId），置于预订区下、简介上 -->
				<view v-if="activeTab === 'book' && hasMchForCate" class="cate-section">
					<view class="cate-sec-head">
						<text class="cate-sec-badge">订</text>
						<text class="cate-sec-title">套餐预订</text>
					</view>
					<view class="cate-guarantee">未服务全额退 | 技师爽约再赔30元</view>
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
								<text class="pkg-name">{{ item.name || '理疗项目' }}</text>
								<text class="pkg-sub line-clamp-1">{{ categorySubLine(item) }}</text>
								<view class="pkg-price-row">
									<text class="pkg-price">¥{{ formatPrice(item.price) }}</text>
									<text
										v-if="item.homeService && item.homePrice != null"
										class="pkg-home"
									>
										上门 ¥{{ formatPrice(item.homePrice) }}
									</text>
								</view>
							</view>
							<view class="pkg-right">
								<text class="pkg-sales">技师销量 {{ treatNumDisplay }}</text>
								<button
									class="pkg-book-btn"
									hover-class="pkg-book-hover"
									@click.stop="bookCategory(item)"
								>
									预订
								</button>
							</view>
						</view>
						<view v-if="categoryList.length === 0" class="cate-empty">暂无理疗项目</view>
					</block>
				</view>
				<view v-else-if="activeTab === 'book'" class="cate-empty cate-empty--box">暂无理疗项目</view>

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

							<view
								class="review-therapist-tag"
								v-if="therapist"
								@click.stop="onTapYueTa"
							>
								<image class="t-tag-avatar" :src="avatarUrl" mode="aspectFill"></image>
								<text class="t-tag-name">{{ therapist.name }}</text>
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
				<view class="footer-dyn" @click="onTherapistDyn">
					<text class="iconfont icon-ic_notes dyn-ico"></text>
					<text class="dyn-txt">技师动态</text>
				</view>
				<button class="book-main bg-color" hover-class="book-main-hover" @click="bookNow">立即预订</button>
			</view>
		</view>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import {
	getTherapistPageListApi,
	getPhysiotherapyCategoryListApi,
	getTherapistReplyListApi,
	getTherapistReplyStatApi
} from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';
import { THERAPIST_DETAIL_PREFILL_KEY as PREFILL_KEY } from '@/utils/therapistDetailPrefill.js';
import { setPhysioBookNav } from '@/utils/physioBookNav.js';
import {
	formatTherapistAgeLabel,
	formatTherapistSex,
	formatTherapistSkill
} from '@/utils/therapistFields.js';

export default {
	components: { emptyPage },
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
		ageLabel() {
			return this.therapist ? formatTherapistAgeLabel(this.therapist) : '';
		},
		sexLabel() {
			return this.therapist ? formatTherapistSex(this.therapist) : '';
		},
		skillText() {
			return this.therapist ? formatTherapistSkill(this.therapist) : '';
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
		statLine() {
			const t = this.therapist;
			if (!t) return '暂无评分 | 评价不足';
			const s = t.score;
			const n = t.treatNum;
			let left = '暂无评分';
			if (s != null && Number(s) > 0) {
				left = '★' + Number(s).toFixed(1) + ' 好评';
			}
			let right = '评价不足';
			if (n != null && n !== '' && !isNaN(Number(n)) && Number(n) > 0) {
				right = '已服务 ' + n + ' 人';
			}
			return left + ' | ' + right;
		},
		distanceLineText() {
			if (this.therapist && this.therapist.distance) {
				return String(this.therapist.distance);
			}
			return '直线≤1km';
		},
		attrCells() {
			const t = this.therapist;
			if (!t) return [];
			const resp = this.responseShort;
			return [
				{ k: '性别', v: formatTherapistSex(t) || '—' },
				{ k: '年龄', v: formatTherapistAgeLabel(t) || '—' },
				{ k: '擅长', v: formatTherapistSkill(t) || '—' },
				{ k: '响应', v: resp }
			];
		},
		responseShort() {
			const t = this.therapist && this.therapist.responseTime;
			if (t == null || t === '' || Number(t) === 0) return '—';
			return `约 ${t} 分钟`;
		},
		/** 当前门店可拉取理疗类目列表 */
		hasMchForCate() {
			const mid = (this.therapist && this.therapist.mchId) || this.mchId;
			return !!mid;
		},
		treatNumDisplay() {
			const n = this.therapist && this.therapist.treatNum;
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
				if (Number.isFinite(eff) && eff >= 4) labels.push('体验很棒');
				if (Number.isFinite(pro) && pro >= 4) labels.push('技师专业');
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
					metricText: `总分${this.scoreNumText(item.star)}星 手法${this.scoreNumText(item.effectStar)}星 服务${this.scoreNumText(item.serviceStar)}星`,
					metricTextShort: `总分${this.scoreNumText(item.star)} 手法${this.scoreNumText(item.effectStar)} 服务${this.scoreNumText(item.serviceStar)}`,
					labelTags: labels,
					createTimeDate: dateStr,
					picList: this.parseReviewPics(item.pics)
				};
			});
		}
	},
	data() {
		return {
			theme: this.$Cache.get('theme') || getApp().globalData.theme,
			loading: true,
			therapist: null,
			therapistId: 0,
			mchId: 0,
			activeTab: 'book',
			expandSelf: false,
			safeBottom: 0,
			scrollH: 500,
			/** 与 scroll-view 联动，用于「约Ta」滚回顶部 */
			detailScrollTop: 0,
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
				{ name: '技师专业', count: 1 }
			],
			/** 从评价列表返回时打开「预订」并滚顶 */
			pendingOpenBook: false
		};
	},
	onLoad(options) {
		this.therapistId = options.therapistId ? parseInt(options.therapistId, 10) : 0;
		this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
		this.pendingOpenBook = options.openBook === '1' || options.openBook === 'true';
		const sys = uni.getSystemInfoSync();
		this.safeBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
		const wh = sys.windowHeight || 667;
		const ww = sys.windowWidth || 375;
		const footerRpx = 24 + 88 + 24;
		const barPx = (footerRpx * ww) / 750;
		this.scrollH = Math.max(240, Math.floor(wh - barPx - this.safeBottom));
		this.loadTherapist();
	},
	methods: {
		onDetailScroll(e) {
			const t = e.detail && e.detail.scrollTop;
			if (typeof t === 'number' && !isNaN(t)) {
				this.detailScrollTop = t;
			}
		},
		/** 评价卡片内「约Ta」：切到预订并滚到页面顶部（套餐区） */
		onTapYueTa() {
			this.activeTab = 'book';
			this.$nextTick(() => {
				const cur = this.detailScrollTop;
				if (cur === 0) {
					this.detailScrollTop = 0.01;
					this.$nextTick(() => {
						this.detailScrollTop = 0;
					});
				} else {
					this.detailScrollTop = 0;
				}
			});
		},
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
				this.reviewStat = null;
				this.reviewList = [];
				this.loading = false;
				this.pendingOpenBook = false;
				return;
			}
			try {
				const raw = uni.getStorageSync(PREFILL_KEY + this.therapistId);
				if (raw) {
					this.therapist = JSON.parse(raw);
					this.loading = false;
					this.applyTitle();
					this.loadCategories();
					this.loadReviews();
					this.$nextTick(() => this.tryOpenBookFromReviews());
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
					this.reviewStat = null;
					this.reviewList = [];
				})
				.finally(() => {
					this.loading = false;
					this.applyTitle();
					if (this.therapist) {
						this.loadCategories();
						this.loadReviews();
					}
					this.$nextTick(() => this.tryOpenBookFromReviews());
				});
		},
		loadCategories() {
			const mid = (this.therapist && this.therapist.mchId) || this.mchId;
			if (!mid) {
				this.categoryList = [];
				return;
			}
			this.cateLoading = true;
			getPhysiotherapyCategoryListApi({ page: 1, limit: 200, mchId: mid })
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
			if (!this.therapistId) {
				this.reviewStat = null;
				this.reviewList = [];
				return;
			}
			this.reviewLoading = true;
			const query = { therapistId: this.therapistId };
			Promise.all([
				getTherapistReplyStatApi(query).catch(() => null),
				getTherapistReplyListApi({ ...query, page: 1, limit: this.reviewPageLimit }).catch(() => null)
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
			const tid = this.therapistId;
			const mid = (this.therapist && this.therapist.mchId) || this.mchId;
			const name = (this.therapist && this.therapist.name) || '';
			if (!tid) {
				return this.$util.Tips({ title: '缺少理疗师信息' });
			}
			const q = `therapistId=${tid}&mchId=${mid || ''}&name=${encodeURIComponent(name)}`;
			this.$util.navigateTo(`/pages/clinic/therapist/reviews/index?${q}`);
		},
		tryOpenBookFromReviews() {
			if (!this.pendingOpenBook) return;
			if (!this.therapist) {
				this.pendingOpenBook = false;
				return;
			}
			this.pendingOpenBook = false;
			this.$nextTick(() => {
				this.onTapYueTa();
			});
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
			parts.push('缓解疲劳');
			return parts.join(' | ');
		},
		formatPrice(v) {
			if (v == null || v === '') return '0';
			const n = Number(v);
			if (isNaN(n)) return '0';
			return Number.isInteger(n) ? String(n) : n.toFixed(2);
		},
		applyTitle() {
			const t =
				(this.therapist && this.therapist.name && String(this.therapist.name).trim()) ||
				'理疗师详情';
			uni.setNavigationBarTitle({ title: t });
		},
		onTherapistDyn() {
			this.$util.Tips({ title: '技师动态敬请期待' });
		},
		bookNow() {
			this.goPhysioBook();
		},
		bookCategory(cat) {
			this.goPhysioBook(cat);
		},
		goPhysioBook(prefCat) {
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
			const payload = {
				therapistId: item.id,
				mchId: mid,
				name: item.name || '',
				domain: item.hospitalDomain || '',
				picture: item.picture || ''
			};
			if (prefCat && prefCat.id != null) {
				payload.preselectedCategoryId = prefCat.id;
			}
			setPhysioBookNav(payload);
			this.$util.navigateTo('/pages/clinic/physio_book/index');
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

.hero-banner {
	position: relative;
	width: 100%;
	height: 520rpx;
	background: #e8e8e8;
}

.hero-img {
	width: 100%;
	height: 520rpx;
	display: block;
}

.hero-fade {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 120rpx;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.12), transparent);
	pointer-events: none;
}

.info-sheet {
	margin: -32rpx 0 0;
	padding: 28rpx 28rpx 24rpx;
	background: #fff;
	border-radius: 24rpx 24rpx 0 0;
	position: relative;
	z-index: 2;
}

.name-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.sheet-name {
	font-size: 40rpx;
	font-weight: 700;
	color: #111;
}

.pill-age {
	font-size: 24rpx;
	color: #e6285f;
	font-weight: 500;
	padding: 4rpx 14rpx;
	background: #fff0f5;
	border-radius: 8rpx;
}

.pill-sex {
	font-size: 22rpx;
	color: #666;
	padding: 4rpx 14rpx;
	background: #f5f5f5;
	border-radius: 8rpx;
}

.sheet-sub {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 24rpx;
	line-height: 1.5;
}

.sub-split {
	margin: 0 10rpx;
	color: #ddd;
}

.attr-grid {
	display: flex;
	flex-wrap: wrap;
	border-top: 1rpx solid #f0f0f0;
	border-left: 1rpx solid #f0f0f0;
	margin-bottom: 20rpx;
	border-radius: 8rpx;
	overflow: hidden;
}

.attr-cell {
	width: 25%;
	box-sizing: border-box;
	padding: 20rpx 12rpx;
	border-right: 1rpx solid #f0f0f0;
	border-bottom: 1rpx solid #f0f0f0;
	text-align: center;
	background: #fafafa;
}

.attr-k {
	display: block;
	font-size: 22rpx;
	color: #999;
	margin-bottom: 8rpx;
}

.attr-v {
	display: block;
	font-size: 24rpx;
	color: #333;
	font-weight: 500;
	word-break: break-all;
}

.line-clamp {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.service-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.service-t {
	font-size: 28rpx;
	font-weight: 600;
	color: #282828;
}

.skill-block {
	font-size: 26rpx;
	color: #555;
	line-height: 1.55;
	margin-bottom: 20rpx;
}

.book-hint-pill {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx 20rpx;
	background: #f6fffa;
	border: 1rpx solid rgba(0, 168, 84, 0.2);
	border-radius: 12rpx;
	font-size: 24rpx;
	color: #00a854;
}

.hint-ico {
	font-size: 28rpx;
}

.tabs-wrap {
	background: #fff;
	margin: 0;
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

.tab-panel {
	padding: 24rpx 36rpx 8rpx;
}

.tab-hint {
	font-size: 26rpx;
	color: #999;
	line-height: 1.5;
}

.empty-review {
	font-size: 26rpx;
	color: #bbb;
	text-align: center;
	display: block;
	padding: 24rpx 0;
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

/* 套餐列表（接口 physiotherapy-category/list） */
.cate-section {
	background: #fff;
	// margin: 0 24rpx 20rpx;
	border-radius: 16rpx;
	padding: 24rpx 20rpx 8rpx;
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
	margin: 0 24rpx 16rpx;
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

.block-card {
	background: #fff;
	margin: 12rpx 0rpx 0rpx 0rpx;
	// border-radius: 16rpx;
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
	padding: 0 32rpx 120rpx;
}

.tip-t {
	font-size: 24rpx;
	color: #999;
	line-height: 1.45;
}

.footer-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	background: #fff;
	padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
	box-sizing: border-box;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.footer-dyn {
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100rpx;
}

.dyn-ico {
	font-size: 40rpx;
	color: #666;
}

.dyn-txt {
	font-size: 20rpx;
	color: #999;
	margin-top: 4rpx;
}

.book-main {
	flex: 1;
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
