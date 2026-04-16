<template>
	<view :data-theme="theme">
		<view class="evaluate-con borderPad">
			<view class="score borRadius14">
				<!-- 与 goods_comment_con 一致：多行星级 + 文案区 + 图 + 提交 -->
				<view
					class="item acea-row row-middle"
					v-for="(row, indexw) in scoreList"
					:key="row.key + '-' + indexw"
				>
					<view class="score-name">{{ row.name }}</view>
					<view class="starsList">
						<text
							@click="onStarTap(indexn, indexw)"
							v-for="(itemn, indexn) in row.stars"
							:key="indexn"
							class="iconfont"
							:class="row.index >= indexn ? 'icon-ic_star1' : 'icon-ic_star'"
						></text>
					</view>
					<text class="evaluate">{{ row.index === -1 ? '' : row.index + 1 + '分' }}</text>
				</view>

				<view class="textarea">
					<textarea
						v-model="comment"
						placeholder="服务体验如何？分享给其他用户参考吧~"
						placeholder-class="placeholder"
					/>
					<view class="list acea-row row-middle">
						<view class="pictrue" v-for="(pic, index) in picsPath" :key="index">
							<image :src="pic" mode="aspectFill"></image>
							<CloseIcon @handle-close="delPic(index)"></CloseIcon>
						</view>
						<view
							class="pictrue acea-row row-center-wrapper row-column"
							@click="uploadPic"
							v-if="picsPath.length < 8"
						>
							<text class="f-s-50 text--w111-999 iconfont icon-ic_camera"></text>
							<view class="text--w111-999 line-heightOne mt-8rpx">上传图片</view>
						</view>
					</view>
				</view>

				<view class="anon-row acea-row row-middle" @click="anonymous = !anonymous">
					<text class="anon-box">{{ anonymous ? '✓' : '' }}</text>
					<text>匿名评价</text>
				</view>

				<button
					class="evaluateBnt bg-color"
					:disabled="submitting"
					hover-class="evaluateBnt-hover"
					@click="submit"
				>
					{{ submitting ? '提交中…' : '立即评价' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { Debounce } from '@/utils/validate.js';
import {
	physiotherapyAppointmentReplySaveApi,
	tcmAppointmentReplySaveApi
} from '@/api/clinic.js';

let app = getApp();

function makeStarRows() {
	return Array.from({ length: 5 }, () => '');
}

export default {
	data() {
		return {
			theme: app.globalData.theme,
			category: 'physio',
			appointmentId: 0,
			/** 每行 index 0-4 表示 1-5 星，默认 4=5星 */
			scoreList: [],
			comment: '',
			anonymous: false,
			pics: [],
			picsPath: [],
			submitting: false
		};
	},
	onLoad(options) {
		this.category = options.category === 'tcm' ? 'tcm' : 'physio';
		const raw = options.id != null ? options.id : options.appointmentId;
		const id = raw != null ? parseInt(raw, 10) : 0;
		this.appointmentId = isNaN(id) ? 0 : id;
		this.initScoreList();
		uni.setNavigationBarTitle({
			title: this.category === 'tcm' ? '中医预约评价' : '理疗预约评价'
		});
		if (!this.appointmentId) {
			this.$util.Tips({ title: '缺少预约编号' });
			setTimeout(() => uni.navigateBack(), 1500);
		}
	},
	methods: {
		initScoreList() {
			const s = makeStarRows();
			if (this.category === 'tcm') {
				this.scoreList = [
					{ name: '总体评分', key: 'star', index: 4, stars: [...s] },
					{ name: '疗效', key: 'effectStar', index: 4, stars: [...s] },
					{ name: '专业水平', key: 'professionalStar', index: 4, stars: [...s] },
					{ name: '服务态度', key: 'serviceStar', index: 4, stars: [...s] },
					{ name: '环境', key: 'environmentStar', index: 4, stars: [...s] }
				];
			} else {
				this.scoreList = [
					{ name: '总体评分', key: 'star', index: 4, stars: [...s] },
					{ name: '专业水平', key: 'professionalStar', index: 4, stars: [...s] },
					{ name: '服务态度', key: 'serviceStar', index: 4, stars: [...s] },
					{ name: '环境', key: 'environmentStar', index: 4, stars: [...s] }
				];
			}
		},
		onStarTap(indexn, indexw) {
			this.$set(this.scoreList[indexw], 'index', indexn);
		},
		delPic(index) {
			this.picsPath.splice(index, 1);
			this.pics.splice(index, 1);
		},
		uploadPic() {
			const that = this;
			that.$util.uploadImageOne(
				{
					url: 'upload/image',
					name: 'multipart',
					model: 'product',
					pid: 1
				},
				function (res) {
					that.pics.push(res);
					that.picsPath.push(res);
				}
			);
		},
		starValue(row) {
			const i = row.index;
			if (i == null || i < 0) return 5;
			return Math.min(5, Math.max(1, i + 1));
		},
		buildPayload() {
			const base = {
				appointmentId: this.appointmentId,
				comment: (this.comment || '').trim(),
				isAnonymous: !!this.anonymous,
				pics: this.pics.length ? this.pics.join(',') : ''
			};
			if (this.category === 'tcm') {
				const o = { ...base };
				this.scoreList.forEach((row) => {
					o[row.key] = this.starValue(row);
				});
				return o;
			}
			const o = { ...base };
			this.scoreList.forEach((row) => {
				o[row.key] = this.starValue(row);
			});
			return o;
		},
		submit: Debounce(function () {
			if (!this.appointmentId || this.submitting) return;
			this.submitting = true;
			uni.showLoading({ title: '正在提交…' });
			const payload = this.buildPayload();
			const req =
				this.category === 'tcm'
					? tcmAppointmentReplySaveApi(payload)
					: physiotherapyAppointmentReplySaveApi(payload);
			req
				.then(() => {
					try {
						uni.setStorageSync(`apt_reply_${this.category}_${this.appointmentId}`, '1');
					} catch (e) {}
					const g = getApp();
					if (g.globalData) {
						g.globalData.appointmentReviewNeedRefresh = true;
					}
					this.$util.Tips({ title: '感谢您的评价!', icon: 'success' });
					setTimeout(() => uni.navigateBack(), 400);
				})
				.catch((err) => {
					this.$util.Tips({ title: err || '提交失败' });
				})
				.finally(() => {
					uni.hideLoading();
					this.submitting = false;
				});
		}, 300)
	}
};
</script>

<style lang="scss" scoped>
.icon-ic_star1 {
	@include main_color(theme);
}

.score-name {
	min-width: 140rpx;
	font-size: 28rpx;
	color: #282828;
}

.anon-row {
	margin-top: 32rpx;
	padding: 0 8rpx;
	font-size: 26rpx;
	color: #666;
}

.anon-box {
	width: 32rpx;
	height: 32rpx;
	border: 1rpx solid #ccc;
	border-radius: 6rpx;
	font-size: 22rpx;
	margin-right: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--view-theme);
}

.evaluateBnt-hover {
	opacity: 0.92;
}

.evaluate-con .score {
	background-color: #fff;
	margin-top: 20rpx;
	font-size: 28rpx;
	color: #282828;
	padding: 46rpx 24rpx;
}

.evaluate-con .score .item ~ .item {
	margin-top: 36rpx;
}

.evaluate-con .score .item .starsList {
	padding: 0 24rpx 0 32rpx;
	flex: 1;
}

.evaluate-con .score .item .starsList .iconfont {
	font-size: 40rpx;
	color: #aaa;
}

.evaluate-con .score .item .starsList .iconfont ~ .iconfont {
	margin-left: 20rpx;
}

.evaluate-con .score .item .evaluate {
	color: #aaa;
	font-size: 24rpx;
	min-width: 56rpx;
	text-align: right;
}

.evaluate-con .score .textarea {
	width: 100%;
	background-color: #f5f5f5;
	border-radius: 16rpx;
	margin-top: 40rpx;
}

.evaluate-con .score .textarea textarea {
	font-size: 28rpx;
	padding: 38rpx 30rpx 0 30rpx;
	width: 100%;
	box-sizing: border-box;
	min-height: 160rpx;
}

.evaluate-con .score .textarea .placeholder {
	color: #bbb;
}

.evaluate-con .score .textarea .list {
	margin-top: 25rpx;
	padding-left: 5rpx;
	flex-wrap: wrap;
}

.evaluate-con .score .textarea .list .pictrue {
	width: 140rpx;
	height: 140rpx;
	margin: 0 0 24rpx 20rpx;
	position: relative;
	font-size: 22rpx;
	border-radius: 16rpx;
}

.evaluate-con .score .textarea .list .pictrue:nth-last-child(1) {
	border: 1rpx solid #ddd;
	box-sizing: border-box;
}

.evaluate-con .score .textarea .list .pictrue image {
	width: 100%;
	height: 100%;
	border-radius: 16rpx;
}

.evaluate-con .score .evaluateBnt {
	font-size: 28rpx;
	color: #fff;
	width: 100%;
	height: 80rpx;
	border-radius: 43rpx;
	text-align: center;
	line-height: 80rpx;
	margin-top: 48rpx;
	border: none;
	padding: 0;
}

.evaluate-con .score .evaluateBnt::after {
	border: none;
}

.borRadius14 {
	border-radius: 14rpx;
	overflow: hidden;
}
</style>
