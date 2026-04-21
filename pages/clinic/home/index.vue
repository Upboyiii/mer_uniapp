<template>
  <view class="clinic-tab-root" :data-theme="theme">
    <!-- 附近门店 / 好物推荐 分段（暂隐藏）
    <view class="sub-tab-bar">
      <view
        class="sub-tab-item"
        :class="{ active: subTab === 0 }"
        @click="setSubTab(0)"
      >
        <text>附近门店</text>
      </view>
      <view
        class="sub-tab-item"
        :class="{ active: subTab === 1 }"
        @click="setSubTab(1)"
      >
        <text>好物推荐</text>
      </view>
    </view>
    -->

    <view v-show="subTab === 0" class="panel panel-stores">
      <view class="intro-card">
        <text class="intro-title">门店</text>
        <text class="intro-desc">理疗产品 · 药食同源，请选择门店进入店铺与预约服务</text>
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
          @click="goStoreHome(item)"
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

      <view v-else-if="!storeLoading" class="empty-wrap">
        <empty-page title="暂无门店~" mTop="80" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></empty-page>
      </view>

      <view v-if="storeLoading && storeList.length === 0" class="loading-tip">
        <text>加载中...</text>
      </view>
      <view v-if="storeList.length > 0" class="loading-more">
        <text v-if="storeLoading">加载中...</text>
        <text v-else-if="storeLoadend">没有更多了</text>
      </view>
    </view>

    <view v-show="subTab === 1" class="panel panel-mall">
      <view class="intro-card intro-card--mall">
        <text class="intro-title">推荐好物</text>
        <text class="intro-desc">平台精选商品，来自各推荐商家</text>
      </view>

      <view class="mall-cate-bar" v-if="categoryList.length > 0">
        <scroll-view scroll-x class="mall-cate-scroll" show-scrollbar="false">
          <view class="mall-cate-list">
            <view
              class="mall-cate-item"
              :class="{ active: currentCateId === 0 }"
              @click="switchMallCate(0)"
            >
              <text>全部</text>
            </view>
            <view
              class="mall-cate-item"
              :class="{ active: currentCateId === item.id }"
              v-for="item in categoryList"
              :key="item.id"
              @click="switchMallCate(item.id)"
            >
              <text>{{ item.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="mall-body">
        <view v-if="mallProductList.length > 0" class="mall-product-grid">
          <view
            class="mall-product-card"
            v-for="(item, index) in mallProductList"
            :key="index"
            @click="goHotProductDetail(item)"
          >
            <view class="mall-product-img">
              <image :src="item.image || defaultGoodsImg" mode="aspectFill"></image>
            </view>
            <view class="mall-product-info">
              <view class="mall-product-name line2">{{ item.name }}</view>
              <view class="mall-product-price">
                <text class="price-sym">¥</text>
                <text class="price-val">{{ item.price }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="!mallLoading" class="empty-wrap empty-wrap--mall">
          <empty-page title="暂无商品~" mTop="40" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></empty-page>
        </view>

        <view v-if="mallLoading && mallProductList.length === 0" class="loading-tip">
          <text>加载中...</text>
        </view>
        <view v-if="mallProductList.length > 0" class="loading-more">
          <text v-if="mallLoading">加载中...</text>
          <text v-else-if="mallLoadend">没有更多了</text>
        </view>
      </view>
    </view>

    <view v-if="bottomNavigationIsCustom" class="footerBottom"></view>
    <pageFooter></pageFooter>
  </view>
</template>

<script>
import { mapGetters } from 'vuex';
import { getMerStreetApi } from '@/api/merchant.js';
import { getCategoryFirst } from '@/api/api.js';
import { getProductHot } from '@/api/product.js';
import emptyPage from '@/components/emptyPage.vue';
import pageFooter from '@/components/pageFooter/index.vue';

let app = getApp();

export default {
  components: { emptyPage, pageFooter },
  data() {
    return {
      urlDomain: this.$Cache.get('imgHost'),
      theme: app.globalData.theme,
      subTab: 0,
      defaultStoreImg: '',
      storeList: [],
      storeLoading: false,
      storeLoadend: false,
      storePage: 1,
      storeLimit: 20,
      latitude: 28.228,
      longitude: 112.939,
      categoryList: [],
      currentCateId: 0,
      mallProductList: [],
      mallLoading: false,
      mallLoadend: false,
      mallPage: 1,
      mallLimit: 20
    };
  },
  computed: {
    ...mapGetters(['bottomNavigationIsCustom']),
    defaultGoodsImg() {
      const raw = this.urlDomain || '';
      if (!raw) return '';
      const host = raw.replace(/\/?$/, '/');
      return `${host}crmebimage/presets/noShopper.png`;
    }
  },
  onLoad() {
    this.defaultStoreImg = (this.urlDomain || '') + 'crmebimage/presets/morenT.png';
    this.syncNavTitle();
    this.bootstrapStores();
  },
  onShow() {
    try {
      const raw = uni.getStorageSync('CLINIC_HOME_MER_ID');
      if (raw) {
        uni.removeStorageSync('CLINIC_HOME_MER_ID');
        const n = parseInt(raw, 10);
        if (n && !isNaN(n)) {
          this.$util.navigateTo(`/pages/clinic/health_mall/index?merId=${n}`);
        }
      }
    } catch (e) {}

    this.syncNavTitle();
  },
  onPullDownRefresh() {
    if (this.subTab === 0) {
      this.resetStoreList();
      this.fetchStores();
    } else {
      this.getCategoryList();
      this.resetMallProducts();
      this.fetchMallProducts();
    }
  },
  onReachBottom() {
    if (this.subTab === 0) this.fetchStores();
    else this.fetchMallProducts();
  },
  methods: {
    setSubTab(i) {
      if (this.subTab === i) return;
      this.subTab = i;
      this.syncNavTitle();
      if (i === 1) this.ensureMallTabLoaded();
    },
    syncNavTitle() {
      try {
        uni.setNavigationBarTitle({
          title: this.subTab === 1 ? '健康商城' : '门店'
        });
      } catch (e) {}
    },
    ensureMallTabLoaded() {
      if (!this.categoryList.length) this.getCategoryList();
      if (!this.mallProductList.length && !this.mallLoading) {
        this.resetMallProducts();
        this.fetchMallProducts();
      }
    },
    bootstrapStores() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
          this.resetStoreList();
          this.fetchStores();
        },
        fail: () => {
          this.resetStoreList();
          this.fetchStores();
        }
      });
    },
    resetStoreList() {
      this.storePage = 1;
      this.storeLoadend = false;
      this.storeList = [];
    },
    fetchStores() {
      if (this.storeLoadend || this.storeLoading) return;
      this.storeLoading = true;
      getMerStreetApi({
        page: this.storePage,
        limit: this.storeLimit,
        latitude: this.latitude,
        longitude: this.longitude
      })
        .then((res) => {
          let list = (res.data && res.data.list) || res.data || [];
          if (!Array.isArray(list)) list = [];
          if (list.length < this.storeLimit) this.storeLoadend = true;
          this.storeList = this.storeList.concat(list);
          this.storePage++;
          this.storeLoading = false;
          uni.stopPullDownRefresh();
        })
        .catch(() => {
          this.storeLoading = false;
          uni.stopPullDownRefresh();
        });
    },
    goStoreHome(item) {
      if (!item || item.id == null) return;
      this.$util.navigateTo(`/pages/clinic/health_mall/index?merId=${item.id}`);
    },
    getCategoryList() {
      getCategoryFirst()
        .then((res) => {
          this.categoryList = res.data || [];
        })
        .catch(() => {});
    },
    switchMallCate(id) {
      if (this.currentCateId === id) return;
      this.currentCateId = id;
      this.resetMallProducts();
      this.fetchMallProducts();
    },
    resetMallProducts() {
      this.mallPage = 1;
      this.mallLoadend = false;
      this.mallProductList = [];
    },
    fetchMallProducts() {
      if (this.mallLoadend || this.mallLoading) return;
      this.mallLoading = true;
      const params = {
        cid: String(this.currentCateId || 0),
        page: this.mallPage,
        limit: this.mallLimit
      };
      getProductHot(params)
        .then((res) => {
          const data = res.data || {};
          let list = data.list || [];
          if (!Array.isArray(list)) list = [];
          const rawTotal = data.totalPage;
          const totalPage =
            rawTotal != null && rawTotal !== ''
              ? Math.max(1, parseInt(rawTotal, 10) || 1)
              : null;
          this.mallProductList = this.mallProductList.concat(list);
          this.mallPage++;
          if (list.length === 0) {
            this.mallLoadend = true;
          } else if (totalPage != null) {
            this.mallLoadend = this.mallPage > totalPage;
          } else {
            this.mallLoadend = list.length < this.mallLimit;
          }
          this.mallLoading = false;
          uni.stopPullDownRefresh();
        })
        .catch(() => {
          this.mallLoading = false;
          uni.stopPullDownRefresh();
        });
    },
    goHotProductDetail(item) {
      if (item && item.id) {
        this.$util.navigateTo(`/pages/goods/goods_details/index?id=${item.id}`);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.clinic-tab-root {
  min-height: 100vh;
  background: #f5f5f5;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom);
}

.sub-tab-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 16rpx 24rpx 20rpx;
  gap: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 20;
}

.sub-tab-item {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
  background: #f5f5f5;

  &.active {
    color: #fff;
    background: var(--view-theme, #1890ff);
    font-weight: 600;
  }
}

.panel {
  padding-bottom: 24rpx;
}

.intro-card {
  margin: 24rpx;
  padding: 28rpx 32rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.intro-card--mall {
  margin-bottom: 16rpx;
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

.mall-cate-bar {
  margin: 0 24rpx 16rpx;
}

.mall-cate-scroll {
  white-space: nowrap;
}

.mall-cate-list {
  display: inline-flex;
  gap: 12rpx;
}

.mall-cate-item {
  display: inline-flex;
  align-items: center;
  padding: 10rpx 28rpx;
  border-radius: 28rpx;
  font-size: 26rpx;
  color: #666;
  background: #fff;
  flex-shrink: 0;
  border: 1rpx solid #f0f0f0;

  &.active {
    background: var(--view-theme, #1890ff);
    color: #fff;
    border-color: transparent;
    font-weight: 600;
  }
}

.mall-body {
  padding: 0 24rpx 32rpx;
}

.mall-product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.mall-product-card {
  width: calc(50% - 8rpx);
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.mall-product-img {
  width: 100%;
  height: 320rpx;
  overflow: hidden;
  background: #eee;

  image {
    width: 100%;
    height: 100%;
  }
}

.mall-product-info {
  padding: 16rpx 20rpx 20rpx;
}

.mall-product-name {
  font-size: 26rpx;
  color: #282828;
  line-height: 1.4;
  margin-bottom: 12rpx;
  min-height: 72rpx;
}

.mall-product-price {
  display: flex;
  align-items: baseline;
}

.price-sym {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--view-priceColor);
}

.price-val {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--view-priceColor);
}

.line2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
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

.empty-wrap--mall {
  padding-top: 40rpx;
}
</style>
