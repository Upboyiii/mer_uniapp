<template>
	<view :data-theme="theme">
		<view class="addForm borderPad">
			<view class="list borRadius14">
				<view class="item acea-row" style="border: none">
					<view class="label">姓名</view>
					<input
						class="input"
						v-model="form.name"
						type="text"
						placeholder="请输入姓名"
						placeholder-style="color:#ccc;"
						maxlength="32"
					/>
				</view>
				<picker mode="selector" :range="typeLabels" :value="typeIndex" @change="onTypeChange">
					<view class="item acea-row row-between-wrapper">
						<view class="label">证件类型</view>
						<view class="picker-val">{{ typeLabels[typeIndex] }}</view>
						<text class="iconfont icon-ic_rightarrow chev"></text>
					</view>
				</picker>
				<view class="item acea-row">
					<view class="label">证件号码</view>
					<input
						class="input"
						v-model="form.idNo"
						type="text"
						placeholder="请输入证件号码"
						placeholder-style="color:#ccc;"
						maxlength="32"
					/>
				</view>
				<picker mode="selector" :range="sexLabels" :value="sexIndex" @change="onSexChange">
					<view class="item acea-row row-between-wrapper">
						<view class="label">性别</view>
						<view class="picker-val">{{ sexLabels[sexIndex] }}</view>
						<text class="iconfont icon-ic_rightarrow chev"></text>
					</view>
				</picker>
				<view class="item acea-row">
					<view class="label">年龄</view>
					<input
						class="input"
						v-model="ageStr"
						type="number"
						placeholder="请输入年龄"
						placeholder-style="color:#ccc;"
						maxlength="3"
					/>
				</view>
				<picker mode="selector" :range="relationLabels" :value="relationIndex" @change="onRelationChange">
					<view class="item acea-row row-between-wrapper">
						<view class="label">与就诊人关系</view>
						<view class="picker-val">{{ relationLabels[relationIndex] }}</view>
						<text class="iconfont icon-ic_rightarrow chev"></text>
					</view>
				</picker>
				<!-- 与 pages/address/user_address 一致：areaWindow 逐级选省市区（接口仍传 province/city/district 名称） -->
				<view class="item acea-row row-between-wrapper">
					<view class="label">所在地区</view>
					<view class="region-row" @click="openRegionPicker">
						<text v-if="!regionDisplayText" class="region-placeholder">选填，请选择省市区</text>
						<text v-else class="region-text">{{ regionDisplayText }}</text>
						<text class="iconfont icon-ic_rightarrow chev"></text>
					</view>
				</view>
			</view>
			<button class="keepBnt" :disabled="submitting" @click="submit">{{ submitting ? '提交中…' : '保存' }}</button>
		</view>
		<areaWindow
			:display="regionPickerVisible"
			:address="addressInfo"
			@submit="onRegionSubmit"
			@changeClose="onRegionPickerClose"
		/>
	</view>
</template>

<script>
import {
	getPatientIdentityInfoApi,
	patientIdentitySaveApi,
	patientIdentityUpdateApi
} from '@/api/clinic.js';
import { toLogin } from '@/libs/login.js';
import { mapGetters } from 'vuex';
import areaWindow from '@/pages/address/components/areaWindow/index.vue';

let app = getApp();

