<template>
  <view class="my-doctor-page" :data-theme="theme">
    <scroll-view
      scroll-y
      class="list-scroll"
      :style="{ height: scrollHeight + 'px' }"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="doctorList.length > 0" class="doctor-list">
        <view
          class="doctor-card"
          v-for="(item, index) in doctorList"
          :key="item.id || index"
          @click="goDoctorDetail(item)"
        >
          <view class="card-avatar">
            <image
              class="avatar"
              :src="item.picture || '/static/images/f.png'"
              mode="aspectFill"
            ></image>
            <view v-if="item.onlineStatus === 1" class="online-badge">接诊中</view>
          </view>
          <view class="card-info">
            <view class="info-top">
              <text class="name">{{ item.name }}</text>
              <text class="title-tag" v-if="item.hospitalTitle">{{ item.hospitalTitle }}</text>
            </view>
            <view class="info-hospital" v-if="item.hospitalName">
              {{ item.hospitalName }}<text v-if="item.hospitalSub"> · {{ item.hospitalSub }}</text>
            </view>
            <view class="info-domain line1" v-if="item.hospitalDomain">
              擅长：{{ item.hospitalDomain }}
            </view>
          </view>
          <view class="card-action">
            <view class="action-btn" @click.stop="goConsult(item)">再次问诊</view>
          </view>
        </view>
      </view>

      <view v-if="doctorList.length === 0 && !loading" class="empty-wrap">
        <emptyPage title="暂无关联医生~" mTop="30%" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></emptyPage>
      </view>

      <view v-if="loading" class="loading-wrap">
        <text>加载中...</text>
      </view>
      <view v-if="loadend && doctorList.length > 0" class="loading-wrap">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { getMyDoctorListApi } from "@/api/clinic.js";
import emptyPage from "@/components/emptyPage.vue";

export default {
  components: { emptyPage },
  computed: {
    ...mapGetters(["isLogin"])
  },
  data() {
    return {
      urlDomain: this.$Cache.get("imgHost"),
      theme: getApp().globalData.theme,
      doctorList: [],
      loading: false,
      loadend: false,
      isRefreshing: false,
      page: 1,
      limit: 10,
      scrollHeight: 0
    };
  },
  onLoad() {
    let sys = uni.getSystemInfoSync();
    this.scrollHeight = sys.windowHeight;
    this.getList();
  },
  onPullDownRefresh() {
    this.onRefresh();
  },
  methods: {
    getList() {
      if (this.loadend || this.loading) return;
      this.loading = true;
      getMyDoctorListApi({ page: this.page, limit: this.limit })
        .then(res => {
          let list = (res.data && res.data.list) || [];
          if (list.length < this.limit) this.loadend = true;
          this.doctorList = this.doctorList.concat(list);
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
      this.doctorList = [];
      this.getList();
    },

    loadMore() {
      this.getList();
    },

    goDoctorDetail(item) {
      this.$util.navigateTo(`/pages/clinic/doctor/detail?id=${item.id}`);
    },

    goConsult(item) {
      if (!this.isLogin) {
        return this.$util.navigateTo("/pages/users/login/index");
      }
      this.$util.navigateTo(`/pages/clinic/doctor/detail?id=${item.id}`);
    }
  }
};
</script>

<style lang="scss" scoped>
.my-doctor-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.list-scroll {
  width: 100%;
}

.doctor-list {
  padding: 16rpx 24rpx;
}

.doctor-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-avatar {
  position: relative;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.online-badge {
  position: absolute;
  bottom: -4rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18rpx;
  color: #fff;
  background: #52c41a;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
  white-space: nowrap;
}

.card-info {
  flex: 1;
  overflow: hidden;
}

.info-top {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.name {
  font-size: 28rpx;
  font-weight: 600;
  color: #282828;
  margin-right: 10rpx;
}

.title-tag {
  font-size: 20rpx;
  color: var(--view-theme);
  background: rgba(110, 163, 90, 0.1);
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
}

.info-hospital {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 6rpx;
}

.info-domain {
  font-size: 22rpx;
  color: #999;
}

.card-action {
  flex-shrink: 0;
  margin-left: 16rpx;
}

.action-btn {
  padding: 14rpx 24rpx;
  background: var(--view-theme);
  color: #fff;
  font-size: 24rpx;
  border-radius: 30rpx;
  white-space: nowrap;
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
