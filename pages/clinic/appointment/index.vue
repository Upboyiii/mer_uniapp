<template>
  <view class="appointment-page" :data-theme="theme">
    <!-- 预约类型：理疗 / 中医（数据源不同） -->
    <view class="category-tabs-row">
      <view
        class="cat-tab"
        :class="{ active: appointCategory === 'physio' }"
        @click="switchCategoryTab('physio')"
      >
        <text>理疗预约</text>
        <view v-if="appointCategory === 'physio'" class="cat-tab-line"></view>
      </view>
      <view
        class="cat-tab"
        :class="{ active: appointCategory === 'tcm' }"
        @click="switchCategoryTab('tcm')"
      >
        <text>中医预约</text>
        <view v-if="appointCategory === 'tcm'" class="cat-tab-line"></view>
      </view>
    </view>

    <!-- 顶部门店选择（筛选 query：mchId） -->
    <view class="store-selector" @click="showStorePicker = !showStorePicker">
      <text class="store-name">{{ currentStoreName || '全部门店' }}</text>
      <text class="iconfont icon-ic_rightarrow" :class="{ 'rotate-down': showStorePicker }" style="font-size: 24rpx; margin-left: 8rpx; transition: transform 0.3s;"></text>
    </view>

    <view class="store-dropdown" v-if="showStorePicker">
      <view class="mask" @click="showStorePicker = false"></view>
      <view class="dropdown-list">
        <view
          class="dropdown-item"
          :class="{ active: currentStoreId === 0 }"
          @click="selectStore(0, '全部门店')"
        >
          <text>全部门店</text>
        </view>
        <view
          class="dropdown-item"
          :class="{ active: currentStoreId === item.id }"
          v-for="item in storeList"
          :key="item.id"
          @click="selectStore(item.id, item.name)"
        >
          <text>{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 状态筛选：理疗 interface 0待服务 1已完成 2已取消；中医 interface 0待确认 1已确认 2已完成 3已取消 -->
    <scroll-view scroll-x class="status-tabs-wrap" :show-scrollbar="false" enable-flex>
      <view class="status-tabs">
        <view
          class="tab-item"
          :class="{ active: currentStatus === item.value }"
          v-for="item in statusTabs"
          :key="appointCategory + '-' + item.value"
          @click="switchStatus(item.value)"
        >
          <text>{{ item.label }}</text>
          <view class="tab-line" v-if="currentStatus === item.value"></view>
        </view>
      </view>
    </scroll-view>

    <view class="appointment-list" v-if="appointmentList.length > 0">
      <view class="appointment-card" v-for="(item, index) in appointmentList" :key="item.id || index" @click="goDetail(item)">
        <view class="card-header">
          <view class="card-store line1">{{ therapistTitle(item) }}</view>
          <view class="card-status" :class="statusBadgeClass(item.status)">{{ rowStatusText(item.status) }}</view>
        </view>
        <view class="card-body">
          <view class="card-img">
            <image :src="therapistAvatar(item)" mode="aspectFill"></image>
          </view>
          <view class="card-info">
            <view class="card-name line1">{{ categoryName(item) }}</view>
            <view class="card-meta-line">
              <text class="meta-label">状态</text>
              <text class="meta-status" :class="statusBadgeClass(item.status)">{{ rowStatusText(item.status) }}</text>
            </view>
            <view class="card-time">
              <text class="time-label">预约时间</text>
              {{ item.appointTime || '--' }}
            </view>
            <view class="card-time line1" v-if="item.address || item.userAddress">地点：{{ item.address || item.userAddress }}</view>
            <view class="card-bottom-pay">
              <text class="fee-text">¥{{ formatFee(itemFee(item)) }}</text>
              <text class="pay-tag" :class="payTagClass(item.payStatus)">{{ item.payStatus | payStatusFilter }}</text>
            </view>
          </view>
        </view>
        <view class="card-footer" v-if="canPayItem(item) || canCancel(item)">
          <view
            v-if="canPayItem(item)"
            class="pay-btn"
            :class="{ 'pay-btn--busy': payingAppointmentId === item.id }"
            @click.stop="payAppointment(item)"
          >
            {{ payingAppointmentId === item.id ? '支付中…' : '立即支付' }}
          </view>
          <view
            v-if="canCancel(item)"
            class="cancel-btn"
            @click.stop="openCancelDialog(item, index)"
          >
            取消预约
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="!loading" class="empty-wrap">
      <empty-page
        :title="appointCategory === 'tcm' ? '暂无中医预约记录~' : '暂无理疗预约记录~'"
        :imgSrc="urlDomain+'crmebimage/presets/noJilu.png'"
      ></empty-page>
    </view>

    <view v-if="loading" class="loading-wrap">
      <text>加载中...</text>
    </view>

    <physio-cancel-reason-popup
      :visible.sync="cancelReasonPopupVisible"
      @confirm="submitCancelWithReason"
    />

    <view v-if="showPaySheet" class="pay-sheet-mask" @click="closePaySheet(false)">
      <view class="pay-sheet" @click.stop>
        <view class="pay-sheet-grabber"></view>
        <view class="pay-sheet-head">
          <text class="pay-sheet-title">确认支付</text>
          <text class="iconfont icon-ic_close pay-sheet-close" @click="closePaySheet(false)"></text>
        </view>
        <text class="pay-sheet-amount">¥{{ formatFee(pendingPayAmount) }}</text>
        <text v-if="pendingPayOrderNo" class="pay-sheet-order line1">订单号 {{ pendingPayOrderNo }}</text>
        <view class="pay-method-wrap">
          <text class="pay-method-title">支付方式</text>
          <view class="pay-option" @click="sheetPayMethod = 'weixin'">
            <text class="po-name">微信支付</text>
            <text
              class="iconfont"
              :class="sheetPayMethod === 'weixin' ? 'icon-a-ic_CompleteSelect check' : 'icon-ic_unselect unsel'"
            ></text>
          </view>
          <!-- #ifndef MP -->
          <view class="pay-option" @click="sheetPayMethod = 'alipay'">
            <text class="po-name">支付宝支付</text>
            <text
              class="iconfont"
              :class="sheetPayMethod === 'alipay' ? 'icon-a-ic_CompleteSelect check' : 'icon-ic_unselect unsel'"
            ></text>
          </view>
          <!-- #endif -->
        </view>
        <button
          class="sheet-pay-btn bg-color"
          hover-class="sheet-pay-btn-hover"
          :disabled="payingAppointmentId != null"
          @click="confirmPayInSheet"
        >
          {{ payingAppointmentId != null ? '支付中…' : '立即支付' }}
        </button>
      </view>
    </view>

    <!-- #ifdef H5 -->
    <view v-if="formContent" class="alipaysubmit" v-html="formContent"></view>
    <!-- #endif -->
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import orderPay from '@/mixins/OrderPay.js';
import {
  getPhysiotherapyAppointmentListApi,
  getTcmAppointmentListApi,
  getClinicListApi,
  physiotherapyAppointmentPayApi,
  physiotherapyAppointmentCancelApi,
  tcmAppointmentPayApi,
  tcmAppointmentCancelApi
} from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';
import physioCancelReasonPopup from '@/components/physioCancelReasonPopup/index.vue';
import { setPhysioAppointmentDetailNav } from '@/utils/physioAppointmentDetailNav.js';

let app = getApp();
export default {
  mixins: [orderPay],
  components: { emptyPage, physioCancelReasonPopup },
  filters: {
    payStatusFilter(ps) {
      const map = { 0: '未支付', 1: '已支付', 2: '已退款' };
      return map[ps] != null ? map[ps] : '';
    }
  },
  computed: {
    ...mapGetters(['isLogin', 'systemPlatform']),
    /** interface.md：理疗 status 0待服务 1已完成 2已取消；中医 status 0待确认 1已确认 2已完成 3已取消 */
    statusTabs() {
      if (this.appointCategory === 'tcm') {
        return [
          { label: '全部', value: -1 },
          { label: '待确认', value: 0 },
          { label: '已确认', value: 1 },
          { label: '已完成', value: 2 },
          { label: '已取消', value: 3 }
        ];
      }
      return [
        { label: '全部', value: -1 },
        { label: '待服务', value: 0 },
        { label: '已完成', value: 1 },
        { label: '已取消', value: 2 }
      ];
    }
  },
  data() {
    return {
      urlDomain: (this.$Cache.get("imgHost") || '').replace(/\/?$/, '/'),
      theme: app.globalData.theme,
      merId: 0,
      currentStoreName: '',
      currentStoreId: 0,
      storeList: [],
      showStorePicker: false,
      currentStatus: -1,
      appointmentList: [],
      loading: false,
      loadend: false,
      page: 1,
      limit: 10,
      /** 正在发起支付的预约 id，避免列表重复点击 */
      payingAppointmentId: null,
      cancelReasonPopupVisible: false,
      cancelTarget: null,
      /** physio：理疗预约单列表；tcm：中医预约单 doctor/tcm-appointment/list */
      appointCategory: 'physio',
      /** 从支付结果页进入时，返回应直接去 tabbar-我的 */
      fromPaySuccess: false,
      showPaySheet: false,
      pendingPayItem: null,
      pendingPayOrderNo: '',
      pendingPayAmount: 0,
      sheetPayMethod: 'weixin',
      // #ifdef H5
      formContent: ''
      // #endif
    }
  },
  onLoad(options) {
    if (options.category === 'tcm') {
      this.appointCategory = 'tcm';
      this.currentStatus = -1;
    } else if (options.category === 'physio') {
      this.appointCategory = 'physio';
      this.currentStatus = -1;
    }
    this.merId = options.merId ? parseInt(options.merId, 10) : 0;
    this.fromPaySuccess = options.fromPaySuccess === '1' || options.fromPaySuccess === 'true';
    if (this.merId) {
      this.currentStoreId = this.merId;
    }
    this.loadStoreList();
    if (!this.isLogin) {
      return this.$util.navigateTo('/pages/users/login/index');
    }
    /**
     * 预约成功后 physio_book 会设 physioAppointmentNeedRefresh。
     * 若此处仍 getList，会与 onShow 里 reset+getList 并发，两页第一页数据 concat 叠一份（退出再进才正常）。
     */
    const app = getApp();
    const hasCategoryQuery = options.category === 'tcm' || options.category === 'physio';
    if (app.globalData && app.globalData.physioAppointmentNeedRefresh) {
      this.loading = true;
      if (!hasCategoryQuery) this.appointCategory = 'physio';
    } else if (app.globalData && app.globalData.tcmAppointmentNeedRefresh) {
      this.loading = true;
      if (!hasCategoryQuery) this.appointCategory = 'tcm';
    } else {
      this.getList();
    }
  },
  onBackPress() {
    if (!this.fromPaySuccess) return false;
    uni.switchTab({ url: '/pages/user/index' });
    return true;
  },
  onShow() {
    if (!this.isLogin) return;
    this.payingAppointmentId = null;
    const app = getApp();
    if (app.globalData && app.globalData.physioAppointmentNeedRefresh) {
      app.globalData.physioAppointmentNeedRefresh = false;
      this.appointCategory = 'physio';
      this.resetList();
      this.loading = false;
      this.getList();
    }
    if (app.globalData && app.globalData.tcmAppointmentNeedRefresh) {
      app.globalData.tcmAppointmentNeedRefresh = false;
      this.appointCategory = 'tcm';
      this.resetList();
      this.loading = false;
      this.getList();
    }
  },
  onPullDownRefresh() {
    this.resetList();
    this.getList();
  },
  onReachBottom() {
    this.getList();
  },
  methods: {
    loadStoreList() {
      getClinicListApi({ page: 1, limit: 200 })
        .then(res => {
          let list = (res.data && res.data.list) || res.data || [];
          if (!Array.isArray(list)) list = [];
          this.storeList = list;
        })
        .catch(() => {});
    },
    therapistTitle(item) {
      if (this.appointCategory === 'tcm') {
        const d = item.doctorInfo || item.doctor;
        if (d && d.name) return d.name;
        return item.doctorName || '中医预约';
      }
      const t = item.therapistInfo;
      if (t && t.name) return t.name;
      return '理疗预约';
    },
    resolveImgUrl(path) {
      if (!path || !String(path).trim()) return '';
      const p = String(path).trim();
      if (/^https?:\/\//i.test(p)) return p;
      const base = (this.$Cache.get('imgHost') || '').replace(/\/?$/, '');
      if (!base) return p;
      return p.startsWith('/') ? base + p : `${base}/${p}`;
    },
    therapistAvatar(item) {
      if (this.appointCategory === 'tcm') {
        const d = item.doctorInfo || item.doctor;
        const p = d && (d.picture || d.avatar || d.headImg);
        if (p && String(p).trim()) {
          const u = this.resolveImgUrl(String(p).trim());
          if (u) return u;
        }
        return `${this.urlDomain}crmebimage/presets/morenT.png`;
      }
      const p = item.therapistInfo && item.therapistInfo.picture;
      if (p && String(p).trim()) {
        const u = this.resolveImgUrl(String(p).trim());
        if (u) return u;
      }
      return `${this.urlDomain}crmebimage/presets/morenT.png`;
    },
    categoryName(item) {
      if (this.appointCategory === 'tcm') {
        const c = item.tcmCategoryInfo;
        if (c && c.name) return c.name;
        return (
          item.serviceName ||
          item.projectName ||
          item.tcmServiceName ||
          item.categoryName ||
          item.remark ||
          '中医项目'
        );
      }
      const c = item.physiotherapyCategoryInfo;
      if (c && c.name) return c.name;
      return item.physiotherapyCategory || item.physiotherapyType || '理疗项目';
    },
    payTagClass(ps) {
      const n = Number(ps);
      if (n === 0) return 'pay-unpaid';
      if (n === 1) return 'pay-paid';
      if (n === 2) return 'pay-refund';
      return '';
    },
    formatFee(f) {
      if (f == null || f === '') return '0';
      const n = Number(f);
      return isNaN(n) ? f : n;
    },
    /** interface 中医列表用 amount 表示预约费用，理疗用 fee */
    itemFee(item) {
      if (!item) return '';
      if (this.appointCategory === 'tcm') {
        const raw = item.amount != null && item.amount !== '' ? item.amount : item.fee;
        return raw;
      }
      return item.fee != null && item.fee !== '' ? item.fee : item.amount;
    },
    rowStatusText(status) {
      if (this.appointCategory === 'tcm') {
        const map = { 0: '待确认', 1: '已确认', 2: '已完成', 3: '已取消' };
        return map[status] != null ? map[status] : '未知';
      }
      const map = {
        0: '待服务',
        1: '已完成',
        2: '已取消',
        3: '已取消'
      };
      return map[status] != null ? map[status] : '未知';
    },
    /** 未支付且未结束、金额大于 0（理疗/中医 status 语义见 interface.md） */
    canPayItem(item) {
      if (!item) return false;
      const s = Number(item.status);
      if (this.appointCategory === 'tcm') {
        if (s === 2 || s === 3) return false;
      } else {
        if (s === 1 || s === 2 || s === 3) return false;
      }
      const fee = Number(this.itemFee(item));
      if (isNaN(fee) || fee <= 0) return false;
      return Number(item.payStatus) === 0;
    },
    /** 仅已支付且可取消状态可取消 */
    canCancel(item) {
      if (!item) return false;
      const s = item.status;
      if (this.appointCategory === 'tcm') {
        if (s === 2 || s === 3) return false;
      } else {
        if (s === 1 || s === 2 || s === 3) return false;
      }
      const ps = item.payStatus;
      if (ps === 2 || ps === '2') return false;
      return ps === 1 || ps === '1' || ps === true || Number(ps) === 1;
    },
    statusBadgeClass(status) {
      const s = Number(status);
      if (this.appointCategory === 'tcm') {
        if (s === 2) return 'badge-done';
        if (s === 3) return 'badge-off';
        return 'badge-wait';
      }
      if (s === 1) return 'badge-done';
      if (s === 2 || s === 3) return 'badge-off';
      return 'badge-wait';
    },
    getList() {
      if (this.loadend || this.loading) return;
      if (!this.isLogin) return;
      this.loading = true;
      const params = {
        page: this.page,
        limit: this.limit
      };
      if (this.currentStoreId > 0) {
        params.mchId = this.currentStoreId;
      }
      if (this.currentStatus >= 0) {
        params.status = this.currentStatus;
      }
      const req =
        this.appointCategory === 'tcm'
          ? getTcmAppointmentListApi(params)
          : getPhysiotherapyAppointmentListApi(params);
      req
        .then(res => {
          let list = (res.data && res.data.list) || [];
          if (!Array.isArray(list)) list = [];
          if (list.length < this.limit) this.loadend = true;
          this.appointmentList = this.appointmentList.concat(list);
          this.page++;
          this.loading = false;
          uni.stopPullDownRefresh();
        })
        .catch(() => {
          this.loading = false;
          uni.stopPullDownRefresh();
        });
    },
    switchCategoryTab(cat) {
      if (this.appointCategory === cat) return;
      this.appointCategory = cat;
      this.currentStatus = -1;
      this.resetList();
      this.getList();
    },
    switchStatus(status) {
      if (this.currentStatus === status) return;
      this.currentStatus = status;
      this.resetList();
      this.getList();
    },
    selectStore(id, name) {
      this.currentStoreId = id;
      this.currentStoreName = name === '全部门店' ? '' : name;
      this.showStorePicker = false;
      this.resetList();
      this.getList();
    },
    resetList() {
      this.page = 1;
      this.loadend = false;
      this.appointmentList = [];
    },
    openCancelDialog(item, index) {
      if (!this.canCancel(item)) return;
      this.cancelTarget = { item, index };
      this.cancelReasonPopupVisible = true;
    },
    submitCancelWithReason(reason) {
      const ctx = this.cancelTarget;
      if (!ctx) return;
      const { item, index } = ctx;
      const reasonTrim = (reason || '').trim();
      if (!reasonTrim) {
        return this.$util.Tips({ title: '请填写取消原因' });
      }
      const rawId = item.id != null ? item.id : item.appointmentId;
      const appointmentId =
        typeof rawId === 'number' ? rawId : parseInt(rawId, 10);
      if (rawId == null || rawId === '' || isNaN(appointmentId)) {
        return this.$util.Tips({ title: '缺少预约信息，无法取消' });
      }
      this.cancelReasonPopupVisible = false;
      const cancelReq =
        this.appointCategory === 'tcm'
          ? tcmAppointmentCancelApi({ appointmentId, cancelReason: reasonTrim })
          : physiotherapyAppointmentCancelApi({ appointmentId, cancelReason: reasonTrim });
      cancelReq
        .then(() => {
          this.$util.Tips({ title: '取消成功' });
          this.cancelTarget = null;
          this.resetList();
          this.getList();
        })
        .catch(err => {
          this.$util.Tips({ title: err || '取消失败' });
        });
    },
    goDetail(item) {
      const appointmentId = item.id != null ? item.id : item.appointmentId;
      if (appointmentId == null || appointmentId === '') {
        return this.$util.Tips({ title: '缺少预约信息' });
      }
      if (this.appointCategory === 'tcm') {
        this.$util.navigateTo(
          `/pages/clinic/physio_appointment_detail/index?id=${appointmentId}&tcm=1`
        );
        return;
      }
      const t = item.therapistInfo;
      setPhysioAppointmentDetailNav({
        appointmentId,
        mchId: this.currentStoreId > 0 ? this.currentStoreId : undefined,
        therapistName: (t && t.name) || ''
      });
      this.$util.navigateTo('/pages/clinic/physio_appointment_detail/index');
    },
    resolvePayChannel() {
      if (this.sheetPayMethod === 'alipay') {
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
    payAppointment(item) {
      if (!this.canPayItem(item)) return;
      const id = item.id != null ? item.id : item.appointmentId;
      if (id == null || id === '') {
        return this.$util.Tips({ title: '缺少预约编号' });
      }
      if (this.payingAppointmentId != null) return;
      this.pendingPayItem = item;
      this.pendingPayOrderNo = (item.orderNo != null ? String(item.orderNo) : '').trim();
      this.pendingPayAmount = this.itemFee(item);
      this.sheetPayMethod = 'weixin';
      this.showPaySheet = true;
    },
    closePaySheet() {
      this.showPaySheet = false;
      this.pendingPayItem = null;
      this.pendingPayOrderNo = '';
      this.pendingPayAmount = 0;
      this.sheetPayMethod = 'weixin';
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
    confirmPayInSheet() {
      if (this.payingAppointmentId != null) return;
      const item = this.pendingPayItem;
      if (!item) return;
      const id = item.id != null ? item.id : item.appointmentId;
      if (id == null || id === '') return;
      // #ifdef MP
      if (this.sheetPayMethod === 'alipay') {
        return this.$util.Tips({ title: '小程序暂不支持支付宝，请使用微信支付' });
      }
      // #endif
      this.payingAppointmentId = id;
      uni.showLoading({ title: '支付中…' });
      const { payChannel, payType } = this.resolvePayChannel();
      const payPayload = { id, payChannel, payType, from: '' };
      const payReq =
        this.appointCategory === 'tcm'
          ? tcmAppointmentPayApi(payPayload)
          : physiotherapyAppointmentPayApi(payPayload);
      payReq
        .then((payRes) => {
          const d = payRes.data;
          const g = getApp();
          if (g.globalData) {
            if (this.appointCategory === 'tcm') {
              g.globalData.tcmAppointmentNeedRefresh = true;
            } else {
              g.globalData.physioAppointmentNeedRefresh = true;
            }
          }
          if (d && d.jsConfig) {
            this.invokeWeixinPay(d.jsConfig)
              .then(() => {
                this.closePaySheet(true);
                this.resetList();
                this.getList();
              })
              .catch((e) => {
                const msg = (typeof e === 'string' && e) || (e && e.errMsg) || '支付未完成，请重试';
                this.$util.Tips({ title: msg });
              })
              .finally(() => {
                uni.hideLoading();
                this.payingAppointmentId = null;
              });
            return;
          }
          if (d && d.alipayRequest) {
            uni.hideLoading();
            this.payingAppointmentId = null;
            this.handleOrderPay(
              payRes,
              String(d.payOrderNo != null ? d.payOrderNo : id),
              'normal',
              '',
              'alipay',
              this.pendingPayAmount
            );
            return;
          }
          {
            uni.hideLoading();
            this.payingAppointmentId = null;
            this.$util.Tips({ title: '支付已发起' });
            this.closePaySheet(true);
            this.resetList();
            this.getList();
          }
        })
        .catch((err) => {
          uni.hideLoading();
          this.payingAppointmentId = null;
          this.$util.Tips({ title: err || '支付发起失败' });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.appointment-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

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

.store-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 30rpx;
  background: #fff;
  font-size: 30rpx;
  font-weight: 600;
  color: #282828;

  .rotate-down {
    transform: rotate(90deg);
  }
}

.store-dropdown {
  position: relative;
  z-index: 999;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
}

.dropdown-list {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 999;
  max-height: 500rpx;
  overflow-y: auto;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  border-radius: 0 0 16rpx 16rpx;
}

.dropdown-item {
  padding: 28rpx 40rpx;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1px solid #f5f5f5;

  &.active {
    color: var(--view-theme);
    font-weight: 600;
  }
}

.status-tabs-wrap {
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
  white-space: nowrap;
}

.status-tabs {
  display: inline-flex;
  min-width: 100%;
  background: #fff;
}

.tab-item {
  flex: 1;
  min-width: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 12rpx 20rpx;
  font-size: 26rpx;
  color: #666;
  position: relative;
  box-sizing: border-box;

  &.active {
    color: #282828;
    font-weight: 600;
  }
}

.tab-line {
  position: absolute;
  bottom: 0;
  width: 48rpx;
  height: 6rpx;
  background: var(--view-theme);
  border-radius: 3rpx;
}

.appointment-list {
  padding: 20rpx 24rpx;
}

.appointment-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 24rpx 0;
}

.card-store {
  font-size: 28rpx;
  font-weight: 600;
  color: #282828;
  flex: 1;
  min-width: 0;
  padding-right: 16rpx;
}

.card-status {
  font-size: 24rpx;
  flex-shrink: 0;

  &.badge-wait {
    color: var(--view-theme);
  }

  &.badge-done {
    color: #52c41a;
  }

  &.badge-off {
    color: #999;
  }
}

.card-meta-line {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.meta-label {
  color: #999;
  margin-right: 12rpx;
}

.meta-status {
  font-weight: 600;

  &.badge-wait {
    color: var(--view-theme);
  }

  &.badge-done {
    color: #52c41a;
  }

  &.badge-off {
    color: #999;
  }
}

.time-label {
  color: #999;
  margin-right: 8rpx;
}

.card-body {
  display: flex;
  padding: 20rpx 24rpx;
}

.card-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20rpx;

  image {
    width: 100%;
    height: 100%;
  }
}

.card-info {
  flex: 1;
  overflow: hidden;
}

.card-name {
  font-size: 28rpx;
  color: #282828;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.card-time {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
}

.card-bottom-pay {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1px solid #f0f0f0;
}

.fee-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #282828;
}

.pay-tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}

.pay-tag.pay-unpaid {
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.12);
}

.pay-tag.pay-paid {
  color: #19be6b;
  background: rgba(25, 190, 107, 0.12);
}

.pay-tag.pay-refund {
  color: #999;
  background: #f5f5f5;
}

.card-footer {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 0 24rpx 24rpx;
}

.pay-btn {
  padding: 12rpx 36rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #fff;
  background: var(--view-theme);

  &--busy {
    opacity: 0.75;
  }
}

.cancel-btn {
  padding: 12rpx 32rpx;
  border: 1px solid #ddd;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #666;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 250rpx;
}

.loading-wrap {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}

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
  overflow-y: auto;
  animation: paySheetUp 0.2s ease-out;
}

@keyframes paySheetUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
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

.pay-sheet-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
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

.pay-sheet-amount {
  display: block;
  text-align: center;
  font-size: 56rpx;
  font-weight: 700;
  color: #e6285f;
  margin-top: 18rpx;
  margin-bottom: 16rpx;
}

.pay-sheet-order {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.pay-method-wrap {
  background: #fafbfc;
  border-radius: 18rpx;
  padding: 22rpx 24rpx 10rpx;
  margin-bottom: 26rpx;
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
  height: 86rpx;
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

.sheet-pay-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  color: #fff;
  border: none;
}

.sheet-pay-btn-hover {
  opacity: 0.9;
}

.line1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
