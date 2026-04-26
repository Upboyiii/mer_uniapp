<template>
	<view class="mch-therapist-page" :data-theme="theme">
		<view v-if="mchId" class="store-tip">
			<text v-if="source === 'physio_pick'">
				选择理疗师后返回预约页；点卡片「立即预订」确认选择
			</text>
			<text v-else>当前门店 · 店内理疗师（点卡片进详情，点立即预订直接下单）</text>
		</view>

		<physio-therapist-card-list
			v-if="mchId && list.length > 0"
			:list="list"
			:theme="theme"
			@detail="goTherapistDetail"
			@book="goBookTherapist"
			@store="goStoreByAddress"
		/>

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
import physioTherapistCardList from '@/components/physioTherapistCardList/physioTherapistCardList.vue';
import { setTherapistDetailPrefill } from '@/utils/therapistDetailPrefill.js';
import { consumeMchTherapistListNav } from '@/utils/mchTherapistListNav.js';
import { setPhysioBookNav, PHYSIO_BOOK_PICK_THERAPIST_KEY } from '@/utils/physioBookNav.js';

let app = getApp();

export default {
	components: { emptyPage, physioTherapistCardList },
	computed: {
		...mapGetters(['isLogin']),
		emptyImg() {
			const raw = this.$Cache.get('imgHost') || '';
			const host = String(raw).replace(/\/?$/, '/');
			return `${host}crmebimage/presets/noJilu.png`;
		}
	},
	data() {
		return {
			theme: this.$Cache.get('theme') || app.globalData.theme,
			mchId: 0,
			list: [],
			loading: false,
			loadend: false,
			page: 1,
			limit: 10,
			/** physio_pick：选理疗师后返回预约页，不重复打开 physio_book */
			source: ''
		};
	},
	onLoad(options) {
		this.source = options.source || '';
		const nav = consumeMchTherapistListNav();
		let mid = options.mchId ? parseInt(options.mchId, 10) : 0;
		if (nav && nav.mchId != null && nav.mchId !== '') {
			mid = parseInt(nav.mchId, 10) || mid;
		}
		this.mchId = mid;
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
			if (this.source === 'physio_pick') {
				try {
					uni.setStorageSync(
						PHYSIO_BOOK_PICK_THERAPIST_KEY,
						JSON.stringify({
							therapistId: tid,
							mchId,
							name: item.name || '',
							domain: item.hospitalDomain || '',
							picture: item.picture || ''
						})
					);
				} catch (e) {}
				return uni.navigateBack({ delta: 1 });
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
			const mid = Number((item && item.mchId) || this.mchId) || 0;
			if (!mid) {
				return this.$util.Tips({ title: '该理疗师暂未关联门店' });
			}
			if (Number(this.mchId) === mid) {
				return this.$util.Tips({ title: '当前已在该门店' });
			}
			try {
				uni.setStorageSync('CLINIC_HOME_MER_ID', String(mid));
				uni.setStorageSync('CLINIC_THERAPIST_REF', 'store');
				uni.setStorageSync('CLINIC_THERAPIST_BACK_MER', String(mid));
			} catch (e) {}
			uni.switchTab({ url: '/pages/clinic/home/index' });
		}
	}
};
</script>

<style lang="scss" scoped>
.mch-therapist-page {
	min-height: 100vh;
	background: #f5f6f8;
	padding-bottom: 24rpx;
}

.store-tip {
	padding: 20rpx 24rpx;
	font-size: 24rpx;
	color: #888;
	background: #fff;
	margin-bottom: 16rpx;
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
