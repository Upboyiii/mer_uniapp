<template>
  <view class="platform-mall-page" :data-theme="theme">
    <view class="intro-card">
      <text class="intro-title">健康商城</text>
      <text class="intro-desc">平台商品一览，多店好物随心选</text>
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
      <view v-if="productList.length > 0" class="mall-product-grid">
        <view
          class="mall-product-card"
          v-for="(item, index) in productList"
          :key="index"
          @click="goProductDetail(item)"
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

      <view v-else-if="!loading" class="empty-wrap">
        <empty-page title="暂无商品~" mTop="40" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></empty-page>
      </view>

      <view v-if="loading && productList.length === 0" class="loading-tip">
        <text>加载中...</text>
      </view>
      <view v-if="productList.length > 0" class="loading-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="loadend">没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCategoryFirst } from '@/api/api.js';
import { getProductHot } from '@/api/product.js';
import emptyPage from '@/components/emptyPage.vue';

let app = getApp();

export default {
  components: { emptyPage },
  data() {
    return {
      urlDomain: this.$Cache.get('imgHost'),
      theme: app.globalData.theme,
      categoryList: [],
      currentCateId: 0,
      productList: [],
      loading: false,
      loadend: false,
      page: 1,
      limit: 20
    };
  },
  computed: {
    defaultGoodsImg() {
      const raw = this.urlDomain || '';
      if (!raw) return '';
      const host = raw.replace(/\/?$/, '/');
      return `${host}crmebimage/presets/noShopper.png`;
    }
  },
  onLoad() {
    this.getCategoryList();
    this.resetList();
    this.fetchList();
  },
  onPullDownRefresh() {
    this.getCategoryList();
    this.resetList();
    this.fetchList();
  },
  onReachBottom() {
    this.fetchList();
  },
  methods: {
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
      this.resetList();
      this.fetchList();
    },
    resetList() {
      this.page = 1;
      this.loadend = false;
      this.productList = [];
    },
    fetchList() {
      if (this.loadend || this.loading) return;
      this.loading = true;
      const params = {
        cid: String(this.currentCateId || 0),
        page: this.page,
        limit: this.limit
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
          this.productList = this.productList.concat(list);
          this.page++;
          if (list.length === 0) {
            this.loadend = true;
          } else if (totalPage != null) {
            this.loadend = this.page > totalPage;
          } else {
            this.loadend = list.length < this.limit;
          }
          this.loading = false;
          uni.stopPullDownRefresh();
        })
        .catch(() => {
          this.loading = false;
          uni.stopPullDownRefresh();
        });
    },
    goProductDetail(item) {
      if (item && item.id) {
        this.$util.navigateTo(`/pages/goods/goods_details/index?id=${item.id}`);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.platform-mall-page {
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
  padding-top: 40rpx;
}
</style>
