<template>
  <view class="clinic-home" :data-theme="theme">
    <!-- 浮动客服按钮：默认半藏，点击展开 -->
    <view
      class="service-drawer"
      :class="{ 'is-open': serviceOpen }"
      :style="{ top: serviceTop + 'rpx' }"
      @click="onServiceTap"
    >
      <view class="drawer-inner">
        <view class="drawer-icon">
          <text class="iconfont icon-ic_customerservice"></text>
        </view>
        <text class="drawer-label">平台客服</text>
      </view>
    </view>

    <!-- 顶部背景图 -->
    <view class="header-bg">
      <image
        v-if="clinicInfo.backImage"
        :src="clinicInfo.backImage"
        mode="aspectFill"
        class="bg-image"
      ></image>
      <view v-else class="bg-placeholder"></view>
    </view>

    <!-- 诊所信息卡片 -->
    <view class="clinic-card">
      <!-- 诊所名称 + 切换 -->
      <view class="clinic-name-row">
        <view class="clinic-name line1">{{ clinicInfo.name || '' }}</view>
        <view class="switch-btn" @click="goStoreSwitch">
          <text class="iconfont icon-ic_sort" style="font-size: 26rpx; margin-right: 6rpx;"></text>
          <text>切换</text>
        </view>
      </view>

      <!-- 营业时间 -->
      <view class="clinic-time">
        <text class="iconfont icon-ic_clock"></text>
        <text>营业时间  {{ clinicInfo.openTime || '08:30 - 21:00' }}</text>
      </view>

      <!-- 地址信息 -->
      <view class="clinic-address-row">
        <view class="address-left">
          <text class="iconfont icon-ic_location51 loc-icon"></text>
          <text class="address-text">{{ clinicInfo.addressDetail || clinicInfo.address || '' }}</text>
        </view>
        <view class="address-actions">
          <view class="action-item" @click="handleNavigation">
            <text class="iconfont icon-ic_location5"></text>
            <text>导航</text>
          </view>
          <view class="action-item" @click="handleCall">
            <text class="iconfont icon-ic_phone"></text>
            <text>电话</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷操作区 -->
    <view class="quick-actions" :class="{ 'quick-actions--fixed': isActionsSticky }">
      <view class="action-card" @click="goClinicMall">
        <view class="action-icon icon-mall">
          <text class="iconfont icon-ic_mall"></text>
        </view>
        <text class="action-label">诊所商城</text>
      </view>
      <view class="action-card" @click="goAppointmentService">
        <view class="action-icon icon-reserve">
          <text class="iconfont icon-ic_clock"></text>
        </view>
        <text class="action-label">预约服务</text>
      </view>
      <view class="action-card" @click="goMyAppointment">
        <view class="action-icon icon-mybook">
          <text class="iconfont icon-a-ic_Picturearrangement"></text>
        </view>
        <text class="action-label">我的预约</text>
      </view>
      <view class="action-card" @click="goMyWallet">
        <view class="action-icon icon-wallet">
          <text class="iconfont icon-ic_coupon"></text>
        </view>
        <text class="action-label">我的钱包</text>
      </view>
      <view class="action-card" @click="goDoctorList">
        <view class="action-icon icon-doctor">
          <text class="iconfont icon-ic_crown"></text>
        </view>
        <text class="action-label">名医专家</text>
      </view>
      <view class="action-card" @click="goTherapistList">
        <view class="action-icon icon-therapist">
          <text class="iconfont icon-ic_leaf"></text>
        </view>
        <text class="action-label">理疗师</text>
      </view>
    </view>

    <!-- 精选商品 -->
    <view class="featured-section">
      <view class="section-header">
        <text class="section-title">精选商品</text>
        <view class="section-more" @click="goClinicMall">
          <text>更多</text>
          <text class="iconfont icon-ic_rightarrow" style="font-size: 24rpx; margin-left: 4rpx;"></text>
        </view>
      </view>

      <view class="product-grid" v-if="displayProducts.length > 0">
        <view class="product-card" v-for="(item, index) in displayProducts" :key="index" @click="goProductDetail(item)">
          <view class="product-img">
            <image :src="item.image" mode="aspectFill"></image>
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

      <view class="empty-products" v-else-if="!loading">
        <empty-page title="暂无商品~" mTop="0" :imgSrc="urlDomain+'crmebimage/presets/noJilu.png'"></empty-page>
      </view>
    </view>

    <!-- 底部安全区 -->
    <view class="safe-bottom"></view>
    <view v-if="bottomNavigationIsCustom" class="footerBottom"></view>
    <pageFooter></pageFooter>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { getMerIndexInfoApi, getMerProListApi, getMerStreetApi } from '@/api/merchant.js';
