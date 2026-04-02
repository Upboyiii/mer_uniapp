<template>
	<view class="mch-therapist-page" :data-theme="theme">
		<view v-if="mchId" class="store-tip">
			<text>当前门店 · 店内理疗师（点卡片进详情，点预约直接下单）</text>
		</view>

		<view v-if="mchId && list.length > 0" class="search-bar">
			<view class="search-inner">
				<text class="iconfont icon-ic_search"></text>
				<input
					class="search-input"
					type="text"
					placeholder="搜索姓名、擅长/理疗类型"
					:value="keyword"
					@input="onSearchInput"
				/>
			</view>
		</view>

		<view v-if="displayList.length > 0" class="therapist-list">
			<view
				class="therapist-card"
				v-for="(item, index) in displayList"
				:key="'mch-t-' + (item.id != null ? item.id : index)"
				@click="goTherapistDetail(item)"
			>
				<view class="therapist-card-row">
					<view class="card-avatar">
						<image
							class="avatar"
							:src="item.picture || '/static/images/f.png'"
							mode="aspectFill"
						></image>
					</view>
					<view class="card-info">
						<view class="info-name">{{ item.name }}</view>
						<view class="info-domain line1" v-if="item.hospitalDomain">
							擅长：{{ item.hospitalDomain }}
						</view>
						<view class="info-stats">
							<view class="stat" v-if="item.score">
								<text class="stat-val">{{ item.score }}</text>
								<text class="stat-label">评分</text>
							</view>
							<view class="stat" v-if="item.treatNum">
								<text class="stat-val">{{ item.treatNum }}</text>
								<text class="stat-label">已服务</text>
							</view>
						</view>
					</view>
					<view class="card-action">
						<view class="book-btn" @click.stop="goBookTherapist(item)">预约</view>
					</view>
				</view>
				<view v-if="index < displayList.length - 1" class="card-divider">
					<view class="card-divider-line"></view>
				</view>
			</view>
		</view>

		<view v-else-if="!loading && mchId && list.length > 0 && displayList.length === 0" class="search-empty">
			<text>未找到相关理疗师</text>
		</view>

		<view v-else-if="!loading && mchId && list.length === 0" class="empty-wrap">
			<emptyPage title="该门店暂无理疗师~" mTop="20%" :imgSrc="emptyImg"></emptyPage>
		</view>

		<view v-else-if="!mchId" class="empty-wrap">
			<emptyPage title="缺少门店信息~" mTop="20%" :imgSrc="emptyImg"></emptyPage>
		</view>

		<view v-if="loading" class="loading-wrap">
			<text>加载中...</text>
		</view>
		<view v-if="loadend && list.length > 0" class="loading-wrap">
			<text>没有更多了</text>
		</view>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import { getTherapistByMchApi } from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';

let app = getApp();

