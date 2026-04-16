<template>
	<view class="reviews-page" :data-theme="theme">
		<view v-if="loading && page === 1 && !mergedRaw.length" class="state-wrap">
			<text>加载中...</text>
		</view>
		<view v-else-if="!therapistId" class="state-wrap">
			<text>参数错误</text>
		</view>
		<block v-else>
			<!-- 评分总览 -->
			<view class="summary-card">
				<view class="summary-top">
					<view class="score-block">
						<text class="laurel left">❧</text>
						<view class="score-main">
							<text class="big-score">{{ summaryScore }}</text>
							<text class="score-sub">已有{{ realUserText }}人真实评价</text>
						</view>
						<text class="laurel right">❧</text>
					</view>
					<view class="dim-rows">
						<view v-for="(row, ri) in dimRows" :key="ri" class="dim-row">
							<text class="dim-name">{{ row.name }}</text>
							<text class="dim-stars">{{ row.stars }}</text>
							<text class="dim-num">{{ row.num }}</text>
						</view>
					</view>
				</view>
				<view class="trust-banner">
					所有评价均来源于真实用户，也期待您的评价
				</view>
			</view>

			<!-- 筛选 Tab -->
			<view class="filter-tabs">
				<view
					v-for="tab in filterTabDefs"
					:key="tab.key"
					class="filter-tab"
					:class="{ on: filterKey === tab.key }"
					@click="filterKey = tab.key"
				>
					{{ tab.label }} {{ tab.countText }}
				</view>
			</view>

			<!-- 关键词标签 -->
			<view class="keyword-wrap" v-if="keywordTags.length">
				<view
					v-for="(tg, ti) in keywordTags"
					:key="ti"
					class="keyword-chip"
				>
					{{ tg.name }} ({{ tg.count }})
				</view>
			</view>

			<view v-if="listLoading" class="hint-loading">加载中...</view>
			<view v-else-if="!displayList.length" class="hint-empty">暂无评价</view>
			<view v-else>
				<view
					v-for="(item, idx) in displayList"
					:key="'rv-' + (item.id != null ? item.id : idx)"
					class="review-card"
				>
					<view class="review-user-row">
						<image class="review-avatar" :src="item.userAvatar" mode="aspectFill" />
						<view class="review-user-main">
							<view class="review-user-top">
								<text class="review-user-name">{{ item.userName }}</text>
								<text class="review-user-level">V 大众</text>
							</view>
							<view class="review-user-sub">
								<text>{{ item.createTimeDate }}</text>
								<text class="sub-split">|</text>
								<text>{{ item.categoryName || '理疗服务' }}</text>
							</view>
						</view>
					</view>

					<view class="review-rating-row">
						<text class="rating-icon">{{ ratingMood(item) }}</text>
						<view class="rating-stars">{{ item.starText }}</view>
						<text class="rating-metrics">| {{ item.metricText }}</text>
					</view>

					<view class="review-labels" v-if="item.labelTags && item.labelTags.length">
						<text
							v-for="(tag, tidx) in item.labelTags"
							:key="tidx"
							class="review-label-chip"
						>
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

					<view class="review-therapist-tag" @click.stop="onYueTa">
						<image
							class="t-tag-avatar"
							:src="therapistAvatarSrc(item)"
							mode="aspectFill"
						/>
						<text class="t-tag-name">{{ item.therapistName || therapistNameHint }}</text>
						<view class="t-tag-btn">约Ta ></view>
					</view>

					<view class="review-footer">
						<text class="view-count">浏览{{ item.viewCount || 0 }}</text>
						<view class="footer-actions">
							<view class="action-item">
								<text class="iconfont icon-ic_love"></text> 没用
							</view>
							<view class="action-item">
								<text class="iconfont icon-ic_love"></text> 有用
							</view>
							<text class="iconfont icon-ic_more"></text>
						</view>
					</view>
				</view>
			</view>

			<view class="end-tip">
				{{ endTipText }}
			</view>
		</block>
	</view>
</template>

<script>
import {
	getTherapistReplyListApi,
	getTherapistReplyStatApi
} from '@/api/clinic.js';
import { mapPhysioReplyToRow } from '@/utils/physioTherapistReviewDisplay.js';

const PAGE_SIZE = 10;

