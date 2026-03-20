<template>
  <view class="clinic-mall" :data-theme="theme">
    <!-- 分类横向滚动 -->
    <view class="category-bar">
      <scroll-view scroll-x class="category-scroll" show-scrollbar="false">
        <view class="category-list">
          <view
            class="category-item"
            :class="{ active: currentCate === item.id }"
            v-for="item in displayCategories"
            :key="item.id"
            @click="switchCate(item.id, item.name)"
          >
            <text>{{ item.name }}</text>
          </view>
          <view class="category-item" @click="showMoreCate = !showMoreCate">
            <text>更多</text>
            <text class="iconfont icon-ic_rightarrow" style="font-size: 20rpx; margin-left: 4rpx;"></text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 当前分类标题 -->
    <view class="current-cate-title" v-if="currentCateName">
      <text>{{ currentCateName }}</text>
    </view>

    <!-- 商品列表 -->
    <view class="product-list" v-if="displayProducts.length > 0">
      <view class="product-grid">
        <view class="product-card" v-for="(item, index) in displayProducts" :key="index" @click="goProductDetail(item)">
          <view class="product-img">
            <image :src="item.image" mode="aspectFill"></image>
            <view class="sold-out-mask" v-if="item.soldOut">
              <text>售罄</text>
            </view>
          </view>
          <view class="product-info">
            <view class="product-name line2">{{ item.name }}</view>
            <view class="product-price-row">
              <text class="price-symbol">¥</text>
              <text class="price-num">{{ item.price }}</text>
            </view>
            <view class="product-tag">
              <text>用户自提</text>
            </view>
          </view>
        </view>
      </view>

      <view class="loading-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="loadend">没有更多了</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-wrap" v-else-if="!loading">
      <empty-page title="暂无商品~" :imgSrc="urlDomain+'crmebimage/presets/noJilu.png'"></empty-page>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { getMerCategoryApi, getMerProListApi } from '@/api/merchant.js';
import emptyPage from '@/components/emptyPage.vue';

let app = getApp();

const MOCK_CATEGORIES = [
  { id: 1, name: '家居类产品' },
  { id: 2, name: '膏方系列' },
  { id: 3, name: '代茶系列' },
  { id: 4, name: '新健康食养' }
];

const MOCK_PRODUCTS = [
  { id: 1, name: '山药茯苓益生菌代餐粉（35g*10袋）', price: '329.00', image: '', deliveryType: 1 },
  { id: 2, name: '复合益生元饮品（20g*20袋/盒）', price: '299.00', image: '', deliveryType: 1 },
  { id: 3, name: '益生菌冻干粉（3g*20袋）', price: '360.00', image: '', deliveryType: 1 },
  { id: 4, name: '益生菌冻干粉（幽静）', price: '360.00', image: '', deliveryType: 1 },
  { id: 5, name: '榕树家眼贴', price: '128.00', image: '', deliveryType: 1, soldOut: true },
  { id: 6, name: '榕树家灸贴', price: '158.00', image: '', deliveryType: 1, soldOut: true }
];

export default {
  components: { emptyPage },
  computed: {
    ...mapGetters(['isLogin']),
    displayCategories() {
      return this.categoryList.length > 0 ? this.categoryList : MOCK_CATEGORIES;
    },
    displayProducts() {
      return this.productList.length > 0 ? this.productList : (this.useMock ? MOCK_PRODUCTS : []);
    }
  },
  data() {
    return {
      urlDomain: this.$Cache.get("imgHost"),
      theme: app.globalData.theme,
      merId: 0,
      categoryList: [],
      productList: [],
      currentCate: 1,
      currentCateName: '',
      loading: false,
      loadend: false,
      page: 1,
      limit: 10,
      showMoreCate: false,
      useMock: false
    }
  },
  onLoad(options) {
    this.merId = options.merId ? parseInt(options.merId) : 0;
    this.getCategoryList();
    this.getProductList();
  },
  onPullDownRefresh() {
    this.resetList();
    this.getProductList();
  },
  onReachBottom() {
    this.getProductList();
  },
  methods: {
    getCategoryList() {
      if (!this.merId) {
        this.useMock = true;
        this.currentCateName = MOCK_CATEGORIES[0].name;
        return;
      }
      getMerCategoryApi(this.merId).then(res => {
        this.categoryList = res.data || [];
        if (this.categoryList.length > 0) {
          this.currentCate = this.categoryList[0].id;
          this.currentCateName = this.categoryList[0].name;
        }
      }).catch(() => {
        this.useMock = true;
        this.currentCateName = MOCK_CATEGORIES[0].name;
      });
    },

    getProductList() {
      if (this.loadend || !this.merId) {
        this.useMock = true;
        this.loading = false;
        return;
      }
      this.loading = true;
      let params = {
        page: this.page,
        limit: this.limit,
        merId: this.merId
      };
      if (this.currentCate > 0) {
        params.cid = this.currentCate;
      }
      getMerProListApi(params).then(res => {
        let list = res.data.list || res.data || [];
        if (list.length < this.limit) this.loadend = true;
        this.productList = this.productList.concat(list);
        this.page++;
        this.loading = false;
        uni.stopPullDownRefresh();
      }).catch(() => {
        this.loading = false;
        this.useMock = true;
        uni.stopPullDownRefresh();
      });
    },

    switchCate(id, name) {
      if (this.currentCate === id) return;
      this.currentCate = id;
      this.currentCateName = name;
      this.resetList();
      this.getProductList();
    },

    resetList() {
      this.page = 1;
      this.loadend = false;
      this.productList = [];
    },

    goProductDetail(item) {
      if (item.id && !item.soldOut) {
        this.$util.navigateTo(`/pages/goods/goods_details/index?id=${item.id}`);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.clinic-mall {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.category-bar {
  background: #fff;
  padding: 24rpx 0;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #f0f0f0;
}

.category-scroll {
  white-space: nowrap;
}

.category-list {
  display: inline-flex;
  padding: 0 24rpx;
}

.category-item {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 28rpx;
  margin-right: 12rpx;
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;

  &.active {
    color: #282828;
    font-weight: 600;
  }
}

.current-cate-title {
  padding: 28rpx 30rpx 16rpx;
  font-size: 30rpx;
  color: #282828;
  font-weight: 500;
  text-align: center;
  background: #f5f5f5;
}

.product-list {
  padding: 16rpx 24rpx;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.product-card {
  width: calc(50% - 8rpx);
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 340rpx;
  overflow: hidden;
  background: #f5f5f5;
  position: relative;

  image {
    width: 100%;
    height: 100%;
  }
}

.sold-out-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 600;
    letter-spacing: 4rpx;
  }
}

.product-info {
  padding: 16rpx 20rpx 20rpx;
}

.product-name {
  font-size: 26rpx;
  color: #282828;
  line-height: 1.4;
  margin-bottom: 12rpx;
  min-height: 72rpx;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 10rpx;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: 600;
  color: #e93323;
}

.price-num {
  font-size: 36rpx;
  font-weight: 600;
  color: #e93323;
}

.product-tag {
  display: inline-block;
  padding: 4rpx 14rpx;
  border: 1px solid #e0e0e0;
  border-radius: 6rpx;
  font-size: 20rpx;
  color: #999;
}

.loading-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}

.empty-wrap {
  padding-top: 200rpx;
}
</style>