export default {
	components: { emptyPage },
	computed: {
		...mapGetters(['isLogin']),
		emptyImg() {
			const raw = this.$Cache.get('imgHost') || '';
			const host = String(raw).replace(/\/?$/, '/');
			return `${host}crmebimage/presets/noJilu.png`;
		},
		displayList() {
			if (!this.keyword.trim()) return this.list;
			const kw = this.keyword.trim().toLowerCase();
			return this.list.filter((t) => {
				const name = (t.name || '').toLowerCase();
				const domain = (t.hospitalDomain || '').toLowerCase();
				const intro = (t.selfInfo || '').toLowerCase();
				return name.indexOf(kw) !== -1 || domain.indexOf(kw) !== -1 || intro.indexOf(kw) !== -1;
			});
		}
	},
	data() {
		return {
			theme: this.$Cache.get('theme') || app.globalData.theme,
			mchId: 0,
			list: [],
			keyword: '',
			loading: false,
			loadend: false,
			page: 1,
			limit: 10
		};
	},
	onLoad(options) {
		this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
		uni.setNavigationBarTitle({ title: '理疗师列表' });
		if (this.mchId) {
			this.getList();
		}
	},
	onReachBottom() {
		this.getList();
	},
	onPullDownRefresh() {
		this.page = 1;
		this.loadend = false;
		this.list = [];
		if (this.mchId) {
			this.getList(() => uni.stopPullDownRefresh());
		} else {
			uni.stopPullDownRefresh();
		}
	},
	onBackPress() {
		return this.handleBack();
	},
	methods: {
		onSearchInput(e) {
			this.keyword = (e.detail && e.detail.value) != null ? e.detail.value : '';
		},
		handleBack() {
			const pages = getCurrentPages();
			if (pages.length > 1) {
				return false;
			}
			let ref = '';
			let mer = '';
			try {
				ref = uni.getStorageSync('CLINIC_THERAPIST_REF') || '';
				mer = uni.getStorageSync('CLINIC_THERAPIST_BACK_MER') || '';
			} catch (e) {}
			try {
				uni.removeStorageSync('CLINIC_THERAPIST_REF');
				uni.removeStorageSync('CLINIC_THERAPIST_BACK_MER');
			} catch (e) {}
			const mch = this.mchId || (mer ? parseInt(mer, 10) : 0);
			if (ref === 'store' && mch) {
				try {
					uni.setStorageSync('CLINIC_HOME_MER_ID', String(mch));
				} catch (e) {}
				uni.switchTab({ url: '/pages/clinic/home/index' });
			} else {
				uni.switchTab({ url: '/pages/index/index' });
			}
			return true;
		},
		getList(cb) {
			if (!this.mchId || this.loadend || this.loading) {
				cb && cb();
				return;
			}
			this.loading = true;
			getTherapistByMchApi({ page: this.page, limit: this.limit, mchId: this.mchId })
				.then((res) => {
					let rows = (res.data && res.data.list) || res.data || [];
					if (!Array.isArray(rows)) rows = [];
					if (rows.length < this.limit) this.loadend = true;
					this.list = this.list.concat(rows);
					this.page++;
					this.loading = false;
					cb && cb();
				})
				.catch(() => {
					this.loading = false;
					cb && cb();
				});
		},
		goTherapistDetail(item) {
			if (!item || item.id == null) {
				return this.$util.Tips({ title: '数据异常' });
			}
			if (!item.mchId) {
				return this.$util.Tips({ title: '该理疗师暂未关联门店' });
			}
			try {
				uni.setStorageSync('CLINIC_THERAPIST_REF', 'store');
				uni.setStorageSync('CLINIC_THERAPIST_BACK_MER', String(this.mchId));
				uni.setStorageSync('therapist_detail_prefill_' + item.id, JSON.stringify(item));
			} catch (e) {}
			const q = [
				`therapistId=${item.id}`,
				`mchId=${item.mchId}`,
				`name=${encodeURIComponent(item.name || '')}`,
				`domain=${encodeURIComponent(item.hospitalDomain || '')}`,
				`picture=${encodeURIComponent(item.picture || '')}`
			].join('&');
			this.$util.navigateTo(`/pages/clinic/therapist/detail?${q}`);
		},
		goBookTherapist(item) {
			if (!this.isLogin) {
				return this.$util.navigateTo('/pages/users/login/index');
			}
			const tid = item.id;
			const mchId = item.mchId;
			if (!tid) {
				return this.$util.Tips({ title: '数据异常' });
			}
			if (!mchId) {
				return this.$util.Tips({ title: '该理疗师暂未关联门店' });
			}
			const q = [
				`therapistId=${tid}`,
				`mchId=${mchId}`,
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
.mch-therapist-page {
	min-height: 100vh;
	background: #f5f5f5;
}

.store-tip {
	padding: 20rpx 24rpx;
	font-size: 24rpx;
	color: #888;
	background: #f9f9f9;
}

.search-bar {
	padding: 16rpx 24rpx;
	background: #fff;
}

.search-inner {
	display: flex;
	align-items: center;
	height: 72rpx;
	padding: 0 20rpx;
	background: #f5f6f8;
	border-radius: 36rpx;
}

.search-inner .iconfont {
	font-size: 32rpx;
	color: #bbb;
	margin-right: 12rpx;
}

.search-input {
	flex: 1;
	height: 72rpx;
	font-size: 28rpx;
}

.therapist-list {
	padding: 0;
	background: #fff;
}

.therapist-card {
	display: flex;
	flex-direction: column;
	background: #fff;
}

.therapist-card-row {
	display: flex;
	align-items: center;
	padding: 28rpx 24rpx;
	min-height: 160rpx;
	box-sizing: border-box;
}

.card-divider {
	width: 100%;
	display: flex;
	justify-content: center;
	padding-top: 2rpx;
}

.card-divider-line {
	width: 92%;
	height: 2rpx;
	background: linear-gradient(
		90deg,
		rgba(0, 0, 0, 0) 0%,
		rgba(0, 0, 0, 0.035) 14%,
		rgba(0, 0, 0, 0.055) 50%,
		rgba(0, 0, 0, 0.035) 86%,
		rgba(0, 0, 0, 0) 100%
	);
}

.card-avatar {
	flex-shrink: 0;
	margin-right: 20rpx;
}

.avatar {
	width: 110rpx;
	height: 110rpx;
	border-radius: 50%;
}

.card-info {
	flex: 1;
	overflow: hidden;
	min-height: 110rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.info-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
	margin-bottom: 8rpx;
}

.info-domain {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 8rpx;
	line-height: 1.4;
}

.info-stats {
	display: flex;
	gap: 24rpx;
	min-height: 36rpx;
}

.stat {
	display: flex;
	align-items: center;
	gap: 4rpx;
}

.stat-val {
	font-size: 24rpx;
	font-weight: 600;
	color: #f0932b;
}

.stat-label {
	font-size: 20rpx;
	color: #999;
}

.card-action {
	flex-shrink: 0;
	margin-left: 16rpx;
}

.book-btn {
	padding: 14rpx 32rpx;
	background: var(--view-theme);
	color: #fff;
	font-size: 24rpx;
	border-radius: 30rpx;
}

.line1 {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.search-empty {
	padding: 80rpx 32rpx;
	text-align: center;
	font-size: 26rpx;
	color: #999;
}

.empty-wrap {
	min-height: 50vh;
}

.loading-wrap {
	text-align: center;
	padding: 30rpx 0;
	font-size: 24rpx;
	color: #999;
}
</style>
