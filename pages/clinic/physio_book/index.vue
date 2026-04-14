<template>
	<view class="physio-book-page" :data-theme="theme">
		<!-- 自定义顶栏：返回 + 门店名（去掉搜索） -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-row-top">
				<view class="nav-back" @click="goBack">
					<text class="iconfont icon-ic_leftarrow"></text>
				</view>
				<text class="nav-store-title line1">{{ storeTitle }}</text>
				<view class="nav-back nav-back--ph"></view>
			</view>
		</view>

		<scroll-view scroll-y class="page-scroll" :style="{ paddingTop: navTotalPx + 'px' }">
			<!-- 参考稿：顶部「安心购」横幅 -->
			<view class="banner-peace">
				<text class="banner-peace-txt">
					安心购 未服务全额退 · 违约包赔 · 不满意可随时退 · 全场保障
				</text>
			</view>

			<!-- 天气 + 地址（同一张白卡片） -->
			<view class="card card-addr-merge">
				<view class="weather-in-card">
					<view class="weather-in-dot"></view>
					<text class="weather-in-txt">由于恶劣天气影响，技师可能会延误，请谅解！</text>
				</view>
				<view class="addr-divider" />
				<view class="addr-row" @click="onTapAddress" :class="{ 'addr-row--readonly': !homeService }">
					<view class="addr-text-wrap">
						<text class="addr-line-main line2">{{ storeAddressLine }}</text>
						<text class="addr-line-sub" v-if="storeContactLine">{{ storeContactLine }}</text>
					</view>
					<text class="iconfont icon-ic_rightarrow addr-chevron"></text>
				</view>
			</view>

			<!-- 服务项目 -->
			<view class="card card-service">
				<view class="svc-main-row" @click="showCatePicker = true">
					<image
						class="svc-cover"
						:src="selectedCate ? coverSrc(selectedCate) : placeholderCover"
						mode="aspectFill"
					/>
					<view class="svc-center">
						<text class="svc-title line2">{{ serviceTitleLine }}</text>
						<view class="svc-price-line" @click.stop>
							<text class="svc-yuan">¥{{ formatMoney(unitPrice) }}</text>
							<text v-if="showMemberPrice" class="svc-split">|</text>
							<text v-if="showMemberPrice" class="svc-vip">会员 ¥{{ vipPriceDisplay }}</text>
							<view v-if="showFirstOrderTag" class="tag-first">首单优惠</view>
						</view>
					</view>
					<view class="qty-box" @click.stop>
						<view class="qty-btn" @click="adjustQty(-1)">−</view>
						<text class="qty-num">{{ quantity }}</text>
						<view class="qty-btn" @click="adjustQty(1)">+</view>
					</view>
				</view>
				<view class="svc-tags-label">服务项目</view>
				<scroll-view v-if="categoryList.length" scroll-x class="tags-scroll" show-scrollbar="false">
					<view class="tags-inner">
						<view
							v-for="(item, idx) in categoryList"
							:key="item.id || idx"
							class="tag-chip"
							:class="{ on: selectedCate && selectedCate.id === item.id }"
							@click="pickCategory(item)"
						>
							{{ item.name || '项目' }}
						</view>
					</view>
				</scroll-view>
				<view v-else class="tags-empty">暂无可选项目</view>
			</view>

			<!-- 预约选项（参考稿：每行右侧箭头；时间/出行为橙色） -->
			<view class="card card-options">
				<view class="opt-row">
					<text class="opt-label">服务人员</text>
					<view class="opt-right">
						<text class="opt-val opt-val--name">{{ therapistName || '理疗师' }}</text>
						<image class="opt-avatar" :src="therapistPicture || defaultAvatar" mode="aspectFill" />
						<text class="iconfont icon-ic_rightarrow opt-arrow"></text>
					</view>
				</view>
				<view class="opt-row">
					<text class="opt-label">服务时间</text>
					<view class="opt-right opt-right--time">
						<picker mode="date" :value="datePart" :start="dateStart" @change="onDateChange">
							<text class="opt-accent">{{ datePart }}</text>
						</picker>
						<text class="opt-accent opt-accent-gap"> </text>
						<picker mode="time" :value="timePart" @change="onTimeChange">
							<text class="opt-accent">{{ timePart }}</text>
						</picker>
						<text class="iconfont icon-ic_rightarrow opt-arrow"></text>
					</view>
				</view>
				<view class="opt-row" @click="onServiceModePick">
					<text class="opt-label">服务方式</text>
					<view class="opt-right">
						<text class="opt-accent">{{ homeServiceLabel }}</text>
						<text class="iconfont icon-ic_rightarrow opt-arrow"></text>
					</view>
				</view>
				<text class="travel-hint">{{ serviceModeHint }}</text>
			</view>

			<!-- 价格明细 -->
			<view class="card card-price">
				<view class="price-head">
					<text class="price-head-t">价格明细</text>
					<text class="price-notice" @click.stop="onBookingNotice">查看《预约须知》</text>
				</view>
				<view class="price-row">
					<text>套餐总价</text>
					<text class="price-num">¥{{ formatMoney(totalPay) }}</text>
				</view>
			</view>

			<view class="bottom-spacer" />
		</scroll-view>

		<!-- 底部栏：需支付 + 提交订单（无会员/月卡推广条） -->
		<view class="footer-bar" :style="{ paddingBottom: footerSafeBottom + 'px' }">
			<view class="footer-pay">
				<text class="pay-label">需支付：</text>
				<text class="pay-num">¥{{ formatMoney(totalPay) }}</text>
			</view>
			<button
				class="btn-submit"
				hover-class="btn-submit-hover"
				:disabled="submitting"
				@click="submit"
			>
				{{ submitting ? '提交中…' : '提交订单' }}
			</button>
		</view>

		<!-- 理疗类目弹层 -->
		<view v-if="showCatePicker" class="picker-mask" @click="showCatePicker = false">
			<view class="picker-panel" @click.stop>
				<view class="picker-head">
					<text class="picker-title">选择理疗项目</text>
					<text class="picker-close" @click="showCatePicker = false">关闭</text>
				</view>
				<scroll-view scroll-y class="picker-scroll">
					<view v-if="cateLoading" class="loading-wrap"><text>加载中...</text></view>
					<view
						v-else
						class="cate-row"
						:class="{ active: selectedCate && selectedCate.id === item.id }"
						v-for="(item, idx) in categoryList"
						:key="item.id || idx"
						@click="pickCategory(item)"
					>
						<image
							v-if="coverSrc(item)"
							class="cate-cover"
							:src="coverSrc(item)"
							mode="aspectFill"
						/>
						<view class="cate-row-body">
							<view class="cate-name-row">
								<text class="cate-name">{{ item.name || '理疗项目' }}</text>
								<text v-if="item.homeService" class="cate-tag-home">可上门</text>
							</view>
							<view class="cate-sub">
								<text v-if="item.duration" class="cate-dur">{{ item.duration }}分钟</text>
								<text
									v-if="item.homeService && item.homePrice != null"
									class="cate-home"
								>
									上门 ¥{{ item.homePrice }}
								</text>
							</view>
						</view>
						<view class="cate-extra">
							<text class="cate-price">¥{{ item.price != null ? item.price : 0 }}</text>
						</view>
					</view>
					<view v-if="!cateLoading && categoryList.length === 0" class="empty-txt">暂无理疗项目</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import orderPay from '@/mixins/OrderPay.js';
