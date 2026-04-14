<template>
  <view class="appointment-page" :data-theme="theme">
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

    <!-- 与 interface.md：query.status 预约状态 0待服务 1已完成 2已取消 -->
    <scroll-view scroll-x class="status-tabs-wrap" :show-scrollbar="false" enable-flex>
      <view class="status-tabs">
        <view
          class="tab-item"
          :class="{ active: currentStatus === item.value }"
          v-for="item in statusList"
          :key="item.value"
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
          <view class="card-status" :class="statusBadgeClass(item.status)">{{ item.status | physioRowStatusFilter }}</view>
        </view>
        <view class="card-body">
          <view class="card-img">
            <image :src="therapistAvatar(item)" mode="aspectFill"></image>
          </view>
          <view class="card-info">
            <view class="card-name line1">{{ categoryName(item) }}</view>
            <view class="card-meta-line">
              <text class="meta-label">状态</text>
              <text class="meta-status" :class="statusBadgeClass(item.status)">{{ item.status | physioRowStatusFilter }}</text>
            </view>
            <view class="card-time">
              <text class="time-label">预约时间</text>
              {{ item.appointTime || '--' }}
            </view>
            <view class="card-time line1" v-if="item.address">地点：{{ item.address }}</view>
            <view class="card-bottom-pay">
              <text class="fee-text">¥{{ formatFee(item.fee) }}</text>
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
      <empty-page title="暂无预约记录~" :imgSrc="urlDomain+'crmebimage/presets/noJilu.png'"></empty-page>
    </view>

    <view v-if="loading" class="loading-wrap">
      <text>加载中...</text>
    </view>

    <physio-cancel-reason-popup
      :visible.sync="cancelReasonPopupVisible"
      @confirm="submitCancelWithReason"
    />
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import orderPay from '@/mixins/OrderPay.js';
import {
  getPhysiotherapyAppointmentListApi,
  getClinicListApi,
  physiotherapyAppointmentPayApi,
  physiotherapyAppointmentCancelApi
} from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';
import physioCancelReasonPopup from '@/components/physioCancelReasonPopup/index.vue';
import { setPhysioAppointmentDetailNav } from '@/utils/physioAppointmentDetailNav.js';

let app = getApp();
export default {
  mixins: [orderPay],
  components: { emptyPage, physioCancelReasonPopup },
  filters: {
    /**
     * 列表项 status（与 interface 预约状态一致）
     * 0待服务 1已完成 2已取消；若后端仍返回 3 表示已取消则兼容
     */
    physioRowStatusFilter(status) {
      const map = {
        0: '待服务',
        1: '已完成',
        2: '已取消',
        3: '已取消'
      };
      return map[status] != null ? map[status] : '未知';
    },
    payStatusFilter(ps) {
      const map = { 0: '未支付', 1: '已支付', 2: '已退款' };
      return map[ps] != null ? map[ps] : '';
    }
  },
  computed: {
    ...mapGetters(['isLogin', 'systemPlatform'])
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
      /** 与 GET therapist/physiotherapy-appointment/list 的 query.status 一致 */
      statusList: [
        { label: '全部', value: -1 },
        { label: '待服务', value: 0 },
        { label: '已完成', value: 1 },
        { label: '已取消', value: 2 }
      ],
      currentStatus: -1,
      appointmentList: [],
      loading: false,
      loadend: false,
      page: 1,
      limit: 10,
      /** 正在发起支付的预约 id，避免列表重复点击 */
      payingAppointmentId: null,
      cancelReasonPopupVisible: false,
      cancelTarget: null
    }
  },
  onLoad(options) {
    this.merId = options.merId ? parseInt(options.merId, 10) : 0;
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
    if (app.globalData && app.globalData.physioAppointmentNeedRefresh) {
      this.loading = true;
    } else {
      this.getList();
    }
  },
  onShow() {
    if (!this.isLogin) return;
    const app = getApp();
    if (app.globalData && app.globalData.physioAppointmentNeedRefresh) {
      app.globalData.physioAppointmentNeedRefresh = false;
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
      const p = item.therapistInfo && item.therapistInfo.picture;
      if (p && String(p).trim()) {
        const u = this.resolveImgUrl(String(p).trim());
        if (u) return u;
      }
      return `${this.urlDomain}crmebimage/presets/morenT.png`;
    },
    categoryName(item) {
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
    /** 未支付且待服务、金额大于 0，与详情页 canPay 一致 */
    canPayItem(item) {
      if (!item) return false;
      const s = Number(item.status);
      if (s === 1 || s === 2 || s === 3) return false;
      const fee = Number(item.fee);
      if (isNaN(fee) || fee <= 0) return false;
      return Number(item.payStatus) === 0;
    },
    /** 仅已支付且待服务可取消（与详情 canCancel 一致） */
    canCancel(item) {
      if (!item) return false;
      const s = item.status;
      if (s === 1 || s === 2 || s === 3) return false;
      const ps = item.payStatus;
      if (ps === 2 || ps === '2') return false;
      return ps === 1 || ps === '1' || ps === true || Number(ps) === 1;
    },
    statusBadgeClass(status) {
      const s = Number(status);
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
      getPhysiotherapyAppointmentListApi(params)
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
      physiotherapyAppointmentCancelApi({ appointmentId, cancelReason: reasonTrim })
        .then(() => {
          this.$util.Tips({ title: '取消成功' });
          this.appointmentList.splice(index, 1);
          this.cancelTarget = null;
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
      const t = item.therapistInfo;
      setPhysioAppointmentDetailNav({
        appointmentId,
        mchId: this.currentStoreId > 0 ? this.currentStoreId : undefined,
        therapistName: (t && t.name) || ''
      });
      this.$util.navigateTo('/pages/clinic/physio_appointment_detail/index');
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
    payAppointment(item) {
      if (!this.canPayItem(item)) return;
      const id = item.id != null ? item.id : item.appointmentId;
      if (id == null || id === '') {
        return this.$util.Tips({ title: '缺少预约编号' });
      }
      if (this.payingAppointmentId != null) return;
      this.payingAppointmentId = id;
      const { payChannel, payType } = this.resolvePayChannel();
      physiotherapyAppointmentPayApi({
        id,
        payChannel,
        payType,
        from: ''
      })
        .then((payRes) => {
          const d = payRes.data;
          const g = getApp();
          if (g.globalData) {
            g.globalData.physioAppointmentNeedRefresh = true;
          }
          if (d && d.jsConfig) {
            const mid =
              item.mchId ||
              (item.therapistInfo && item.therapistInfo.mchId) ||
              this.currentStoreId;
            const goPages =
              mid > 0
                ? `/pages/clinic/therapist/index?mchId=${mid}`
                : '/pages/clinic/appointment/index';
            this.payingAppointmentId = null;
            this.weixinPay(
              d.jsConfig,
              String(d.payOrderNo || id),
              goPages,
              'normal',
              ''
            );
          } else {
            this.payingAppointmentId = null;
            this.$util.Tips({ title: '支付已发起' });
            this.resetList();
            this.getList();
          }
        })
        .catch((err) => {
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

.line1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
