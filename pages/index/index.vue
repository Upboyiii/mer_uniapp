<template>
	<view id="home" :data-theme="theme" class="home-page">
		<tui-skeleton v-if="showSkeleton"></tui-skeleton>

		<!-- 有网内容 -->
		<view v-if="!errorNetwork" :style="{ visibility: showSkeleton ? 'hidden' : 'visible' }">
			<!-- 开屏广告 -->
			<advertisement v-if="isShowGuide" :advData="advData" @getShowIndexDiy="getShowIndexDiy"></advertisement>

			<view v-if="showIndexDiy">
				<!-- 自定义导航栏 -->
				<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
					<view class="nav-bar-inner" :style="{ minHeight: navBarContentPx + 'px' }">
						<view class="nav-left" @click="goInstitution">
							<image
								v-if="navLogo"
								class="nav-logo-img"
								:src="navLogo"
								mode="aspectFit"
							></image>
						</view>
						<view class="nav-search" @click="goSearch">
							<text class="iconfont icon-ic_search search-icon"></text>
							<text class="search-placeholder">医生姓名、患者疾病、科室等</text>
						</view>
						<view class="nav-right" @click="goMessage">
							<text class="iconfont icon-ic_message msg-icon"></text>
						</view>
					</view>
				</view>

				<!-- 占位高度：状态栏 + 导航内容区（约 80～90px 整体更紧凑） -->
				<view :style="{ height: (statusBarHeight + navBarContentPx) + 'px' }"></view>

				<!-- Banner区域：双卡片 -->
				<view class="banner-section">
					<view class="banner-card banner-card-left" @click="goMeridian">
						<view class="banner-card-content">
							<view class="banner-tag-row">
								<text class="banner-title-bold">肾经</text>
								<text class="banner-title-light"> 当令</text>
							</view>
							<view class="banner-info-row">
								<text class="banner-info-label red">忌</text>
								<text class="banner-info-text">争吵、情绪激动</text>
							</view>
							<view class="banner-info-row">
								<text class="banner-info-label green">宜</text>
								<text class="banner-info-text">放松、饮水</text>
							</view>
						</view>
						<image class="banner-card-img" src="/static/images/meridian.png" mode="aspectFit"></image>
					</view>
					<view class="banner-card banner-card-right" @click="goTongue">
						<view class="banner-card-content banner-card-right-inner">
							<view class="banner-title-row">
								<text class="iconfont icon-ic_camera2 banner-inline-icon"></text>
								<text class="banner-title-bold">智能舌诊</text>
							</view>
							<text class="banner-subtitle">身体状况早知道</text>
							<view class="banner-tongue-icon-wrap">
								<text class="iconfont icon-ic_picture banner-tongue-deco"></text>
							</view>
						</view>
					</view>
				</view>

				<!-- 特色门诊 -->
				<view class="clinic-section">
					<view class="section-title">特色门诊</view>
					<view class="clinic-grid">
						<view class="clinic-card" v-for="(item, idx) in clinicList" :key="idx" @click="goClinicDetail(item)">
							<view class="clinic-card-text">
								<view class="clinic-name-row" v-if="item.showTitleIcon">
									<text class="iconfont clinic-title-icon" :class="item.titleIcon"></text>
									<text class="clinic-card-name">{{ item.name }}</text>
								</view>
								<text v-else class="clinic-card-name">{{ item.name }}</text>
								<text class="clinic-card-desc">{{ item.desc }}</text>
							</view>
							<view class="clinic-card-icon" :class="'clinic-icon-' + idx">
								<text class="iconfont" :class="item.icon"></text>
							</view>
						</view>
					</view>
				</view>

				<!-- Tab区域：名医专家 / 理疗专区 / 平台商城 -->
				<view class="tab-section">
					<view class="tab-bar" :class="{ 'tab-bar-sticky': isTabSticky }">
						<view
							class="tab-item"
							:class="{ active: currentTab === index }"
							v-for="(tab, index) in tabList"
							:key="index"
							@click="switchContentTab(index)"
						>
							<text>{{ tab }}</text>
							<view v-if="currentTab === index" class="tab-line"></view>
						</view>
					</view>

					<!-- 名医专家 -->
					<view v-if="currentTab === 0" class="tab-content">
						<view v-if="doctorList.length > 0" class="doctor-list">
							<view
								class="doctor-card"
								v-for="(doc, index) in doctorList"
								:key="doc.id || index"
								@click="goDoctorDetail(doc)"
							>
								<view class="doc-avatar-wrap">
									<view class="doc-avatar-circle">
										<easy-loadimage
											class="doc-avatar-easy"
											:image-src="doctorAvatarSrc(doc)"
											mode="aspectFill"
											width="110rpx"
											height="110rpx"
											radius="50%"
										/>
									</view>
									<view v-if="doc.onlineStatus === 1" class="online-badge">
										<text>接诊中</text>
									</view>
								</view>
								<view class="doc-info">
									<view class="doc-name-row">
										<text class="doc-name">{{ doc.name }}</text>
										<text v-if="doc.hospitalTitle" class="doc-title-tag">{{ doc.hospitalTitle }}</text>
									</view>
									<view class="doc-hospital-wrap">
										<view class="doc-hospital line2" v-if="doc.hospitalName || doc.hospitalSub">
											<text v-if="doc.hospitalName">{{ doc.hospitalName }}</text>
											<text v-if="doc.hospitalSub"> · {{ doc.hospitalSub }}</text>
											<text v-if="doc.hospitalLevel" class="hospital-level">{{ doc.hospitalLevel }}</text>
										</view>
									</view>
									<view class="doc-domain" v-if="doc.hospitalDomain">
										<text>擅长：{{ doc.hospitalDomain }}</text>
									</view>
									<view class="doc-stats-row">
										<view class="doc-stat" v-if="hasStat(doc.score)">
											<text class="doc-stat-val">{{ formatScore(doc.score) }}</text>
											<text class="doc-stat-label">评分</text>
										</view>
										<view class="doc-stat" v-if="hasStat(doc.treatNum)">
											<text class="doc-stat-val">{{ doc.treatNum }}</text>
											<text class="doc-stat-label">已治疗</text>
										</view>
										<view class="doc-stat" v-if="hasStat(doc.responseTime)">
											<text class="doc-stat-val">{{ doc.responseTime }}min</text>
											<text class="doc-stat-label">响应</text>
										</view>
									</view>
									<view class="doc-actions">
										<view class="action-btn action-text" v-if="doc.textPrice" @click.stop="goConsult(doc, 'text')">
											<text class="iconfont icon-ic_edit"></text>
											<text>图文 ¥{{ doc.textPrice }}</text>
										</view>
										<view class="action-btn action-video" v-if="doc.videoPrice" @click.stop="goConsult(doc, 'video')">
											<text class="iconfont icon-ic_video"></text>
											<text>视频 ¥{{ doc.videoPrice }}</text>
										</view>
									</view>
								</view>
							</view>
						</view>
						<view v-if="doctorList.length === 0 && !doctorLoading" class="empty-state">
							<emptyPage title="暂无名医数据~" mTop="0" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></emptyPage>
						</view>
						<view v-if="doctorLoading" class="loading-tip"><text>加载中...</text></view>
					</view>

					<!-- 理疗专区 -->
					<view v-if="currentTab === 1" class="tab-content">
						<view v-if="therapistList.length > 0" class="therapist-list">
							<view
								class="therapist-card"
								v-for="(item, index) in therapistList"
								:key="item.id || index"
								@click="goTherapistDetail(item)"
							>
								<view class="therapist-avatar-wrap">
									<easy-loadimage
										class="therapist-avatar-easy"
										:image-src="therapistAvatarSrc(item)"
										mode="aspectFill"
										width="110rpx"
										height="110rpx"
										radius="50%"
									/>
								</view>
								<view class="therapist-info">
									<view class="therapist-name">{{ item.name }}</view>
									<view class="therapist-domain line1" v-if="item.hospitalDomain">擅长：{{ item.hospitalDomain }}</view>
									<view class="therapist-stats">
										<text v-if="item.score" class="t-stat">{{ item.score }} 评分</text>
										<text v-if="item.treatNum" class="t-stat">{{ item.treatNum }} 已服务</text>
									</view>
								</view>
								<view class="therapist-action">
									<view class="book-btn" @click.stop="goBookTherapist(item)">预约</view>
								</view>
							</view>
						</view>
						<view v-if="therapistList.length === 0 && !therapistLoading" class="empty-state">
							<emptyPage title="暂无理疗师~" mTop="0" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></emptyPage>
						</view>
						<view v-if="therapistLoading" class="loading-tip"><text>加载中...</text></view>
					</view>

					<!-- 平台商城 -->
					<view v-if="currentTab === 2" class="tab-content">
						<!-- 商品分类 -->
						<view class="mall-cate-bar" v-if="categoryList.length > 0">
							<scroll-view scroll-x class="mall-cate-scroll">
								<view class="mall-cate-list">
									<view
										class="mall-cate-item"
										:class="{ active: currentCateId === 0 }"
										@click="switchMallCate(0, '全部')"
									>
										<text>全部</text>
									</view>
									<view
										class="mall-cate-item"
										:class="{ active: currentCateId === item.id }"
										v-for="item in categoryList"
										:key="item.id"
										@click="switchMallCate(item.id, item.name)"
									>
										<text>{{ item.name }}</text>
									</view>
								</view>
							</scroll-view>
						</view>
						<view v-if="mallProductList.length > 0" class="mall-product-grid">
							<view
								class="mall-product-card"
								v-for="(item, index) in mallProductList"
								:key="index"
								@click="goProductDetail(item)"
							>
								<view class="mall-product-img">
									<easy-loadimage
										:image-src="item.image || defaultGoodsPlaceholder"
										mode="aspectFill"
										width="100%"
										height="320rpx"
										radius="0"
									/>
								</view>
								<view class="mall-product-info">
									<view class="mall-product-name line2">{{ item.name }}</view>
									<view class="mall-product-price">
										<text class="price-sym">¥</text>
										<text class="price-val">{{ item.price }}</text>
									</view>
								</view>
							</view>
						</view>
						<view v-if="mallProductList.length === 0 && !mallLoading" class="empty-state">
							<emptyPage title="暂无商品~" mTop="0" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></emptyPage>
						</view>
						<view v-if="mallLoading" class="loading-tip"><text>加载中...</text></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 断网内容 -->
		<view v-if="errorNetwork">
			<view class="error-network">
				<image class="img" src="./error-network.png"></image>
				<view class="title">网络连接断开</view>
				<view class="con">
					<view class="label">请检查情况：</view>
					<view class="item">· 在设置中是否已开启网络权限</view>
					<view class="item">· 当前是否处于弱网环境</view>
					<view class="item">· 版本是否过低，升级试试吧</view>
				</view>
				<view class="btn" @click="reconnect">重新连接</view>
			</view>
		</view>

		<!-- #ifdef H5 -->
		<view v-show="(globalData.authorizeFilingNum || globalData.authorizeInfo) && !isShowGuide" class="mt-40 mb-40rpx">
			<view @click="toInternet" class="text-center text-24rpx text--w111-666 mb-24">{{ globalData.authorizeFilingNum }}</view>
			<view class="text-center text-24rpx text--w111-666">{{ globalData.authorizeInfo }}</view>
		</view>
		<!-- #endif -->

		<view v-if="bottomNavigationIsCustom && !isShowGuide" class="footerBottom"></view>
		<page-footer v-show="!isShowGuide" :guidePages="guidePages"></page-footer>
		<coupon-dialog :urlDomain="urlDomain" v-if="couponModal" :couponModal="couponModal" @on-close="closeDialog"></coupon-dialog>
	</view>
