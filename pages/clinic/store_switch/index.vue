<template>
  <view class="store-switch" :data-theme="theme">
    <!-- 顶部导航 + Tab -->
    <view class="header-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-ic_leftarrow"></text>
      </view>
      <view class="header-tabs">
        <view class="htab" :class="{ active: tabIndex === 0 }" @click="switchTab(0)">
          <text>我的</text>
        </view>
        <view class="htab" :class="{ active: tabIndex === 1 }" @click="switchTab(1)">
          <text>所有</text>
        </view>
      </view>
    </view>

    <!-- 地图区域 -->
    <view class="map-area">
      <map
        id="clinicMap"
        :latitude="latitude"
        :longitude="longitude"
        :scale="mapScale"
        :markers="displayMarkers"
        show-location
        style="width: 100%; height: 100%;"
        @markertap="onMarkerTap"
      ></map>
      <!-- 定位按钮 -->
      <view class="locate-btn" @click="getLocation">
        <text class="iconfont icon-ic_location51"></text>
      </view>
      <!-- 高德地图角标 -->
      <view class="map-badge" @click="openFullMap">
        <text class="iconfont icon-ic_location51" style="color: #1890ff;"></text>
        <text class="badge-text">高德地图</text>
      </view>
    </view>

    <!-- 搜索栏（仅"所有"tab显示） -->
    <view class="search-bar" v-if="tabIndex === 1">
      <view class="city-selector" @click="showCityPicker">
        <text>{{ currentCity || '选择城市' }}</text>
        <text class="iconfont icon-ic_rightarrow" style="font-size: 20rpx; margin-left: 6rpx; color: #999;"></text>
      </view>
      <view class="search-input-box">
        <text class="iconfont icon-ic_search" style="font-size: 28rpx; color: #ccc; margin-right: 8rpx;" v-if="!keyword"></text>
        <input
          class="search-input"
          :placeholder="!keyword ? '搜索' : ''"
          v-model="keyword"
          @confirm="searchStore"
        />
      </view>
    </view>

    <!-- 门店列表 -->
    <scroll-view scroll-y class="store-list" @scrolltolower="loadMore">
      <view v-if="displayStores.length > 0">
        <view class="store-card" v-for="(item, index) in displayStores" :key="index">
          <view class="store-img">
            <image :src="item.avatar || item.image" mode="aspectFill"></image>
          </view>
          <view class="store-info">
            <view class="store-name">{{ item.name }}</view>
            <view class="store-meta">
              <text class="store-distance" v-if="item.distance">{{ item.distance }}</text>
              <text class="store-address">{{ item.addressDetail || item.address }}</text>
            </view>
          </view>
          <view class="switch-action" @click="doSwitch(item)">
            <text class="switch-text">切换</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-wrap">
        <empty-page title="无相关结果"></empty-page>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-wrap">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { getMyClinicListApi } from '@/api/clinic.js';
import { getMerStreetApi } from '@/api/merchant.js';
import emptyPage from '@/components/emptyPage.vue';

let app = getApp();

const MOCK_STORES = [
  {
    id: 1,
    name: '长沙县湘龙保利中医诊所',
    distance: '9.3km',
    addressDetail: '湖南省长沙市长沙县湘龙街道湘龙路42号保利香槟国际C18b栋102',
    avatar: '',
    latitude: 28.2580,
    longitude: 113.0280
  },
  {
    id: 2,
    name: '长沙市芙蓉区乐康安中医门诊',
    distance: '9.7km',
    addressDetail: '湖南省长沙市芙蓉区荷花路东站芙蓉公寓底座克丽缇娜',
    avatar: '',
    latitude: 28.1970,
    longitude: 113.0350
  },
  {
    id: 3,
    name: '湖南柏榕树家医学科技有限公司芙蓉乐康中医诊所',
    distance: '10km',
    addressDetail: '湖南省长沙市芙蓉区马坡岭街道远大一路1389号卓越汇富苑7栋101号',
    avatar: '',
    latitude: 28.2100,
    longitude: 113.0800
  }
];

