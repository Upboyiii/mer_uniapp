<template>
  <view class="therapist-page" :data-theme="theme">
    <view class="store-tip" v-if="mchId">
      <text>当前门店 · 预约记录（可筛选状态）</text>
    </view>

    <!-- GET therapist/physiotherapy-appointment/list：query 传 mchId、status -->
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

    <view class="content-box">
      <view class="main-content main-content--full">
        <scroll-view scroll-y class="list-scroll" @scrolltolower="loadMore">
          <view v-if="appointmentList.length > 0" class="appointment-list">
            <view
              class="appointment-card"
              v-for="(item, index) in appointmentList"
              :key="item.id || index"
              @click="goDetail(item)"
            >
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
              <view class="card-footer" v-if="canCancel(item)">
                <view class="cancel-btn" @click.stop="openCancelDialog(item, index)">取消预约</view>
              </view>
            </view>
          </view>

          <view v-else-if="!loading && !mchId" class="empty-content">
            <empty-page title="请先选择门店~" mTop="0" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></empty-page>
          </view>

          <view v-else-if="!loading && mchId" class="empty-content">
            <empty-page title="暂无预约记录~" mTop="0" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></empty-page>
          </view>

          <view v-if="loading" class="loading-wrap">
            <text>加载中...</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 新增预约：therapist/page/mch/list 选理疗师 → physio_book -->
    <view class="footer-bar" v-if="mchId">
      <button class="book-main bg-color" @click="openTherapistPicker">新增预约</button>
    </view>

    <view v-if="showTherapistPicker" class="picker-mask" @click="showTherapistPicker = false">
      <view class="picker-panel" @click.stop>
        <view class="picker-head">
          <text class="picker-title">选择理疗师</text>
          <text class="picker-close" @click="showTherapistPicker = false">关闭</text>
        </view>
        <scroll-view scroll-y class="picker-scroll">
          <view v-if="pickLoading" class="loading-wrap"><text>加载中...</text></view>
          <view
            v-else
            class="pick-row"
            v-for="(item, idx) in pickTherapistList"
            :key="item.id || idx"
            @click="goPhysioBook(item)"
          >
            <image class="pick-avatar" :src="item.picture || item.avatar || defaultFace" mode="aspectFill" />
            <view class="pick-info">
              <view class="pick-name">{{ item.name }}</view>
              <view class="pick-desc line1" v-if="item.hospitalDomain">{{ item.hospitalDomain }}</view>
            </view>
            <text class="iconfont icon-ic_rightarrow pick-arrow"></text>
          </view>
          <view v-if="!pickLoading && pickTherapistList.length === 0" class="empty-content">
            <text class="empty-txt">该门店暂无理疗师</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <physio-cancel-reason-popup
      :visible.sync="cancelReasonPopupVisible"
      @confirm="submitCancelWithReason"
    />
  </view>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  getPhysiotherapyAppointmentListApi,
  getTherapistByMchApi,
  physiotherapyAppointmentCancelApi
} from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';
import physioCancelReasonPopup from '@/components/physioCancelReasonPopup/index.vue';
import { setPhysioAppointmentDetailNav } from '@/utils/physioAppointmentDetailNav.js';
import { setPhysioBookNav } from '@/utils/physioBookNav.js';

