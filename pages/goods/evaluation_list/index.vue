 <template>
	<view :data-theme="theme" class="eval-page">
		<!-- 与 pages/clinic/appointment/index 一致的顶部分类 Tab -->
		<view class="category-tabs-row">
			<view
				class="cat-tab"
				:class="{ active: activeTab === 'physio' }"
				@click="switchTab('physio')"
			>
				<text>理疗预约</text>
				<view v-if="activeTab === 'physio'" class="cat-tab-line"></view>
			</view>
			<view
				class="cat-tab"
				:class="{ active: activeTab === 'tcm' }"
				@click="switchTab('tcm')"
			>
				<text>中医预约</text>
				<view v-if="activeTab === 'tcm'" class="cat-tab-line"></view>
			</view>
		</view>

		<view class="my-order borderPad">
			<!-- 商城订单待评价 order/reply/list（暂不下发）
			<view class='list' v-show="activeTab === 'order'">
				<view class='item borRadius14' v-for="(item,index) in replyList" :key="index">
					<view class='title acea-row row-between-wrapper'>
						<navigator :url="`/pages/merchant/home/index?merId=${item.merId}`" hover-class="none">
							<view class="acea-row row-middle 3cfea756">
								<text class='iconfont icon-ic_mall mr10'></text>
								<text class="mr-2">{{item.merName}}</text>
								<text class='iconfont f-s-28 icon-ic_rightarrow text-999'></text>
							</view>
						</navigator>
					</view>
					<view @click='goProDetails(item)' class='item-info acea-row row-between row-top 8bfb4'>
						<view class='pictrue'>
						<easy-loadimage :image-src="item.image" width="120rpx" height="120rpx"
                            radius="16rpx"></easy-loadimage>
						</view>
						<view class='text acea-row row-between'>
							<view class='name line2'>{{item.productName}}</view>
							<view class='money'>
								<view>￥{{item.price}}</view>
								<view>x{{item.payNum}}</view>
							</view>
							<view class="sku">规格：{{ item.sku?item.sku:'无' }}</view>
						</view>
					</view>
					<view class='bottom acea-row row-right row-middle aaf9'>
						<view class='bnt' @click='evaluateTap(item)'>去评价</view>
					</view>
				</view>
				<view class='loadingicon acea-row row-center-wrapper 3cfea756'>
					<text class='loading iconfont icon-jiazai' :hidden='loading==false'></text>{{replyList.length>0?loadTitle:''}}
				</view>
				<emptyPage v-if="replyList.length == 0 && !loading" title="暂无评论~" :imgSrc="urlDomain+'crmebimage/presets/noEvaluate.png'"></emptyPage>
			</view>
			-->

			<!-- 理疗预约我的评价（physiotherapy-appointment-reply/my-list） -->
			<view class="list physio-list" v-show="activeTab === 'physio'">
				<view
					class="item borRadius14 physio-item"
					v-for="(item, index) in physioList"
					:key="'ph-' + (item.id != null ? item.id : index)"
					@click="goPhysioAppointment(item)"
				>
					<view class="physio-head acea-row row-between-wrapper">
						<view class="acea-row row-middle">
							<image
								class="physio-avatar"
								:src="resolveImgUrl(item.therapistAvatar) || '/static/images/f.png'"
								mode="aspectFill"
							/>
							<view class="physio-meta">
								<text class="physio-name">{{ item.therapistName || '理疗师' }}</text>
								<text class="physio-cate line1" v-if="item.categoryName">{{ item.categoryName }}</text>
							</view>
						</view>
						<text class="physio-time">{{ item.createTime || '' }}</text>
					</view>
					<view class="physio-stars acea-row row-middle">
						<text class="star-text">{{ starLine(item.star) }}</text>
						<text class="star-detail" v-if="item.star != null">
							综合{{ item.star }}星 · 专业{{ item.professionalStar != null ? item.professionalStar : '—' }} · 服务{{ item.serviceStar != null ? item.serviceStar : '—' }}
						</text>
					</view>
					<view class="physio-comment line2" v-if="item.comment">{{ item.comment }}</view>
					<view class="physio-pics acea-row" v-if="parsePics(item.pics).length">
						<image
							v-for="(pic, pi) in parsePics(item.pics).slice(0, 3)"
							:key="pi"
							class="physio-pic"
							:src="pic"
							mode="aspectFill"
						/>
					</view>
					<view class="physio-foot acea-row row-right">
						<text class="physio-tip">查看预约</text>
						<text class="iconfont f-s-28 icon-ic_rightarrow text-999"></text>
					</view>
				</view>
				<view class="loadingicon acea-row row-center-wrapper 3cfea756">
					<text class="loading iconfont icon-jiazai" :hidden="physioLoading === false"></text>
					{{ physioList.length > 0 ? physioLoadTitle : '' }}
				</view>
				<emptyPage
					v-if="physioList.length === 0 && !physioLoading"
					title="暂无理疗评价~"
					:imgSrc="urlDomain + 'crmebimage/presets/noEvaluate.png'"
				></emptyPage>
			</view>

			<!-- 中医预约我的评价（tcm-appointment-reply/my-list） -->
			<view class="list physio-list" v-show="activeTab === 'tcm'">
				<view
					class="item borRadius14 physio-item"
					v-for="(item, index) in tcmList"
					:key="'tcm-' + (item.id != null ? item.id : index)"
					@click="goTcmAppointment(item)"
				>
					<view class="physio-head acea-row row-between-wrapper">
						<view class="acea-row row-middle">
							<image
								class="physio-avatar"
								:src="resolveImgUrl(item.doctorAvatar) || '/static/images/f.png'"
								mode="aspectFill"
							/>
							<view class="physio-meta">
								<text class="physio-name">{{ item.doctorName || '中医师' }}</text>
								<text class="physio-cate line1" v-if="item.categoryName">{{ item.categoryName }}</text>
							</view>
						</view>
						<text class="physio-time">{{ item.createTime || '' }}</text>
					</view>
					<view class="physio-stars acea-row row-middle">
						<text class="star-text">{{ starLine(item.star) }}</text>
						<text class="star-detail tcm-star-detail" v-if="item.star != null">
							综合{{ item.star }}星 · 疗效{{ tcmStar(item.effectStar) }} · 专业{{ tcmStar(item.professionalStar) }} · 服务{{ tcmStar(item.serviceStar) }} · 环境{{ tcmStar(item.environmentStar) }}
						</text>
					</view>
					<view class="physio-comment line2" v-if="item.comment">{{ item.comment }}</view>
					<view class="physio-pics acea-row" v-if="parsePics(item.pics).length">
						<image
							v-for="(pic, pi) in parsePics(item.pics).slice(0, 3)"
							:key="pi"
							class="physio-pic"
							:src="pic"
							mode="aspectFill"
						/>
					</view>
					<view class="physio-foot acea-row row-right">
						<text class="physio-tip">查看预约</text>
						<text class="iconfont f-s-28 icon-ic_rightarrow text-999"></text>
					</view>
				</view>
				<view class="loadingicon acea-row row-center-wrapper 3cfea756">
					<text class="loading iconfont icon-jiazai" :hidden="tcmLoading === false"></text>
					{{ tcmList.length > 0 ? tcmLoadTitle : '' }}
				</view>
				<emptyPage
					v-if="tcmList.length === 0 && !tcmLoading"
					title="暂无中医评价~"
					:imgSrc="urlDomain + 'crmebimage/presets/noEvaluate.png'"
				></emptyPage>
			</view>
		</view>
	</view>