import {
	getClinicDetailApi,
	getPhysiotherapyCategoryListApi,
	physiotherapyAppointmentSaveApi,
	physiotherapyAppointmentPayApi
} from '@/api/clinic.js';
import { getAddressList } from '@/api/user.js';
import { consumePhysioBookNav } from '@/utils/physioBookNav.js';

let app = getApp();
const PHYSIO_BOOK_ADDRESS_KEY = 'physio_book_selected_address';
export default {
	mixins: [orderPay],
	data() {
		return {
			theme: this.$Cache.get('theme') || app.globalData.theme,
			therapistId: 0,
			mchId: 0,
			therapistName: '',
			therapistDomain: '',
			therapistPicture: '',
			storeInfo: null,
			selectedAddress: null,
			categoryList: [],
			cateLoading: false,
			preselectedCategoryId: 0,
			showCatePicker: false,
			selectedCate: null,
			quantity: 1,
			/** 是否上门服务（接口 homeService；到店为 false） */
			homeService: false,
			datePart: '',
			timePart: '09:00',
			submitting: false,
			footerSafeBottom: 16,
			statusBarHeight: 20,
			/** 自定义顶栏总高度(px)，用于 scroll 上内边距 */
			navTotalPx: 88
		};
	},
	computed: {
		...mapGetters(['systemPlatform']),
		storeTitle() {
			const s = this.storeInfo;
			if (s && s.name && String(s.name).trim()) return String(s.name).trim();
			return '理疗预约';
		},
		defaultAvatar() {
			const raw = this.$Cache.get('imgHost') || '';
			if (!raw) return '';
			const host = raw.replace(/\/?$/, '/');
			return `${host}crmebimage/presets/morenT.png`;
		},
		placeholderCover() {
			return this.defaultAvatar;
		},
		dateStart() {
			const d = new Date();
			const y = d.getFullYear();
			const m = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			return `${y}-${m}-${day}`;
		},
		homeServiceLabel() {
			return this.homeService ? '上门服务' : '到店服务';
		},
		serviceModeHint() {
			return this.homeService
				? '上门服务将前往您选择的收货地址；费用以所选项目上门价为准。'
				: '到店服务请按预约时间前往门店；下方为门店地址。';
		},
		unitPrice() {
			if (!this.selectedCate) return 0;
			const useHome =
				this.homeService &&
				this.selectedCate.homeService === true &&
				this.selectedCate.homePrice != null &&
				!isNaN(Number(this.selectedCate.homePrice));
			if (useHome) {
				const n = Number(this.selectedCate.homePrice);
				return isNaN(n) ? 0 : n;
			}
			if (this.selectedCate.price == null) return 0;
			const n = Number(this.selectedCate.price);
			return isNaN(n) ? 0 : n;
		},
		totalPay() {
			const q = Math.max(1, parseInt(this.quantity, 10) || 1);
			return Math.round(this.unitPrice * q * 100) / 100;
		},
		appointTimeStr() {
			if (!this.datePart || !this.timePart) return '';
			return `${this.datePart} ${this.timePart}:00`;
		},
		serviceTitleLine() {
			if (!this.selectedCate) return '请选择理疗项目';
			const name = this.selectedCate.name || '理疗项目';
			const d = this.selectedCate.duration;
			return d != null && d !== '' ? `${name} | ${d}分钟` : name;
		},
		storeAddressLine() {
			if (this.homeService) {
				const a = this.selectedAddress;
				if (a) {
					return `${a.province || ''}${a.city || ''}${a.district || ''}${a.street || ''}${a.detail || ''}`.trim();
				}
				return '请选择收货地址';
			}
			const s = this.storeInfo;
			if (!s) return '门店地址加载中…';
			return (s.addressDetail || s.address || '暂无门店地址').trim();
		},
		storeContactLine() {
			if (this.homeService) {
				const a = this.selectedAddress;
				if (a) {
					const rn = a.realName || a.name || '';
					const ph = a.phone || '';
					return [rn, ph].filter(Boolean).join(' ');
				}
				return '';
			}
			const s = this.storeInfo;
			if (!s) return '';
			const phone = s.phone || s.servicePhone || '';
			const name = (s.contactName || s.realName || '').trim();
			if (phone && name) return `${name}（先生）${phone}`;
			if (phone) return phone;
			return name || '';
		},
		/** 会员价：接口 vipPrice/memberPrice 优先，否则按 0.88 展示（仅展示，以实际结算为准） */
		vipPriceDisplay() {
			if (!this.selectedCate || this.unitPrice <= 0) return '0';
			const raw = this.selectedCate.vipPrice ?? this.selectedCate.memberPrice;
			if (raw != null && raw !== '' && !isNaN(Number(raw))) {
				return this.formatMoney(Number(raw));
			}
			return this.formatMoney(Math.round(this.unitPrice * 0.88 * 100) / 100);
		},
		showMemberPrice() {
			return this.unitPrice > 0;
		},
		showFirstOrderTag() {
			return this.unitPrice > 0;
		}
	},
	onLoad(options) {
		const nav = consumePhysioBookNav();
		if (nav && nav.therapistId != null && nav.therapistId !== '') {
			this.therapistId = parseInt(nav.therapistId, 10) || 0;
			this.mchId = nav.mchId != null && nav.mchId !== '' ? parseInt(nav.mchId, 10) : 0;
			this.therapistName = nav.name != null ? String(nav.name) : '';
			this.therapistDomain = nav.domain != null ? String(nav.domain) : '';
			this.therapistPicture = nav.picture != null ? String(nav.picture) : '';
			if (nav.preselectedCategoryId != null && nav.preselectedCategoryId !== '') {
				const pid = parseInt(nav.preselectedCategoryId, 10);
				this.preselectedCategoryId = !isNaN(pid) ? pid : 0;
			}
		} else {
			this.therapistId = options.therapistId ? parseInt(options.therapistId, 10) : 0;
			this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
			this.therapistName = options.name ? decodeURIComponent(options.name) : '';
			this.therapistDomain = options.domain ? decodeURIComponent(options.domain) : '';
			this.therapistPicture = options.picture ? decodeURIComponent(options.picture) : '';
		}
		if (!this.datePart) {
			this.datePart = this.dateStart;
		}
		this.layoutFooter();
		this.layoutNav();
		this.loadMerchantInfo();
		this.loadUserAddress();
		this.loadCategories();
	},
	onShow() {
		this.consumeSelectedAddress();
	},
	methods: {
		layoutNav() {
			const sys = uni.getSystemInfoSync();
			const sh = sys.statusBarHeight || 20;
			this.statusBarHeight = sh;
			// 单行标题栏
			this.navTotalPx = sh + uni.upx2px(88);
		},
		goBack() {
			const pages = getCurrentPages();
			if (pages.length > 1) {
				uni.navigateBack({ delta: 1 });
			} else {
				uni.switchTab({ url: '/pages/index/index' });
			}
		},
		consumeSelectedAddress() {
			try {
				const raw = uni.getStorageSync(PHYSIO_BOOK_ADDRESS_KEY);
				if (raw) {
					uni.removeStorageSync(PHYSIO_BOOK_ADDRESS_KEY);
					const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
					if (obj && obj.id) this.selectedAddress = obj;
				}
			} catch (e) {}
		},
		loadUserAddress() {
			this.consumeSelectedAddress();
			if (this.selectedAddress && this.selectedAddress.id) return;
			getAddressList()
				.then((res) => {
					const list = (res && res.data) || [];
					if (!Array.isArray(list) || list.length === 0) return;
					const def = list.find((it) => it && it.isDefault) || list[0];
					if (def) this.selectedAddress = def;
				})
				.catch(() => {});
		},
		layoutFooter() {
			const sys = uni.getSystemInfoSync();
			const inset = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
			this.footerSafeBottom = inset + 12;
		},
		loadMerchantInfo() {
			if (!this.mchId) return;
			getClinicDetailApi(this.mchId)
				.then((res) => {
					this.storeInfo = (res && res.data) || null;
				})
				.catch(() => {
					this.storeInfo = null;
				});
		},
		onTapAddress() {
			if (!this.homeService) {
				return this.$util.Tips({ title: '到店服务使用门店地址，如需上门请切换为「上门服务」' });
			}
			this.$util.navigateTo('/pages/address/user_address_list/index?source=physio_book');
		},
		onServiceModePick() {
			const list = ['到店服务', '上门服务'];
			uni.showActionSheet({
				itemList: list,
				success: (res) => {
					if (res.tapIndex === 0) {
						this.homeService = false;
						return;
					}
					if (res.tapIndex === 1) {
						if (this.selectedCate && this.selectedCate.homeService !== true) {
							return this.$util.Tips({ title: '当前理疗项目不支持上门服务' });
						}
						this.homeService = true;
					}
				}
			});
		},
		onBookingNotice() {
			uni.showModal({
				title: '预约须知',
				content:
					'请按预约时间到店或等候上门；如需改期请提前联系门店。服务开始前可申请退款，具体以平台与门店规则为准。费用提交后若需支付将调起微信支付。',
				showCancel: false
			});
		},
		formatMoney(v) {
			if (v == null || v === '') return '0';
			const n = Number(v);
			if (isNaN(n)) return '0';
			return Number.isInteger(n) ? String(n) : n.toFixed(2);
		},
		coverSrc(item) {
			if (!item || !item.coverImage) return '';
			let u = String(item.coverImage).trim();
			if (!u) return '';
			if (/^https?:\/\//i.test(u)) return u;
			const raw = this.$Cache.get('imgHost') || '';
			if (!raw) return u;
			const base = raw.replace(/\/?$/, '');
			return u.startsWith('/') ? base + u : `${base}/${u}`;
		},
		loadCategories() {
			this.cateLoading = true;
			const params = { page: 1, limit: 200 };
			if (this.mchId) {
				params.mchId = this.mchId;
			}
			return getPhysiotherapyCategoryListApi(params)
				.then((res) => {
					const data = res.data;
					let list = [];
					if (data && Array.isArray(data.list)) {
						list = data.list;
					} else if (Array.isArray(data)) {
						list = data;
					}
					this.categoryList = list.filter((it) => it && (it.status === undefined || it.status === 1));
					this.applyPreselectedCategory();
				})
				.catch(() => {})
				.finally(() => {
					this.cateLoading = false;
				});
		},
		applyPreselectedCategory() {
			if (!this.categoryList || !this.categoryList.length) return;
			const pid = this.preselectedCategoryId;
			if (pid) {
				const found = this.categoryList.find((it) => String(it.id) === String(pid));
				if (found) {
					this.pickCategory(found);
					return;
				}
			}
			if (!this.selectedCate) {
				this.pickCategory(this.categoryList[0]);
			}
		},
		pickCategory(item) {
			this.selectedCate = item;
			if (this.homeService && item && item.homeService !== true) {
				this.homeService = false;
			}
			this.showCatePicker = false;
		},
		adjustQty(delta) {
			let q = parseInt(this.quantity, 10) || 1;
			q += delta;
			if (q < 1) q = 1;
			if (q > 99) q = 99;
			this.quantity = q;
		},
		onDateChange(e) {
			this.datePart = e.detail.value;
		},
		onTimeChange(e) {
			this.timePart = e.detail.value;
		},
		resolvePayChannel() {
			const payType = 'weixin';
			let payChannel = 'mini';
			// #ifdef H5
			payChannel = this.$wechat.isWeixin() ? 'public' : 'h5';
			// #endif
			// #ifdef APP-PLUS
			payChannel = this.systemPlatform === 'ios' ? 'wechatIos' : 'wechatAndroid';
			// #endif
			// #ifdef MP
			payChannel = 'mini';
			// #endif
			return { payChannel, payType };
		},
		markAppointmentListNeedRefresh() {
			const g = getApp();
			if (g.globalData) {
				g.globalData.physioAppointmentNeedRefresh = true;
			}
		},
		notifyPrevPageRefresh() {
			const g = getApp();
			if (g.globalData) {
				g.globalData.physioBookJustCreated = true;
				g.globalData.physioAppointmentNeedRefresh = true;
			}
			try {
				const pages = getCurrentPages();
				if (pages.length < 2) return;
				const prev = pages[pages.length - 2];
				const vm = prev.$vm;
				if (!vm) return;
				if (typeof vm.resetList === 'function') vm.resetList();
				vm.loading = false;
				if (typeof vm.getAppointmentList === 'function' && vm.mchId) {
					vm.getAppointmentList();
				} else if (typeof vm.getList === 'function') {
					vm.getList();
				}
			} catch (e) {}
		},
		goBackAfterSubmit() {
			setTimeout(() => {
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 });
				} else {
					uni.redirectTo({ url: '/pages/clinic/appointment/index' });
				}
			}, 400);
		},
		parseAppointmentId(inner) {
			if (inner == null || inner === '') return null;
			if (typeof inner === 'number' && !isNaN(inner)) return inner;
			if (typeof inner === 'string') {
				const t = inner.trim();
				if (!t) return null;
				if (/^\d+$/.test(t)) return parseInt(t, 10);
				return t;
			}
			if (typeof inner === 'object') {
				if (inner.id != null) return inner.id;
				if (inner.data != null) return this.parseAppointmentId(inner.data);
			}
			return null;
		},
		submit() {
			if (!this.therapistId) {
				return this.$util.Tips({ title: '缺少理疗师信息' });
			}
			if (!this.selectedCate) {
				return this.$util.Tips({ title: '请选择理疗项目' });
			}
			if (!this.appointTimeStr) {
				return this.$util.Tips({ title: '请选择预约日期与时间' });
			}
			if (this.homeService && (!this.selectedAddress || !this.selectedAddress.id)) {
				return this.$util.Tips({ title: '请选择收货地址' });
			}
			const feeNum = this.totalPay;
			const cateId =
				this.selectedCate.id != null && this.selectedCate.id !== ''
					? parseInt(this.selectedCate.id, 10)
					: 0;
			const body = {
				therapistId: this.therapistId,
				physiotherapyCategory: !isNaN(cateId) ? cateId : 0,
				appointTime: this.appointTimeStr,
				amount: feeNum,
				addressId: this.homeService && this.selectedAddress && this.selectedAddress.id
					? parseInt(this.selectedAddress.id, 10) || 0
					: 0,
				homeService: !!this.homeService
			};
			this.submitting = true;
			uni.showLoading({ title: '提交中…' });
			physiotherapyAppointmentSaveApi(body)
				.then((res) => {
					const appointmentId = this.parseAppointmentId(res.data);
					const needPay = !isNaN(feeNum) && feeNum > 0;
					if (needPay && appointmentId != null && appointmentId !== '') {
						return this.doPay(appointmentId, feeNum);
					}
					uni.hideLoading();
					this.submitting = false;
					if (needPay && (appointmentId == null || appointmentId === '')) {
						this.$util.Tips({
							title: '创建成功，未返回预约编号，请到「我的预约」中完成支付'
						});
					} else {
						this.$util.Tips({ title: '预约已提交' });
					}
					this.notifyPrevPageRefresh();
					this.goBackAfterSubmit();
				})
				.catch((err) => {
					uni.hideLoading();
					this.submitting = false;
					this.$util.Tips({ title: err || '提交失败' });
				});
		},
		doPay(appointmentId, payPrice) {
			const { payChannel, payType } = this.resolvePayChannel();
			physiotherapyAppointmentPayApi({
				id: appointmentId,
				payChannel,
				payType,
				from: ''
			})
				.then((payRes) => {
					uni.hideLoading();
					this.submitting = false;
					const d = payRes.data;
					this.markAppointmentListNeedRefresh();
					if (d && d.jsConfig) {
						const goPages = '/pages/clinic/appointment/index';
						this.weixinPay(d.jsConfig, String(d.payOrderNo || appointmentId), goPages, 'normal', '');
					} else {
						this.$util.Tips({ title: '预约已提交' });
						uni.navigateTo({ url: '/pages/clinic/appointment/index' });
					}
				})
				.catch((err) => {
					uni.hideLoading();
					this.submitting = false;
					this.$util.Tips({ title: err || '支付发起失败' });
				});
		}
	}
};
</script>