import { chatConfig } from '@/utils/consumerType.js';
import emptyPage from '@/components/emptyPage.vue';
import pageFooter from '@/components/pageFooter/index.vue';

let app = getApp();

export default {
  components: {
    emptyPage,
    pageFooter
  },
  computed: {
    ...mapGetters(['isLogin', 'uid', 'globalData', 'bottomNavigationIsCustom']),
    displayProducts() {
      return this.productList;
    }
  },
  data() {
    return {
      urlDomain: this.$Cache.get("imgHost"),
      theme: app.globalData.theme,
      merId: 0,
      serviceOpen: false,
      serviceTop: 280,
      serviceTimer: null,
      clinicInfo: {},
      productList: [],
      loading: true,
      page: 1,
      limit: 10,
      loadend: false,
      isActionsSticky: false
    }
  },
  onLoad(options) {
    if (options.merId) {
      this.merId = parseInt(options.merId, 10);
      this.getClinicInfo();
      this.getProductList();
    } else {
      this.bootstrapDefaultStore();
    }
  },
  onPullDownRefresh() {
    this.page = 1;
    this.loadend = false;
    this.productList = [];
    if (this.merId) {
      this.getClinicInfo();
      this.getProductList();
    } else {
      this.bootstrapDefaultStore();
    }
  },
  onPageScroll(e) {
    this.isActionsSticky = e.scrollTop > 350;
  },
  onReachBottom() {
    this.getProductList();
  },
  methods: {
    /** 未带 merId 进入时：店铺街接口取第一个门店作为当前门店（与门店切换页同一套 merchant/street） */
    bootstrapDefaultStore() {
      this.loading = true;
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.fetchFirstMerchantAsDefault(res.latitude, res.longitude);
        },
        fail: () => {
          this.fetchFirstMerchantAsDefault(28.228, 112.939);
        }
      });
    },

    fetchFirstMerchantAsDefault(latitude, longitude) {
      getMerStreetApi({
        page: 1,
        limit: 20,
        latitude,
        longitude
      })
        .then(res => {
          let list = (res.data && res.data.list) || res.data || [];
          if (!Array.isArray(list)) list = [];
          const first = list[0];
          if (first && first.id != null) {
            this.merId = first.id;
          }
          this.getClinicInfo();
          this.page = 1;
          this.loadend = false;
          this.productList = [];
          this.getProductList();
        })
        .catch(() => {
          this.getClinicInfo();
          this.page = 1;
          this.loadend = false;
          this.productList = [];
          this.getProductList();
        });
    },

    getClinicInfo() {
      if (!this.merId) {
        this.clinicInfo = {};
        uni.setNavigationBarTitle({ title: '诊所' });
        return;
      }
      getMerIndexInfoApi(this.merId).then(res => {
        this.clinicInfo = res.data;
        uni.setNavigationBarTitle({ title: res.data.name || '诊所' });
      }).catch(() => {
        this.clinicInfo = {};
        uni.setNavigationBarTitle({ title: '诊所' });
      });
    },

    getProductList() {
      if (this.loadend) return;
      if (!this.merId) {
        this.loading = false;
        uni.stopPullDownRefresh();
        return;
      }
      this.loading = true;
      getMerProListApi({
        page: this.page,
        limit: this.limit,
        merId: this.merId
      }).then(res => {
        let list = res.data.list || res.data || [];
        if (list.length < this.limit) this.loadend = true;
        this.productList = this.productList.concat(list);
        this.page++;
        this.loading = false;
        uni.stopPullDownRefresh();
      }).catch(() => {
        this.loading = false;
        uni.stopPullDownRefresh();
      });
    },

    onServiceTap() {
      if (this.serviceOpen) {
        this.handleCustomer();
        this.serviceOpen = false;
      } else {
        this.serviceOpen = true;
        clearTimeout(this.serviceTimer);
        this.serviceTimer = setTimeout(() => {
          this.serviceOpen = false;
        }, 4000);
      }
    },

    handleNavigation() {
      let info = this.clinicInfo;
      if (!info.latitude || !info.longitude) {
        return this.$util.Tips({ title: '暂无位置信息' });
      }
      let lat = parseFloat(info.latitude);
      let lng = parseFloat(info.longitude);
      let name = encodeURIComponent(info.name || '目的地');
      let addr = encodeURIComponent(info.addressDetail || '');

      // #ifdef APP-PLUS
      let mapItems = ['高德地图', '百度地图', '腾讯地图'];
      if (uni.getSystemInfoSync().platform === 'ios') {
        mapItems.push('Apple 地图');
      }
      uni.showActionSheet({
        itemList: mapItems,
        success: (res) => {
          let urls = {
            0: `amapuri://route/plan/?dlat=${lat}&dlon=${lng}&dname=${name}&dev=0&t=0`,
            1: `baidumap://map/direction?destination=latlng:${lat},${lng}|name:${name}&coord_type=gcj02&mode=driving`,
            2: `qqmap://map/routeplan?type=drive&to=${name}&tocoord=${lat},${lng}&referer=clinic`,
            3: `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
          };
          let url = urls[res.tapIndex];
          plus.runtime.openURL(url, (err) => {
            let fallbacks = {
              0: `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car`,
              1: `https://api.map.baidu.com/direction?destination=latlng:${lat},${lng}|name:${name}&coord_type=gcj02&mode=driving&output=html`,
              2: `https://apis.map.qq.com/uri/v1/routeplan?type=drive&to=${name}&tocoord=${lat},${lng}&referer=clinic`,
              3: `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car`
            };
            plus.runtime.openURL(fallbacks[res.tapIndex], () => {
              this.$util.Tips({ title: '未安装该地图应用' });
            });
          });
        }
      });
      // #endif

      // #ifdef H5
      uni.showActionSheet({
        itemList: ['高德地图', '百度地图', '腾讯地图'],
        success: (res) => {
          let webUrls = [
            `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car`,
            `https://api.map.baidu.com/direction?destination=latlng:${lat},${lng}|name:${name}&coord_type=gcj02&mode=driving&output=html`,
            `https://apis.map.qq.com/uri/v1/routeplan?type=drive&to=${name}&tocoord=${lat},${lng}&referer=clinic`
          ];
          window.open(webUrls[res.tapIndex]);
        }
      });
      // #endif

      // #ifdef MP
      uni.openLocation({
        latitude: lat,
        longitude: lng,
        scale: 16,
        name: info.name,
        address: info.addressDetail || ''
      });
      // #endif
    },

    handleCall() {
      let phone = this.clinicInfo.phone || this.clinicInfo.servicePhone;
      if (!phone) {
        return this.$util.Tips({ title: '暂无联系电话' });
      }
      uni.makePhoneCall({ phoneNumber: phone });
    },

    handleCustomer() {
      if (this.clinicInfo) {
        chatConfig(this.clinicInfo);
      }
    },

    goStoreSwitch() {
      this.$util.navigateTo(`/pages/clinic/store_switch/index?merId=${this.merId}`);
    },

    goClinicMall() {
      this.$util.navigateTo(`/pages/clinic/mall/index?merId=${this.merId}`);
    },

    goAppointmentService() {
      this.$util.navigateTo(`/pages/clinic/therapist/index?mchId=${this.merId}`);
    },

    goMyAppointment() {
      this.$util.navigateTo(`/pages/clinic/appointment/index?merId=${this.merId}`);
    },

    goMyWallet() {
      this.$util.navigateTo(`/pages/users/user_money/index`);
    },

    goProductDetail(item) {
      if (item.id) {
        this.$util.navigateTo(`/pages/goods/goods_details/index?id=${item.id}`);
      }
    },

    goDoctorList() {
      this.$util.navigateTo(`/pages/clinic/doctor/index?mchId=${this.merId}`);
    },

    goTherapistList() {
      this.$util.navigateTo(`/pages/clinic/therapist/index?mchId=${this.merId}`);
    }
  }
}
</script>

