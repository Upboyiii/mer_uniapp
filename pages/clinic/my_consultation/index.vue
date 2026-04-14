<template>
  <view class="my-consultation-page" :data-theme="theme">
    <!-- 自定义顶栏：返回进入「我的」Tab，避免回到支付等中间页 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-inner" :style="{ minHeight: navContentPx + 'px' }">
        <view class="nav-back" @click="goBack">
          <text class="iconfont icon-ic_leftarrow"></text>
        </view>
        <text class="nav-title">我的问诊</text>
        <view class="nav-back nav-back--ph"></view>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="list-scroll"
      :style="{ height: scrollHeight + 'px' }"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="list.length > 0" class="consult-list">
        <view
          class="consult-card"
          v-for="(item, index) in list"
          :key="item.id || index"
          @click="goDetail(item)"
        >
          <view class="card-header">
            <view class="doctor-info">
              <image
                class="doctor-avatar"
                :src="(item.doctorInfo && item.doctorInfo.picture) || '/static/images/f.png'"
                mode="aspectFill"
              ></image>
              <view class="doctor-meta">
                <view class="doctor-name-row">
                  <text class="doctor-name">{{ (item.doctorInfo && item.doctorInfo.name) || '医生' }}</text>
                  <text class="doctor-title" v-if="item.doctorInfo && item.doctorInfo.hospitalTitle">
                    {{ item.doctorInfo.hospitalTitle }}
                  </text>
                </view>
                <text class="doctor-hospital" v-if="item.doctorInfo && item.doctorInfo.hospitalName">
                  {{ item.doctorInfo.hospitalName }}
                  <text v-if="item.doctorInfo.hospitalSub"> · {{ item.doctorInfo.hospitalSub }}</text>
                </text>
              </view>
            </view>
            <view class="status-badge" :class="statusClass(item.status)">
              {{ statusText(item.status) }}
            </view>
          </view>

          <view class="card-body">
            <view class="info-row">
              <text class="info-label">类型</text>
              <text class="consult-type-tag" :class="item.consultType === 2 ? 'type-video' : 'type-img'">
                {{ item.consultType === 2 ? '视频问诊' : '图文问诊' }}
              </text>
            </view>
            <view class="info-row" v-if="item.diseaseType">
              <text class="info-label">科室</text>
              <text class="info-val">{{ item.diseaseType }}</text>
            </view>
            <view class="info-row" v-if="item.diseaseDesc">
              <text class="info-label">描述</text>
              <text class="info-val desc-val">{{ item.diseaseDesc }}</text>
            </view>
          </view>

          <view class="card-footer">
            <text class="create-time">{{ item.createTime }}</text>
            <text class="consult-fee" v-if="item.consultFee != null">¥{{ item.consultFee }}</text>
          </view>
        </view>
      </view>

      <view v-if="list.length === 0 && !loading" class="empty-wrap">
        <emptyPage title="暂无问诊记录~" mTop="30%" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></emptyPage>
      </view>

      <view v-if="loading" class="loading-wrap">
        <text>加载中...</text>
      </view>
      <view v-if="loadend && list.length > 0" class="loading-wrap">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getDoctorConsultationListApi } from "@/api/clinic.js";
import emptyPage from "@/components/emptyPage.vue";

export default {
  components: { emptyPage },
  data() {
    return {
      urlDomain: this.$Cache.get("imgHost"),
      theme: getApp().globalData.theme,
      list: [],
      loading: false,
      loadend: false,
      isRefreshing: false,
      page: 1,
      limit: 10,
      scrollHeight: 0,
      statusBarHeight: 20,
      /** 导航内容区高度（px），与标题栏对齐 */
      navContentPx: 44
    };
  },
  onLoad() {
    const sys = uni.getSystemInfoSync();
    this.statusBarHeight = sys.statusBarHeight || 20;
    const winH = sys.windowHeight || sys.screenHeight || 600;
    const navTotal = this.statusBarHeight + this.navContentPx;
    this.scrollHeight = Math.max(200, winH - navTotal);
    this.getList();
  },
  onPullDownRefresh() {
    this.onRefresh();
  },
  // #ifdef APP-PLUS
  onBackPress() {
    this.goBack();
    return true;
  },
  // #endif
  methods: {
    /** 回到「我的」Tab，不走 navigateBack（避免回到支付页等） */
    goBack() {
      uni.switchTab({ url: '/pages/user/index' });
    },
    getList() {
      if (this.loadend || this.loading) return;
      this.loading = true;
      getDoctorConsultationListApi({ page: this.page, limit: this.limit })
        .then(res => {
          let data = res.data || {};
          let items = data.list || [];
          if (items.length < this.limit) this.loadend = true;
          this.list = this.list.concat(items);
          this.page++;
          this.loading = false;
          this.isRefreshing = false;
          uni.stopPullDownRefresh();
        })
        .catch(() => {
          this.loading = false;
          this.isRefreshing = false;
          uni.stopPullDownRefresh();
        });
    },

    onRefresh() {
      this.isRefreshing = true;
      this.page = 1;
      this.loadend = false;
      this.list = [];
      this.getList();
    },

    loadMore() {
      this.getList();
    },

    goDetail(item) {
      this.$util.navigateTo(`/pages/clinic/my_consultation/detail?id=${item.id}`);
    },

    statusText(status) {
      const map = { 0: '待接诊', 1: '问诊中', 2: '已完成', 3: '已取消' };
      return map[status] !== undefined ? map[status] : '未知';
    },

    statusClass(status) {
      const map = { 0: 'status-pending', 1: 'status-ongoing', 2: 'status-done', 3: 'status-cancelled' };
      return map[status] || '';
    }
  }
};
</script>

<style lang="scss" scoped>
.my-consultation-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.custom-nav {
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16rpx;
}

.nav-back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .iconfont {
    font-size: 36rpx;
    color: #333;
  }

  &--ph {
    visibility: hidden;
    pointer-events: none;
  }
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #282828;
}

.list-scroll {
  width: 100%;
}

.consult-list {
  padding: 16rpx 24rpx;
}

.consult-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.doctor-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.doctor-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.doctor-meta {
  flex: 1;
  overflow: hidden;
}

.doctor-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.doctor-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #282828;
  margin-right: 10rpx;
}

.doctor-title {
  font-size: 20rpx;
  color: var(--view-theme);
  background: rgba(110, 163, 90, 0.1);
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
}

.doctor-hospital {
  font-size: 22rpx;
  color: #999;
}

.status-badge {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.status-pending {
  color: #fa8c16;
  background: rgba(250, 140, 22, 0.1);
}

.status-ongoing {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.status-done {
  color: #999;
  background: rgba(0, 0, 0, 0.05);
}

.status-cancelled {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

.card-body {
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
  padding: 16rpx 0;
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 24rpx;
  color: #999;
  width: 60rpx;
  flex-shrink: 0;
  margin-right: 12rpx;
  margin-top: 2rpx;
}

.info-val {
  font-size: 24rpx;
  color: #555;
  flex: 1;
}

.desc-val {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.consult-type-tag {
  font-size: 22rpx;
  padding: 2rpx 14rpx;
  border-radius: 20rpx;
}

.type-img {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.type-video {
  color: #722ed1;
  background: rgba(114, 46, 209, 0.1);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.create-time {
  font-size: 22rpx;
  color: #bbb;
}

.consult-fee {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--view-theme);
}

.empty-wrap {
  padding-top: 100rpx;
}

.loading-wrap {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>