export default {
	components: {
		areaWindow
	},
	data() {
		return {
			theme: app.globalData.theme,
			editId: null,
			submitting: false,
			regionPickerVisible: false,
			/** 与收货地址一致：逐级选择后的节点列表（可能含街道，提交只取前三层为省市区名称） */
			addressInfo: [],
			ageStr: '',
			typeLabels: [
				'居民身份证',
				'港澳居民居住证',
				'台湾居民居住证',
				'港澳居民来往内地通行证',
				'台湾居民来往内地通行证',
				'护照'
			],
			typeIndex: 0,
			sexLabels: ['男', '女'],
			sexIndex: 0,
			relationLabels: ['本人', '父母', '爱人', '子女', '亲戚', '朋友', '其他'],
			relationIndex: 0,
			form: {
				name: '',
				idNo: '',
				type: 1,
				sex: 1,
				age: null,
				relationType: 1,
				province: '',
				city: '',
				district: ''
			}
		};
	},
	computed: {
		...mapGetters(['isLogin']),
		regionDisplayText() {
			if (this.addressInfo && this.addressInfo.length >= 3) {
				return this.addressInfo
					.slice(0, 3)
					.map((v) => v.regionName)
					.filter(Boolean)
					.join('/');
			}
			const parts = [this.form.province, this.form.city, this.form.district].filter(
				(s) => s && String(s).trim()
			);
			return parts.join('/');
		}
	},
	onLoad(options) {
		if (!this.isLogin) {
			toLogin();
			return;
		}
		const id = options.id ? parseInt(options.id, 10) : 0;
		if (id) {
			this.editId = id;
			uni.setNavigationBarTitle({ title: '编辑就诊人' });
			this.loadDetail(id);
		} else {
			uni.setNavigationBarTitle({ title: '添加就诊人' });
		}
	},
	methods: {
		onTypeChange(e) {
			const i = Number(e.detail.value);
			this.typeIndex = i;
			this.form.type = i + 1;
		},
		onSexChange(e) {
			const i = Number(e.detail.value);
			this.sexIndex = i;
			this.form.sex = i + 1;
		},
		onRelationChange(e) {
			const i = Number(e.detail.value);
			this.relationIndex = i;
			this.form.relationType = i + 1;
		},
		openRegionPicker() {
			this.regionPickerVisible = true;
		},
		onRegionPickerClose() {
			this.regionPickerVisible = false;
		},
		onRegionSubmit(address) {
			this.addressInfo = Array.isArray(address) ? address : [];
			const a = this.addressInfo;
			this.form.province = (a[0] && a[0].regionName) || '';
			this.form.city = (a[1] && a[1].regionName) || '';
			this.form.district = (a[2] && a[2].regionName) || '';
		},
		loadDetail(id) {
			uni.showLoading({ title: '加载中…' });
			getPatientIdentityInfoApi(id)
				.then((res) => {
					const d = (res && res.data) || {};
					this.form.name = d.name || '';
					this.form.idNo = d.idNo || '';
					this.form.type = d.type != null ? d.type : 1;
					this.form.sex = d.sex === 2 ? 2 : 1;
					this.form.age = d.age != null ? d.age : null;
					this.form.relationType = d.relationType != null ? d.relationType : 1;
					this.form.province = d.province || '';
					this.form.city = d.city || '';
					this.form.district = d.district || '';
					/** 详情仅有名称无 regionId，无法还原 areaWindow 选中态；展示用名称拼接，重选后写入 addressInfo */
					this.addressInfo = [];
					this.typeIndex = Math.max(0, Math.min(5, this.form.type - 1));
					this.sexIndex = this.form.sex === 2 ? 1 : 0;
					this.relationIndex = Math.max(0, Math.min(6, this.form.relationType - 1));
					this.ageStr = this.form.age != null ? String(this.form.age) : '';
				})
				.catch(() => {})
				.finally(() => {
					uni.hideLoading();
				});
		},
		validate() {
			const name = (this.form.name || '').trim();
			if (!name) {
				this.$util.Tips({ title: '请输入姓名' });
				return false;
			}
			const idNo = (this.form.idNo || '').trim();
			if (!idNo) {
				this.$util.Tips({ title: '请输入证件号码' });
				return false;
			}
			const age = parseInt(this.ageStr, 10);
			if (!Number.isFinite(age) || age < 0 || age > 150) {
				this.$util.Tips({ title: '请输入正确年龄' });
				return false;
			}
			this.form.age = age;
			return true;
		},
		submit() {
			if (this.submitting) return;
			if (!this.validate()) return;
			const body = {
				name: (this.form.name || '').trim(),
				idNo: (this.form.idNo || '').trim(),
				type: this.form.type,
				sex: this.form.sex,
				age: this.form.age,
				relationType: this.form.relationType,
				province: (this.form.province || '').trim(),
				city: (this.form.city || '').trim(),
				district: (this.form.district || '').trim()
			};
			this.submitting = true;
			uni.showLoading({ title: '提交中…' });
			const req = this.editId
				? patientIdentityUpdateApi(this.editId, body)
				: patientIdentitySaveApi(body);
			req
				.then(() => {
					this.$util.Tips({ title: '保存成功', icon: 'success' });
					setTimeout(() => {
						uni.navigateBack({ delta: 1 });
					}, 400);
				})
				.catch((err) => {
					this.$util.Tips({ title: err || '保存失败' });
				})
				.finally(() => {
					this.submitting = false;
					uni.hideLoading();
				});
		}
	}
};
</script>

<style scoped lang="scss">
.addForm {
	padding-top: 20rpx;
	padding-bottom: 48rpx;
}

.addForm .list {
	background-color: #fff;
	padding: 0 30rpx;
}

.addForm .list .item {
	border-top: 1rpx solid #eee;
	padding: 24rpx 0;
	align-items: center;
}

.addForm .list .item:first-of-type {
	border-top: none;
}

.addForm .label {
	font-size: 30rpx;
	color: #333;
	width: 200rpx;
	flex-shrink: 0;
}

.addForm .input {
	flex: 1;
	margin-left: 20rpx;
	font-size: 30rpx;
}

.picker-val {
	flex: 1;
	margin-left: 20rpx;
	font-size: 30rpx;
	text-align: right;
	color: #333;
}

.chev {
	font-size: 24rpx;
	color: #ccc;
	margin-left: 12rpx;
}

.region-row {
	flex: 1;
	margin-left: 20rpx;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	min-height: 44rpx;
}

.region-placeholder {
	font-size: 30rpx;
	color: #cdcdcd;
	flex: 1;
	text-align: right;
}

.region-text {
	font-size: 30rpx;
	color: #333;
	flex: 1;
	text-align: right;
}

.keepBnt {
	width: 690rpx;
	height: 88rpx;
	border-radius: 50rpx;
	text-align: center;
	line-height: 88rpx;
	margin: 80rpx auto 24rpx auto;
	font-size: 28rpx;
	color: #fff;
	@include linear-gradient(theme);
	border: none;
}

.keepBnt[disabled] {
	opacity: 0.7;
}
</style>