<style lang="scss" scoped>
.clinic-home {
  min-height: 100vh;
  background-color: #fff;
}

/* 顶部背景图 */
.header-bg {
  position: relative;
  width: 100%;
  height: 360rpx;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  height: 100%;
}

.bg-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #c8d8b0 0%, #a8c68f 30%, #8ab573 60%, #6ea35a 100%);
}

/* 抽屉式浮动客服按钮 */
.service-drawer {
  position: fixed;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  transform: translateX(60%);
  transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);

  &.is-open {
    transform: translateX(0);
  }
}

.drawer-inner {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f5a623, #f0932b);
  padding: 14rpx 24rpx 14rpx 18rpx;
  border-radius: 40rpx 0 0 40rpx;
  box-shadow: -4rpx 4rpx 16rpx rgba(245, 166, 35, 0.35);
}

.drawer-icon {
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10rpx;
  flex-shrink: 0;

  .iconfont {
    font-size: 32rpx;
    color: #fff;
  }
}

.drawer-label {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
}

/* 诊所信息卡片 */
.clinic-card {
  position: relative;
  margin-top: -60rpx;
  margin-left: 24rpx;
  margin-right: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 28rpx 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  z-index: 5;
}

.clinic-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.clinic-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #282828;
  flex: 1;
  margin-right: 20rpx;
}

