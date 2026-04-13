<template>
	<view
		class="physio-tlist-root"
		:class="{ 'is-embedded': embedded }"
		:data-theme="theme"
	>
		<view v-if="list && list.length > 0" class="therapist-list-wrap">
			<view
				class="therapist-card"
				v-for="(item, index) in list"
				:key="'physio-t-' + index + '-' + (item.id != null ? item.id : '')"
				@click="onCardClick(item)"
			>
				<view class="card-upper">
					<view class="col-avatar">
						<view class="avatar-frame">
							<easy-loadimage
								class="avatar-img"
								:image-src="therapistAvatarSrc(item)"
								mode="aspectFill"
								width="200rpx"
								height="268rpx"
								radius="12rpx"
							/>
							<view class="avatar-ribbon" :class="ribbonMeta(item, index).cls">
								<text>{{ ribbonMeta(item, index).text }}</text>
							</view>
						</view>
					</view>

					<view class="col-info">
						<view class="info-top">
							<view class="name-stack">
								<view class="name-gen">
									<text class="t-name">{{ item.name || '技师' }}</text>
									<text v-if="formatTherapistAgeLabel(item)" class="gen-tag">{{
										formatTherapistAgeLabel(item)
									}}</text>
									<text v-if="formatTherapistSex(item)" class="sex-tag">{{
										formatTherapistSex(item)
									}}</text>
								</view>
							</view>
							<view v-if="availLine(item)" class="avail-pill">
								<text class="iconfont icon-ic_clock ap-ico"></text>
								<text>{{ availLine(item) }}</text>
							</view>
							<view v-else-if="responseMini(item)" class="avail-pill muted">{{ responseMini(item) }}</view>
						</view>

						<view class="stat-mix">
							<text class="st-a">{{ statPrimary(item) }}</text>
							<text v-if="item.treatNum != null && item.treatNum !== ''" class="st-b">
								<text class="dot"> · </text>
								年接单{{ item.treatNum }}
							</text>
						</view>

						<view class="loc-row">
							<text class="loc-txt line1">{{ areaLine(item) || '服务范围内可预约' }}</text>
							<view class="dist-pill">
								<text class="iconfont icon-ic_location5 dist-ico"></text>
								<text>{{ distanceLine(item) }}</text>
							</view>
						</view>

						<view class="tag-block" v-if="badgeTags(item, index).length">
							<text v-for="(h, hi) in badgeTags(item, index)" :key="hi" class="tag-yl">{{ h }}</text>
						</view>
						<view class="promo-icons" v-if="showPromoRow(item, index)">
							<text class="hui-ico">惠</text>
							<text class="promo-txt">免车费</text>
						</view>
						<view class="skill-one line2" v-if="formatTherapistSkill(item)">
							<text class="sk">擅长：{{ formatTherapistSkill(item) }}</text>
						</view>
					</view>
				</view>

				<view class="card-footer">
					<view class="footer-left">
						<view class="fake-avatars">
							<image class="fa-img" src="https://img.yzcdn.cn/vant/cat.jpeg" mode="aspectFill" />
							<image class="fa-img" src="https://img.yzcdn.cn/vant/apple-1.jpg" mode="aspectFill" />
							<image class="fa-img" src="https://img.yzcdn.cn/vant/apple-2.jpg" mode="aspectFill" />
						</view>
						<text class="review-quote">「{{ reviewPreview(item) }}」</text>
					</view>
					<button
						class="btn-book-list bg-color"
						hover-class="book-main-hover"
						@click.stop="onBookClick(item)"
					>
						立即预订
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import easyLoadimage from '@/components/base/easy-loadimage.vue';
import physioTherapistCardDisplay from '@/mixins/physioTherapistCardDisplay.js';

export default {
	name: 'PhysioTherapistCardList',
	components: { easyLoadimage },
	mixins: [physioTherapistCardDisplay],
	props: {
		list: {
			type: Array,
			default() {
				return [];
			}
		},
		/** 与 physio/index 同主题色变量 */
		theme: {
			type: String,
			default: ''
		},
		/** 首页 Tab 内嵌时略收紧左右边距 */
		embedded: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		onCardClick(item) {
			this.$emit('detail', item);
		},
		onBookClick(item) {
			this.$emit('book', item);
		}
	}
};
</script>

<style lang="scss" scoped>
.physio-tlist-root {
	width: 100%;
}

/* 首页 Tab：与外层 tab-content 左右留白对齐（外层对理疗 Tab 去掉左右 padding，由这里统一 24rpx） */
.physio-tlist-root.is-embedded .therapist-list-wrap {
	padding: 0 24rpx 32rpx;
}

