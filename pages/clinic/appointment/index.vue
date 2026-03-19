<template>
  <view class="appointment-page" :data-theme="theme">
    <!-- 顶部门店选择 -->
    <view class="store-selector" @click="showStorePicker = !showStorePicker">
      <text class="store-name">{{ currentStoreName || '全部门店' }}</text>
      <text class="iconfont icon-ic_rightarrow" :class="{ 'rotate-down': showStorePicker }" style="font-size: 24rpx; margin-left: 8rpx; transition: transform 0.3s;"></text>
    </view>

    <!-- 门店选择下拉 -->
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

    <!-- 状态标签 -->
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

    <!-- 预约列表 -->
    <view class="appointment-list" v-if="appointmentList.length > 0">
      <view class="appointment-card" v-for="(item, index) in appointmentList" :key="index" @click="goDetail(item)">
        <view class="card-header">
          <view class="card-store">{{ item.merName || item.storeName }}</view>
          <view class="card-status" :class="'status-' + item.status">{{ item.status | appointmentStatusFilter }}</view>
        </view>
        <view class="card-body">
          <view class="card-img">
            <image :src="item.image" mode="aspectFill"></image>
          </view>
          <view class="card-info">
            <view class="card-name line1">{{ item.productName || item.serviceName }}</view>
            <view class="card-time">{{ item.reservationTime || item.appointmentTime }}</view>
            <view class="card-therapist" v-if="item.therapistName">理疗师：{{ item.therapistName }}</view>
          </view>
        </view>
        <view class="card-footer" v-if="item.status === 0 || item.status === 'pending'">
          <view class="cancel-btn" @click.stop="cancelAppointment(item, index)">取消预约</view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!loading" class="empty-wrap">
      <empty-page title="暂无数据"></empty-page>
    </view>

    <!-- 加载更多 -->
    <view v-if="loading" class="loading-wrap">
      <text>加载中...</text>
    </view>
    <view v-else-if="loadend && appointmentList.length > 0" class="loading-wrap">
      <text>没有更多了</text>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { getMyAppointmentListApi } from '@/api/clinic.js';
import { cancelReservationApi } from '@/api/order.js';
import emptyPage from '@/components/emptyPage.vue';

let app = getApp();
export default {
  components: { emptyPage },
  filters: {
    appointmentStatusFilter(status) {
      const map = {
        0: '待服务',
        1: '待服务',
        'pending': '待服务',
        2: '已完成',
        'completed': '已完成',
        3: '已失效',
        'expired': '已失效',
        9: '已取消',
        'cancelled': '已取消'
      };
      return map[status] || '未知';
    }
  },
  computed: {
    ...mapGetters(['isLogin'])
  },
  data() {
    return {
      theme: app.globalData.theme,
      merId: 0,
      currentStoreName: '',
      currentStoreId: 0,
      storeList: [],
      showStorePicker: false,
      statusList: [
        { label: '全部', value: -1 },
        { label: '待服务', value: 0 },
        { label: '已完成', value: 2 },
        { label: '已失效', value: 3 }
      ],
      currentStatus: -1,
      appointmentList: [],
      loading: false,
      loadend: false,
      page: 1,
      limit: 10
    }
  },
  onLoad(options) {
    this.merId = options.merId ? parseInt(options.merId) : 0;
    if (this.merId) {
      this.currentStoreId = this.merId;
    }
    this.getList();
  },
  onPullDownRefresh() {
    this.resetList();
    this.getList();
  },
  onReachBottom() {
    this.getList();
  },
  methods: {
    getList() {
      if (this.loadend) return;
      this.loading = true;
      let params = {
        page: this.page,
        limit: this.limit
      };
      if (this.currentStoreId > 0) {
        params.merId = this.currentStoreId;
      }
      if (this.currentStatus >= 0) {
        params.status = this.currentStatus;
      }
      getMyAppointmentListApi(params).then(res => {
        let list = res.data.list || res.data || [];
        if (list.length < this.limit) this.loadend = true;
        this.appointmentList = this.appointmentList.concat(list);
        this.page++;
        this.loading = false;
        uni.stopPullDownRefresh();
      }).catch(() => {
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

    cancelAppointment(item, index) {
      uni.showModal({
        title: '提示',
        content: '确定取消该预约吗？',
        success: (res) => {
          if (res.confirm) {
            let orderNo = item.orderNo || item.id;
            cancelReservationApi(orderNo).then(() => {
              this.$util.Tips({ title: '取消成功' });
              this.appointmentList.splice(index, 1);
            }).catch(err => {
              this.$util.Tips({ title: err || '取消失败' });
            });
          }
        }
      });
    },

    goDetail(item) {
      let orderNo = item.orderNo || item.id;
      this.$util.navigateTo(`/pages/goods/order_details/index?orderNo=${orderNo}`);
    }
  }
}
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

.status-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0 20rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;

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
}

.card-status {
  font-size: 24rpx;
  color: var(--view-theme);

  &.status-2, &.status-completed {
    color: #999;
  }

  &.status-3, &.status-expired, &.status-9, &.status-cancelled {
    color: #ccc;
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

.card-time {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
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

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 250rpx;
}

.empty-img {
  width: 300rpx;
  height: 240rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

.loading-wrap {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>
