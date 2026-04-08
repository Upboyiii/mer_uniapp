<template>
	<view class="physio-page" :data-theme="theme">
		<!-- 搜索：姓名、擅长（理疗类型） -->
		<view v-if="therapistList.length > 0" class="physio-search-wrap">
			<view class="physio-search-inner">
				<text class="iconfont icon-ic_search physio-search-ico"></text>
				<input
					class="physio-search-input"
					type="text"
					:value="therapistSearchKey"
					placeholder="搜索姓名、擅长/理疗类型"
					confirm-type="search"
					@input="onTherapistSearchInput"
				/>
				<text
					v-if="therapistSearchKey"
					class="physio-search-clear"
					@click="therapistSearchKey = ''"
				>×</text>
			</view>
		</view>

		<!-- 理疗师列表 -->
		<view v-if="displayTherapistList.length > 0" class="therapist-list">
			<view
				class="therapist-card"
				v-for="(item, index) in displayTherapistList"
				:key="'physio-t-' + index + '-' + (item.id != null ? item.id : '')"
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
				<!-- 小程序对 1rpx+渐变 常只渲染异常，用外层居中 + 内层 border 画 92% 线 -->
				<view v-if="index < displayTherapistList.length - 1" class="card-divider">
					<view class="card-divider-line"></view>
				</view>
			</view>
		</view>

		<view
			v-else-if="therapistList.length > 0 && displayTherapistList.length === 0 && !loading"
			class="search-empty"
		>
			<text>未找到相关理疗师，可换个关键词或上拉加载更多后再搜</text>
		</view>

		<!-- 空状态 -->
		<view v-if="therapistList.length === 0 && !loading">
			<emptyPage title="暂无理疗师~" mTop="25%" :imgSrc="urlDomain+'crmebimage/presets/noJilu.png'"></emptyPage>
		</view>

		<!-- 加载状态 -->
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
import { setTherapistDetailPrefill } from '@/utils/therapistDetailPrefill.js';

let app = getApp();
export default {
	components: { pageFooter, emptyPage },
	data() {
		return {
			urlDomain: this.$Cache.get("imgHost"),
			/** 与 getTheme 接口、pageFooter、clinic/therapist 一致，保证 --view-theme 随后台主题色 */
			theme: this.$Cache.get('theme') || app.globalData.theme,
			therapistList: [],
			loading: false,
			loadend: false,
			page: 1,
			limit: 10,
			therapistSearchKey: ''
		};
	},
	computed: {
		...mapGetters(['bottomNavigationIsCustom', 'isLogin']),
		/** 本地按姓名、hospitalDomain（擅长/理疗类型说明）过滤 */
		displayTherapistList() {
			const kw = (this.therapistSearchKey || '').trim().toLowerCase();
			const list = this.therapistList || [];
			if (!kw) return list;
			return list.filter((t) => {
				const name = (t.name || '').toLowerCase();
				const domain = (t.hospitalDomain || '').toLowerCase();
				const intro = (t.selfInfo || '').toLowerCase();
				return name.indexOf(kw) !== -1 || domain.indexOf(kw) !== -1 || intro.indexOf(kw) !== -1;
			});
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
		onTherapistSearchInput(e) {
			this.therapistSearchKey = (e.detail && e.detail.value) != null ? e.detail.value : '';
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
.physio-page {
	min-height: 100vh;
	background: #f5f5f5;
}

.physio-search-wrap {
	padding: 16rpx 24rpx 0;
	background: #fff;
}

.physio-search-inner {
	display: flex;
	align-items: center;
	height: 72rpx;
	padding: 0 20rpx;
	background: #f5f6f8;
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

.search-empty {
	padding: 80rpx 40rpx;
	text-align: center;
	font-size: 26rpx;
	color: #999;
	line-height: 1.5;
}

.therapist-list {
	padding: 0;
	background: #fff;
}

.therapist-card {
	display: flex;
	flex-direction: column;
	background: #fff;
	border-radius: 0;
	margin: 0;
	box-shadow: none;
	box-sizing: border-box;
}

.therapist-card-row {
	display: flex;
	align-items: center;
	padding: 28rpx 24rpx;
	min-height: 160rpx;
	box-sizing: border-box;
}

/* 每条下方一条线（最后一条无），约 92% 宽；两端渐隐更柔和 */
.card-divider {
	width: 100%;
	flex-shrink: 0;
	display: flex;
	justify-content: center;
	align-items: stretch;
	box-sizing: border-box;
	padding-top: 2rpx;
}

.card-divider-line {
	width: 92%;
	height: 2rpx;
	border-radius: 1rpx;
	/* 中间略深、两侧淡出，比实色分割线更柔 */
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

.loading-wrap {
	text-align: center;
	padding: 30rpx 0;
	font-size: 24rpx;
	color: #999;
}
</style>
