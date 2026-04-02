<template>
	<view class="patient-page" :data-theme="theme">
		<view class="patient-management">
			<view v-for="(item, index) in list" :key="item.id" class="item borRadius14">
				<view class="body" @click="goEdit(item.id)">
					<view class="row-title">
						<text class="name">{{ item.name || '—' }}</text>
						<text v-if="item.relationType === 1" class="tag">本人</text>
					</view>
					<view class="row-sub">
						<text>{{ sexLabel(item.sex) }}</text>
						<text v-if="item.age != null" class="gap">{{ item.age }}岁</text>
						<text class="gap">{{ relationLabel(item.relationType) }}</text>
					</view>
					<view class="row-id">证件号：{{ maskIdNo(item.idNo) }}</view>
				</view>
				<view class="operation acea-row row-between-wrapper">
					<view></view>
					<view class="acea-row row-middle">
						<view @click.stop="goEdit(item.id)">
							<text class="iconfont icon-ic_edit"></text>编辑
						</view>
						<view @click.stop="delOne(index)">
							<text class="iconfont icon-ic_delete"></text>删除
						</view>
					</view>
				</view>
			</view>
			<view class="loadingicon acea-row row-center-wrapper">
				<text class="loading iconfont icon-jiazai" :hidden="!loading"></text>
			</view>
			<emptyPage
				v-if="list.length === 0 && !loading"
				title="暂无就诊人，请添加~"
				:imgSrc="urlDomain + 'crmebimage/presets/noAddress.png'"
			></emptyPage>
			<view class="list-pad-bottom"></view>
		</view>
		<view class="footer acea-row row-between-wrapper borderPad">
			<view class="add-btn" @click="goAdd">
				<text class="iconfont icon-ic_add"></text>添加就诊人
			</view>
		</view>
	</view>
</template>

<script>
import { getPatientIdentityListApi, patientIdentityDeleteApi } from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';
import { toLogin } from '@/libs/login.js';
import { mapGetters } from 'vuex';

let app = getApp();

export default {
	components: { emptyPage },
	data() {
		return {
			theme: app.globalData.theme,
			urlDomain: this.$Cache.get('imgHost') || '',
			list: [],
			loading: false,
			page: 1,
			limit: 100
		};
	},
	computed: mapGetters(['isLogin']),
	watch: {
		isLogin: {
			handler(n) {
				if (n) this.loadList(true);
			},
			deep: true
		}
	},
	onLoad() {
		if (this.isLogin) this.loadList(true);
		else toLogin();
	},
	onShow() {
		if (this.isLogin) this.loadList(true);
	},
	methods: {
		parseListRes(res) {
			const inner = res && res.data;
			if (!inner) return [];
			let rows = inner.list;
			if (!rows && Array.isArray(inner)) rows = inner;
			return Array.isArray(rows) ? rows : [];
		},
		loadList() {
			if (this.loading) return;
			this.loading = true;
			getPatientIdentityListApi({ page: this.page, limit: this.limit })
				.then((res) => {
					this.list = this.parseListRes(res);
				})
				.catch(() => {})
				.finally(() => {
					this.loading = false;
				});
		},
		sexLabel(sex) {
			if (sex === 1) return '男';
			if (sex === 2) return '女';
			return '—';
		},
		relationLabel(t) {
			const m = {
				1: '本人',
				2: '父母',
				3: '爱人',
				4: '子女',
				5: '亲戚',
				6: '朋友',
				7: '其他'
			};
			return m[t] || '—';
		},
		maskIdNo(no) {
			if (!no || !String(no).trim()) return '—';
			const s = String(no).trim();
			if (s.length <= 8) return s;
			return s.slice(0, 4) + '****' + s.slice(-4);
		},
		goAdd() {
			uni.navigateTo({ url: '/pages/users/patient_identity/form' });
		},
		goEdit(id) {
			uni.navigateTo({ url: '/pages/users/patient_identity/form?id=' + id });
		},
		delOne(index) {
			const item = this.list[index];
			if (!item) return;
			uni.showModal({
				content: '确定删除该就诊人？',
				cancelText: '取消',
				confirmText: '确定',
				cancelColor: '#999',
				success: (res) => {
					if (!res.confirm) return;
					patientIdentityDeleteApi(item.id)
						.then(() => {
							this.list.splice(index, 1);
							this.$util.Tips({ title: '删除成功', icon: 'success' });
						})
						.catch((err) => {
							this.$util.Tips({ title: err || '删除失败' });
						});
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.patient-page {
	min-height: 100vh;
	background: #f5f6f8;
	box-sizing: border-box;
}

.patient-management {
	padding: 20rpx 24rpx 140rpx;
}

.patient-management .item {
	background-color: #fff;
	padding: 0 24rpx;
	margin-bottom: 20rpx;
}

.patient-management .body {
	padding: 32rpx 0 24rpx;
	border-bottom: 1rpx solid #eee;
	font-size: 28rpx;
	color: #282828;
}

.row-title {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;
}

.row-title .name {
	font-size: 30rpx;
	font-weight: 600;
}

.row-title .tag {
	margin-left: 16rpx;
	font-size: 22rpx;
	padding: 2rpx 12rpx;
	border-radius: 8rpx;
	color: #fff;
	@include main_bg_color(theme);
}

.row-sub {
	font-size: 26rpx;
	color: #666;
}

.row-sub .gap {
	margin-left: 24rpx;
}

.row-id {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #999;
}

.patient-management .operation {
	height: 83rpx;
	font-size: 28rpx;
	color: #282828;
}

.patient-management .operation .iconfont {
	color: #2c2c2c;
	font-size: 35rpx;
	vertical-align: -2rpx;
	margin-right: 10rpx;
}

.patient-management .operation .icon-ic_delete {
	margin-left: 35rpx;
	font-size: 38rpx;
}

.list-pad-bottom {
	height: 40rpx;
}

.footer {
	position: fixed;
	left: 0;
	width: 100%;
	bottom: 0;
	height: calc(106rpx + constant(safe-area-inset-bottom));
	height: calc(106rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
	background: #fff;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
}

.footer .add-btn {
	width: 100%;
	height: 88rpx;
	border-radius: 44rpx;
	text-align: center;
	line-height: 88rpx;
	font-size: 28rpx;
	color: #fff;
	@include linear-gradient(theme);
}

.footer .add-btn .iconfont {
	font-size: 32rpx;
	margin-right: 8rpx;
	vertical-align: -2rpx;
}
</style>