export default {
	data() {
		return {
			theme: this.$Cache.get('theme') || getApp().globalData.theme,
			therapistId: 0,
			mchId: 0,
			therapistNameHint: '',
			loading: true,
			listLoading: false,
			stat: null,
			mergedRaw: [],
			page: 1,
			totalPage: 0,
			total: 0,
			finished: false,
			filterKey: 'all'
		};
	},
	computed: {
		defaultAvatar() {
			const raw = this.$Cache.get('imgHost') || '';
			if (!raw) return '';
			const host = raw.replace(/\/?$/, '/');
			return `${host}crmebimage/presets/morenT.png`;
		},
		summaryScore() {
			const avg = this.stat && this.stat.avgStar;
			const n = Number(avg);
			if (!Number.isFinite(n) || n <= 0) return '—';
			return n.toFixed(1);
		},
		realUserText() {
			const t = this.stat && this.stat.totalCount;
			const n = Number(t);
			return Number.isFinite(n) && n >= 0 ? String(n) : '0';
		},
		dimRows() {
			const s = this.stat || {};
			const rows = [
				{ key: 'avgStar', name: '总体' },
				{ key: 'avgProfessionalStar', name: '手法' },
				{ key: 'avgServiceStar', name: '服务' }
			];
			return rows.map((r) => {
				const v = Number(s[r.key]);
				const num = Number.isFinite(v) && v > 0 ? v.toFixed(1) : '5.0';
				const rounded = Math.min(5, Math.max(0, Math.round(Number(num) || 0)));
				const stars = `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
				return { name: r.name, stars, num };
			});
		},
		lowScoreCount() {
			const s = this.stat || {};
			const a = Number(s.star1Count) || 0;
			const b = Number(s.star2Count) || 0;
			return a + b;
		},
		mediaCount() {
			return this.mergedRaw.filter((r) => this.rawHasMedia(r)).length;
		},
		filterTabDefs() {
			const total = Number(this.stat && this.stat.totalCount) || 0;
			return [
				{ key: 'all', label: '全部', countText: total },
				{ key: 'media', label: '图/视频', countText: this.mediaCount },
				{ key: 'latest', label: '最新', countText: total },
				{ key: 'low', label: '低分', countText: this.lowScoreCount }
			];
		},
		mappedRows() {
			return this.mergedRaw.map((raw) =>
				mapPhysioReplyToRow(raw, (p) => this.resolveImgUrl(p), this.defaultAvatar)
			);
		},
		displayList() {
			let list = this.mappedRows.slice();
			if (this.filterKey === 'media') {
				list = list.filter((r) => r.picList && r.picList.length);
			} else if (this.filterKey === 'low') {
				list = list.filter((r) => {
					const st = Number(r.star);
					return Number.isFinite(st) && st <= 2;
				});
			}
			if (this.filterKey === 'latest' || this.filterKey === 'all') {
				list.sort((a, b) => {
					const ta = new Date(String(a.createTime || '').replace(/-/g, '/')).getTime();
					const tb = new Date(String(b.createTime || '').replace(/-/g, '/')).getTime();
					return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
				});
			}
			return list;
		},
		keywordTags() {
			const preset = ['准时到达', '体验很棒', '技师专业', '态度好', '耐心', '高大上'];
			const map = {};
			preset.forEach((p) => {
				map[p] = 0;
			});
			this.mappedRows.forEach((row) => {
				(row.labelTags || []).forEach((t) => {
					if (map[t] !== undefined) map[t] += 1;
				});
			});
			return preset
				.map((name) => ({ name, count: map[name] || 0 }))
				.filter((x) => x.count > 0);
		},
		endTipText() {
			if (this.listLoading) return '加载中…';
			if (!this.finished && this.mergedRaw.length) return '上拉加载更多';
			if (this.mergedRaw.length) return '已经全部加载完毕';
			return '';
		}
	},
	onLoad(options) {
		this.therapistId = options.therapistId ? parseInt(options.therapistId, 10) : 0;
		this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
		this.therapistNameHint = options.name ? decodeURIComponent(options.name) : '';
		uni.setNavigationBarTitle({ title: '用户评价' });
		this.bootstrap();
	},
	onReachBottom() {
		this.loadMore();
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
		rawHasMedia(raw) {
			const pics = raw && raw.pics;
			if (!pics) return false;
			if (Array.isArray(pics)) return pics.length > 0;
			return String(pics).trim().length > 0;
		},
		therapistAvatarSrc(item) {
			const p = item && item.therapistAvatar;
			if (p && String(p).trim()) return this.resolveImgUrl(String(p).trim());
			return this.defaultAvatar;
		},
		ratingMood(item) {
			const st = Number(item && item.star);
			if (Number.isFinite(st) && st >= 4) return '🤩 超赞';
			if (Number.isFinite(st) && st >= 3) return '😊 不错';
			return '评价';
		},
		previewImage(urls, index) {
			uni.previewImage({ urls, current: index });
		},
		onYueTa() {
			const tid = this.therapistId;
			const mid = this.mchId || '';
			if (!tid) return;
			uni.navigateTo({
				url: `/pages/clinic/therapist/detail?therapistId=${tid}&mchId=${mid}&openBook=1`
			});
		},
		async bootstrap() {
			if (!this.therapistId) {
				this.loading = false;
				return;
			}
			this.loading = true;
			try {
				const statRes = await getTherapistReplyStatApi({
					therapistId: this.therapistId
				}).catch(() => null);
				this.stat = statRes && statRes.data ? statRes.data : null;
			} finally {
				this.loading = false;
			}
			this.page = 1;
			this.mergedRaw = [];
			this.finished = false;
			await this.fetchPage(true);
		},
		async fetchPage(isFirst) {
			if (!this.therapistId || this.finished) return;
			if (this.listLoading) return;
			this.listLoading = true;
			try {
				const res = await getTherapistReplyListApi({
					therapistId: this.therapistId,
					page: this.page,
					limit: PAGE_SIZE
				}).catch(() => null);
				const data = res && res.data;
				const list = (data && Array.isArray(data.list) && data.list) || [];
				if (data && data.total != null) this.total = Number(data.total);
				if (data && data.totalPage != null) this.totalPage = Number(data.totalPage);
				if (isFirst) {
					this.mergedRaw = list.slice();
				} else {
					this.mergedRaw = this.mergedRaw.concat(list);
				}
				if (this.total > 0 && this.mergedRaw.length >= this.total) {
					this.finished = true;
				} else if (!list.length || list.length < PAGE_SIZE) {
					this.finished = true;
				} else if (this.totalPage > 0 && this.page >= this.totalPage) {
					this.finished = true;
				} else {
					this.page += 1;
				}
			} finally {
				this.listLoading = false;
			}
		},
		loadMore() {
			if (!this.finished && !this.listLoading) {
				this.fetchPage(false);
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.reviews-page {
	min-height: 100vh;
	background: #f5f6f7;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.state-wrap {
	padding: 120rpx 0;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}

.summary-card {
	background: #fff;
	padding: 32rpx 24rpx 0;
	margin-bottom: 16rpx;
}

.summary-top {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: space-between;
	gap: 24rpx;
}

.score-block {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8rpx;
	flex-shrink: 0;
}

.laurel {
	font-size: 44rpx;
	color: #e8c27a;
	line-height: 1;
	opacity: 0.85;
}

.laurel.left {
	transform: scaleX(-1);
}

.score-main {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.big-score {
	font-size: 72rpx;
	font-weight: 700;
	color: #ff7a45;
	line-height: 1.1;
}

.score-sub {
	font-size: 22rpx;
	color: #999;
	margin-top: 12rpx;
}

.dim-rows {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	min-width: 0;
}

.dim-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	font-size: 24rpx;
	color: #333;
}

.dim-name {
	width: 72rpx;
	color: #666;
}

.dim-stars {
	flex: 1;
	color: #ff4d4f;
	letter-spacing: 2rpx;
	margin: 0 12rpx;
}

.dim-num {
	color: #999;
}

.trust-banner {
	margin-top: 24rpx;
	padding: 20rpx 24rpx;
	background: linear-gradient(90deg, #fff5e6 0%, #fff 100%);
	font-size: 24rpx;
	color: #d46b08;
	border-radius: 12rpx 12rpx 0 0;
}

.filter-tabs {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	background: #fff;
	padding: 8rpx 16rpx 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.filter-tab {
	font-size: 26rpx;
	color: #666;
	padding: 8rpx 4rpx;
	position: relative;
}

.filter-tab.on {
	color: #ff7a45;
	font-weight: 600;
}

.filter-tab.on::after {
	content: '';
	position: absolute;
	left: 50%;
	bottom: -8rpx;
	transform: translateX(-50%);
	width: 48rpx;
	height: 6rpx;
	background: #ff7a45;
	border-radius: 100rpx;
}

.keyword-wrap {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	padding: 24rpx 24rpx 8rpx;
	background: #fff;
	margin-bottom: 16rpx;
}

.keyword-chip {
	font-size: 24rpx;
	color: #666;
	background: #f5f5f5;
	padding: 12rpx 20rpx;
	border-radius: 28rpx;
}

.hint-loading,
.hint-empty {
	text-align: center;
	color: #999;
	font-size: 26rpx;
	padding: 40rpx 0;
}

.review-card {
	background: #fff;
	padding: 28rpx 24rpx;
	margin-bottom: 16rpx;
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
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 16rpx;
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
	font-size: 22rpx;
	color: #ccc;
	flex: 1;
	min-width: 60%;
}

.review-labels {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 20rpx;
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
	margin-bottom: 20rpx;
	display: block;
}

.review-pics {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 20rpx;
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
	margin-bottom: 20rpx;
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

.end-tip {
	text-align: center;
	font-size: 24rpx;
	color: #bbb;
	padding: 32rpx 0 48rpx;
}
</style>
