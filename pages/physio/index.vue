<template>
	<view class="physio-page" :data-theme="theme">
		<!-- 仅 App 端：自定义导航时预留状态栏高度；H5/Web 不渲染，避免多出一截空白 -->
		<!-- #ifdef APP-PLUS -->
		<view class="physio-safe-status" :style="{ height: statusBarHeight + 'px' }"></view>
		<!-- #endif -->
		<!-- 顶部：仅搜索（不含地址、地图） -->
		<view class="physio-top">
			<view class="physio-search-inner">
				<text class="iconfont icon-ic_search physio-search-ico"></text>
				<input
					class="physio-search-input"
					type="text"
					:value="therapistSearchKey"
					placeholder="搜索技师姓名"
					confirm-type="search"
					@input="onTherapistSearchInput"
				/>
				<text
					v-if="therapistSearchKey"
					class="physio-search-clear"
					@click="therapistSearchKey = ''"
				>×</text>
			</view>

			<!-- 筛选条：样式还原，排序可本地生效；时段/全部筛选为占位 -->
			<view class="filter-bar">
				<view class="filter-item" @click="openSortSheet">
					<text class="filter-item-txt">{{ sortLabel }}</text>
					<text class="iconfont icon-ic_downarrow filter-arrow"></text>
				</view>
				<view class="filter-item filter-item-muted" @click="onFilterPlaceholder('time')">
					<text class="filter-item-txt">服务时段</text>
					<text class="iconfont icon-ic_downarrow filter-arrow"></text>
				</view>
				<view class="filter-item filter-item-muted" @click="onFilterPlaceholder('more')">
					<text class="filter-item-txt">全部筛选</text>
					<text class="iconfont icon-ic_downarrow filter-arrow"></text>
				</view>
			</view>

			<!-- 快捷标签 -->
			<scroll-view scroll-x class="tag-scroll" show-scrollbar="false">
				<view class="tag-list">
					<view
						v-for="(tag, ti) in quickTags"
						:key="tag.key"
						class="tag-chip"
						:class="{ active: activeQuickTag === tag.key, highlight: tag.highlight }"
						@click="toggleQuickTag(tag.key)"
					>
						<text>{{ tag.label }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<physio-therapist-card-list
			v-if="sortedDisplayList.length > 0"
			:list="sortedDisplayList"
			:theme="theme"
			@detail="goTherapistDetail"
			@book="goBookTherapist"
		/>

		<view
			v-else-if="therapistList.length > 0 && sortedDisplayList.length === 0 && !loading"
			class="search-empty"
		>
			<text>未找到相关理疗师，可换个关键词试试</text>
		</view>

		<view v-if="therapistList.length === 0 && !loading">
			<emptyPage title="暂无理疗师~" mTop="25%" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></emptyPage>
		</view>

		<view v-if="loading" class="loading-wrap">
			<text>加载中...</text>
		</view>

		<view v-if="bottomNavigationIsCustom" class="footerBottom"></view>
		<pageFooter></pageFooter>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import { getTherapistPageListApi } from '@/api/clinic.js';
import pageFooter from '@/components/pageFooter/index.vue';
import emptyPage from '@/components/emptyPage.vue';
import physioTherapistCardList from '@/components/physioTherapistCardList/physioTherapistCardList.vue';
import { setTherapistDetailPrefill } from '@/utils/therapistDetailPrefill.js';
import { setPhysioBookNav } from '@/utils/physioBookNav.js';

let app = getApp();
const SORT_ITEMS = [
	{ key: 'default', label: '智能排序' },
	{ key: 'score', label: '评分优先' },
	{ key: 'treat', label: '服务量优先' }
];

export default {
	components: { pageFooter, emptyPage, physioTherapistCardList },
	data() {
		return {
			urlDomain: this.$Cache.get('imgHost'),
			theme: this.$Cache.get('theme') || app.globalData.theme,
			therapistList: [],
			loading: false,
			loadend: false,
			page: 1,
			limit: 10,
			therapistSearchKey: '',
			sortMode: 'default',
			activeQuickTag: '',
			quickTags: [
				{ key: 'skill', label: '手法优先', highlight: false },
				{ key: 'new', label: '新人', highlight: false },
				{ key: 'sale', label: '特惠', highlight: true },
				{ key: 'coupon', label: '神券技师', highlight: false },
				{ key: 'free', label: '免车费', highlight: false }
			],
			/** APP 端状态栏占位高度（px），仅配合模板 #ifdef APP-PLUS） */
			statusBarHeight: 0
		};
	},
	computed: {
		...mapGetters(['bottomNavigationIsCustom', 'isLogin']),
		sortLabel() {
			const f = SORT_ITEMS.find(s => s.key === this.sortMode);
			return f ? f.label : '智能排序';
		},
		displayTherapistList() {
			const kw = (this.therapistSearchKey || '').trim().toLowerCase();
			let list = this.therapistList || [];
			if (this.activeQuickTag === 'new') {
				list = list.filter(t => {
					const n = Number(t.treatNum);
					return !isNaN(n) && n > 0 && n <= 8;
				});
			} else if (this.activeQuickTag === 'skill') {
				list = list.filter(t => {
					const d = ((t.hospitalDomain || '') + (t.specialization || '')).toLowerCase();
					return d.indexOf('手法') !== -1 || d.indexOf('推拿') !== -1 || d.indexOf('理疗') !== -1;
				});
			}
			if (!kw) return list;
			return list.filter(t => {
				const name = (t.name || '').toLowerCase();
				const domain = (t.hospitalDomain || '').toLowerCase();
				const spec = (t.specialization || '').toLowerCase();
				const intro = (t.selfInfo || '').toLowerCase();
				return (
					name.indexOf(kw) !== -1 ||
					domain.indexOf(kw) !== -1 ||
					spec.indexOf(kw) !== -1 ||
					intro.indexOf(kw) !== -1
				);
			});
		},
		sortedDisplayList() {
			const list = [...this.displayTherapistList];
			if (this.sortMode === 'score') {
				list.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
			} else if (this.sortMode === 'treat') {
				list.sort((a, b) => (Number(b.treatNum) || 0) - (Number(a.treatNum) || 0));
			}
			return list;
		}
	},
	onLoad(options) {
		// #ifdef APP-PLUS
		try {
			const sys = uni.getSystemInfoSync();
			this.statusBarHeight = (sys && sys.statusBarHeight) || 0;
		} catch (e) {
			this.statusBarHeight = 20;
		}
		// #endif
		this.getList();
	},
	onPullDownRefresh() {
		this.page = 1;
		this.loadend = false;
		this.therapistList = [];
		this.getList();
	},
	onReachBottom() {
		this.getList();
	},
	methods: {
		onTherapistSearchInput(e) {
			this.therapistSearchKey = (e.detail && e.detail.value) != null ? e.detail.value : '';
		},
		openSortSheet() {
			const labels = SORT_ITEMS.map(s => s.label);
			uni.showActionSheet({
				itemList: labels,
				success: res => {
					const idx = res.tapIndex;
					if (idx >= 0 && idx < SORT_ITEMS.length) {
						this.sortMode = SORT_ITEMS[idx].key;
					}
				}
			});
		},
		onFilterPlaceholder(which) {
			this.$util.Tips({ title: which === 'time' ? '服务时段筛选敬请期待' : '更多筛选敬请期待' });
		},
		toggleQuickTag(key) {
			this.activeQuickTag = this.activeQuickTag === key ? '' : key;
		},

		getList() {
			if (this.loadend || this.loading) return;
			this.loading = true;
			getTherapistPageListApi({ page: this.page, limit: this.limit })
				.then(res => {
					let list = (res.data && res.data.list) || [];
					if (list.length < this.limit) this.loadend = true;
					this.therapistList = this.therapistList.concat(list);
					this.page++;
					this.loading = false;
					uni.stopPullDownRefresh();
				})
				.catch(() => {
					this.loading = false;
					uni.stopPullDownRefresh();
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
				uni.setStorageSync('CLINIC_THERAPIST_REF', 'plat');
				uni.removeStorageSync('CLINIC_THERAPIST_BACK_MER');
			} catch (e) {}
			setTherapistDetailPrefill(item);
			this.$util.navigateTo(
				`/pages/clinic/therapist/detail?therapistId=${item.id}&mchId=${item.mchId}`
			);
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
			setPhysioBookNav({
				therapistId: tid,
				mchId,
				name: item.name || '',
				domain: item.hospitalDomain || '',
				picture: item.picture || ''
			});
			this.$util.navigateTo('/pages/clinic/physio_book/index');
		}
	}
};
</script>

<style lang="scss" scoped>
.physio-page {
	min-height: 100vh;
	background: #f5f6f8;
	padding-bottom: 24rpx;
}

/* App 端占位块，避免内容顶到刘海；无背景线与页面冲突 */
.physio-safe-status {
	width: 100%;
	flex-shrink: 0;
	background: #fff;
}

.physio-top {
	background: #fff;
	/* 与顶部留出间距，避免贴边「边框」感（H5/App 均生效） */
	padding-top: 20rpx;
	padding-bottom: 0;
	margin-bottom: 16rpx;
}

.physio-search-inner {
	display: flex;
	align-items: center;
	margin: 0 24rpx 0;
	height: 72rpx;
	padding: 0 20rpx;
	background: #f3f4f6;
	border-radius: 36rpx;
	box-sizing: border-box;
}

.physio-search-ico {
	font-size: 32rpx;
	color: #bbb;
	margin-right: 12rpx;
	flex-shrink: 0;
}

.physio-search-input {
	flex: 1;
	height: 72rpx;
	font-size: 28rpx;
	color: #333;
}

.physio-search-clear {
	font-size: 40rpx;
	color: #ccc;
	line-height: 1;
	padding: 0 8rpx;
	flex-shrink: 0;
}

.filter-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx 12rpx;
}

.filter-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
	flex: 1;
	justify-content: center;
}

.filter-item-muted .filter-item-txt {
	color: #999;
}

.filter-item-txt {
	font-size: 26rpx;
	color: #333;
	max-width: 200rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.filter-arrow {
	font-size: 20rpx;
	color: #bbb;
}

.tag-scroll {
	width: 100%;
	white-space: nowrap;
	padding: 8rpx 0 8rpx;
}

.tag-list {
	display: inline-flex;
	padding: 0 24rpx;
	gap: 16rpx;
}

.tag-chip {
	flex-shrink: 0;
	padding: 12rpx 22rpx;
	font-size: 24rpx;
	color: #666;
	background: #f5f6f8;
	border-radius: 8rpx;
	border: 1rpx solid transparent;
}

/* 选中态与「特惠」同款：浅粉底 + 红字 + 浅红边 */
.tag-chip.highlight,
.tag-chip.active {
	color: #e74c3c;
	background: #fff5f5;
	border-color: rgba(231, 76, 60, 0.2);
}

.search-empty {
	padding: 80rpx 40rpx;
	text-align: center;
	font-size: 26rpx;
	color: #999;
	line-height: 1.5;
}

.loading-wrap {
	text-align: center;
	padding: 30rpx 0;
	font-size: 24rpx;
	color: #999;
}
</style>