</template>

<script>
import Cache from '../../utils/cache';
import advertisement from '../guide/guide.vue';
import tuiSkeleton from '@/components/base/tui-skeleton.vue';
import pageFooter from '@/components/pageFooter/index.vue';
import emptyPage from '@/components/emptyPage.vue';
import easyLoadimage from '@/components/base/easy-loadimage.vue';
import couponDialog from "../../subPackage/pages/diyPage/couponDialog";
import { getIndexData, getAppVersion, getOpenAdvApi } from '@/api/api.js';
import { getCategoryFirst } from '@/api/api.js';
import { getDoctorListApi } from '@/api/clinic.js';
import { getTherapistPageListApi } from '@/api/clinic.js';
import { getProductHot } from '@/api/product.js';
// #ifdef MP-WEIXIN || APP-PLUS
import { getTemlIds } from '@/api/api.js';
// #endif
import { mapGetters } from "vuex";
import { silenceBindingSpread } from '@/utils/index.js';
import animationType from '@/utils/animationType.js';
import onShare from "@/mixins/onShare";

const arrTemp = ["beforePay", "afterPay", "createBargain", "pink"];
let app = getApp();

export default {
	mixins: [onShare],
	computed: {
		...mapGetters(['isLogin', 'uid', 'globalData', 'bottomNavigationIsCustom', 'isAdvertisement']),
		isShowGuide() {
			return this.guidePages && this.isAdvertisement;
		},
		/** login/config：优先 logo，其次 mobileLoginLogo（同一接口） */
		navLogo() {
			const g = this.globalData || {};
			return g.logo || g.mobileLoginLogo || '';
		},
		/** 与「我的」页一致：默认用户头像（CDN presets/morenT.png） */
		defaultAvatarPlaceholder() {
			const raw = this.urlDomain || this.$Cache.get('imgHost') || '';
			if (!raw) return '';
			const host = raw.replace(/\/?$/, '/');
			return `${host}crmebimage/presets/morenT.png`;
		},
		/** 商品无图占位（与秒杀列表等一致） */
		defaultGoodsPlaceholder() {
			const raw = this.urlDomain || this.$Cache.get('imgHost') || '';
			if (!raw) return '';
			const host = raw.replace(/\/?$/, '/');
			return `${host}crmebimage/presets/noShopper.png`;
		}
	},
	components: {
		tuiSkeleton,
		pageFooter,
		advertisement,
		couponDialog,
		emptyPage,
		easyLoadimage
	},
	data() {
		return {
			urlDomain: this.$Cache.get("imgHost"),
			showSkeleton: true,
			theme: this.$Cache.get('theme'),
			statusBarHeight: 0,
			/** 导航栏内容区高度（px，不含状态栏），与整体约 80～90px 头部视觉协调 */
			navBarContentPx: 42,
			couponModal: false,
			errorNetwork: false,
			guidePages: false,
			advData: [],
			showIndexDiy: false,
			isTabSticky: false,

			// 特色门诊（AI 项名称前增加与右侧一致的图标）
			clinicList: [
				{ name: '失眠专病门诊', desc: '无忧入睡', icon: 'icon-ic_clock', link: '' },
				{ name: '调养专病门诊', desc: '中医治根本', icon: 'icon-ic_leaf', link: '' },
				{ name: '肥胖专病门诊', desc: '轻松享瘦', icon: 'icon-ic_crown', link: '' },
				{ name: 'AI特色门诊', desc: '快速高效', icon: 'icon-ic_xuni', link: '', showTitleIcon: true, titleIcon: 'icon-ic_xuni' }
			],

			// Tab
			tabList: ['名医专家', '理疗专区', '平台商城'],
			currentTab: 0,

			// 名医专家
			doctorList: [],
			doctorLoading: false,
			doctorLoadend: false,
			doctorPage: 1,

			// 理疗专区
			therapistList: [],
			therapistLoading: false,
			therapistLoadend: false,
			therapistPage: 1,

			// 平台商城
			categoryList: [],
			currentCateId: 0,
			mallProductList: [],
			mallLoading: false,
			mallLoadend: false,
			mallPage: 1,
			mallLimit: 20
		};
	},
	onLoad(options) {
		const sysInfo = uni.getSystemInfoSync();
		this.statusBarHeight = sysInfo.statusBarHeight || 20;

		if (!this.isAdvertisement) this.showIndexDiy = true;
		this.loadExecution();
		// #ifdef APP-PLUS
		this.snycNetWork();
		this.appVersionConfig();
		// #endif
		this.getOptionData(options);
		this.getIndexConfig();
		// #ifdef MP || APP-PLUS
		this.getTemlIds();
		// #endif

		this.loadTabData(0);
	},
	onShow() {
		let self = this;
		// #ifdef APP-PLUS
		setTimeout(() => {
			if (self.appUpdate && self.appUpdate.openUpgrade == 'true') {
				self.appVersionConfig();
			}
		}, 1000);
		// #endif
		let newGift = self.$Cache.get('newGift') ? JSON.parse(self.$Cache.get('newGift')) : [];
		self.couponModal = newGift.length ? true : false;
		// 确保 login/config 已写入 globalData（与 App 启动竞态时补拉一次）
		if (!self.navLogo) {
			self.$store.dispatch('GetLoginConfig');
		}
	},
	onPageScroll(e) {
		uni.$emit('scroll');
		this.isTabSticky = e.scrollTop > 600;
	},
	onPullDownRefresh() {
		this.refreshCurrentTab();
		// #ifdef APP-PLUS
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 1000);
		// #endif
	},
	onReachBottom() {
		this.loadMoreCurrentTab();
	},
	methods: {
		// ==================== Tab 切换 ====================
		switchContentTab(index) {
			if (this.currentTab === index) return;
			this.currentTab = index;
			this.loadTabData(index);
		},

		loadTabData(index) {
			if (index === 0 && this.doctorList.length === 0) {
				this.getDoctorList();
			} else if (index === 1 && this.therapistList.length === 0) {
				this.getTherapistList();
			} else if (index === 2 && this.mallProductList.length === 0) {
				this.getCategoryList();
				this.getMallProductList();
			}
		},

		refreshCurrentTab() {
			if (this.currentTab === 0) {
				this.doctorPage = 1;
				this.doctorLoadend = false;
				this.doctorList = [];
				this.getDoctorList();
			} else if (this.currentTab === 1) {
				this.therapistPage = 1;
				this.therapistLoadend = false;
				this.therapistList = [];
				this.getTherapistList();
			} else if (this.currentTab === 2) {
				this.mallPage = 1;
				this.mallLoadend = false;
				this.mallProductList = [];
				this.getMallProductList();
			}
			uni.stopPullDownRefresh();
		},

		loadMoreCurrentTab() {
			if (this.currentTab === 0) this.getDoctorList();
			else if (this.currentTab === 1) this.getTherapistList();
			else if (this.currentTab === 2) this.getMallProductList();
		},

		// ==================== 名医专家 ====================
		getDoctorList() {
			if (this.doctorLoadend || this.doctorLoading) return;
			this.doctorLoading = true;
			getDoctorListApi({ page: this.doctorPage, limit: 10 })
				.then(res => {
					let list = (res.data && res.data.list) || [];
					if (list.length < 10) this.doctorLoadend = true;
					this.doctorList = this.doctorList.concat(list);
					this.doctorPage++;
					this.doctorLoading = false;
				})
				.catch(() => {
					this.doctorLoading = false;
				});
		},

		goDoctorDetail(doc) {
			this.$util.navigateTo(`/pages/clinic/doctor/detail?id=${doc.id}`);
		},

		goConsult(doc, type) {
			if (!this.isLogin) {
				return this.$util.navigateTo('/pages/users/login/index');
			}
			if (doc.onlineStatus !== 1) {
				return this.$util.Tips({ title: '医生当前离线' });
			}
			this.$util.navigateTo(`/pages/clinic/doctor/detail?id=${doc.id}`);
		},

		// ==================== 理疗专区 ====================
		getTherapistList() {
			if (this.therapistLoadend || this.therapistLoading) return;
			this.therapistLoading = true;
			getTherapistPageListApi({ page: this.therapistPage, limit: 10 })
				.then(res => {
					let list = (res.data && res.data.list) || [];
					if (list.length < 10) this.therapistLoadend = true;
					this.therapistList = this.therapistList.concat(list);
					this.therapistPage++;
					this.therapistLoading = false;
				})
				.catch(() => {
					this.therapistLoading = false;
				});
		},

		goTherapistDetail(item) {
			if (item.mchId) {
				this.$util.navigateTo(`/pages/clinic/therapist/index?mchId=${item.mchId}`);
			}
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
		},

		// ==================== 平台商城 ====================
		getCategoryList() {
			getCategoryFirst().then(res => {
				this.categoryList = res.data || [];
			}).catch(() => {});
		},

		getMallProductList() {
			if (this.mallLoadend || this.mallLoading) return;
			this.mallLoading = true;
			// /api/front/index/product/list：cid 一级分类 id，全部传 "0"；page、limit 分页
			const params = {
				cid: String(this.currentCateId || 0),
				page: this.mallPage,
				limit: this.mallLimit
			};
			getProductHot(params)
				.then(res => {
					const data = res.data || {};
					let list = data.list || [];
					if (!Array.isArray(list)) list = [];
					const rawTotal = data.totalPage;
					const totalPage =
						rawTotal != null && rawTotal !== ''
							? Math.max(1, parseInt(rawTotal, 10) || 1)
							: null;
					this.mallProductList = this.mallProductList.concat(list);
					this.mallPage++;
					if (list.length === 0) {
						this.mallLoadend = true;
					} else if (totalPage != null) {
						this.mallLoadend = this.mallPage > totalPage;
					} else {
						this.mallLoadend = list.length < this.mallLimit;
					}
					this.mallLoading = false;
				})
				.catch(() => {
					this.mallLoading = false;
				});
		},

		switchMallCate(id, name) {
			if (this.currentCateId === id) return;
			this.currentCateId = id;
			this.mallPage = 1;
			this.mallLoadend = false;
			this.mallProductList = [];
			this.getMallProductList();
		},

		goProductDetail(item) {
			if (item.id) {
				this.$util.navigateTo(`/pages/goods/goods_details/index?id=${item.id}`);
			}
		},

		// ==================== 导航跳转 ====================
		goSearch() {
			this.$util.navigateTo('/pages/goods/goods_search/index');
		},

		goMessage() {
			if (!this.isLogin) {
				return this.$util.navigateTo('/pages/users/login/index');
			}
			this.$util.navigateTo('/pages/users/user_message/index');
		},

		goInstitution() {},

		goMeridian() {},

		goTongue() {
			uni.switchTab({ url: '/pages/tongue/index' });
		},

		goClinicDetail(item) {
			if (item.link) {
				this.$util.navigateTo(item.link);
			}
		},

		/** 无头像或空串时用默认用户图（morenT），与「我的」一致 */
		doctorAvatarSrc(doc) {
			const p = doc && doc.picture;
			if (p != null && String(p).trim() !== '') {
				return String(p).trim();
			}
			return this.defaultAvatarPlaceholder;
		},
		therapistAvatarSrc(item) {
			const p = item && item.picture;
			if (p != null && String(p).trim() !== '') {
				return String(p).trim();
			}
			return this.defaultAvatarPlaceholder;
		},

		/** 与名医列表页一致：接口有效值才展示 */
		hasStat(val) {
			if (val === null || val === undefined || val === '') return false;
			if (typeof val === 'number') return val > 0;
			return String(val).trim() !== '';
		},
		formatScore(score) {
			if (score === null || score === undefined || score === '') return '';
			const n = Number(score);
			if (!Number.isFinite(n)) return String(score);
			return n <= 5 ? n.toFixed(1) : String(score);
		},

		// ==================== 原有逻辑保留 ====================
		getShowIndexDiy() {
			this.showIndexDiy = true;
			this.guidePages = false;
		},

		loadExecution() {
			const tagDate = uni.getStorageSync('guideDate') || 0;
			const nowDate = new Date().getTime();
			getOpenAdvApi().then(res => {
				if (res.data.splashAdSwitch == 0 || res.data.adList.length == 0) {
					this.showIndexDiy = true;
				} else if (res.data.splashAdSwitch == 1 && res.data.adList.length) {
					this.advData = res.data;
					uni.hideTabBar();
					let intervalTime = parseFloat(res.data.splashAdShowInterval) * 60 * 60 * 1000 || 0;
					uni.setStorageSync('intervalTime', intervalTime);
					uni.setStorageSync('guideDate', new Date().getTime());
					if ((nowDate - tagDate) <= uni.getStorageSync('intervalTime')) {
						this.showIndexDiy = true;
						this.guidePages = false;
						return;
					}
					this.guidePages = true;
				} else {
					this.showIndexDiy = true;
					this.guidePages = false;
				}
			}).catch(() => {
				this.showIndexDiy = true;
			});
		},

		getOptionData(options) {
			if (options.hasOwnProperty('id') || options.scene) {
				if (options.scene) {
					let value = this.$util.getUrlParams(decodeURIComponent(options.scene));
					if (value.sd) this.$store.commit('Change_Spread', value.sd);
					silenceBindingSpread(this.isLogin, value.sd);
				} else {
					if (options.sd) this.$store.commit('Change_Spread', options.sd);
					silenceBindingSpread(this.isLogin, options.sd);
				}
			}
		},

		toInternet() {
			window.open('https://beian.miit.gov.cn/#/Integrated/index');
		},

		snycNetWork() {
			uni.getNetworkType({
				success: res => {
					this.errorNetwork = res.networkType === 'none';
					if (this.errorNetwork) this.reloadData();
				}
			});
		},

		reconnect() {
			uni.getNetworkType({
				success: res => {
					this.errorNetwork = res.networkType === 'none';
					if (!this.errorNetwork) {
						setTimeout(() => {
							this.$util.navigateTo('/pages/index/index');
						}, 1000);
					}
				}
			});
		},

		reloadData() {
			this.showSkeleton = false;
		},

		getIndexConfig() {
			getIndexData().then(res => {
				let imgHost = res.data.logoUrl.split('crmebimage')[0];
				this.$Cache.set('imgHost', imgHost + '/');
				// #ifdef H5 || APP-PLUS
				this.$store.commit("SET_CHATURL", res.data.yzfUrl);
				Cache.set('chatUrl', res.data.yzfUrl);
				// #endif
				Cache.setItem({
					name: 'platChatConfig',
					value: {
						servicePhone: res.data.consumerHotline,
						serviceLink: res.data.consumerH5Url,
						serviceType: res.data.consumerType
					}
				});
				this.reloadData();
			}).catch(err => {
				this.reloadData();
				return this.$util.Tips({ title: err });
			});
		},

		appVersionConfig() {
			getAppVersion().then(res => {
				this.appUpdate = res.data || {};
				// #ifdef APP-PLUS
				plus.runtime.getProperty(plus.runtime.appid, (inf) => {
					let nowVersion = (inf.version).split('.').join('');
					let appVersion = (res.data.appVersion).split('.').join('');
					uni.getSystemInfo({
						success: (sysRes) => {
							if (appVersion > nowVersion) {
								uni.showModal({
									title: '更新提示',
									content: '发现新版本，是否前去下载?',
									showCancel: this.appUpdate.openUpgrade == '1',
									success: (response) => {
										if (response.confirm) {
											let url = sysRes.platform === 'ios' ? this.appUpdate.iosAddress : this.appUpdate.androidAddress;
											plus.runtime.openURL(sysRes.platform === 'ios' ? encodeURI(url) : url);
										}
									}
								});
							}
						}
					});
				});
				// #endif
			}).catch(() => {});
		},

		// #ifdef MP || APP-PLUS
		getTemlIds() {
			for (var i in arrTemp) {
				this.getTem(arrTemp[i]);
			}
		},
		getTem(data) {
			getTemlIds({ type: data }).then(res => {
				if (res.data) {
					let arr = res.data.map(item => item.tempId);
					wx.setStorageSync('tempID' + data, arr);
				}
			});
		},
		// #endif

		closeDialog() {
			this.couponModal = false;
			this.$Cache.clear('newGift');
		}
	},
	onHide() {
		this.guidePages = false;
	}
};
</script>

