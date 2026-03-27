<template>
  <view class="therapist-page" :data-theme="theme">
    <view class="content-box" :style="{ height: winHeight + 'px' }">
      <!-- 仅走新接口 therapist/page/mch/list，按商户 mchId（与 merchant/street 列表项 id 一致） -->
      <view class="main-content main-content--full">
        <scroll-view scroll-y style="height: 100%;" @scrolltolower="loadMore">
          <view v-if="therapistList.length > 0" class="therapist-list">
            <view
              class="therapist-card"
              v-for="(item, index) in therapistList"
              :key="item.id || index"
              @click="goTherapistDetail(item)"
            >
              <view class="avatar-box">
                <image
                  :src="item.picture || item.avatar || '/static/images/f.png'"
                  mode="aspectFill"
                  class="avatar"
                ></image>
              </view>
              <view class="card-info">
                <view class="card-name">{{ item.name }}</view>
                <view class="card-desc line1" v-if="item.hospitalDomain || item.intro">
                  {{ item.hospitalDomain || item.intro }}
                </view>
              </view>
              <view class="card-action">
                <view class="book-btn" @click.stop="goBookTherapist(item)">预约</view>
              </view>
            </view>
          </view>

          <view v-else-if="!loading && !mchId" class="empty-content">
            <empty-page title="请先选择门店~" mTop="0" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></empty-page>
          </view>

          <view v-else-if="!loading && mchId" class="empty-content">
            <empty-page title="暂无理疗师~" mTop="0" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></empty-page>
          </view>

          <view v-if="loading" class="loading-wrap">
            <text>加载中...</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters } from 'vuex';
import { getTherapistByMchApi } from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';

let app = getApp();
export default {
  components: { emptyPage },
  computed: {
    ...mapGetters(['isLogin'])
  },
  data() {
    return {
      urlDomain: this.$Cache.get('imgHost'),
      theme: app.globalData.theme,
      /** 商户 ID：与 GET /api/front/merchant/street 列表项 id 一致，传给 therapist/page/mch/list 的 mchId */
      mchId: 0,
      winHeight: 0,
      therapistList: [],
      loading: false,
      loadend: false,
      page: 1,
      limit: 10
    };
  },
  onLoad(options) {
    this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
    let sysInfo = uni.getSystemInfoSync();
    // #ifdef H5
    this.winHeight = sysInfo.windowHeight;
    // #endif
    // #ifdef MP || APP-PLUS
    this.winHeight = sysInfo.windowHeight - uni.getSystemInfoSync().statusBarHeight - 44;
    // #endif
    this.resetList();
    if (this.mchId) {
      this.getTherapistList();
    } else {
      this.loading = false;
    }
  },
  methods: {
    getTherapistList() {
      if (!this.mchId) {
        this.loading = false;
        return;
      }
      if (this.loadend) return;
      this.loading = true;
      getTherapistByMchApi({
        page: this.page,
        limit: this.limit,
        mchId: this.mchId
      })
        .then(res => {
          let list = (res.data && res.data.list) || res.data || [];
          if (!Array.isArray(list)) list = [];
          if (list.length < this.limit) this.loadend = true;
          this.therapistList = this.therapistList.concat(list);
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
      this.therapistList = [];
    },

    loadMore() {
      this.getTherapistList();
    },

    goTherapistDetail(item) {
      this.$util.navigateTo(`/pages/clinic/therapist/detail?id=${item.id}&mchId=${this.mchId}`);
    },

    goBookTherapist(item) {
      if (!this.isLogin) {
        return this.$util.navigateTo('/pages/users/login/index');
      }
      if (item.productId) {
        this.$util.navigateTo(
          `/pages/activity/reservation/reservation/index?productId=${item.productId}&mchId=${this.mchId}`
        );
      } else {
        this.$util.Tips({ title: '暂无关联预约商品' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.therapist-page {
  background-color: #f5f5f5;
}

.content-box {
  display: flex;
  width: 100%;
}

.main-content {
  flex: 1;
  background: #fff;
  overflow: hidden;

  &--full {
    width: 100%;
  }
}

.therapist-list {
  padding: 20rpx;
}

.therapist-card {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  border-bottom: 1px solid #f5f5f5;
}

.avatar-box {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.avatar {
  width: 100%;
  height: 100%;
}

.card-info {
  flex: 1;
  overflow: hidden;
}

.card-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #282828;
  margin-bottom: 8rpx;
}

.card-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.card-action {
  flex-shrink: 0;
  margin-left: 16rpx;
}

.book-btn {
  padding: 12rpx 28rpx;
  background: var(--view-theme);
  color: #fff;
  font-size: 24rpx;
  border-radius: 30rpx;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 24rpx 120rpx;
  box-sizing: border-box;
}

.loading-wrap {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>