export default {
  components: { emptyPage },
  computed: {
    ...mapGetters(['isLogin', 'uid']),
    displayStores() {
      return this.storeList.length > 0 ? this.storeList : (this.useMock && this.tabIndex === 1 ? MOCK_STORES : []);
    },
    displayMarkers() {
      let list = this.displayStores.filter(item => item.latitude && item.longitude);
      return list.map((item, index) => ({
        id: index,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        title: item.name,
        width: 25,
        height: 35,
        callout: {
          content: item.name,
          display: 'BYCLICK',
          fontSize: 12,
          borderRadius: 4,
          padding: 6,
          bgColor: '#fff'
        }
      }));
    }
  },
  data() {
    return {
      theme: app.globalData.theme,
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      merId: 0,
      tabIndex: 1,
      latitude: 28.228,
      longitude: 112.939,
      mapScale: 13,
      currentCity: '长沙市',
      keyword: '',
      storeList: [],
      loading: false,
      loadend: false,
      page: 1,
      limit: 10,
      useMock: false
    }
  },
  onLoad(options) {
    this.merId = options.merId ? parseInt(options.merId) : 0;
    this.getLocation();
    this.getStoreList();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },

    getLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
        },
        fail: () => {}
      });
    },

    getStoreList() {
      if (this.loadend) return;
      this.loading = true;

      let params = {
        page: this.page,
        limit: this.limit,
        latitude: this.latitude,
        longitude: this.longitude
      };
      if (this.keyword) params.keyword = this.keyword;

      let apiCall;
      if (this.tabIndex === 0) {
        apiCall = getMyClinicListApi(params);
      } else {
        apiCall = getMerStreetApi(params);
      }

      apiCall.then(res => {
        let list = res.data.list || res.data || [];
        if (list.length < this.limit) this.loadend = true;
        this.storeList = this.storeList.concat(list);
        this.page++;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
        this.useMock = true;
      });
    },

    switchTab(index) {
      if (this.tabIndex === index) return;
      this.tabIndex = index;
      this.resetList();
      this.getStoreList();
    },

    searchStore() {
      this.resetList();
      this.getStoreList();
    },

    resetList() {
      this.page = 1;
      this.loadend = false;
      this.storeList = [];
    },

    loadMore() {
      this.getStoreList();
    },

    doSwitch(item) {
      uni.showModal({
        title: '提示',
        content: `确定切换到 ${item.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            if (prevPage) {
              prevPage.$vm.merId = item.id;
              prevPage.$vm.getClinicInfo && prevPage.$vm.getClinicInfo();
              prevPage.$vm.productList = [];
              prevPage.$vm.page = 1;
              prevPage.$vm.loadend = false;
              prevPage.$vm.getProductList && prevPage.$vm.getProductList();
            }
            uni.navigateBack();
          }
        }
      });
    },

    onMarkerTap(e) {
      let index = e.markerId || (e.detail && e.detail.markerId);
      let stores = this.displayStores;
      if (stores[index]) {
        let item = stores[index];
        if (item.latitude && item.longitude) {
          uni.openLocation({
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            name: item.name,
            address: item.addressDetail || item.address || ''
          });
        }
      }
    },

    openFullMap() {
      uni.openLocation({
        latitude: this.latitude,
        longitude: this.longitude,
        scale: 14
      });
    },

    showCityPicker() {
      this.$util.Tips({ title: '城市选择功能开发中' });
    }
  }
}
</script>

<style lang="scss" scoped>
.store-switch {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
}

/* 顶部导航 */
.header-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 10rpx 0;
  flex-shrink: 0;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 24rpx;
  z-index: 2;
  padding: 10rpx;

  .iconfont {
    font-size: 36rpx;
    color: #282828;
  }
}

.header-tabs {
  display: flex;
  justify-content: center;
  width: 100%;
}

.htab {
  padding: 16rpx 40rpx;
  font-size: 32rpx;
  color: #bbb;
  position: relative;
  transition: all 0.3s;

  &.active {
    color: #282828;
    font-weight: 700;
  }
}

/* 地图 */
.map-area {
  height: 520rpx;
  position: relative;
  flex-shrink: 0;
}

.locate-btn {
  position: absolute;
  right: 24rpx;
  bottom: 80rpx;
  width: 72rpx;
  height: 72rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);

  .iconfont {
    font-size: 36rpx;
    color: #1890ff;
  }
}

.map-badge {
  position: absolute;
  right: 24rpx;
  bottom: 20rpx;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);

  .badge-text {
    font-size: 20rpx;
    color: #666;
    margin-left: 6rpx;
  }
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.city-selector {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
  padding-right: 20rpx;
}

.search-input-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 12rpx 20rpx;
  margin-left: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 40rpx;
}

/* 门店列表 */
.store-list {
  flex: 1;
  overflow: hidden;
  background: #fff;
}

.store-card {
  display: flex;
  align-items: flex-start;
  padding: 28rpx 30rpx;
  border-bottom: 1px solid #f5f5f5;
}

.store-img {
  width: 140rpx;
  height: 100rpx;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 24rpx;
  background: #f0f0f0;

  image {
    width: 100%;
    height: 100%;
  }
}

.store-info {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.store-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #282828;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.store-meta {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
}

.store-distance {
  font-size: 24rpx;
  color: #999;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.store-address {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

.switch-action {
  flex-shrink: 0;
  margin-left: 20rpx;
  padding-top: 4rpx;
}

.switch-text {
  font-size: 28rpx;
  color: #1890ff;
}

.empty-wrap {
  padding-top: 120rpx;
}

.loading-wrap {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>