<style lang="scss" scoped>
/* 参考稿主色：背景 #f6f6f6、强调橙 #ff6a00、红价 #e6285f、黄按钮渐变 */
$bg: #ffffff;
$card: #fff;
$line: #ededed;
$orange: #ff6a00;
$red: #e6285f;

.physio-book-page {
	min-height: 100vh;
	background: $bg;
	box-sizing: border-box;
}

.custom-nav {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	z-index: 200;
	background: #ffffff;
	border-bottom: 1rpx solid #f0f0f0;
	box-sizing: border-box;
}

.nav-row-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 88rpx;
	padding: 0 8rpx 0 4rpx;
}

.nav-back {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;

	.iconfont {
		font-size: 40rpx;
		color: #222;
	}

	&--ph {
		opacity: 0;
		pointer-events: none;
	}
}

.nav-store-title {
	flex: 1;
	text-align: center;
	font-size: 34rpx;
	font-weight: 600;
	color: #222;
	padding: 0 16rpx;
}

.page-scroll {
	box-sizing: border-box;
	padding-left: 12rpx;
	padding-right: 12rpx;
	padding-bottom: 240rpx;
	min-height: 100vh;
	background: #fff;
}

.line1 {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.banner-peace {
	padding: 18rpx 20rpx;
	margin: 0 0 12rpx;
	background: linear-gradient(180deg, #fff9e8 0%, #fff3d6 100%);
	border-radius: 14rpx;
	border: 1rpx solid rgba(230, 190, 120, 0.35);
}

.banner-peace-txt {
	font-size: 22rpx;
	color: #8b6914;
	line-height: 1.5;
	text-align: center;
	display: block;
}

.card {
	background: $card;
	border-radius: 16rpx;
	padding: 0;
	margin-bottom: 12rpx;
	border: 1rpx solid #f0f0f0;
	box-shadow: 0 2rpx 14rpx rgba(0, 0, 0, 0.04);
	overflow: hidden;
}

.card + .card {
	margin-top: 0;
}

.card-addr-merge {
	padding: 0;
}

.weather-in-card {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
	padding: 20rpx 24rpx;
	background: #e8f4ff;
}

.weather-in-dot {
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	flex-shrink: 0;
	margin-top: 4rpx;
	background: radial-gradient(circle at 35% 35%, #ffffff 0%, #b9dcff 45%, #7bb9ff 100%);
	border: 1rpx solid rgba(24, 144, 255, 0.28);
	box-shadow: 0 0 0 4rpx rgba(24, 144, 255, 0.08);
}

.weather-in-txt {
	flex: 1;
	font-size: 24rpx;
	color: #1890ff;
	line-height: 1.45;
}

.addr-divider {
	height: 1rpx;
	background: #f0f0f0;
}

.addr-row {
	display: flex;
	align-items: center;
	padding: 24rpx 24rpx 24rpx 20rpx;
	position: relative;
}

.addr-text-wrap {
	flex: 1;
	min-width: 0;
	padding-right: 12rpx;
}

.addr-line-main {
	font-size: 28rpx;
	color: #111;
	font-weight: 500;
	line-height: 1.45;
}

.addr-line-sub {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #999;
	line-height: 1.4;
}

.addr-chevron {
	font-size: 24rpx;
	color: #ccc;
	flex-shrink: 0;
}

.card-service {
	padding: 24rpx 24rpx 20rpx;
}

.svc-main-row {
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
}

.svc-cover {
	width: 176rpx;
	height: 176rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
	background: $bg;
}

.svc-center {
	flex: 1;
	min-width: 0;
	padding-top: 2rpx;
}

.svc-title {
	font-size: 28rpx;
	color: #111;
	font-weight: 600;
	line-height: 1.4;
}

.svc-price-line {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8rpx 10rpx;
	margin-top: 14rpx;
}

.svc-yuan {
	font-size: 40rpx;
	font-weight: 700;
	color: $red;
	line-height: 1;
}

.svc-split {
	font-size: 24rpx;
	color: #ccc;
}

.svc-vip {
	font-size: 24rpx;
	font-weight: 500;
	color: $red;
}

.tag-first {
	padding: 2rpx 10rpx;
	font-size: 20rpx;
	color: #c45c00;
	background: #fff3d4;
	border-radius: 6rpx;
	border: 1rpx solid rgba(255, 180, 0, 0.45);
	line-height: 1.3;
}

.qty-box {
	display: flex;
	align-items: center;
	border: 1rpx solid #e0e0e0;
	border-radius: 8rpx;
	overflow: hidden;
	flex-shrink: 0;
	align-self: flex-start;
}

.qty-btn {
	width: 56rpx;
	height: 56rpx;
	line-height: 56rpx;
	text-align: center;
	font-size: 32rpx;
	color: #666;
	background: #fafafa;
}

.qty-num {
	min-width: 56rpx;
	text-align: center;
	font-size: 26rpx;
	color: #333;
	font-weight: 600;
}

.svc-tags-label {
	margin-top: 28rpx;
	margin-bottom: 14rpx;
	font-size: 26rpx;
	color: #333;
	font-weight: 600;
}

.tags-scroll {
	width: 100%;
	white-space: nowrap;
}

.tags-inner {
	display: inline-flex;
	flex-wrap: nowrap;
	gap: 16rpx;
	padding-bottom: 6rpx;
}

.tag-chip {
	flex-shrink: 0;
	padding: 12rpx 26rpx;
	font-size: 24rpx;
	color: #666;
	background: #f5f5f5;
	border-radius: 32rpx;
	border: 2rpx solid transparent;

	&.on {
		color: $orange;
		background: #fff7e8;
		border-color: #ffc266;
		font-weight: 500;
	}
}

.tags-empty {
	font-size: 24rpx;
	color: #bbb;
	padding: 8rpx 0;
}

.card-options {
	padding: 8rpx 24rpx 20rpx;
}

.opt-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 96rpx;
	padding: 0 4rpx;
	border-bottom: 1rpx solid #f5f5f5;

	&:last-of-type {
		border-bottom: none;
	}
}

.opt-label {
	font-size: 28rpx;
	color: #333;
	flex-shrink: 0;
	font-weight: 400;
}

.opt-right {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 12rpx;
	min-width: 0;
	flex: 1;
}

.opt-right--time {
	flex-wrap: nowrap;
}

.opt-val--name {
	font-size: 28rpx;
	color: #111;
	font-weight: 500;
	max-width: 280rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.opt-avatar {
	width: 52rpx;
	height: 52rpx;
	border-radius: 50%;
	flex-shrink: 0;
	background: #eee;
}

.opt-accent {
	font-size: 28rpx;
	color: $orange;
	font-weight: 500;
}

.opt-accent-gap {
	font-size: 28rpx;
	color: $orange;
}

.opt-arrow {
	font-size: 24rpx;
	color: #d0d0d0;
	flex-shrink: 0;
	margin-left: 4rpx;
}

.travel-hint {
	display: block;
	padding: 12rpx 4rpx 8rpx;
	font-size: 22rpx;
	color: #999;
	line-height: 1.45;
}

.addr-row--readonly .addr-chevron {
	opacity: 0.35;
}

.card-price {
	padding: 20rpx 24rpx 28rpx;
}

.price-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.price-head-t {
	font-size: 30rpx;
	font-weight: 600;
	color: #111;
}

.price-notice {
	font-size: 24rpx;
	color: $orange;
	font-weight: 400;
}

.price-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 28rpx;
	color: #333;
}

.price-num {
	font-size: 34rpx;
	font-weight: 700;
	color: $red;
}

.bottom-spacer {
	height: 24rpx;
}

.footer-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	padding: 20rpx 24rpx;
	padding-top: 16rpx;
	background: $card;
	border-top: 1rpx solid #f0f0f0;
	box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.footer-pay {
	display: flex;
	align-items: baseline;
	flex-wrap: wrap;
	flex: 1;
	min-width: 0;
}

.pay-label {
	font-size: 26rpx;
	color: #666;
}

.pay-num {
	font-size: 44rpx;
	font-weight: 700;
	color: $red;
	margin-left: 4rpx;
	letter-spacing: -1rpx;
}

.btn-submit {
	flex-shrink: 0;
	min-width: 280rpx;
	height: 92rpx;
	line-height: 92rpx;
	border-radius: 46rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #fff;
	border: none;
	padding: 0 44rpx;
	margin: 0;
	box-sizing: border-box;
	background: var(--view-theme);
}

.btn-submit::after {
	border: none;
}

.btn-submit-hover {
	opacity: 0.92;
}

.btn-submit[disabled] {
	opacity: 0.55;
}

.line2 {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

/* 弹层 */
.picker-mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.45);
	z-index: 1000;
	display: flex;
	align-items: flex-end;
}

.picker-panel {
	width: 100%;
	max-height: 70vh;
	background: #fff;
	border-radius: 24rpx 24rpx 0 0;
	overflow: hidden;
}

.picker-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx 32rpx;
	border-bottom: 1px solid #f0f0f0;
}