</template>

<script>
	// +----------------------------------------------------------------------
	// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
	// +----------------------------------------------------------------------
	// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
	// +----------------------------------------------------------------------
	// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
	// +----------------------------------------------------------------------
	// | Author: CRMEB Team <admin@crmeb.com>
	// +----------------------------------------------------------------------
	/* 商城待评 order/reply/list
	import {
		orderReplyList
	} from '@/api/order.js';
	*/
	import {
		getPhysiotherapyReplyMyListApi,
		getTcmReplyMyListApi
	} from '@/api/clinic.js';
	import {toLogin} from '@/libs/login.js';
	import {mapGetters} from "vuex";
	import emptyPage from '@/components/emptyPage.vue'
	/* import easyLoadimage from '@/components/base/easy-loadimage.vue';
	import { goProductDetail } from '../../../libs/order'; */
	const app = getApp();
	export default {
		data() {
			return {
        urlDomain: this.$Cache.get("imgHost"),
				/** physio | tcm */
				activeTab: 'physio',
				/* 商城待评
				loading: false,
				loadend: false,
				loadTitle: '显示更多',
				replyList: [],
				page: 1,
				isShow: false,
				*/
				limit: 20,
				theme: app.globalData.theme,
				/** 理疗预约评价 my-list */
				physioList: [],
				physioPage: 1,
				physioLoadend: false,
				physioLoading: false,
				physioLoadTitle: '显示更多',
				/** 中医预约评价 my-list */
				tcmList: [],
				tcmPage: 1,
				tcmLoadend: false,
				tcmLoading: false,
				tcmLoadTitle: '显示更多'
			};
		},
		computed: mapGetters(['isLogin']),
		components: {
			emptyPage
		},
		// 滚动监听
		onPageScroll(e) {
			// 传入scrollTop值并触发所有easy-loadimage组件下的滚动监听事件
			uni.$emit('scroll');
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: '我的评价'
			})
			let that = this;
			if (this.isLogin) {
				if (this.activeTab === 'physio') {
					this.physioLoadend = false;
					this.physioPage = 1;
					this.$set(this, 'physioList', []);
					this.getPhysioReplyList();
				} else {
					this.tcmLoadend = false;
					this.tcmPage = 1;
					this.$set(this, 'tcmList', []);
					this.getTcmReplyList();
				}
			} else {
				toLogin();
			}
		},
		methods: {
			switchTab(tab) {
				if (this.activeTab === tab) return;
				this.activeTab = tab;
				if (tab === 'physio' && !this.physioList.length && !this.physioLoadend && !this.physioLoading) {
					this.physioPage = 1;
					this.physioLoadend = false;
					this.getPhysioReplyList();
				}
				if (tab === 'tcm' && !this.tcmList.length && !this.tcmLoadend && !this.tcmLoading) {
					this.tcmPage = 1;
					this.tcmLoadend = false;
					this.getTcmReplyList();
				}
			},
			tcmStar(v) {
				if (v == null || v === '') return '—';
				return v;
			},
			resolveImgUrl(path) {
				if (!path || !String(path).trim()) return '';
				const p = String(path).trim();
				if (/^https?:\/\//i.test(p)) return p;
				const base = (this.$Cache.get('imgHost') || '').replace(/\/?$/, '');
				if (!base) return p;
				return p.startsWith('/') ? base + p : `${base}/${p}`;
			},
			parsePics(pics) {
				if (!pics) return [];
				if (Array.isArray(pics)) {
					return pics.map((x) => this.resolveImgUrl(x)).filter(Boolean);
				}
				return String(pics)
					.split(',')
					.map((s) => this.resolveImgUrl(s.trim()))
					.filter(Boolean);
			},
			starLine(star) {
				const n = Math.min(5, Math.max(0, parseInt(star, 10) || 0));
				if (!n) return '—';
				return '★'.repeat(n) + '☆'.repeat(5 - n);
			},
			goPhysioAppointment(item) {
				const id = item && item.appointmentId;
				if (!id) {
					return this.$util.Tips({ title: '无关联预约' });
				}
				this.$util.navigateTo(`/pages/clinic/physio_appointment_detail/index?id=${id}`);
			},
			goTcmAppointment(item) {
				const id = item && item.appointmentId;
				if (!id) {
					return this.$util.Tips({ title: '无关联预约' });
				}
				this.$util.navigateTo(
					`/pages/clinic/physio_appointment_detail/index?id=${id}&tcm=1`
				);
			},
			getTcmReplyList() {
				let that = this;
				if (that.tcmLoadend) return;
				if (that.tcmLoading) return;
				that.tcmLoading = true;
				that.tcmLoadTitle = '加载中';
				getTcmReplyMyListApi({
					page: that.tcmPage,
					limit: that.limit
				})
					.then((res) => {
						let list = (res.data && res.data.list) || [];
						let loadend = list.length < that.limit;
						that.tcmList = that.$util.SplitArray(list, that.tcmList);
						that.$set(that, 'tcmList', that.tcmList);
						that.tcmLoadend = loadend;
						that.tcmLoading = false;
						that.tcmLoadTitle = loadend ? '' : '显示更多';
						that.tcmPage = that.tcmPage + 1;
					})
					.catch(() => {
						that.tcmLoading = false;
						that.tcmLoadTitle = '显示更多';
					});
			},
			getPhysioReplyList() {
				let that = this;
				if (that.physioLoadend) return;
				if (that.physioLoading) return;
				that.physioLoading = true;
				that.physioLoadTitle = '加载中';
				getPhysiotherapyReplyMyListApi({
					page: that.physioPage,
					limit: that.limit
				})
					.then((res) => {
						let list = (res.data && res.data.list) || [];
						let loadend = list.length < that.limit;
						that.physioList = that.$util.SplitArray(list, that.physioList);
						that.$set(that, 'physioList', that.physioList);
						that.physioLoadend = loadend;
						that.physioLoading = false;
						that.physioLoadTitle = loadend ? '' : '显示更多';
						that.physioPage = that.physioPage + 1;
					})
					.catch(() => {
						that.physioLoading = false;
						that.physioLoadTitle = '显示更多';
					});
			},
			returns(){
				uni.navigateBack()
			},
			/* 商城待评
			evaluateTap(item) {
				uni.navigateTo({
					url: "/pages/goods/goods_comment_con/index?orderNo=" + item.orderNo + "&id=" + item.id
				})
			},
			goProDetails: function(item) {
               goProductDetail(item.productId, 0, `&typeNum=${item.productType}`)
			},
			getReplyList: function() {
				let that = this;
				if (that.loadend) return;
				if (that.loading) return;
				that.loading = true;
				that.loadTitle = '显示更多';
				orderReplyList({
					page: that.page,
					limit: that.limit,
				}).then(res => {
					let list = res.data.list || [];
					let loadend = list.length < that.limit;
					that.replyList = that.$util.SplitArray(list, that.replyList);
					that.$set(that, 'replyList', that.replyList);
					that.loadend = loadend;
					that.loading = false;
					that.loadTitle = loadend ? "" : '显示更多';
					that.page = that.page + 1;
					that.isShow = true;
				}).catch(err => {
					that.loading = false;
					that.loadTitle = '显示更多';
				})
			},
			*/
		},
		onReachBottom: function() {
			if (this.activeTab === 'physio') {
				this.getPhysioReplyList();
			} else if (this.activeTab === 'tcm') {
				this.getTcmReplyList();
			}
		}
	}
