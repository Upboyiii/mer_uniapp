<template>
  <view class="health-mall-page" :data-theme="theme">
    <view class="intro-card">
      <text class="intro-title">平台健康商城</text>
      <text class="intro-desc">理疗产品 · 药食同源，请选择门店进入店铺商品</text>
    </view>

    <view class="section-label">
      <text class="section-title">门店列表</text>
      <text class="section-hint">按平台展示顺序</text>
    </view>

    <view v-if="storeList.length > 0" class="store-list">
      <view
        class="store-row"
        v-for="(item, index) in storeList"
        :key="item.id != null ? item.id : index"
        @click="goStoreMall(item)"
      >
        <view class="store-avatar">
          <image :src="item.avatar || item.image || defaultStoreImg" mode="aspectFill"></image>
        </view>
        <view class="store-main">
          <text class="store-name line1">{{ item.name }}</text>
          <view class="store-meta">
            <text v-if="item.distance" class="store-distance">{{ item.distance }}</text>
            <text class="store-address line1">{{ item.addressDetail || item.address || '' }}</text>
          </view>
        </view>
        <text class="iconfont icon-ic_rightarrow store-arrow"></text>
      </view>
    </view>

    <view v-else-if="!loading" class="empty-wrap">
      <empty-page title="暂无门店~" mTop="80" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></empty-page>
    </view>

    <view v-if="loading && storeList.length === 0" class="loading-tip">
      <text>加载中...</text>
    </view>
    <view v-if="storeList.length > 0" class="loading-more">
      <text v-if="loading">加载中...</text>
      <text v-else-if="loadend">没有更多了</text>
    </view>
  </view>
</template>

<script>
import { getMerStreetApi } from '@/api/merchant.js';
import emptyPage from '@/components/emptyPage.vue';

let app = getApp();

export default {
  components: { emptyPage },
  data() {
    return {
      urlDomain: this.$Cache.get('imgHost'),
      theme: app.globalData.theme,
      storeList: [],
      loading: false,
      loadend: false,
      page: 1,
      limit: 20,
      latitude: 28.228,
      longitude: 112.939,
      defaultStoreImg: ''
    };
  },
  onLoad() {
    this.defaultStoreImg = (this.urlDomain || '') + 'crmebimage/presets/morenT.png';
    this.bootstrap();
  },
  onPullDownRefresh() {
    this.resetList();
    this.fetchStores();
  },
  onReachBottom() {
    this.fetchStores();
  },
  methods: {
    bootstrap() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
          this.resetList();
          this.fetchStores();
        },
        fail: () => {
          this.resetList();
          this.fetchStores();
        }
      });
    },
    resetList() {
      this.page = 1;
      this.loadend = false;
      this.storeList = [];
    },
    fetchStores() {
      if (this.loadend || this.loading) return;
      this.loading = true;
      getMerStreetApi({
        page: this.page,
        limit: this.limit,
        latitude: this.latitude,
        longitude: this.longitude
      })
        .then((res) => {
          let list = (res.data && res.data.list) || res.data || [];
          if (!Array.isArray(list)) list = [];
          if (list.length < this.limit) this.loadend = true;
          this.storeList = this.storeList.concat(list);
          this.page++;
          this.loading = false;
          uni.stopPullDownRefresh();
        })
        .catch(() => {
          this.loading = false;
          uni.stopPullDownRefresh();
        });
    },
    goStoreMall(item) {
      if (!item || item.id == null) return;
      this.$util.navigateTo(`/pages/clinic/mall/index?merId=${item.id}`);
    }
  }
};
</script>

<style lang="scss" scoped>
.health-mall-page {
  min-height: 100vh;
  background: #f5f5f5;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom);
}

.intro-card {
  margin: 24rpx;
  padding: 28rpx 32rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.intro-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #282828;
  margin-bottom: 12rpx;
}

.intro-desc {
  font-size: 26rpx;
  color: #888;
  line-height: 1.5;
}

.section-label {
  padding: 8rpx 32rpx 16rpx;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #282828;
}

.section-hint {
  font-size: 22rpx;
  color: #aaa;
}

.store-list {
  padding: 0 24rpx 32rpx;
}

.store-row {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.store-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #eee;
  flex-shrink: 0;

  image {
    width: 100%;
    height: 100%;
  }
}

.store-main {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.store-name {
  font-size: 30rpx;
  color: #282828;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.store-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.store-distance {
  color: var(--view-theme, #1890ff);
  flex-shrink: 0;
}

.store-address {
  flex: 1;
  min-width: 0;
}

.store-arrow {
  font-size: 28rpx;
  color: #ccc;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.line1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-tip,
.loading-more {
  text-align: center;
  padding: 32rpx;
  font-size: 24rpx;
  color: #999;
}

.empty-wrap {
  padding-top: 80rpx;
}
</style>