.picker-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #282828;
}

.picker-close {
	font-size: 28rpx;
	color: #999;
}

.picker-scroll {
	max-height: 55vh;
	padding: 0 24rpx 40rpx;
}

.cate-row {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1px solid #f5f5f5;
	gap: 20rpx;

	&.active {
		background: rgba(0, 0, 0, 0.02);
	}
}

.cate-cover {
	width: 112rpx;
	height: 112rpx;
	border-radius: 12rpx;
	background: #f0f0f0;
	flex-shrink: 0;
}

.cate-row-body {
	flex: 1;
	min-width: 0;
}

.cate-name-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 8rpx;
}

.cate-name {
	font-size: 28rpx;
	color: #282828;
	font-weight: 500;
	line-height: 1.35;
}

.cate-tag-home {
	font-size: 20rpx;
	color: var(--view-theme);
	background: rgba(110, 163, 90, 0.12);
	padding: 2rpx 10rpx;
	border-radius: 6rpx;
	flex-shrink: 0;
}

.cate-sub {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 16rpx;
}

.cate-home {
	font-size: 22rpx;
	color: #999;
}

.cate-extra {
	display: flex;
	align-items: flex-start;
	flex-shrink: 0;
}

.cate-price {
	font-size: 28rpx;
	color: var(--view-theme);
	font-weight: 600;
	margin-right: 16rpx;
}

.cate-dur {
	font-size: 24rpx;
	color: #999;
}

.empty-txt {
	text-align: center;
	padding: 60rpx 0;
	font-size: 26rpx;
	color: #999;
}

.loading-wrap {
	text-align: center;
	padding: 40rpx 0;
	font-size: 24rpx;
	color: #999;
}
</style>

<style lang="scss">
page {
	height: 100%;
	background: #ffffff;
}
</style>