<style>
page {
	height: auto;
	display: flex;
	flex-direction: column;
	background-color: #f5f5f5;
}
</style>

<style lang="scss" scoped>
@import '../../static/css/theme.scss';

.home-page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* ==================== 导航栏 ==================== */
.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 999;
	@include index-gradient(linear-gradient(270deg, #E93323 0%, #F5F5F5 100%));
}

.nav-bar-inner {
	display: flex;
	align-items: center;
	padding: 0 12rpx;
	box-sizing: border-box;
}

.nav-left {
	flex-shrink: 0;
	margin-right: 8rpx;
	width: 100rpx;
	height: 52rpx;
	display: flex;
	align-items: center;
	justify-content: flex-start;
}

.nav-logo-img {
	width: 100rpx;
	height: 52rpx;
}

.nav-search {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	height: 56rpx;
	background: rgba(255, 255, 255, 0.85);
	border-radius: 28rpx;
	padding: 0 16rpx;
}

.search-icon {
	font-size: 28rpx;
	color: #999;
	margin-right: 10rpx;
}

.search-placeholder {
	font-size: 24rpx;
	color: #999;
}

.nav-right {
	flex-shrink: 0;
	margin-left: 8rpx;
	width: 52rpx;
	height: 52rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.msg-icon {
	font-size: 36rpx;
	color: #fff;
}

/* ==================== Banner 双卡片 ==================== */
.banner-section {
	display: flex;
	padding: 20rpx 24rpx;
	gap: 16rpx;
}

.banner-card {
	flex: 1;
	border-radius: 20rpx;
	padding: 24rpx;
	position: relative;
	overflow: hidden;
	min-height: 180rpx;
}

.banner-card-left {
	background: var(--view-main-rgba);
	border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.banner-card-right {
	background: var(--view-main-rgba);
	border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.banner-card-right-inner {
	padding-right: 8rpx;
}

.banner-title-row {
	display: flex;
	align-items: center;
	gap: 10rpx;
	margin-bottom: 8rpx;
}

.banner-inline-icon {
	font-size: 36rpx;
	color: var(--view-theme);
}

.banner-tongue-icon-wrap {
	margin-top: 12rpx;
}

.banner-tongue-deco {
	font-size: 56rpx;
	color: var(--view-second-theme);
	opacity: 0.85;
}

.banner-card-content {
	position: relative;
	z-index: 2;
}

.banner-tag-row {
	margin-bottom: 16rpx;
}

.banner-title-bold {
	font-size: 32rpx;
	font-weight: 700;
	color: #282828;
}

.banner-title-light {
	font-size: 28rpx;
	color: #666;
}

.banner-subtitle {
	display: block;
	font-size: 22rpx;
	color: #666;
	margin-top: 8rpx;
}

.banner-info-row {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.banner-info-label {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36rpx;
	height: 36rpx;
	border-radius: 8rpx;
	font-size: 20rpx;
	color: #fff;
	margin-right: 10rpx;
	flex-shrink: 0;

	&.red {
		background: #E8886B;
	}

	&.green {
		background: #7FB069;
	}
}

.banner-info-text {
	font-size: 22rpx;
	color: #666;
}

.banner-card-img {
	position: absolute;
	right: 8rpx;
	bottom: 8rpx;
	width: 120rpx;
	height: 120rpx;
	opacity: 0.6;
}

.banner-card-img-right {
	position: absolute;
	right: 12rpx;
	bottom: 12rpx;
	width: 100rpx;
	height: 100rpx;
	opacity: 0.7;
}

/* ==================== 特色门诊 ==================== */
.clinic-section {
	padding: 20rpx 24rpx 0;
}

.section-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #333;
	margin-bottom: 20rpx;
}

.clinic-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
}

.clinic-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #fff;
	border-radius: 20rpx;
	padding: 28rpx 20rpx;
	min-height: 140rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.clinic-card-text {
	flex: 1;
}

.clinic-card-name {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 8rpx;
}

.clinic-card-desc {
	display: block;
	font-size: 22rpx;
	color: #999;
}

.clinic-name-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 8rpx;
}

.clinic-title-icon {
	font-size: 30rpx;
	color: var(--view-theme);
}

.clinic-card-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-left: 12rpx;
	background: var(--view-main-rgba);

	.iconfont {
		font-size: 40rpx;
		color: var(--view-theme);
	}
}

/* ==================== Tab 区域 ==================== */
.tab-section {
	margin-top: 30rpx;
}

.tab-bar {
	display: flex;
	align-items: center;
	padding: 0 24rpx;
	background: #f5f5f5;
	border-bottom: 1rpx solid #eee;
	position: sticky;
	top: 0;
	z-index: 100;
}

.tab-bar-sticky {
	background: #fff;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.tab-item {
	position: relative;
	padding: 24rpx 0;
	margin-right: 48rpx;
	font-size: 30rpx;
	color: #999;
	font-weight: 500;
	transition: color 0.2s;

	&.active {
		color: #333;
		font-weight: 700;
		font-size: 32rpx;
	}
}

.tab-line {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 40rpx;
	height: 6rpx;
	border-radius: 3rpx;
	background: var(--view-theme);
}

.tab-content {
	padding: 16rpx 24rpx 0;
	min-height: 400rpx;
}

/* ==================== 名医专家 ==================== */
.doctor-list {
	padding-bottom: 20rpx;
}

.doctor-card {
	display: flex;
	align-items: flex-start;
	background: #fff;
	border-radius: 20rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}

.doc-avatar-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex-shrink: 0;
	margin-right: 20rpx;
	min-width: 110rpx;
}