.therapist-list-wrap {
	padding: 0 20rpx 48rpx;
}

.therapist-card {
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
	box-sizing: border-box;
}
.card-upper {
	display: flex;
	padding: 24rpx 24rpx 16rpx;
	align-items: flex-start;
}

.col-avatar {
	flex-shrink: 0;
	margin-right: 20rpx;
}

.avatar-frame {
	position: relative;
	width: 200rpx;
	height: 268rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background: #eee;
}

.avatar-img {
	width: 200rpx;
	height: 268rpx;
	display: block;
}

.avatar-ribbon {
	position: absolute;
	left: 0;
	top: 0;
	padding: 6rpx 14rpx;
	font-size: 20rpx;
	color: #fff;
	line-height: 1.2;
	border-radius: 0 0 12rpx 0;
}

.avatar-ribbon.rb-new {
	background: linear-gradient(135deg, #52c41a, #389e0d);
}

.avatar-ribbon.rb-free {
	background: linear-gradient(135deg, #fa8c16, #d46b08);
}

.col-info {
	flex: 1;
	min-width: 0;
}

.info-top {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 12rpx;
	margin-bottom: 10rpx;
}

.name-stack {
	flex: 1;
	min-width: 0;
}

.name-gen {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 8rpx;
}

.t-name {
	font-size: 34rpx;
	font-weight: 700;
	color: #111;
}

.gen-tag {
	font-size: 24rpx;
	color: #e6285f;
	font-weight: 500;
}

.sex-tag {
	font-size: 22rpx;
	color: #666;
	font-weight: 500;
	padding: 2rpx 12rpx;
	background: #f5f5f5;
	border-radius: 8rpx;
}

.avail-pill {
	flex-shrink: 0;
	display: inline-flex;
	align-items: center;
	gap: 4rpx;
	padding: 6rpx 12rpx;
	font-size: 22rpx;
	color: #00a854;
	font-weight: 500;
	background: #ecf9f0;
	border-radius: 8rpx;
	max-width: 220rpx;
}

.avail-pill.muted {
	color: #999;
	background: #f5f5f5;
	font-size: 20rpx;
	font-weight: 400;
}

.ap-ico {
	font-size: 24rpx;
}

.stat-mix {
	font-size: 24rpx;
	color: #888;
	margin-bottom: 10rpx;
	line-height: 1.4;
}

.st-a,
.st-b {
	font-size: 24rpx;
	color: #888;
}

.dot {
	color: #ccc;
}

.loc-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.loc-txt {
	flex: 1;
	font-size: 24rpx;
	color: #999;
	min-width: 0;
}

.dist-pill {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	font-size: 22rpx;
	color: #999;
}

.dist-ico {
	font-size: 26rpx;
	margin-right: 4rpx;
	color: #ccc;
}

.tag-block {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin-bottom: 8rpx;
}

.tag-yl {
	font-size: 20rpx;
	color: #d48806;
	background: #fff7e0;
	padding: 4rpx 10rpx;
	border-radius: 4rpx;
	line-height: 1.2;
}

.promo-icons {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 8rpx;
}

.hui-ico {
	width: 28rpx;
	height: 28rpx;
	line-height: 28rpx;
	text-align: center;
	font-size: 18rpx;
	color: #fff;
	background: #ff4d4f;
	border-radius: 4rpx;
}

.promo-txt {
	font-size: 22rpx;
	color: #666;
}

.skill-one {
	font-size: 24rpx;
	color: #666;
	line-height: 1.4;
}

.sk {
	word-break: break-all;
}

.card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	padding: 10rpx 24rpx 10rpx;
	background: #fff;
}

.footer-left {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.fake-avatars {
	display: flex;
	flex-shrink: 0;
}

.fa-img {
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	background: #f0f0f0;
	margin-right: -10rpx;
	border: 2rpx solid #fff;
}

.review-quote {
	flex: 1;
	font-size: 22rpx;
	color: #999;
	line-height: 1.45;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	min-width: 0;
}

.btn-book-list {
	flex-shrink: 0;
	width: 200rpx;
	height: 72rpx;
	line-height: 72rpx;
	padding: 0;
	margin: 0;
	font-size: 28rpx;
	font-weight: 600;
	color: #fff;
	border-radius: 36rpx;
	border: none;
}

.btn-book-list::after {
	border: none;
}

.book-main-hover {
	opacity: 0.92;
}

.line1 {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.line2 {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}
</style>
