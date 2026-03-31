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
                  <view class="card-name line1">{{ item.physiotherapyCategory || item.physiotherapyType || '理疗预约' }}</view>
                  <view class="card-meta-line">
                    <text class="meta-label">状态</text>
                    <text class="meta-status" :class="statusBadgeClass(item.status)">{{ item.status | physioRowStatusFilter }}</text>
                  </view>
                  <view class="card-time">
                    <text class="time-label">预约时间</text>
                    {{ item.appointTime || '--' }}
                  </view>
                  <view class="card-time line1" v-if="item.address">地点：{{ item.address }}</view>
                  <view class="card-therapist">¥{{ item.fee != null ? item.fee : 0 }} · {{ item.payStatus | payStatusFilter }}</view>
                </view>
              </view>
              <view class="card-footer" v-if="canCancel(item)">
                <view class="cancel-btn" @click.stop="cancelAppointment(item, index)">取消预约</view>
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
  </view>
</template>

<script>
import { mapGetters } from 'vuex';
import { getPhysiotherapyAppointmentListApi, getTherapistByMchApi } from '@/api/clinic.js';
import { cancelReservationApi } from '@/api/order.js';
import emptyPage from '@/components/emptyPage.vue';

let app = getApp();
export default {
  components: { emptyPage },
  filters: {
    physioRowStatusFilter(status) {
      const map = { 0: '待服务', 1: '已完成', 2: '已取消', 3: '已取消' };
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
      showTherapistPicker: false,
      pickTherapistList: [],
      pickLoading: false
    };
  },
  onLoad(options) {
    this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
    if (!this.isLogin) {
      return this.$util.navigateTo('/pages/users/login/index');
    }
    this.resetList();
    if (this.mchId) {
      this.getAppointmentList();
    } else {
      this.loading = false;
    }
  },
  onShow() {
    if (!this.isLogin) return;
    const app = getApp();
    if (app.globalData && app.globalData.physioBookJustCreated) {
      app.globalData.physioBookJustCreated = false;
      if (this.mchId) {
        this.loading = false;
        this.resetList();
        this.getAppointmentList();
      }
    }
  },
  methods: {
    therapistTitle(item) {
      const t = item.therapistInfo;
      return t && t.name ? t.name : '理疗预约';
    },
    therapistAvatar(item) {
      const p = item.therapistInfo && item.therapistInfo.picture;
      if (p && String(p).trim()) return String(p).trim();
      return `${this.urlDomain}crmebimage/presets/morenT.png`;
    },
    statusBadgeClass(status) {
      const s = Number(status);
      if (s === 1) return 'badge-done';
      if (s === 2 || s === 3) return 'badge-off';
      return 'badge-wait';
    },
    canCancel(item) {
      const s = item.status;
      if (s === 1 || s === 2 || s === 3) return false;
      return !!item.payOrderNo;
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
    cancelAppointment(item, index) {
      const orderNo = item.payOrderNo;
      if (!orderNo) {
        return this.$util.Tips({ title: '暂无关联订单号，无法取消' });
      }
      uni.showModal({
        title: '提示',
        content: '确定取消该预约吗？',
        success: (res) => {
          if (res.confirm) {
            cancelReservationApi(orderNo)
              .then(() => {
                this.$util.Tips({ title: '取消成功' });
                this.appointmentList.splice(index, 1);
              })
              .catch(err => {
                this.$util.Tips({ title: err || '取消失败' });
              });
          }
        }
      });
    },
    goDetail(item) {
      if (item.payOrderNo) {
        this.$util.navigateTo(`/pages/goods/order_details/index?orderNo=${item.payOrderNo}`);
      } else {
        this.$util.Tips({ title: '暂无关联订单' });
      }
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
      const q = [
        `therapistId=${item.id}`,
        `mchId=${this.mchId}`,
        `name=${encodeURIComponent(item.name || '')}`,
        `domain=${encodeURIComponent(item.hospitalDomain || '')}`,
        `picture=${encodeURIComponent(item.picture || item.avatar || '')}`
      ].join('&');
      this.$util.navigateTo(`/pages/clinic/physio_book/index?${q}`);
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

.card-therapist {
  font-size: 24rpx;
  color: #666;
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