.doc-avatar-circle {
	width: 110rpx;
	height: 110rpx;
	border-radius: 50%;
	overflow: hidden;
	background: #f0f0f0;
	flex-shrink: 0;
}

.doc-avatar-easy {
	width: 110rpx;
	height: 110rpx;
	border-radius: 50%;
	overflow: hidden;
}

.online-badge {
	margin-top: 8rpx;
	align-self: center;
	background: #52c41a;
	color: #fff;
	font-size: 18rpx;
	padding: 4rpx 10rpx;
	border-radius: 8rpx;
	white-space: nowrap;
	line-height: 1.2;
	text-align: center;
}

.doc-info {
	flex: 1;
	overflow: hidden;
}

.doc-name-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 6rpx;
}

.doc-name {
	font-size: 32rpx;
	font-weight: 700;
	color: #282828;
}

.doc-title-tag {
	font-size: 22rpx;
	color: var(--view-theme);
	background: var(--view-main-rgba);
	padding: 2rpx 12rpx;
	border-radius: 6rpx;
	flex-shrink: 0;
}

.doc-hospital-wrap {
	margin-bottom: 8rpx;
}

.doc-hospital {
	font-size: 24rpx;
	color: #666;
	line-height: 1.5;
}

.hospital-level {
	display: inline-block;
	@include main_bg_color($main-color-theme1);
	color: #fff;
	font-size: 20rpx;
	padding: 2rpx 10rpx;
	border-radius: 6rpx;
	margin-right: 8rpx;
}

