<template>
	<view :data-theme="theme">
		<view class="container">
			<view v-if="fromType==='video'" class="header flex-between-center">
				<text class="title">TA提到的宝贝</text>
        <CloseIcon @handle-close="closePopup" topStyle="position: relative;right:0;top:0;"></CloseIcon>
      </view>
			<view class="main_count" :class="fromType==='video'?'pdStyle':'flex'">
				<view v-for="(item, index) in list" :key="index" @click="goDetail(item)" class="list" :style="fromType==='video'?goodsStyle.bgStyle:''">
					<view class="pro_list">
						<view class="picture">
							<image :src="item.productImage" class="image" :style="fromType==='video'?goodsStyle.imageStyle:''"></image>
						</view>
						<view class="info">
							<text class="name line1 text--w111-333 text-28rpx" :style="fromType==='video'?goodsStyle.nameWidth:''">{{item.productName}}</text>
							<text v-if="item.isPay == 1" class="isPay">作者买过</text>
							<view class="bottom" :style="fromType==='video'?'width:480rpx':'width:370rpx'">
								<view v-if="item.price" class="price"><text class="sm">￥</text><text
										class="text">{{item.price}}</text></view>
								<text class="buy-btn">立即购买</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>

</template>

<script>
	import Cache from '@/utils/cache'
	import {
		goProductDetail
	} from '@/libs/order.js'
	import {
		mapGetters
	} from "vuex";
	let app = getApp();
	export default {
		computed: {},
		props: {
			list: {
				type: Array,
				default: function() {
					return []; 
				}
			},
			uid: {
				type: Number,
			},
			isHome: {
				type: Boolean,
				default: false
			},
      //页面来源,默认详情中的样式
      fromType: {
        type: String,
        default: 'details'
      },
      // 商品样式
      goodsStyle: {
        type: Object,
        default: function() {
          return {};
        }
      }
		},
		data() {
			return {
				urlDomain: Cache.get("imgHost"),
				theme: app.globalData.theme,
				popup: {
					show: false
				},

			};
		},
		methods: {
			// 点击关闭按钮
			closePopup() {
				this.$emit('close');
			},
			// 去详情页
			goDetail(item) {
				goProductDetail(item.productId, 0, '');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.isPay {
		padding: 3rpx 5rpx;
		font-size: 20rpx;
		border-radius: 3px 3px 3px 3px;
		margin-top: 12rpx;
		/* #ifdef APP-PLUS-NVUE */
		display: flex;
		flex-direction: row;
		align-items: center;
		color: #e93323;
		border-width: 1px;
		border-style: solid;
		border-color: #e93323;
		/* #endif */
		/* #ifndef APP-PLUS-NVUE */
		/* #ifndef APP-PLUS */
		@include main_color(theme);
		@include coupons_border_color(theme);
		/* #endif */
		display: inline-block;
		/* #endif */
	}

	.container {
		background-color: #ffffff;
		border-radius: 40rpx 40rpx 0 0;
		/* #ifndef APP-PLUS-NVUE */
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		/* #endif */
		/* #ifdef APP-PLUS-NVUE */
		padding-bottom: 24rpx;
		/* #endif */

		.header {
			position: relative;
			padding: 44rpx 24rpx 28rpx 24rpx;

			.title {
				color: #282828;
				font-size: 30rpx;
			}

			.closeBnt {
				position: absolute;
				right: 30rpx;
				top: 45rpx;
				width: 30rpx;
				height: 30rpx;
				font-size: 28rpx;
			}
		}

		.scroll-view {
			//max-height: 1100rpx;
		}

		.main_count {
			padding: 0 24rpx 0 0;
			//max-height: 1100rpx;
			/* #ifndef APP-PLUS-NVUE */
			overflow-y: scroll;
			/* #endif */

			.list {
				width: 578rpx;
				height: 192rpx;
				background: #FAFAFA;
				border-radius: 16rpx 16rpx 16rpx 16rpx;
				padding: 20rpx;
				flex-direction: row;
				margin-right: 30rpx;

				&:last-child {
					margin-bottom: 0;
				}
			}

			.pro_list {
				display: flex;
				flex-direction: row;

				.image {
					width: 150rpx;
					height: 150rpx;
					border-radius: 16rpx;
				}

				.info {
					margin-left: 16rpx;
					position: relative;

					.name {
						width: 390rpx;
						lines: 1;
						text-overflow: ellipsis;
						/* #ifdef APP-PLUS-NVUE */
						display: flex;
						flex-direction: row;
						/* #endif */
						/* #ifndef APP-PLUS-NVUE */
						display: inline-block;
						/* #endif */
					}

					.bottom {
						display: flex;
						justify-content: space-between;
						align-items: center;
						position: absolute;
						left: 0;
						bottom: 0;
						flex-direction: row;
					}

					.price {
						flex-direction: row;
						align-items: flex-end;

						.sm {
							font-weight: bold;
							font-size: 26rpx;
							/* #ifdef APP-PLUS-NVUE */
							color: #e93323;
							/* #endif */
							/* #ifndef APP-PLUS-NVUE */
							color: var(--view-theme);
							/* #endif */
						}

						.text {
							font-weight: bold;
							font-size: 34rpx;
							/* #ifdef APP-PLUS-NVUE */
							color: #e93323;
							/* #endif */
							/* #ifndef APP-PLUS-NVUE */
							color: var(--view-theme);
							/* #endif */
						}
					}

					.buy-btn {
						border-radius: 26rpx;
						padding: 10rpx 20rpx;
						text-align: center;
						align-items: center;
						justify-content: center;
						font-size: 24rpx;
						color: #fff;
						/* #ifdef APP-PLUS-NVUE */
						background-color: #e93323;
						/* #endif */
						/* #ifndef APP-PLUS-NVUE */
						background: var(--view-theme);
						/* #endif */
					}
				}
			}
		}
	}
</style>