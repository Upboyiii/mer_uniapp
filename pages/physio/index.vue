<template>
	<view class="physio-page" :data-theme="theme">
		<!-- 理疗师列表 -->
		<view v-if="therapistList.length > 0" class="therapist-list">
			<view
				class="therapist-card"
				v-for="(item, index) in therapistList"
				:key="item.id || index"
				@click="goTherapistDetail(item)"
			>
				<view class="card-avatar">
					<image
						class="avatar"
						:src="item.picture || '/static/images/f.png'"
						mode="aspectFill"
					></image>
				</view>
				<view class="card-info">
					<view class="info-name">{{ item.name }}</view>
					<view class="info-domain line2" v-if="item.hospitalDomain">
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
						<view class="stat" v-if="item.responseTime">
							<text class="stat-val">{{ item.responseTime }}min</text>
							<text class="stat-label">响应</text>
						</view>
					</view>
				</view>
				<view class="card-action">
					<view class="book-btn" @click.stop="goBookTherapist(item)">预约</view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-if="therapistList.length === 0 && !loading">
			<emptyPage title="暂无理疗师~" mTop="25%" :imgSrc="urlDomain+'crmebimage/presets/noJilu.png'"></emptyPage>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-wrap">
			<text>加载中...</text>
		</view>
		<view v-if="loadend && therapistList.length > 0" class="loading-wrap">
			<text>没有更多了</text>
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

export default {
	components: { pageFooter, emptyPage },
	data() {
		return {
			urlDomain: this.$Cache.get("imgHost"),
			therapistList: [],
			loading: false,
			loadend: false,
			page: 1,
			limit: 10
		};
	},
	computed: {
		...mapGetters(['viewColor', 'keyColor', 'bottomNavigationIsCustom', 'isLogin']),
		theme() {
			return this.viewColor || '';
		}
	},
	onLoad(options) {
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
			this.$util.navigateTo(`/pages/clinic/therapist/detail?id=${item.id}&merId=${item.mchId || 0}`);
		},

		goBookTherapist(item) {
			if (!this.isLogin) {
				return this.$util.navigateTo('/pages/users/login/index');
			}
			this.$util.navigateTo(`/pages/clinic/therapist/detail?id=${item.id}&merId=${item.mchId || 0}`);
		}
	}
};
</script>

<style lang="scss" scoped>
.physio-page {
	min-height: 100vh;
	background: #f5f5f5;
}

.therapist-list {
	padding: 16rpx 24rpx;
}

.therapist-card {
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 16rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
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
	margin-bottom: 12rpx;
	line-height: 1.5;
}

.info-stats {
	display: flex;
	gap: 24rpx;
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

.loading-wrap {
	text-align: center;
	padding: 30rpx 0;
	font-size: 24rpx;
	color: #999;
}
</style>