.doc-domain {
	font-size: 24rpx;
	color: #999;
	line-height: 1.5;
	margin-bottom: 10rpx;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.doc-stats-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 24rpx;
	margin-bottom: 14rpx;
}

.doc-stat {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.doc-stat-val {
	font-size: 24rpx;
	font-weight: 600;
	color: var(--view-second-theme);
}

.doc-stat-label {
	font-size: 20rpx;
	color: #999;
}

.doc-actions {
	display: flex;
	gap: 16rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	padding: 10rpx 24rpx;
	border-radius: 28rpx;
	font-size: 24rpx;

	.iconfont {
		font-size: 24rpx;
		margin-right: 6rpx;
	}
}

.action-text {
	background: var(--view-main-rgba);
	color: var(--view-theme);
	border: 1rpx solid var(--view-theme);
}

.action-video {
	background: var(--view-coupons-light-color);
	color: var(--view-second-theme);
	border: 1rpx solid var(--view-second-theme);
}

/* ==================== 理疗专区 ==================== */
.therapist-list {
	padding-bottom: 20rpx;
}

.therapist-card {
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 20rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}

.therapist-avatar-wrap {
	flex-shrink: 0;
	margin-right: 20rpx;
}

.therapist-avatar-easy {
	width: 110rpx;
	height: 110rpx;
	border-radius: 50%;
	overflow: hidden;
}

.therapist-info {
	flex: 1;
	overflow: hidden;
}

.therapist-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #282828;
	margin-bottom: 8rpx;
}