let app = getApp();
export default {
  components: { emptyPage, physioCancelReasonPopup },
  filters: {
    physioRowStatusFilter(status) {
      const map = { 0: '待确认', 1: '已确认', 2: '已完成', 3: '已取消' };
      return map[status] != null ? map[status] : '未知';
    },
    payStatusFilter(ps) {
      const map = { 0: '未支付', 1: '已支付', 2: '已退款' };
      return map[ps] != null ? map[ps] : '';
    }
  },
  computed: {
    ...mapGetters(['isLogin']),
    defaultFace() {
      const raw = (this.$Cache.get('imgHost') || '').replace(/\/?$/, '/');
      return raw ? `${raw}crmebimage/presets/morenT.png` : '/static/images/f.png';
    }
  },
  data() {
    return {
      urlDomain: (this.$Cache.get('imgHost') || '').replace(/\/?$/, '/'),
      theme: app.globalData.theme,
      mchId: 0,
      statusList: [
        { label: '全部', value: -1 },
        { label: '待确认', value: 0 },
        { label: '已确认', value: 1 },
        { label: '已完成', value: 2 },
        { label: '已取消', value: 3 }
      ],
      currentStatus: -1,
      appointmentList: [],
      loading: false,
      loadend: false,
      page: 1,
      limit: 10,
      showTherapistPicker: false,
      pickTherapistList: [],
      pickLoading: false,
      cancelReasonPopupVisible: false,
      cancelTarget: null
    };
  },
  onLoad(options) {
    this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
    if (!this.isLogin) {
      return this.$util.navigateTo('/pages/users/login/index');
    }
    this.resetList();
    const app = getApp();
    /** 与 appointment/index：避免 onLoad 与 onShow(physioBookJustCreated) 重复拉第一页 */
    const skipFirstLoad = app.globalData && app.globalData.physioBookJustCreated;
    if (this.mchId && !skipFirstLoad) {
      this.getAppointmentList();
    } else if (this.mchId && skipFirstLoad) {
      this.loading = true;
    } else if (!this.mchId) {
      this.loading = false;
    }
  },
  /**
   * 栈里只有当前页时（如分享直达），系统返回会落到首页 tab；
   * 从门店进入时已写入 CLINIC_THERAPIST_REF=store，此处回到门店 tab。
   */
  onBackPress() {
    return this.handleTherapistBack();
  },
  onShow() {
    if (!this.isLogin) return;
    const app = getApp();
    if (app.globalData && app.globalData.physioBookJustCreated) {
      app.globalData.physioBookJustCreated = false;
      if (this.mchId) {
        this.resetList();
        this.loading = false;
        this.getAppointmentList();
      }
    }
  },
  methods: {
    handleTherapistBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        return false;
      }
      let ref = '';
      let mer = '';
      try {
        ref = uni.getStorageSync('CLINIC_THERAPIST_REF') || '';
        mer = uni.getStorageSync('CLINIC_THERAPIST_BACK_MER') || '';
      } catch (e) {}
      try {
        uni.removeStorageSync('CLINIC_THERAPIST_REF');
        uni.removeStorageSync('CLINIC_THERAPIST_BACK_MER');
      } catch (e) {}

      const mch = this.mchId || (mer ? parseInt(mer, 10) : 0);
      if (ref === 'store' && mch) {
        try {
          uni.setStorageSync('CLINIC_HOME_MER_ID', String(mch));
        } catch (e) {}
        uni.switchTab({ url: '/pages/clinic/home/index' });
      } else {
        uni.switchTab({ url: '/pages/index/index' });
      }
      return true;
    },
    therapistTitle(item) {
      const t = item.therapistInfo;
      return t && t.name ? t.name : '理疗预约';
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
    /** 优先 physiotherapyCategoryInfo.name */
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
    statusBadgeClass(status) {
      const s = Number(status);
      if (s === 2) return 'badge-done';
      if (s === 3) return 'badge-off';
      return 'badge-wait';
    },
    canCancel(item) {
      if (!item) return false;
      const s = item.status;
      if (s === 2 || s === 3) return false;
      const ps = item.payStatus;
      if (ps === 2 || ps === '2') return false;
      return ps === 1 || ps === '1' || ps === true || Number(ps) === 1;
    },
    getAppointmentList() {
      if (!this.mchId || this.loadend || this.loading) return;
      this.loading = true;
      const params = {
        page: this.page,
        limit: this.limit,
        mchId: this.mchId
      };
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
        })
        .catch(() => {
          this.loading = false;
        });
    },
    resetList() {
      this.page = 1;
      this.loadend = false;
      this.appointmentList = [];
    },
    loadMore() {
      this.getAppointmentList();
    },
    switchStatus(status) {
      if (this.currentStatus === status) return;
      this.currentStatus = status;
      this.resetList();
      this.getAppointmentList();
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
        mchId: this.mchId || undefined,
        therapistName: (t && t.name) || ''
      });
      this.$util.navigateTo('/pages/clinic/physio_appointment_detail/index');
    },
    openTherapistPicker() {
      if (!this.isLogin) {
        return this.$util.navigateTo('/pages/users/login/index');
      }
      this.showTherapistPicker = true;
      if (this.pickTherapistList.length > 0 || this.pickLoading) return;
      this.pickLoading = true;
      getTherapistByMchApi({ page: 1, limit: 100, mchId: this.mchId })
        .then(res => {
          let list = (res.data && res.data.list) || res.data || [];
          if (!Array.isArray(list)) list = [];
          this.pickTherapistList = list;
          this.pickLoading = false;
        })
        .catch(() => {
          this.pickLoading = false;
        });
    },
    goPhysioBook(item) {
      this.showTherapistPicker = false;
      setPhysioBookNav({
        therapistId: item.id,
        mchId: this.mchId,
        name: item.name || '',
        domain: item.hospitalDomain || '',
        picture: item.picture || item.avatar || ''
      });
      this.$util.navigateTo('/pages/clinic/physio_book/index');
    }
  }
};
</script>

<style lang="scss" scoped>
.therapist-page {
  background-color: #f5f5f5;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.store-tip {
  flex-shrink: 0;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  color: #999;
  background: #fafafa;
}

.status-tabs-wrap {
  flex-shrink: 0;
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

.content-box {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  min-height: 0;
  background: #fff;
  overflow: hidden;

  &--full {
    width: 100%;
    height: 100%;
  }
}

.list-scroll {
  height: 100%;
}

.appointment-list {
  padding: 20rpx 24rpx;
}

.appointment-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  border: 1px solid #f0f0f0;
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

.card-time {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
}

.time-label {
  color: #999;
  margin-right: 8rpx;
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
  justify-content: flex-end;
  padding: 0 24rpx 24rpx;
}

.cancel-btn {
  padding: 12rpx 32rpx;
  border: 1px solid #ddd;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #666;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 24rpx 120rpx;
  box-sizing: border-box;
}

.empty-txt {
  font-size: 26rpx;
  color: #999;
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

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.book-main {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  color: #fff;
  border: none;
}

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

.pick-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.pick-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.pick-info {
  flex: 1;
  min-width: 0;
}

.pick-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #282828;
}

.pick-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.pick-arrow {
  font-size: 24rpx;
  color: #ccc;
}
</style>