.switch-btn {
  display: flex;
  align-items: center;
  padding: 10rpx 24rpx;
  border: 1px solid #ddd;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
  flex-shrink: 0;
}

.clinic-time {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;

  .iconfont {
    font-size: 28rpx;
    color: #999;
    margin-right: 10rpx;
  }
}

.clinic-address-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.address-left {
  display: flex;
  align-items: flex-start;
  flex: 1;
  margin-right: 24rpx;

  .loc-icon {
    font-size: 28rpx;
    color: var(--view-theme);
    margin-right: 10rpx;
    margin-top: 4rpx;
    flex-shrink: 0;
  }
}

.address-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.address-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 36rpx;
  font-size: 22rpx;
  color: #333;

  .iconfont {
    font-size: 40rpx;
    color: #333;
    margin-bottom: 6rpx;
  }
}

/* 快捷操作区 */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  background: #fff;
  padding: 36rpx 20rpx 28rpx;
  margin-top: 20rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1rpx solid transparent;
  transition: border-color 0.2s, box-shadow 0.2s;
  gap: 20rpx 0;
}
.quick-actions--fixed {
  border-bottom-color: #f0f0f0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  margin-bottom: 14rpx;

  .iconfont {
    font-size: 48rpx;
  }

  &.icon-mall {
    background: #eef6e8;
    .iconfont { color: #6ea35a; }
  }
  &.icon-reserve {
    background: #fef4e5;
    .iconfont { color: #f0932b; }
  }
  &.icon-mybook {
    background: #e8f0fe;
    .iconfont { color: #4a90d9; }
  }
  &.icon-wallet {
    background: #fde8e8;
    .iconfont { color: #e74c3c; }
  }
  &.icon-doctor {
    background: #e8f4fd;
    .iconfont { color: #2980b9; }
  }
  &.icon-therapist {
    background: #f0e8fd;
    .iconfont { color: #8e44ad; }
  }
}

.action-label {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 精选商品 */
.featured-section {
  background: #fff;
  margin-top: 20rpx;
  padding: 24rpx 24rpx;
  min-height: 400rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #282828;
}

.section-more {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #999;
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
  border: 1px solid #f0f0f0;
}

.product-img {
  width: 100%;
  height: 340rpx;
  overflow: hidden;
  background: #f5f5f5;

  image {
    width: 100%;
    height: 100%;
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
  color: var(--view-priceColor);
}

.price-num {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--view-priceColor);
}

.product-tag {
  display: inline-block;
  padding: 4rpx 14rpx;
  border: 1px solid #e0e0e0;
  border-radius: 6rpx;
  font-size: 20rpx;
  color: #999;
}

.empty-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320rpx;
  padding: 24rpx 0 80rpx;
  box-sizing: border-box;
}

.safe-bottom {
  height: calc(20rpx + constant(safe-area-inset-bottom));
  height: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
}
</style>