.therapist-domain {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 8rpx;
	line-height: 1.4;
}

.therapist-stats {
	display: flex;
	gap: 20rpx;
}

.t-stat {
	font-size: 22rpx;
	@include second_color($second-color-theme1);
	font-weight: 500;
}

.therapist-action {
	flex-shrink: 0;
	margin-left: 16rpx;
}

.book-btn {
	padding: 14rpx 36rpx;
	@include main_bg_color($main-color-theme1);
	color: #fff;
	font-size: 26rpx;
	border-radius: 30rpx;
	font-weight: 500;
}

/* ==================== 平台商城 ==================== */
.mall-cate-bar {
	margin-bottom: 16rpx;
}

.mall-cate-scroll {
	white-space: nowrap;
}

.mall-cate-list {
	display: inline-flex;
	gap: 12rpx;
}

.mall-cate-item {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 28rpx;
	border-radius: 28rpx;
	font-size: 26rpx;
	color: #666;
	background: #fff;
	flex-shrink: 0;
	border: 1rpx solid #f0f0f0;

	&.active {
		@include main_bg_color($main-color-theme1);
		color: #fff;
		border-color: transparent;
		font-weight: 600;
	}
}

.mall-product-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	padding-bottom: 20rpx;
}

.mall-product-card {
	width: calc(50% - 8rpx);
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.mall-product-img {
	width: 100%;
	height: 320rpx;
	overflow: hidden;
	background: #eee;
}

.mall-product-info {
	padding: 16rpx 20rpx 20rpx;
}

.mall-product-name {
	font-size: 26rpx;
	color: #282828;
	line-height: 1.4;
	margin-bottom: 12rpx;
	min-height: 72rpx;
}

.mall-product-price {
	display: flex;
	align-items: baseline;
}

.price-sym {
	font-size: 24rpx;
	font-weight: 600;
	@include price_color($price-color-theme1);
}

.price-val {
	font-size: 36rpx;
	font-weight: 600;
	@include price_color($price-color-theme1);
}

/* ==================== 公共 ==================== */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 400rpx;
	padding: 40rpx 0;
}

.loading-tip {
	text-align: center;
	padding: 30rpx 0;
	font-size: 24rpx;
	color: #999;
}

.error-network {
	position: fixed;
	left: 0;
	top: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	height: 100%;
	padding-top: 30%;
	background: #fff;

	.img {
		width: 414rpx;
		height: 336rpx;
	}

	.title {
		position: relative;
		top: -40rpx;
		font-size: 32rpx;
		color: #666;
	}

	.con {
		font-size: 24rpx;
		color: #999;

		.label { margin-bottom: 20rpx; }
		.item { margin-bottom: 20rpx; }
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 508rpx;
		height: 86rpx;
		margin-top: 100rpx;
		border: 1px solid var(--view-theme);
		color: var(--view-theme);
		font-size: 30rpx;
		border-radius: 120rpx;
	}
}
</style>
