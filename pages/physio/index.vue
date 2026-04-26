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

			<!-- 项目分类：横滑；选中为左直右斜梯形（不用 skew，左侧始终竖直对齐）；右侧更多 -->
			<view class="project-cat-row">
				<scroll-view
					scroll-x
					class="project-cat-scroll"
					:show-scrollbar="false"
					:enable-flex="true"
				>
					<view class="project-cat-inner">
						<view
							v-for="(cat, ci) in projectCategories"
							:key="cat.key"
							class="project-cat-item"
							:class="{
								active: activeProjectKey === cat.key,
								'project-cat-item--lead': ci === 0
							}"
							hover-class="none"
							@click="selectProjectCat(cat.key)"
						>
							<view class="project-cat-pill">
								<text class="project-cat-text">{{ cat.label }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="project-cat-more" hover-class="none" @click="openProjectCatMore">
					<view class="project-cat-more-inner">
						<text class="iconfont icon-ic_sort2 project-cat-more-ico"></text>
					</view>
				</view>
			</view>

			<!-- 筛选条：样式还原，排序可本地生效；时段/全部筛选为占位 -->
			<view class="filter-bar">
				<view class="filter-item" hover-class="none" @click="openSortSheet">
					<text class="filter-item-txt">{{ sortLabel }}</text>
					<text class="iconfont icon-ic_downarrow filter-arrow"></text>
				</view>
				<view class="filter-item filter-item-muted" hover-class="none" @click="onFilterPlaceholder('time')">
					<text class="filter-item-txt">服务时段</text>
					<text class="iconfont icon-ic_downarrow filter-arrow"></text>
				</view>
				<view class="filter-item filter-item-muted" hover-class="none" @click="onFilterPlaceholder('more')">
					<text class="filter-item-txt">全部筛选</text>
					<text class="iconfont icon-ic_downarrow filter-arrow"></text>
				</view>
			</view>
			<view class="region-bar">
				<view class="region-item" hover-class="none" @click="openCitySheet">
					<text class="region-item-txt">{{ cityFilterLabel }}</text>
					<text class="iconfont icon-ic_downarrow filter-arrow"></text>
				</view>
				<view class="region-item" hover-class="none" @click="openDistrictSheet">
					<text class="region-item-txt">{{ districtFilterLabel }}</text>
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
						hover-class="none"
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
			@store="goStoreByAddress"
		/>

		<view
			v-else-if="therapistList.length > 0 && sortedDisplayList.length === 0 && !loading"
			class="search-empty"
		>
			<text>{{ listEmptyHint }}</text>
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
			/** 项目分类（本地筛选：擅长/简介等字段关键词） */
			activeProjectKey: 'all',
			/** 城市/区域切换：空字符串代表全部 */
			selectedCity: '',
			selectedDistrict: '',
			projectCategories: [
				{ key: 'all', label: '精选' },
				{ key: 'tcm', label: '中医推拿' },
				{ key: 'foot', label: '足道SPA' },
				{ key: 'beauty', label: '美容美肤' },
				{ key: 'pediatric', label: '小儿推拿' },
				{ key: 'physio', label: '康复理疗' },
				{ key: 'massage', label: '精油开背' }
			],
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
		listEmptyHint() {
			const kw = (this.therapistSearchKey || '').trim();
			if (kw) return '未找到相关理疗师，可换个关键词试试';
			if (this.selectedCity || this.selectedDistrict) {
				return '当前城市/区域暂无理疗师，可切换其他区域试试';
			}
			if (this.activeProjectKey && this.activeProjectKey !== 'all') {
				return '该分类下暂无匹配技师，可试试「精选」或其它分类';
			}
			if (this.activeQuickTag) return '当前条件下暂无理疗师，可调整筛选试试';
			return '未找到相关理疗师，可换个关键词试试';
		},
		cityFilterLabel() {
			return this.selectedCity || '全部城市';
		},
		districtFilterLabel() {
			return this.selectedDistrict || '全部区域';
		},
		cityOptions() {
			const set = new Set();
			(this.therapistList || []).forEach(t => {
				const city = (t && t.city ? String(t.city) : '').trim();
				if (city) set.add(city);
			});
			return Array.from(set);
		},
		districtOptions() {
			const set = new Set();
			(this.therapistList || []).forEach(t => {
				const city = (t && t.city ? String(t.city) : '').trim();
				const district = (t && t.district ? String(t.district) : '').trim();
				if (!district) return;
				if (this.selectedCity && city !== this.selectedCity) return;
				set.add(district);
			});
			return Array.from(set);
		},
		displayTherapistList() {
			const kw = (this.therapistSearchKey || '').trim().toLowerCase();
			let list = this.therapistList || [];
			list = this.filterByRegion(list);
			list = this.filterByProjectCategory(list);
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
		openCitySheet() {
			const cityOpts = this.cityOptions || [];
			if (!cityOpts.length) {
				return this.$util.Tips({ title: '暂无可切换城市' });
			}
			const itemList = ['全部城市'].concat(cityOpts);
			uni.showActionSheet({
				itemList,
				success: res => {
					const idx = res.tapIndex;
					if (idx === 0) {
						this.selectedCity = '';
						this.selectedDistrict = '';
						return;
					}
					this.selectedCity = cityOpts[idx - 1] || '';
					if (this.selectedDistrict) {
						const districtOk = this.districtOptions.includes(this.selectedDistrict);
						if (!districtOk) this.selectedDistrict = '';
					}
				}
			});
		},
		openDistrictSheet() {
			const districtOpts = this.districtOptions || [];
			if (!districtOpts.length) {
				return this.$util.Tips({ title: '当前城市暂无可选区域' });
			}
			const itemList = ['全部区域'].concat(districtOpts);
			uni.showActionSheet({
				itemList,
				success: res => {
					const idx = res.tapIndex;
					this.selectedDistrict = idx === 0 ? '' : districtOpts[idx - 1] || '';
				}
			});
		},
		toggleQuickTag(key) {
			this.activeQuickTag = this.activeQuickTag === key ? '' : key;
		},

		selectProjectCat(key) {
			this.activeProjectKey = key;
		},

		openProjectCatMore() {
			const cats = this.projectCategories || [];
			const labels = cats.map(c => c.label);
			uni.showActionSheet({
				itemList: labels,
				success: res => {
					const idx = res.tapIndex;
					if (idx >= 0 && idx < cats.length) {
						this.activeProjectKey = cats[idx].key;
					}
				}
			});
		},

		/** 按项目分类在擅长/简介中做关键词匹配（无接口字段时的折中） */
		filterByProjectCategory(list) {
			const key = this.activeProjectKey;
			if (!key || key === 'all') return list;
			const pick = t => {
				const text = (
					(t.hospitalDomain || '') +
					(t.specialization || '') +
					(t.selfInfo || '')
				).toLowerCase();
				switch (key) {
					case 'tcm':
						return (
							text.includes('推拿') ||
							text.includes('中医') ||
							text.includes('针灸') ||
							text.includes('艾灸') ||
							text.includes('拔罐')
						);
					case 'foot':
						return text.includes('足') || text.includes('足道') || text.includes('spa');
					case 'beauty':
						return text.includes('美容') || text.includes('美肤') || text.includes('皮肤');
					case 'pediatric':
						return text.includes('小儿') || text.includes('儿童') || text.includes('儿科');
					case 'physio':
						return (
							text.includes('理疗') ||
							text.includes('康复') ||
							text.includes('运动') ||
							text.includes('产后')
						);
					case 'massage':
						return (
							text.includes('精油') ||
							text.includes('开背') ||
							text.includes('经络') ||
							text.includes('舒压')
						);
					default:
						return true;
				}
			};
			return (list || []).filter(pick);
		},
		filterByRegion(list) {
			if (!this.selectedCity && !this.selectedDistrict) return list;
			return (list || []).filter(t => {
				const city = (t && t.city ? String(t.city) : '').trim();
				const district = (t && t.district ? String(t.district) : '').trim();
				if (this.selectedCity && city !== this.selectedCity) return false;
				if (this.selectedDistrict && district !== this.selectedDistrict) return false;
				return true;
			});
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
		},
		goStoreByAddress(item) {
			const mchId = Number(item && item.mchId) || 0;
			if (!mchId) {
				return this.$util.Tips({ title: '该理疗师暂未关联门店' });
			}
			try {
				uni.setStorageSync('CLINIC_HOME_MER_ID', String(mchId));
				uni.setStorageSync('CLINIC_THERAPIST_REF', 'store');
				uni.setStorageSync('CLINIC_THERAPIST_BACK_MER', String(mchId));
			} catch (e) {}
			uni.switchTab({ url: '/pages/clinic/home/index' });
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

/* 项目分类：禁用系统点击高亮；避免 transform 过渡产生「抖动感」 */
.project-cat-row {
	display: flex;
	flex-direction: row;
	align-items: stretch;
	background: #fff;
	border-bottom: 1rpx solid #f0f0f0;
	overflow: hidden;
	-webkit-tap-highlight-color: transparent;
}

.project-cat-row .project-cat-item,
.project-cat-row .project-cat-more {
	-webkit-tap-highlight-color: transparent;
}

.project-cat-scroll {
	flex: 1;
	min-width: 0;
	height: 92rpx;
}

.project-cat-inner {
	display: inline-flex;
	flex-direction: row;
	align-items: center;
	min-height: 92rpx;
	padding: 0 10rpx 0 0;
	box-sizing: border-box;
	/* 与屏左对齐，首项左缘即屏幕左缘 */
	padding-left: 0;
}

.project-cat-item {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	margin-right: 7rpx;
	box-sizing: border-box;
}

.project-cat-pill {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 64rpx;
	padding: 0 24rpx;
	box-sizing: border-box;
	border-radius: 0;
	/* 不对 transform 做过渡，切换选中时斜切瞬间到位，避免「震动」感 */
	transition: background-color 0.22s ease, box-shadow 0.22s ease;
}

/* 首项「精选」：固定最小宽度，文案在块内水平居中（不靠左） */
.project-cat-item--lead .project-cat-pill {
	min-width: 140rpx;
	padding-left: 26rpx;
	padding-right: 26rpx;
}

.project-cat-text {
	font-size: 27rpx;
	color: #666;
	line-height: 1.2;
	white-space: nowrap;
	text-align: center;
}

/*
 * 选中态：左侧竖直、与列表左缘对齐，仅右侧斜边（梯形）。
 * 不用 skew，避免整块旋转导致左边也「斜」出去。
 */
.project-cat-item.active .project-cat-pill {
	background: var(--view-theme, #3a9d8f);
	transform: none;
	clip-path: polygon(0 0, 100% 0, 89% 100%, 0 100%);
	border-radius: 0;
	box-shadow: 0 4rpx 14rpx rgba(58, 157, 143, 0.2);
	padding-left: 30rpx;
	padding-right: 38rpx;
}

.project-cat-item--lead.active .project-cat-pill {
	min-width: 152rpx;
	padding-left: 32rpx;
	padding-right: 38rpx;
}

.project-cat-item.active .project-cat-text {
	transform: none;
	color: #fff;
	font-weight: 600;
	letter-spacing: 0;
}

/* 右侧「更多」：与分类条同高 */
.project-cat-more {
	flex-shrink: 0;
	width: 78rpx;
	min-height: 92rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-left: 1rpx solid #f0f0f0;
	background: #fafafa;
}

.project-cat-more-inner {
	width: 48rpx;
	height: 48rpx;
	border-radius: 13rpx;
	background: #fff;
	border: 1rpx solid #eaeaea;
	box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: center;
	justify-content: center;
}

.project-cat-more-ico {
	font-size: 24rpx;
	color: #999;
	line-height: 1;
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

.region-bar {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 0 24rpx 10rpx;
}

.region-item {
	flex: 1;
	height: 64rpx;
	border-radius: 32rpx;
	background: #f5f6f8;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
}

.region-item-txt {
	max-width: 210rpx;
	font-size: 24rpx;
	color: #555;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
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
