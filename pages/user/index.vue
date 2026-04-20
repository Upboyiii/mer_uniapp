<template>
	<view :data-theme="theme">
		<!-- #ifdef MP -->
		<view class="cart_nav" :style='"height:"+navH+"rpx;"'>
			<nav-bar iconColor='#fff' ref="navBarRef" navTitle="个人中心" :isShowBack="false">
			</nav-bar>
		</view>
		<!-- #endif -->
		<tui-skeleton v-if="showSkeleton"></tui-skeleton>
		<view class="new-users copy-data tui-skeleton af90db">
			<view class="mid" style="flex:1;overflow: hidden;">
				<scroll-view scroll-y="true">
					<view class="headBox absolute"></view>
					<view class="borderPad head relative">
						<view class="bg 8bfb4"
							:style="{'background-image': `url(${urlDomain}crmebimage/presets/user_bg.png)`}">
							<view class="user-card">
								<view class="user-info">
									<image class="avatar tui-skeleton-rect" :src='userInfo.avatar'
										v-if="userInfo.avatar" @click="goEdit()"></image>
									<image v-else class="avatar tui-skeleton-rect"
										:src="urlDomain+'crmebimage/presets/morenT.png'" mode="" @click="goEdit()">
									</image>
									<view class="info">
										<view class="name" v-if="!isLogin" @tap="openAuto">
											请点击登录
										</view>
										<view class="name" v-if="userInfo && uid">
											<view class="name-text line1" @click="goEdit()">
												{{userInfo && userInfo.nickname && uid ? userInfo.nickname : ''}}
											</view>
											<view class="vip" v-if="userInfo.vipIcon" @click.stop="goEdit()">
												<image
													class="vip-img"
													:src="userInfo.vipIcon"
													mode="aspectFit"
													:lazy-load="false"
												></image>
											</view>
										<!-- 入口关闭：付费会员角标跳转 SVIP
										<view class="vip" v-if="userInfo.isPaidMember"
											@click="menusTap('/pages/activity/vip_paid/index')">
											<image
												:style="{'background-image': `url(${urlDomain}crmebimage/presets/viptu.png)`}">
											</image>
										</view>
										-->
										</view>
										<view class="num mt10" v-if="userInfo && userInfo.phone && uid"
											@click="goEdit()">
											<view class="num-txt">{{userInfo.phone}}</view>
										</view>
									</view>
									<view class="app_set" @click="handleUserSetting()">
										<text class="iconfont icon-a-ic_setup1"></text>
									</view>
								</view>
							<!-- 入口关闭：积分 / 优惠券 / 收藏 / 浏览记录
							<view class="num-wrapper tui-skeleton-rect">
								<view class="num-item" @click="goMenuPage('/pages/merchant/user_integral/index')">
									<text
										class="num semiBold">{{userInfo.integral && uid ? userInfo.integral: 0}}</text>
									<view class="txt">积分</view>
								</view>
								<view class="num-item" @click="goMenuPage('/pages/users/user_coupon/index')">
									<text
										class="num semiBold">{{userInfo.couponCount && uid ? userInfo.couponCount : 0}}</text>
									<view class="txt">优惠券</view>
								</view>
								<view class="num-item"
									@click="goMenuPage('/pages/goods/user_goods_collection/index')">
									<text
										class="num semiBold">{{userInfo.collectCount && uid ? userInfo.collectCount : 0}}</text>
									<view class="txt">收藏</view>
								</view>
								<view class="num-item" @click="goMenuPage('/pages/goods/browsing_history/index')">
									<text
										class="num semiBold">{{userInfo.browseNum && uid ? userInfo.browseNum:0}}</text>
									<view class="txt">浏览记录</view>
								</view>
							</view>
							-->
							</view>
						</view>
					<!-- 入口关闭：加入 SVIP
					<view v-show="userInfo.paidMemberPaidEntrance===1"
						@click="menusTap('/pages/activity/vip_paid/index')" class="h-128 svip-box px-30 relative"
						:style="{'background-image': `url(${urlDomain}crmebimage/presets/cardbj.png)`}">
						<view class="acea-row row-middle row-between h-94">
							<view class="acea-row">
								<view class="w-34 h-28 no-repeat vipicon"
									:style="{'background-image': `url(${urlDomain}crmebimage/presets/huangguan.png)`}">
								</view>
								<view class="f-s-24 text ml-12">加入SVIP畅享精彩</view>
							</view>
							<view class="acea-row row-middle">
								<view class="f-s-24 text mr10">{{userInfo.isPaidMember?'去查看':'去开通'}}</view>
								<text class="iconfont icon-ic_rightarrow text f-s-20"></text>
							</view>
						</view>
					</view>
					-->
						<view class="order-wrapper tui-skeleton-rect 3cfea756 order-below-user">
							<view class="order-hd flex">
								<view class="left">订单中心</view>
								<view class="right flex" @click="menusTap('/pages/goods/order_list/index')">查看全部
									<text class="iconfont icon-ic_rightarrow"></text>
								</view>
							</view>
							<view class="order-bd 3cfea756">
								<block v-for="(item,index) in orderMenu" :key="index">
									<view class="order-item" @click="menusTap(item.url)">
										<view class="pic">
											<text class="iconfont pic_status" :class="item.img"></text>
											<text class="order-status-num" v-if="item.num > 0">{{ item.num }}</text>
										</view>
										<view class="txt tui-skeleton-rect">{{item.title}}</view>
									</view>
								</block>
							</view>
						</view>
					</view>
					<view class="contenBox borderPad user-page-content" id="pageIndex">
						<!-- 中间轮播关闭
						<view class="slider-wrapper tui-skeleton-rect" @click.native="bindEdit('userBanner')"
							v-if="centerBanner != null && centerBanner.length > 0">
							<swiper v-if="centerBanner.length>0" indicator-dots="true" :autoplay="autoplay"
								:circular="circular" :interval="interval" :duration="duration"
								indicator-color="rgba(255,255,255,0.6)" indicator-active-color="#fff">
								<block v-for="(item,index) in centerBanner" :key="index">
									<swiper-item class="borRadius14">
										<image :src="item.pic" class="slide-image" @click="navito(item.url)"></image>
									</swiper-item>
								</block>
							</swiper>
						</view>
						-->
						<!-- 会员菜单 -->
						<view class="user-menus mt20 borRadius14" @click.native="bindEdit('userMenus')">
							<view class="menu-title">我的服务</view>
							<view class="list-box">
								<block v-for="(item,index) in serviceMenuList" :key="'svc-' + index">
									<view class="item tui-skeleton-rect" @click="onMyServiceItemClick(item)">
										<view class="menu-icon-wrap icon-service-wrap">
											<image v-if="item.pic" class="menu-service-icon-img" :src="item.pic" mode="aspectFit" />
											<text v-else class="iconfont" :class="item.icon || 'icon-ic_menu'"></text>
										</view>
										<text>{{ item.name || item.title || '菜单' }}</text>
									</view>
								</block>
								<!-- #ifndef MP -->
								<view class="item" @click="serviceClick">
									<image :src="servicePic"></image>
									<text>联系客服</text>
								</view>
								<!-- #endif -->
								<!-- #ifdef MP -->
								<button class="item" hover-class='none' @click="serviceClick"
									v-if="chatConfig.telephone_service_switch === 'true'">
									<image :src="servicePic"></image>
									<text>联系客服</text>
								</button>
								<button class="item" open-type='contact' hover-class='none' v-else>
									<image :src="servicePic"></image>
									<text>联系客服</text>
								</button>
								<!-- #endif -->
							</view>
						</view>
						<!-- 健康服务 -->
						<view class="user-menus mt20 borRadius14">
							<view class="menu-title">健康服务</view>
							<view class="list-box">
								<view class="item tui-skeleton-rect" @click="menusTap('/pages/clinic/my_doctor/index')">
									<view class="menu-icon-wrap icon-doctor-wrap">
										<text class="iconfont icon-ic_crown"></text>
									</view>
									<text>我的医生</text>
								</view>
								<view class="item tui-skeleton-rect" @click="menusTap('/pages/clinic/my_therapist/index')">
									<view class="menu-icon-wrap icon-therapist-wrap">
										<text class="iconfont icon-ic_leaf"></text>
									</view>
									<text>我的理疗师</text>
								</view>
							<view class="item tui-skeleton-rect" @click="menusTap('/pages/users/patient_identity/index')">
								<view class="menu-icon-wrap icon-patient-wrap">
									<text class="iconfont icon-a-ic_user1"></text>
								</view>
								<text>患者管理</text>
							</view>
							<view class="item tui-skeleton-rect" @click="menusTap('/pages/clinic/my_consultation/index')">
								<view class="menu-icon-wrap icon-consultation-wrap">
									<text class="iconfont icon-ic_notes"></text>
								</view>
								<text>我的问诊</text>
							</view>
							<view class="item tui-skeleton-rect" @click="menusTap('/pages/clinic/appointment/index')">
								<view class="menu-icon-wrap icon-appointment-wrap">
									<text class="iconfont icon-riqi"></text>
								</view>
								<text>我的预约</text>
							</view>
						</view>
					</view>
						<view class="user-menus mt20 borRadius14" v-if="isEmployee">
							<view class="menu-title">店铺管理</view>
							<view class="list-box">
								<view v-if="isEmployeeUse" class="item" @click="toggle('bottom')">
									<image :src="urlDomain+'crmebimage/presets/adminImg/sjgl.png'"></image>
									<text>商家管理</text>
								</view>
								<view v-if="isServiceStaff" class="item" @click="goReservation">
									<image :src="urlDomain+'crmebimage/presets/adminImg/sjgl.png'"></image>
									<text>工单管理</text>
								</view>
							</view>
						</view>
					</view>
					<image :src="copyImage" alt="" class='support'></image>
				</scroll-view>
			</view>
		</view>
		<view v-if="bottomNavigationIsCustom" class="footerBottom"></view>
		<pageFooter></pageFooter>
		<uni-popup ref="popup" type="bottom" background-color="rgba(0,0,0,0)" border-radius="10px 10px 0 0">
			<view class="merchant-content">
				<view class="item" v-for="(item,index) in merchantEmployeeList" :key="index"
					:class="{bottom_border:index!=merchantEmployeeList.length-1}">
					<view class="item_main">
						<image :src="item.currentMerchant.avatar" mode="" class="item_img"></image>
						<view class="item_name" :class="{nameColor:item.merId==selectMerId}">
							{{item.currentMerchant.name}}
						</view>
					</view>
					<text v-if="item.merId==selectMerId"
						class="iconfont icon-a-ic_CompleteSelect icon-size icon_color"></text>
					<text v-else class="iconfont icon-ic_unselect icon-size text--w111-ddd"
						@click="radioChange(item)"></text>
				</view>
			</view>
		</uni-popup>
	</view>
