<template>
	<view class="my-therapist-page" :data-theme="theme">
		<view class="page-tip">
			<text>最近服务过的理疗师 · 点卡片看详情，点按钮快速预约</text>
		</view>

		<physio-therapist-card-list
			v-if="therapistList.length > 0"
			:list="therapistList"
			:theme="theme"
			book-button-text="再次预约"
			@detail="goTherapistDetail"
			@book="goBook"
		/>

		<view v-else-if="!loading" class="empty-wrap">
			<emptyPage
				title="暂无关联理疗师~"
				mTop="20%"
				:imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"
			></emptyPage>
		</view>

		<view v-if="loading" class="loading-wrap">
			<text>加载中...</text>
		</view>
		<view v-if="loadend && therapistList.length > 0" class="loading-wrap">
			<text>没有更多了</text>
		</view>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import { getMyTherapistListApi } from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';
import physioTherapistCardList from '@/components/physioTherapistCardList/physioTherapistCardList.vue';
import { setTherapistDetailPrefill } from '@/utils/therapistDetailPrefill.js';
import { setPhysioBookNav } from '@/utils/physioBookNav.js';

let app = getApp();

export default {
	components: { emptyPage, physioTherapistCardList },
	computed: {
		...mapGetters(['isLogin'])
	},
	data() {
		return {
			urlDomain: this.$Cache.get('imgHost'),
			theme: this.$Cache.get('theme') || app.globalData.theme,
			therapistList: [],
			loading: false,
			loadend: false,
			page: 1,
			limit: 10
		};
	},
	onLoad() {
		this.getList();
	},
	onReachBottom() {
		this.loadMore();
	},
	onPullDownRefresh() {
		this.page = 1;
		this.loadend = false;
		this.therapistList = [];
		this.getList(() => uni.stopPullDownRefresh());
	},
	methods: {
		getList(cb) {
			if (this.loadend || this.loading) {
				cb && cb();
				return;
			}
			this.loading = true;
			getMyTherapistListApi({ page: this.page, limit: this.limit })
				.then((res) => {
					let list = (res.data && res.data.list) || [];
					if (list.length < this.limit) this.loadend = true;
					this.therapistList = this.therapistList.concat(list);
					this.page++;
					this.loading = false;
					cb && cb();
				})
				.catch(() => {
					this.loading = false;
					cb && cb();
				});
		},
		loadMore() {
			this.getList();
		},
		goTherapistDetail(item) {
			if (!item || item.id == null) {
				return this.$util.Tips({ title: '数据异常' });
			}
			if (!item.mchId) {
				return this.$util.Tips({ title: '该理疗师暂未关联门店' });
			}
			setTherapistDetailPrefill(item);
			this.$util.navigateTo(
				`/pages/clinic/therapist/detail?therapistId=${item.id}&mchId=${item.mchId}`
			);
		},
		goBook(item) {
			if (!this.isLogin) {
				return this.$util.navigateTo('/pages/users/login/index');
			}
			const tid = item.id;
			const mchId = item.mchId;
			if (!tid || !mchId) {
				return this.$util.Tips({ title: '缺少门店或理疗师信息' });
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
.my-therapist-page {
	min-height: 100vh;
	background: #f5f6f8;
	padding-bottom: 32rpx;
	box-sizing: border-box;
}

.page-tip {
	padding: 20rpx 24rpx;
	font-size: 24rpx;
	color: #888;
	background: #fff;
	margin-bottom: 16rpx;
	line-height: 1.5;
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