</script>

<style scoped lang="scss">
	.eval-page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	/* 与 clinic/appointment/index .category-tabs-row 一致 */
	.category-tabs-row {
		display: flex;
		background: #fff;
		border-bottom: 1px solid #f0f0f0;
	}
	.cat-tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 28rpx 16rpx 22rpx;
		font-size: 30rpx;
		color: #666;
		position: relative;
		&.active {
			color: #282828;
			font-weight: 600;
		}
	}
	.cat-tab-line {
		position: absolute;
		bottom: 0;
		width: 56rpx;
		height: 6rpx;
		background: var(--view-theme);
		border-radius: 3rpx;
	}
	.physio-list .physio-item {
		padding-bottom: 8rpx;
	}
	.physio-head {
		padding: 24rpx 24rpx 0;
	}
	.physio-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #f5f5f5;
	}
	.physio-meta {
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		max-width: 420rpx;
	}
	.physio-name {
		font-size: 30rpx;
		color: #282828;
		font-weight: 600;
	}
	.physio-cate {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}
	.line1 {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.physio-time {
		font-size: 24rpx;
		color: #999;
		flex-shrink: 0;
	}
	.physio-stars {
		padding: 16rpx 24rpx 0;
		flex-wrap: wrap;
	}
	.star-text {
		font-size: 28rpx;
		color: #ff6b35;
		letter-spacing: 2rpx;
		margin-right: 16rpx;
	}
	.star-detail {
		font-size: 22rpx;
		color: #bbb;
	}
	.tcm-star-detail {
		flex: 1;
		min-width: 0;
		white-space: normal;
		line-height: 1.4;
	}
	.line2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
	.physio-comment {
		padding: 16rpx 24rpx 0;
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
	}
	.physio-pics {
		padding: 16rpx 24rpx 0;
		flex-wrap: wrap;
		gap: 12rpx;
	}
	.physio-pic {
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		background: #f5f5f5;
	}
	.physio-foot {
		padding: 20rpx 24rpx 24rpx;
		border-top: 1rpx solid #f5f5f5;
		margin-top: 16rpx;
	}
	.physio-tip {
		font-size: 26rpx;
		color: #999;
	}
	.sku{
		font-size: 24rpx;
		color: #999999;
		margin: 10rpx 0;
	}
	.icon-ic_mall{
		font-size: 28rpx;
	}
	.my-order .header {
		height: 250rpx;
		padding: 0 30rpx;
	}
	.my-order .header .picTxt {
		height: 190rpx;
	}

	.my-order .header .picTxt .text {
		color: rgba(255, 255, 255, 0.8);
		font-size: 26rpx;
		font-family: 'Guildford Pro';
	}

	.my-order .header .picTxt .text .name {
		font-size: 34rpx;
		font-weight: bold;
		color: #fff;
		margin-bottom: 20rpx;
	}

	.my-order .nav {
		background-color: #fff;
		border-top: 1px solid #F5F5F5;
		// margin: -60rpx 0 0;

	}

	.my-order .nav .item {
		text-align: center;
		font-size: 26rpx;
		color: #282828;
		padding: 26rpx 30rpx;
		display: inline-block;
		background-color: #fff;
	}

	.my-order .nav .item.on {
		/* #ifdef H5 || MP */
		font-weight: bold;
		/* #endif */
		/* #ifdef APP-PLUS */
		color: #000;
		/* #endif */
		position: relative;
	}
	.my-order .nav .item.on ::after{
		content: '';
		width: 78rpx;
		height: 4rpx;
		@include main_bg_color(theme);
		position: absolute;
		bottom: 2rpx;
		left: 30rpx;
	}
	.my-order .nav .item .num {
		margin-top: 18rpx;
	}

	.my-order .list {
		width: 100%;
		margin: 20rpx auto 0 auto;
	}

	.my-order .list .item {
		background-color: #fff;
		margin-bottom: 20rpx;
	}

	.my-order .list .item .title {
		height: 84rpx;
		padding: 0 24rpx;
		font-size: 28rpx;
		color: #282828;
	}

	.my-order .list .item .title .sign {
		font-size: 24rpx;
		padding: 0 13rpx;
		height: 36rpx;
		margin-right: 15rpx;
		border-radius: 18rpx;
		@include coupons_border_color(theme);
		@include main_color(theme);
	}

	.my-order .list .item .item-info {
		padding: 0 24rpx;
		margin-top: 22rpx;
	}

	.my-order .list .item .item-info .text {
		width: 500rpx;
		font-size: 28rpx;
		color: #999;
	}

	.my-order .list .item .item-info .text .name {
		width: 350rpx;
		color: #282828;
	}

	.my-order .list .item .item-info .text .money {
		text-align: right;
	}
	.font_color{
		@include main_color(theme);
	}
	.my-order .list .item .totalPrice {
		font-size: 26rpx;
		color: #282828;
		text-align: right;
		margin: 27rpx 0 0 30rpx;
		padding: 0 30rpx 30rpx 0;
		border-bottom: 1rpx solid #eee;
	}

	.my-order .list .item .totalPrice .money {
		font-size: 28rpx;
		font-weight: bold;
		@include price_color(theme);
	}

	.my-order .list .item .bottom {
		height: 107rpx;
		padding: 0 24rpx;
	}

	.my-order .list .item .bottom .bnt {
    width: 120rpx;
    height: 56rpx;
		text-align: center;
		line-height: 56rpx;
		@include main_bg_color(theme);
		border-radius: 30rpx;
		font-size: 26rpx;
    color: #fff;
	}

	.my-order .list .item .bottom .bnt.cancelBnt {
		border: 1rpx solid #ddd;
		color: #aaa;
	}

	.my-order .list .item .bottom .bnt~.bnt {
		margin-left: 17rpx;
	}

	.noCart {
		margin-top: 171rpx;
		padding-top: 0.1rpx;
	}

	.noCart .pictrue {
		width: 414rpx;
		height: 336rpx;
		margin: 78rpx auto 56rpx auto;
	}

	.noCart .pictrue image {
		width: 100%;
		height: 100%;
	}
	/deep/.tui-red{
		@include main_bg_color(theme);
	}
	/deep/.tui-red-outline{
		@include main_color(theme);
		@include coupons_border_color(theme);
	}
</style>