</template>
<script>
	let sysHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
	import Cache from '@/utils/cache';
	import navBar from '@/components/navBar';
	import {
		BACK_URL
	} from '@/config/cache';
	import {
		userCenterInfo,
		copyrightImageApi,
		userCenterInfoMenu
	} from '@/api/user.js';
	import {
		MerchantBelongListApi,
		merchantActive
	} from '@/api/work.js';
	import {
		orderNum
	} from '@/api/order.js';
	import {
		toLogin
	} from '@/libs/login.js';
	import {
		mapGetters
	} from "vuex";
	import {
		getCityList
	} from "@/utils";
	import {
		tokenIsExistApi
	} from '@/api/api.js';
	// #ifdef H5
	import Auth from '@/libs/wechat';
	// #endif
	import {
		getShare
	} from '@/api/public.js';
	import {
		setThemeColor
	} from '@/utils/setTheme.js'
	import animationType from '@/utils/animationType.js'
	import {
		chatConfig
	} from '@/utils/consumerType.js'
	import tuiSkeleton from '@/components/base/tui-skeleton.vue';
	import pageFooter from "@/components/pageFooter/index.vue";
	const app = getApp();
	export default {
		computed: {
			...mapGetters(['isLogin', 'chatUrl', 'uid', 'globalData', 'bottomNavigationIsCustom',
				'merchantEmployeeList', 'isEmployee', 'selectMerId'
			]),
			/** 我的服务：user/center/info/menu 的 centerMenu；仅展示有跳转地址的项 */
			serviceMenuList() {
				const raw = Array.isArray(this.centerMenu) ? this.centerMenu : [];
				return raw
					.map((item) => {
						const url = (item.url || item.link || item.wap_url || '').trim();
						const name = item.name || item.title || item.menuName || '';
						return { ...item, url, name };
					})
					.filter((item) => item.url);
			}
		},
		data() {
			return {
				scrollHeight: 0,
				triggered: false,
				isRefresher: false, //下拉刷新状态
				urlDomain: this.$Cache.get("imgHost"),
				showSkeleton: true, //骨架屏显示隐藏
				orderMenu: [{
						img: 'icon-ic_daifukuan',
						title: '待付款',
						url: '/pages/goods/order_list/index?status=0',
						num: 0
					},
					{
						img: 'icon-ic_daifahuo',
						title: '待发货',
						url: '/pages/goods/order_list/index?status=1',
						num: 0
					},
					{
						img: 'icon-ic_daihexiao',
						title: '待使用',
						url: '/pages/goods/order_list/index?status=3',
						num: 0
					},
					{
						img: 'icon-ic_daishouhuo',
						title: '待收货',
						url: '/pages/goods/order_list/index?status=4',
						num: 0
					},
					{
						img: 'icon-ic_daipingjia',
						title: '待评价',
						url: '/pages/goods/evaluation_list/index',
						num: 0
					},
					{
						img: 'icon-ic_daituikuan',
						title: '售后/退款',
						url: '/pages/goods/user_return_list/index',
						num: 0
					},
				],
				centerBanner: [],
				userMenu: [],
				autoplay: true,
				circular: true,
				interval: 3000,
				duration: 500,
				isAuto: false, //没有授权的不会自动授权
				isShowAuth: false, //是否隐藏授权
				orderStatusNum: {},
				centerMenu: [], //个人中心菜单
				wechatUrl: [],
				servicePic: '',
				sysHeight: sysHeight,
				// #ifdef MP
				pageHeight: '100%',
				// #endif
				// #ifdef H5 || APP-PLUS
				pageHeight: '',
				// #endif
				// #ifdef H5
				isWeixin: Auth.isWeixin(),
				//#endif
				configApi: {}, //分享类容配置
				theme: app.globalData.theme,
				bgColor: '',
				userInfo: {},
				copyImage: '',
				navH: '',
				isPromoter: '', //是否是推广人
				isEmployeeUse: false, //	是否为推广员
				isServiceStaff: false //	是否服务员工
			}
		},
		components: {
			tuiSkeleton,
			pageFooter,
			navBar
		},
		onLoad() {
			this.bgColor = setThemeColor();
			this.servicePic = this.urlDomain + 'crmebimage/presets/customer.png'
			this.getTokenIsExist();
			this.copyrightImage();
			// #ifdef MP
			this.navH = this.globalData.navHeight;
			// #endif
			// #ifndef MP
			this.navH = 96;
			// #endif
			if (this.globalData.isIframe) {
				setTimeout(() => {
					let active;
					document.getElementById('pageIndex').children.forEach(dom => {
						dom.addEventListener('click', (e) => {
							e.stopPropagation();
							e.preventDefault();
							if (dom === active) return;
							dom.classList.add('borderShow');
							active && active.classList.remove('borderShow');
							active = dom;
						})
					})
				});
			}
			// #ifdef APP-PLUS
			setTimeout(() => {
				uni.setNavigationBarColor({
					frontColor: '#ffffff',
					backgroundColor: this.bgColor,
				});
			}, 500)
			// #endif
			// #ifdef H5 || APP-PLUS
			this.$set(this, 'pageHeight', this.globalData.windowHeight);
			// #endif
			this.$set(this, 'centerMenu', this.globalData.centerMenu);
		},
		onShow: function() {
			this.getUserCenterInfoMenu()
			if (this.isLogin) {
				this.getUserCenterInfo();
				this.getOrderData();
				this.getMerchantList()
			}
			this.showSkeleton = false
			let that = this;
			if (!that.$Cache.get('cityList')) getCityList();
			// #ifdef H5
			uni.getSystemInfo({
				success: function(res) {
					that.pageHeight = res.windowHeight + 'px'
				}
			});
			// #endif
			// #ifdef MP
			let query = uni.createSelectorQuery();
			let dom = query.select('.new-users');
			// #endif
		},
		methods: {
			/**
			 *  发现列表滑动中用到的方法
			 */
			onScroll() {
				uni.$emit('scroll');
			},
			// 工单管理
			goReservation() {
				this.$util.navigateTo('/pages/admin/workOrder_manage/index');
			},
			// 商家管理
			toggle(type) {
				if (!this.isLogin) {
					return this.openAuto();
				}
				if (this.merchantEmployeeList.length == 1) {
					merchantActive(this.merchantEmployeeList[0].merId).then(res => {
						this.$store.commit('SetSelectMerId', this.merchantEmployeeList[0].merId);
						this.$store.commit('SetSelectMerchantRole', this.merchantEmployeeList[0].role);
						this.$store.commit('SET_MANAGER_TOKEN', {
							managerToken: res.data.token
						});
						Cache.set('electrPrintingSwitch', res.data.electrPrintingSwitch);
						uni.navigateTo({
							url: '/pages/admin/work/index'
						})
						return
					})
					return
				}
				if (this.selectMerId) {
					uni.navigateTo({
						url: '/pages/admin/work/index'
					})
				} else {
					this.type = type
					// open 方法传入参数 等同在 uni-popup 组件上绑定 type属性
					this.$refs.popup.open(type)
				}
			},
			//选中商户
			radioChange(item) {
				let that = this
				merchantActive(item.merId).then(res => {
					if (res.code == 200) {
						that.$store.commit('SET_MANAGER_TOKEN', {
							managerToken: res.data.token
						});
						Cache.set('electrPrintingSwitch', res.data.electrPrintingSwitch);
						that.$store.commit('SetSelectMerId', item.merId);
						this.$store.commit('SetSelectMerchantRole', item.role);
						this.$refs.popup.close()
						uni.navigateTo({
							url: '/pages/admin/work/index'
						})
					}
				})
			},
			//获取商户列表
			getMerchantList() {
				let that = this
				MerchantBelongListApi().then(res => {
					if (this.selectMerId) {
						let flag = res.data.find(item => item.merId === this.selectMerId);
						!flag && that.$store.commit('CLEAR_SELECTMERID');
					}
					this.$store.commit("SetMerchantEmployeeList", res.data);
				})
			},
			//校验token是否有效,true为有效，false为无效
			getTokenIsExist() {
				tokenIsExistApi().then(res => {
					let tokenIsExist = res.data;
					if (!tokenIsExist) {
						this.$store.commit('UPDATE_LOGIN', '');
						this.$store.commit('UPDATE_USERINFO', {});
					}
				})
			},
			copyrightImage() {
				copyrightImageApi().then(res => {
					if (res.data) {
						this.copyImage = res.data;
					} else {
						this.copyImage = `${this.urlDomain}crmebimage/presets/support.png`;
					}
				}).catch(err => {
					return this.$util.Tips({
						title: err
					})
				});
			},
			bindEdit(name) {
				if (this.globalData.isIframe) {
					window.parent.postMessage({
							name: name
						},
						'*'
					);
					return;
				}
			},
			menusTap(url) {
				if (!this.isLogin) {
					this.openAuto();
				} else {
					if (url === '/pages/activity/vip_paid/index' && this.userInfo.paidMemberPaidEntrance === 0) return
					this.$util.navigateTo(url);
				}
			},
			/** 「我的服务」：接口项已过滤为必有 url */
			onMyServiceItemClick(item) {
				if (!item.url) {
					this.myServiceDeveloping();
					return;
				}
				this.menusTap(item.url);
			},
			myServiceDeveloping() {
				this.$util.Tips({ title: '正在开发中' });
			},
			//轮播图跳转
			navito(url) {
				this.$util.navigateTo(url);
			},
			serviceClick() {
				chatConfig(this.$Cache.getItem('platChatConfig'));
			},
			getOrderData() {
				let that = this;
				orderNum().then(res => {
					that.orderMenu.forEach((item, index) => {
						switch (item.title) {
							case '待付款':
								item.num = res.data.awaitPayCount
								break
							case '待发货':
								item.num = res.data.awaitShippedCount
								break
							case '待收货':
								item.num = res.data.receiptCount
								break
							case '待使用':
								item.num = res.data.verificationCount
								break
							case '待评价':
								item.num = res.data.awaitReplyCount
								break
							default:
								item.num = res.data.refundCount
						}
					})
					that.$set(that, 'orderMenu', that.orderMenu);
				})
			},
			// 绑定手机
			bindPhone() {
				uni.navigateTo({
					animationType: animationType.type,
					animationDuration: animationType.duration,
					url: '/pages/users/app_login/index'
				})
			},
			//个人中心菜单
			async getUserCenterInfoMenu() {
				const {
					code,
					data
				} = await userCenterInfoMenu()
				if (code === 200) {
					this.centerMenu = data.centerMenu || [];
					this.isPromoter = data.isPromoter;
					this.isEmployeeUse = data.isEmployee;
					this.isServiceStaff = data.isServiceStaff
					this.$store.commit("SetIsEmployee", data);
				}
			},
			/**
			 * 
			 * 获取个人中心详情
			 */
			getUserCenterInfo: function() {
				userCenterInfo().then(res => {
					let data = res.data;
					this.userInfo = data;
					this.$store.commit("SETUID", data.id);
					this.$store.commit('UPDATE_USERINFO', {
						avatar: data.avatar,
						nickname: data.nickname,
						phone: data.phone
					});
					if (data.centerBanner) {
						this.centerBanner = data.centerBanner
					}
					this.showSkeleton = false;
				}).catch(err => {
					this.showSkeleton = false;
				});
			},
			// 编辑页面
			goEdit() {
				if (this.isLogin == false) {
					this.openAuto();
				} else {
					uni.navigateTo({
						animationType: animationType.type,
						animationDuration: animationType.duration,
						url: '/pages/users/user_info/index'
					})
				}
			},
			goMenuPage(url) {
				if (this.isLogin) {
					uni.navigateTo({
						animationType: animationType.type,
						animationDuration: animationType.duration,
						url
					})
				} else {
					this.openAuto()
				}
			},
			// 打开授权
			openAuto() {
				Cache.set(BACK_URL, '')
				toLogin();
			},
			// 去设置页面
			handleUserSetting() {
				if (!this.isLogin) {
					return this.openAuto();
				}
				uni.navigateTo({
					url: '/pages/users/user_setting/index'
				})
			},
			shareApi: function() {
				getShare().then(res => {
					this.$set(this, 'configApi', res.data);
					// #ifdef H5
					this.setOpenShare(res.data);
					// #endif
				})
			},
			// 微信分享；
			setOpenShare: function() {
				let that = this;
				if (that.$wechat.isWeixin()) {
					let configAppMessage = {
						desc: 'crmeb',
						title: 'crmeb',
						link: location.href,
						imgUrl: ''
					};
					that.$wechat.wechatEvevt([
							"updateAppMessageShareData",
							"updateTimelineShareData",
							"onMenuShareAppMessage",
							"onMenuShareTimeline",
						],
						configAppMessage);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.vipicon {
		background-size: 100% 100%;
	}

	/** 原 mt34rpx 为负边距，与 SVIP 条叠用；已去掉 SVIP/积分行后改为正间距，避免压住下方「我的服务」 */
	.order-below-user {
		margin-top: 24rpx;
	}

	.svip-box {
		width: 702rpx;
		background-repeat: no-repeat;
		background-size: 702rpx 128rpx;

		.text {
			color: #FFD89C;
		}
	}

	.num-txt {
		padding: 6rpx 20rpx;
		border-radius: 36rpx;
		background: rgba(255, 255, 255, 0.2);
	}

	page,
	body {
		height: 100%;
		margin: 0;
	}

	.ma .mp-header {
		@include main_bg_color(theme);
	}

	.bg {
		width: 100%;
		background-repeat: no-repeat;
		background-size: 100% 100%;
	}

	.support {
		width: 219rpx;
		height: 74rpx;
		margin: 20rpx auto;
		display: block;
	}

	.new-users {
		display: flex;
		flex-direction: column;
		height: 100%;

		.sys-head {
			position: relative;
			width: 100%;
			background: linear-gradient(90deg, $bg-star1 0%, $bg-end1 100%);

			.sys-title {
				z-index: 10;
				position: relative;
				height: 43px;
				text-align: center;
				line-height: 43px;
				font-size: 36rpx;
				color: #FFFFFF;
			}
		}

		.headBox {
			width: 100%;
			/* 原 492rpx：去掉积分行/轮播后头部变矮，过高仍盖住下方「我的服务」白卡 */
			height: 360rpx;
			z-index: 0;
			@include index-gradient(theme);
		}

		.user-page-content {
			position: relative;
			z-index: 2;
			margin-top: 24rpx;
			padding-top: 8rpx;
			box-sizing: border-box;
		}

		.head {
			width: 100%;
			background-repeat: no-repeat;
			background-size: 100% 100%;

			.user-card {
				width: 100%;
				margin: 0 auto;
				padding: 35rpx 0 40rpx 0;

				.user-info {
					z-index: 20;
					display: flex;
					align-items: center;
					color: #fff;

					.avatar {
						width: 120rpx;
						height: 120rpx;
						border-radius: 50%;
					}

					.app_set {
						color: #fff;
						width: 140rpx;
						height: 92rpx;
						text-align: right;

						.icon-a-ic_setup1 {
							font-size: 40rpx;
						}
					}

					.info {
						flex: 1;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						margin-left: 20rpx;
						padding: 15rpx 0;

						.name {
							display: flex;
							align-items: center;
							gap: 6rpx;
							min-width: 0;
							color: #fff;
							font-size: 31rpx;

							.name-text {
								flex: 0 1 auto;
								min-width: 0;
								max-width: calc(100% - 56rpx - 6rpx);
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
							}

							.vip {
								flex-shrink: 0;
								margin-left: 0;
								width: 56rpx;
								height: 56rpx;

								.vip-img {
									width: 56rpx;
									height: 56rpx;
									display: block;
								}
							}
						}

						.num {
							display: flex;
							align-items: center;
							font-size: 26rpx;
							color: rgba(255, 255, 255, 0.6);

							image {
								width: 22rpx;
								height: 23rpx;
								margin-left: 20rpx;
							}
						}
					}
				}

				.num-wrapper {
					z-index: 30;
					position: relative;
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-top: 30rpx;
					color: #fff;

					.num-item {
						width: 33.33%;
						text-align: center;

						.num {
							font-size: 42rpx;
							font-weight: bold;
						}

						.txt {
							margin-top: 10rpx;
							font-size: 26rpx;
							color: rgba(255, 255, 255, 0.6);
						}
					}
				}

				.sign {
					z-index: 200;
					position: absolute;
					right: -12rpx;
					top: 80rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 120rpx;
					height: 60rpx;
					background: linear-gradient(90deg, rgba(255, 225, 87, 1) 0%, rgba(238, 193, 15, 1) 100%);
					border-radius: 29rpx 4rpx 4rpx 29rpx;
					color: #282828;
					font-size: 28rpx;
					font-weight: bold;
				}
			}

			.order-wrapper {
				background-color: #fff;
				border-radius: 16rpx;
				padding: 30rpx 16rpx;
				position: relative;
				z-index: 11;

				.order-hd {
					justify-content: space-between;
					font-size: 30rpx;
					color: #282828;
					margin-bottom: 40rpx;
					padding: 0 16rpx;

					.left {
						color: #282828;
						font-size: 30rpx;
						font-weight: 600;
					}

					.right {
						align-items: center;
						color: #666666;
						font-size: 26rpx;

						.icon-ic_rightarrow {
							margin-left: 5rpx;
							font-size: 24rpx;
						}
					}
				}

				.order-bd {
					display: flex;
					justify-content: space-between;
					padding: 0;

					.order-item {
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;

						.pic {
							position: relative;
							text-align: center;

							image {
								width: 48rpx;
								height: 48rpx;
							}
						}

						.txt {
							margin-top: 15rpx;
							font-size: 26rpx;
							color: #454545;
						}
					}
				}
			}
		}

		.slider-wrapper {
			margin: 20rpx 0;
			height: 138rpx;

			swiper,
			swiper-item {
				height: 100%;
			}

			image {
				width: 100%;
				height: 100%;
			}
		}

		.user-menus {
			background-color: #fff;

			.menu-title {
				padding: 30rpx 30rpx 40rpx;
				font-size: 30rpx;
				color: #282828;
				font-weight: 600;
			}

			.list-box {
				display: flex;
				flex-wrap: wrap;
				justify-content: flex-start;
				align-content: flex-start;
				padding: 0;
			}

			.item {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-direction: column;
				width: 25%;
				margin-bottom: 47rpx;
				font-size: 26rpx;
				color: #333333;

				image {
					width: 52rpx;
					height: 52rpx;
					margin-bottom: 18rpx;
				}


				&:last-child::before {
					display: none;
				}
			}

			button {
				font-size: 28rpx;
			}

			.menu-icon-wrap {
				width: 52rpx;
				height: 52rpx;
				border-radius: 14rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 18rpx;

				.iconfont {
					font-size: 32rpx;
					color: #fff;
				}
			}

			.icon-doctor-wrap {
				background: var(--view-theme);
			}

			.icon-therapist-wrap {
				background: var(--view-second-theme);
			}

			.icon-patient-wrap {
				background: var(--view-theme);
			}

			.icon-consultation-wrap {
				background: #1890ff;
			}

			.icon-appointment-wrap {
				background: #fa8c16;
			}

			.icon-service-wrap {
				background: #fff;
				border: 1rpx solid #f0f0f0;
				box-sizing: border-box;

				.iconfont {
					color: var(--view-theme);
				}

				.menu-service-icon-img {
					width: 52rpx;
					height: 52rpx;
					margin-bottom: 0;
					border-radius: 8rpx;
				}
			}
		}

		.phone {
			color: #fff;
		}

		.pic_status {
			font-size: 48rpx;
			@include main_color(theme);
		}

		.order-status-num {
			min-width: 13rpx;
			background-color: #fff;
			@include main_color(theme);
			border-radius: 15px;
			position: absolute;
			right: -14rpx;
			top: -15rpx;
			font-size: 20rpx;
			padding: 0 8rpx;
			@include coupons_border_color(theme);
		}

	}

	.sub_btn {
		width: 690rpx;
		height: 86rpx;
		line-height: 86rpx;
		margin-top: 60rpx;
		background: $theme-color;
		border-radius: 43rpx;
		color: #fff;
		font-size: 28rpx;
		text-align: center;
	}

	.merchant-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 20px 15px;
		background-color: #fff;
		border-top-left-radius: 40rpx;
		border-top-right-radius: 40rpx;

		.bottom_border {
			border-bottom: 1px solid #F5F5F5;
		}

		.item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx;

			.icon_color {
				color: #2A7EFB;
			}

			.item_main {
				display: flex;
				align-items: center;

				.item_name {
					margin-left: 20rpx;
					font-weight: 500;
					font-size: 28rpx;
				}
			}

			.item_img {
				width: 60rpx;
				height: 60rpx;
				border-radius: 60rpx;
			}
		}
	}
</style>