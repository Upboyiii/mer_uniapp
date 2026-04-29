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
				<view class="addr-row" @click="onTapAddress">
					<view class="addr-text-wrap">
						<text v-if="!homeService && resolvedStoreName" class="addr-line-store line1">{{
							resolvedStoreName
						}}</text>
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
				<view class="opt-row" @click="onPickTherapist">
					<text class="opt-label">服务人员</text>
					<view class="opt-right">
						<text class="opt-val opt-val--name">{{ therapistName || '理疗师' }}</text>
						<image class="opt-avatar" :src="therapistPicture || defaultAvatar" mode="aspectFill" />
						<text class="iconfont icon-ic_rightarrow opt-arrow"></text>
					</view>
				</view>
				<view class="opt-row" @click="openServiceTimePicker">
					<text class="opt-label">服务时间</text>
					<view class="opt-right opt-right--time">
						<text class="opt-accent">{{ serviceTimeRowDisplay }}</text>
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
					<view v-if="!cateLoading && categoryList.length === 0" class="empty-txt">{{
						categoryListSource === 'tcm' ? '暂无中医项目' : '暂无理疗项目'
					}}</view>
				</scroll-view>
			</view>
		</view>

		<!-- 服务时间：今天 / 明天 / 后天 + 时段 -->
		<view
			v-if="showServiceTimeModal"
			class="picker-mask st-time-mask"
			@click="showServiceTimeModal = false"
		>
			<view class="st-time-panel" @click.stop>
				<view class="st-time-head">
					<view class="st-time-head-text">
						<text class="st-time-title">请选择服务时间</text>
						<text class="st-time-sub">实际到达可能会有 30 分钟的浮动</text>
					</view>
					<text class="st-time-close" @click="showServiceTimeModal = false">×</text>
				</view>
				<view class="st-day-row">
					<view
						v-for="d in relativeDayOptions"
						:key="d.dateStr"
						class="st-day-chip"
						:class="{ on: tempDatePart === d.dateStr }"
						@click="tempDatePart = d.dateStr"
					>
						<text class="st-day-label">{{ d.label }}</text>
						<text class="st-day-sub">{{ d.sub }}</text>
					</view>
				</view>
				<scroll-view scroll-y class="st-time-scroll">
					<view v-if="serviceTimeSlotList.length === 0" class="st-time-empty">
						<text>今日可约时段已结束，请选择明天或后天</text>
					</view>
					<view v-else class="st-time-grid">
						<view
							v-for="(t, ti) in serviceTimeSlotList"
							:key="ti"
							class="st-time-cell"
							:class="{ on: isServiceTimeCellActive(t) }"
							@click="pickServiceTimeSlot(t)"
						>
							<text class="st-time-t">{{ t }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 下单成功且需付款：底部弹出确认支付（医生详情中医预约等） -->
		<view v-if="showPaySheet" class="pay-sheet-mask" @click="onPaySheetMaskClick">
			<view class="pay-sheet" @click.stop>
				<view class="pay-sheet-grabber" />
				<view class="pay-sheet-head">
					<text class="pay-sheet-title">确认支付</text>
					<text class="iconfont icon-ic_close pay-sheet-close" @click="dismissPaySheet(true)"></text>
				</view>
				<text class="pay-sheet-amount">¥{{ formatMoney(pendingPayAmount) }}</text>
				<text v-if="pendingOrderNo" class="pay-sheet-order line1">订单号 {{ pendingOrderNo }}</text>
				<view class="pay-method-wrap">
					<text class="pay-method-title">支付方式</text>
					<view class="pay-option" @click="sheetPayMethod = 'weixin'">
						<text class="po-name">微信支付</text>
						<text
							class="iconfont"
							:class="
								sheetPayMethod === 'weixin'
									? 'icon-a-ic_CompleteSelect check'
									: 'icon-ic_unselect unsel'
							"
						></text>
					</view>
					<!-- #ifndef MP -->
					<view class="pay-option" @click="sheetPayMethod = 'alipay'">
						<text class="po-name">支付宝支付</text>
						<text
							class="iconfont"
							:class="
								sheetPayMethod === 'alipay'
									? 'icon-a-ic_CompleteSelect check'
									: 'icon-ic_unselect unsel'
							"
						></text>
					</view>
					<!-- #endif -->
				</view>
				<button
					class="btn-submit pay-sheet-btn-full"
					hover-class="btn-submit-hover"
					:disabled="submitting"
					@click="confirmPayInSheet"
				>
					{{ submitting ? '请稍候…' : '立即支付' }}
				</button>
				<text class="pay-sheet-cancel" @click="dismissPaySheet(true)">暂不支付，稍后处理</text>
			</view>
		</view>

		<!-- #ifdef H5 -->
		<view v-if="formContent" class="alipaysubmit" v-html="formContent"></view>
		<!-- #endif -->
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import orderPay from '@/mixins/OrderPay.js';
import {
	getClinicDetailApi,
	getPhysiotherapyCategoryListApi,
	getTcmCategoryListApi,
	physiotherapyAppointmentSaveApi,
	physiotherapyAppointmentPayApi,
	tcmAppointmentSaveApi,
	tcmAppointmentPayApi
} from '@/api/clinic.js';
import { getAddressList } from '@/api/user.js';
import {
	consumePhysioBookNav,
	PHYSIO_BOOK_SELECTED_MCH_KEY,
	PHYSIO_BOOK_PICK_THERAPIST_KEY
} from '@/utils/physioBookNav.js';
import { setMchTherapistListNav } from '@/utils/mchTherapistListNav.js';

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
			/** 从门店切换页带回的名称，在门店详情接口无 name 时用于顶栏/地址区展示 */
			pendingStoreName: '',
			/** 从门店切换页带回的地址文案；详情接口缺地址字段时仍展示列表里那一行 */
			pendingStoreAddress: '',
			selectedAddress: null,
			categoryList: [],
			cateLoading: false,
			preselectedCategoryId: 0,
			/** physio：理疗类目；tcm：中医类目（therapist/tcm-category/list） */
			categoryListSource: 'physio',
			/** 从医生详情中医预约入口带入，提交 doctor/tcm-appointment/save */
			doctorId: 0,
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
			navTotalPx: 88,
			showServiceTimeModal: false,
			/** 弹层中选中的日期 yyyy-mm-dd，仅今天/明天/后天 */
			tempDatePart: '',
			/** 下单成功后底部支付面板 */
			showPaySheet: false,
			pendingPayId: null,
			pendingOrderNo: '',
			pendingPayAmount: 0,
			/** 支付弹层选择 */
			sheetPayMethod: 'weixin',
			// #ifdef H5
			formContent: ''
			// #endif
		};
	},
	computed: {
		...mapGetters(['systemPlatform']),
		resolvedStoreName() {
			if (this.pendingStoreName && String(this.pendingStoreName).trim()) {
				return String(this.pendingStoreName).trim();
			}
			const s = this.storeInfo;
			if (!s) return '';
			const n = s.name || s.merName;
			return n && String(n).trim() ? String(n).trim() : '';
		},
		storeTitle() {
			if (this.categoryListSource === 'tcm') {
				return this.resolvedStoreName || '中医预约';
			}
			return this.resolvedStoreName || '理疗预约';
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
				: '到店服务请按预约时间前往门店。点击地址可选择或切换门店。';
		},
		/** 到店：是否已有可展示的地址（接口多字段或切换页带回） */
		hasValidStoreAddress() {
			if (this.pendingStoreAddress && String(this.pendingStoreAddress).trim()) return true;
			const s = this.storeInfo;
			if (!s) return false;
			return !!this.pickMerchantAddress(s);
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
			if (!s && !this.pendingStoreAddress) return '门店地址加载中…';
			const fromApi = s ? this.pickMerchantAddress(s) : '';
			if (fromApi) return fromApi;
			const pending = (this.pendingStoreAddress || '').trim();
			if (pending) return pending;
			if (!s) return '门店地址加载中…';
			return '';
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
		},
		/** 今天 / 明天 / 后天 + 月-日 */
		relativeDayOptions() {
			const now = new Date();
			const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const pad = (n) => String(n).padStart(2, '0');
			const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
			const sub = (d) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
			const t1 = new Date(t0);
			t1.setDate(t1.getDate() + 1);
			const t2 = new Date(t0);
			t2.setDate(t2.getDate() + 2);
			return [
				{ label: '今天', sub: sub(t0), dateStr: fmt(t0) },
				{ label: '明天', sub: sub(t1), dateStr: fmt(t1) },
				{ label: '后天', sub: sub(t2), dateStr: fmt(t2) }
			];
		},
		/** 弹层内可选时段：「今天」从当前时间之后算起，明天后天全天 9:00–23:30 */
		serviceTimeSlotList() {
			return this.getSlotsForDateString(this.tempDatePart);
		},
		/** 列表行展示 */
		serviceTimeRowDisplay() {
			if (!this.datePart || !this.timePart) return '请选择';
			const opt = this.relativeDayOptions.find((o) => o.dateStr === this.datePart);
			const dayLabel = opt ? opt.label : this.datePart;
			return `${dayLabel} ${this.timePart}`;
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
			if (nav.categoryListSource === 'tcm') {
				this.categoryListSource = 'tcm';
			}
			if (nav.doctorId != null && nav.doctorId !== '') {
				const did = parseInt(nav.doctorId, 10);
				this.doctorId = !isNaN(did) ? did : 0;
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
		this.$nextTick(() => {
			this.snapServiceTimeToBookable();
		});
	},
	onShow() {
		this.consumeSelectedAddress();
		this.consumeSelectedMchFromStore();
		this.consumePickedTherapist();
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
		consumeSelectedMchFromStore() {
			try {
				const raw = uni.getStorageSync(PHYSIO_BOOK_SELECTED_MCH_KEY);
				if (!raw) return;
				uni.removeStorageSync(PHYSIO_BOOK_SELECTED_MCH_KEY);
				const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
				const mid = obj && obj.mchId != null ? parseInt(obj.mchId, 10) : 0;
				if (!mid || isNaN(mid)) return;
				const pickedName =
					obj.name != null && String(obj.name).trim() ? String(obj.name).trim() : '';
				this.pendingStoreName = pickedName;
				const addrPick =
					obj.addressDetail != null && String(obj.addressDetail).trim()
						? String(obj.addressDetail).trim()
						: '';
				this.pendingStoreAddress = addrPick;
				if (mid !== this.mchId) {
					this.mchId = mid;
					this.storeInfo = null;
					this.categoryList = [];
					this.selectedCate = null;
					this.loadMerchantInfo();
					this.loadCategories();
				} else {
					this.loadMerchantInfo();
				}
			} catch (e) {}
		},
		consumePickedTherapist() {
			try {
				const raw = uni.getStorageSync(PHYSIO_BOOK_PICK_THERAPIST_KEY);
				if (!raw) return;
				uni.removeStorageSync(PHYSIO_BOOK_PICK_THERAPIST_KEY);
				const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
				if (!obj || obj.therapistId == null) return;
				const tid = parseInt(obj.therapistId, 10) || 0;
				if (tid) this.therapistId = tid;
				this.therapistName = obj.name != null ? String(obj.name) : '';
				this.therapistDomain = obj.domain != null ? String(obj.domain) : '';
				this.therapistPicture = obj.picture != null ? String(obj.picture) : '';
				if (obj.mchId != null && obj.mchId !== '') {
					const mid = parseInt(obj.mchId, 10) || 0;
					if (mid && mid !== this.mchId) {
						this.mchId = mid;
						this.storeInfo = null;
						this.categoryList = [];
						this.selectedCate = null;
						this.loadMerchantInfo();
						this.loadCategories();
					}
				}
			} catch (e) {}
		},
		onPickTherapist() {
			if (!this.mchId) {
				return this.$util.Tips({
					title: '请先选择门店：若暂无门店地址，请点击上方地址进入门店列表选择'
				});
			}
			setMchTherapistListNav({ mchId: this.mchId });
			this.$util.navigateTo(
				`/pages/clinic/therapist/mch_list?source=physio_pick&mchId=${this.mchId}`
			);
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
		/** 门店详情/商户首页接口里地址可能散落在多个字段 */
		pickMerchantAddress(s) {
			if (!s || typeof s !== 'object') return '';
			const keys = [
				'addressDetail',
				'address',
				'merAddressDetail',
				'detailAddress',
				'fullAddress',
				'storeAddress',
				'street',
				'userAddress'
			];
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				const v = s[k];
				if (v != null && typeof v === 'string' && v.trim()) return v.trim();
			}
			const nested = s.merAddress || s.returnAddress;
			if (nested && typeof nested === 'object') {
				const nv = nested.addressDetail || nested.address;
				if (nv != null && String(nv).trim()) return String(nv).trim();
			}
			return '';
		},
		loadMerchantInfo() {
			if (!this.mchId) return;
			getClinicDetailApi(this.mchId)
				.then((res) => {
					this.storeInfo = (res && res.data) || null;
					const nm =
						this.storeInfo &&
						(this.storeInfo.name || this.storeInfo.merName) &&
						String(this.storeInfo.name || this.storeInfo.merName).trim();
					if (nm) {
						this.pendingStoreName = '';
					}
					if (this.storeInfo && this.pickMerchantAddress(this.storeInfo)) {
						this.pendingStoreAddress = '';
					}
				})
				.catch(() => {
					this.storeInfo = null;
				});
		},
		onTapAddress() {
			if (this.homeService) {
				return this.$util.navigateTo('/pages/address/user_address_list/index?source=physio_book');
			}
			const mid = this.mchId || 0;
			return this.$util.navigateTo(`/pages/clinic/store_switch/index?source=physio_book&merId=${mid}`);
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
			const req =
				this.categoryListSource === 'tcm'
					? getTcmCategoryListApi(params)
					: getPhysiotherapyCategoryListApi(params);
			return req
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
		/** 全部半小时档位 9:00–23:30 */
		buildAllHalfHourSlots() {
			const slots = [];
			for (let m = 9 * 60; m <= 23 * 60 + 30; m += 30) {
				const h = Math.floor(m / 60);
				const min = m % 60;
				slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
			}
			return slots;
		},
		/**
		 * 某日可选时段：仅「今天」按当前时刻截断（早于当前时间的半点档不展示），
		 * 最小可约 = 当前时间向上取整到下一个 30 分钟（如 17:40 → 从 18:00 起）
		 */
		getSlotsForDateString(dateStr) {
			const all = this.buildAllHalfHourSlots();
			const opts = this.relativeDayOptions;
			if (!dateStr || !opts.length) return all;
			const todayStr = opts[0].dateStr;
			if (dateStr !== todayStr) return all;
			const now = new Date();
			const nowMin = now.getHours() * 60 + now.getMinutes();
			const minBookable = Math.ceil(nowMin / 30) * 30;
			return all.filter((t) => {
				const parts = t.split(':');
				const th = parseInt(parts[0], 10);
				const tm = parseInt(parts[1], 10);
				if (isNaN(th) || isNaN(tm)) return false;
				return th * 60 + tm >= minBookable;
			});
		},
		/** 若当前选中的时刻已早于今日可约范围，顺推到第一个可约时段 */
		snapServiceTimeToBookable() {
			const slots = this.getSlotsForDateString(this.datePart);
			if (slots.length && !slots.includes(this.timePart)) {
				this.timePart = slots[0];
			}
		},
		openServiceTimePicker() {
			const opts = this.relativeDayOptions;
			const ok = opts.some((o) => o.dateStr === this.datePart);
			this.tempDatePart = ok ? this.datePart : opts[0].dateStr;
			this.showServiceTimeModal = true;
			this.$nextTick(() => {
				const slots = this.serviceTimeSlotList;
				if (slots.length && !slots.includes(this.timePart)) {
					this.timePart = slots[0];
				}
			});
		},
		isServiceTimeCellActive(t) {
			return this.timePart === t && this.datePart === this.tempDatePart;
		},
		pickServiceTimeSlot(t) {
			this.datePart = this.tempDatePart;
			this.timePart = t;
			this.showServiceTimeModal = false;
		},
		resolvePayChannel(method) {
			if (method === 'alipay') {
				// #ifdef H5
				return { payChannel: 'alipay', payType: 'alipay' };
				// #endif
				// #ifdef APP-PLUS
				return { payChannel: 'alipayApp', payType: 'alipay' };
				// #endif
				// #ifdef MP
				return { payChannel: 'mini', payType: 'weixin' };
				// #endif
			}
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
				if (this.categoryListSource === 'tcm') {
					g.globalData.tcmAppointmentNeedRefresh = true;
				} else {
					g.globalData.physioAppointmentNeedRefresh = true;
				}
			}
		},
		notifyPrevPageRefresh() {
			const g = getApp();
			if (g.globalData) {
				g.globalData.physioBookJustCreated = true;
				if (this.categoryListSource === 'tcm') {
					g.globalData.tcmAppointmentNeedRefresh = true;
				} else {
					g.globalData.physioAppointmentNeedRefresh = true;
				}
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
		/** 预约提交/支付完成后进入统一成功页（含理疗/中医） */
		goToAppointmentSuccess(appointmentId, orderNo, paySuccess) {
			this.notifyPrevPageRefresh();
			const cat = this.categoryListSource === 'tcm' ? 'tcm' : 'physio';
			let url = `/pages/clinic/appointment_success/index?category=${cat}`;
			if (appointmentId != null && appointmentId !== '') {
				url += `&id=${encodeURIComponent(appointmentId)}`;
			}
			if (orderNo != null && String(orderNo).trim()) {
				url += `&orderNo=${encodeURIComponent(String(orderNo).trim())}`;
			}
			if (paySuccess === true) {
				url += '&paySuccess=1';
			}
			uni.redirectTo({ url });
		},
		/** 解析下单接口返回的预约 id（interface.md：save 返回 data: { id, orderNo }；id 为 0 视为无效） */
		parseAppointmentId(inner) {
			if (inner == null || inner === '') return null;
			if (typeof inner === 'number' && !isNaN(inner)) return inner > 0 ? inner : null;
			if (typeof inner === 'string') {
				const t = inner.trim();
				if (!t) return null;
				if (/^\d+$/.test(t)) {
					const n = parseInt(t, 10);
					return n > 0 ? n : null;
				}
				return t;
			}
			if (typeof inner === 'object') {
				if (inner.id != null && inner.id !== '') {
					const raw = inner.id;
					if (typeof raw === 'number' && !isNaN(raw)) return raw > 0 ? raw : null;
					if (typeof raw === 'string') {
						const t = raw.trim();
						if (/^\d+$/.test(t)) {
							const n = parseInt(t, 10);
							return n > 0 ? n : null;
						}
						return t || null;
					}
				}
				if (inner.data != null) return this.parseAppointmentId(inner.data);
			}
			return null;
		},
		/** 下单接口 data：{ id, orderNo } */
		parseAppointmentSaveResult(inner) {
			const id = this.parseAppointmentId(inner);
			let orderNo = '';
			if (inner && typeof inner === 'object' && inner.orderNo != null) {
				const t = String(inner.orderNo).trim();
				if (t) orderNo = t;
			}
			return { id, orderNo };
		},
		submit() {
			if (!this.therapistId) {
				return this.$util.Tips({ title: '缺少理疗师信息' });
			}
			if (!this.selectedCate) {
				return this.$util.Tips({
					title: this.categoryListSource === 'tcm' ? '请选择中医项目' : '请选择理疗项目'
				});
			}
			if (this.categoryListSource === 'tcm' && !this.doctorId) {
				return this.$util.Tips({ title: '缺少医生信息' });
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
			const addressId =
				this.homeService && this.selectedAddress && this.selectedAddress.id
					? parseInt(this.selectedAddress.id, 10) || 0
					: 0;
			const isTcm = this.categoryListSource === 'tcm';
			/** interface.md「新增中医预约」POST body：TcmAppointmentRequest，无 amount/mchId/therapistId */
			const body = isTcm
				? {
						doctorId: this.doctorId,
						appointTime: this.appointTimeStr,
						tcmCategory: !isNaN(cateId) ? cateId : 0,
						homeService: !!this.homeService,
						addressId,
						remark: ''
				  }
				: {
						therapistId: this.therapistId,
						physiotherapyCategory: !isNaN(cateId) ? cateId : 0,
						appointTime: this.appointTimeStr,
						amount: feeNum,
						addressId,
						homeService: !!this.homeService
				  };
			this.submitting = true;
			uni.showLoading({ title: '提交中…' });
			const saveReq = isTcm ? tcmAppointmentSaveApi(body) : physiotherapyAppointmentSaveApi(body);
			saveReq
				.then((res) => {
					const { id: appointmentId, orderNo } = this.parseAppointmentSaveResult(res.data);
					const needPay = !isNaN(feeNum) && feeNum > 0;
					if (appointmentId != null && appointmentId !== '' && orderNo && String(orderNo).trim()) {
						uni.hideLoading();
						this.submitting = false;
						this.pendingPayId = appointmentId;
						this.pendingOrderNo = orderNo || '';
						this.pendingPayAmount = feeNum;
						this.sheetPayMethod = 'weixin';
						this.showPaySheet = true;
						return;
					}
					uni.hideLoading();
					this.submitting = false;
					if (needPay && (appointmentId == null || appointmentId === '')) {
						this.$util.Tips({
							title: '创建成功，未返回预约编号，请到「我的预约」中完成支付'
						});
					} else if (needPay && (!orderNo || !String(orderNo).trim())) {
						this.$util.Tips({
							title: '创建成功，未返回订单号，请到「我的预约」中完成支付'
						});
					} else {
						this.$util.Tips({ title: '预约已提交' });
					}
					this.goToAppointmentSuccess(appointmentId, orderNo, false);
				})
				.catch((err) => {
					uni.hideLoading();
					this.submitting = false;
					this.$util.Tips({ title: err || '提交失败' });
				});
		},
		onPaySheetMaskClick() {
			this.dismissPaySheet(true);
		},
		dismissPaySheet(showTip) {
			if (!this.showPaySheet) return;
			this.showPaySheet = false;
			this.pendingPayId = null;
			this.pendingOrderNo = '';
			this.pendingPayAmount = 0;
			this.sheetPayMethod = 'weixin';
			if (showTip) {
				this.$util.Tips({ title: '预约订单创建成功，可以去我的预约查看' });
			}
			this.markAppointmentListNeedRefresh();
		},
		confirmPayInSheet() {
			if (this.submitting) return;
			const appointmentId = this.pendingPayId;
			const orderNo = this.pendingOrderNo;
			const feeNum = this.pendingPayAmount;
			if (appointmentId == null || appointmentId === '') return;
			// #ifdef MP
			if (this.sheetPayMethod === 'alipay') {
				return this.$util.Tips({ title: '小程序暂不支持支付宝，请使用微信支付' });
			}
			// #endif
			this.showPaySheet = false;
			this.submitting = true;
			uni.showLoading({ title: '支付中…' });
			this.doPay(appointmentId, feeNum, orderNo, this.sheetPayMethod);
		},
		invokeWeixinPay(jsConfig) {
			return new Promise((resolve, reject) => {
				// #ifdef MP
				uni.requestPayment({
					timeStamp: jsConfig.timeStamp,
					nonceStr: jsConfig.nonceStr,
					package: jsConfig.packages,
					signType: jsConfig.signType,
					paySign: jsConfig.paySign,
					ticket: jsConfig.ticket || null,
					success: () => resolve(),
					fail: (e) => reject(e || '支付失败')
				});
				// #endif
				// #ifdef H5
				if (!this.$wechat.isWeixin()) return reject('请在微信内完成支付');
				const data = {
					timestamp: jsConfig.timeStamp,
					nonceStr: jsConfig.nonceStr,
					package: jsConfig.packages,
					signType: jsConfig.signType,
					paySign: jsConfig.paySign
				};
				this.$wechat
					.pay(data)
					.then(() => resolve())
					.catch((e) => reject(e || '支付失败'));
				// #endif
				// #ifdef APP-PLUS
				reject('请在当前端完成支付');
				// #endif
			});
		},
		doPay(appointmentId, payPrice, saveOrderNo, payMethod) {
			const { payChannel, payType } = this.resolvePayChannel(payMethod);
			const payPayload = {
				id: appointmentId,
				payChannel,
				payType,
				// 给后端/回跳页一个明确来源标识
				from: this.categoryListSource === 'tcm' ? 'clinic_appointment_tcm' : 'clinic_appointment_physio'
			};
			const payReq =
				this.categoryListSource === 'tcm'
					? tcmAppointmentPayApi(payPayload)
					: physiotherapyAppointmentPayApi(payPayload);
			payReq
				.then((payRes) => {
					const d = payRes.data || {};
					this.markAppointmentListNeedRefresh();
					const cat = this.categoryListSource === 'tcm' ? 'tcm' : 'physio';
					const orderNoQ = saveOrderNo != null && String(saveOrderNo).trim()
						? `&orderNo=${encodeURIComponent(String(saveOrderNo).trim())}`
						: '';
					if (d.jsConfig) {
						this.invokeWeixinPay(d.jsConfig)
							.then(() => {
								this.goToAppointmentSuccess(appointmentId, saveOrderNo, true);
							})
							.catch((e) => {
								const msg =
									(typeof e === 'string' && e) ||
									(e && e.errMsg) ||
									'支付未完成，请重试';
								this.$util.Tips({ title: msg });
							})
							.finally(() => {
								this.submitting = false;
								uni.hideLoading();
							});
						return;
					}
					if (d.alipayRequest) {
						this.submitting = false;
						uni.hideLoading();
						// 支付回跳页需要区分 tcm/physio，避免默认把中医当理疗
						try {
							uni.setStorageSync('clinicAppointmentPayCategory', cat);
							uni.setStorageSync('clinicAppointmentPayAppointmentId', String(appointmentId));
						} catch (e) {}
						this.handleOrderPay(
							payRes,
							String(d.payOrderNo != null ? d.payOrderNo : saveOrderNo || appointmentId),
							'normal',
							cat === 'tcm' ? 'clinic_appointment_tcm' : 'clinic_appointment_physio',
							'alipay',
							payPrice,
							undefined,
							{ appointmentId, category: cat }
						);
						return;
					}
					this.submitting = false;
					uni.hideLoading();
					this.$util.Tips({ title: '预约已提交' });
					this.goToAppointmentSuccess(appointmentId, saveOrderNo, false);
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

.addr-line-store {
	display: block;
	font-size: 30rpx;
	color: #111;
	font-weight: 600;
	line-height: 1.35;
	margin-bottom: 10rpx;
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
	line-clamp: 2;
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

/* 服务时间：今天 / 明天 / 后天 + 半小时档位 */
.st-time-mask {
	align-items: flex-end;
	z-index: 1001;
}

.st-time-panel {
	width: 100%;
	max-height: 72vh;
	background: #fff;
	border-radius: 24rpx 24rpx 0 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.st-time-head {
	position: relative;
	padding: 28rpx 56rpx 20rpx 32rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.st-time-head-text {
	display: block;
}

.st-time-title {
	display: block;
	font-size: 32rpx;
	font-weight: 600;
	color: #282828;
}

.st-time-sub {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #999;
	line-height: 1.4;
}

.st-time-close {
	position: absolute;
	right: 20rpx;
	top: 20rpx;
	font-size: 44rpx;
	color: #bbb;
	line-height: 1;
	padding: 8rpx;
}

.st-day-row {
	display: flex;
	flex-direction: row;
	padding: 20rpx 24rpx 12rpx;
	gap: 16rpx;
	background: #fafafa;
}

.st-day-chip {
	flex: 1;
	min-width: 0;
	padding: 20rpx 12rpx;
	border-radius: 12rpx;
	background: #fff;
	border: 2rpx solid #eee;
	text-align: center;

	&.on {
		border-color: $orange;
		background: #fff8f0;
	}
}

.st-day-label {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #111;
}

.st-day-sub {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	color: #999;
}

.st-time-empty {
	padding: 48rpx 32rpx 56rpx;
	text-align: center;
	font-size: 26rpx;
	color: #999;
	line-height: 1.5;
}

.st-time-scroll {
	max-height: 46vh;
	min-height: 200rpx;
}

.st-time-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 16rpx 16rpx 40rpx;
}

.st-time-cell {
	width: 25%;
	box-sizing: border-box;
	padding: 8rpx;
}

.st-time-t {
	display: block;
	padding: 18rpx 4rpx;
	text-align: center;
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
	background: #f5f5f5;
	border-radius: 8rpx;
	border: 2rpx solid transparent;
}

.st-time-cell.on .st-time-t {
	color: $orange;
	font-weight: 600;
	background: #fff5e8;
	border-color: rgba(255, 106, 0, 0.45);
}

/* 底部支付弹层 */
.pay-sheet-mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.45);
	z-index: 1200;
	display: flex;
	align-items: flex-end;
	justify-content: center;
}

.pay-sheet {
	width: 100%;
	box-sizing: border-box;
	background: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding: 24rpx 40rpx 48rpx;
	padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
	height: 45vh;
	max-height: 45vh;
	box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08);
	animation: paySheetUp 0.2s ease-out;
	overflow-y: auto;
}

@keyframes paySheetUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.pay-sheet-grabber {
	width: 72rpx;
	height: 8rpx;
	background: #e8e8e8;
	border-radius: 4rpx;
	margin: 0 auto 28rpx;
}

.pay-sheet-head {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 10rpx;
}

.pay-sheet-close {
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	font-size: 38rpx;
	color: #b5b5b5;
	padding: 8rpx;
}

.pay-sheet-title {
	display: block;
	text-align: center;
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
	line-height: 1.2;
	padding-right: 10rpx;
}

.pay-sheet-amount {
	display: block;
	text-align: center;
	font-size: 60rpx;
	font-weight: 700;
	color: #e6285f;
	margin-top: 18rpx;
	margin-bottom: 18rpx;
	line-height: 1.1;
}

.pay-sheet-order {
	display: block;
	text-align: center;
	font-size: 26rpx;
	color: #999;
	margin-bottom: 42rpx;
}

.pay-method-wrap {
	background: #fafbfc;
	border-radius: 18rpx;
	padding: 22rpx 24rpx 10rpx;
	margin-bottom: 30rpx;
}

.pay-method-title {
	display: block;
	font-size: 26rpx;
	color: #666;
	margin-bottom: 12rpx;
}

.pay-option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 90rpx;
	border-bottom: 1rpx solid #efefef;
}

.pay-option:last-child {
	border-bottom: none;
}

.po-name {
	font-size: 30rpx;
	color: #333;
}

.check {
	color: #07c160;
	font-size: 34rpx;
}

.unsel {
	color: #c8c8c8;
	font-size: 32rpx;
}

.pay-sheet-btn-full {
	width: 100%;
	margin-bottom: 24rpx;
}

.pay-sheet-cancel {
	display: block;
	text-align: center;
	font-size: 28rpx;
	color: #999;
	padding: 12rpx 0;
}
</style>

<style lang="scss">
page {
	height: 100%;
	background: #ffffff;
}
</style>
