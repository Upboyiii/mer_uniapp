<template>
	<view v-if="visible" class="crp-mask" @click.stop="onMaskClick">
		<view class="crp-panel" @click.stop>
			<view class="crp-title">填写取消原因</view>
			<textarea
				class="crp-textarea"
				v-model="draft"
				placeholder="请输入取消原因"
				maxlength="200"
				:fixed="true"
				:auto-height="true"
			/>
			<view class="crp-actions">
				<button class="crp-btn plain" @click="close">返回</button>
				<button class="crp-btn primary bg-color" @click="onConfirm">确定取消</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'PhysioCancelReasonPopup',
	props: {
		visible: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			draft: ''
		};
	},
	watch: {
		visible(v) {
			if (v) this.draft = '';
		}
	},
	methods: {
		close() {
			this.$emit('update:visible', false);
			this.$emit('close');
		},
		onMaskClick() {
			this.close();
		},
		onConfirm() {
			const t = (this.draft || '').trim();
			if (!t) {
				return uni.showToast({ title: '请填写取消原因', icon: 'none' });
			}
			this.$emit('confirm', t);
		}
	}
};
</script>

<style lang="scss" scoped>
.crp-mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 500;
	background: rgba(0, 0, 0, 0.45);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 48rpx;
	box-sizing: border-box;
}

.crp-panel {
	width: 100%;
	max-width: 600rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 32rpx 28rpx 28rpx;
	box-sizing: border-box;
}

.crp-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 24rpx;
	text-align: center;
}

.crp-textarea {
	width: 100%;
	min-height: 160rpx;
	padding: 20rpx;
	box-sizing: border-box;
	border: 1rpx solid #e5e5e5;
	border-radius: 12rpx;
	font-size: 28rpx;
	line-height: 1.5;
	color: #333;
	margin-bottom: 28rpx;
}

.crp-actions {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.crp-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	margin: 0;
	border: none;
}

.crp-btn.plain {
	background: #f5f5f5;
	color: #666;
}

.crp-btn.primary {
	color: #fff;
}
</style>
