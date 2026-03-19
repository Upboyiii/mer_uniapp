<template>
  <view class="therapist-page" :data-theme="theme">
    <view class="content-box" :style="{ height: winHeight + 'px' }">
      <!-- 左侧分类 -->
      <view class="aside">
        <scroll-view scroll-y style="height: 100%;" scroll-with-animation>
          <view
            class="aside-item"
            :class="{ active: currentCateIndex === index }"
            v-for="(item, index) in categoryList"
            :key="item.id || index"
            @click="switchCategory(index)"
          >
            <text class="aside-text">{{ item.name }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 右侧理疗师列表 -->
      <view class="main-content">
        <scroll-view scroll-y style="height: 100%;" @scrolltolower="loadMore">
          <view v-if="therapistList.length > 0" class="therapist-list">
            <view
              class="therapist-card"
              v-for="(item, index) in therapistList"
              :key="index"
              @click="goTherapistDetail(item)"
            >
              <view class="avatar-box">
                <image :src="item.avatar || '/static/images/f.png'" mode="aspectFill" class="avatar"></image>
              </view>
              <view class="card-info">
                <view class="card-name">{{ item.name }}</view>
                <view class="card-desc line1" v-if="item.intro">{{ item.intro }}</view>
                <view class="card-tags" v-if="item.skills && item.skills.length">
                  <text class="tag" v-for="(skill, si) in item.skills" :key="si">{{ skill }}</text>
                </view>
              </view>
              <view class="card-action">
                <view class="book-btn" @click.stop="goBookTherapist(item)">预约</view>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-else-if="!loading" class="empty-content">
            <empty-page title="暂无数据" mTop="30%"></empty-page>
          </view>

          <!-- 加载中 -->
          <view v-if="loading" class="loading-wrap">
            <text>加载中...</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { getTherapistCategoryApi, getTherapistListApi } from '@/api/clinic.js';
import emptyPage from '@/components/emptyPage.vue';

let app = getApp();
export default {
  components: { emptyPage },
  computed: {
    ...mapGetters(['isLogin'])
  },
  data() {
    return {
      theme: app.globalData.theme,
      merId: 0,
      winHeight: 0,
      categoryList: [],
      therapistList: [],
      currentCateIndex: 0,
      loading: false,
      loadend: false,
      page: 1,
      limit: 10
    }
  },
  onLoad(options) {
    this.merId = options.merId ? parseInt(options.merId) : 0;
    let sysInfo = uni.getSystemInfoSync();
    // #ifdef H5
    this.winHeight = sysInfo.windowHeight;
    // #endif
    // #ifdef MP || APP-PLUS
    this.winHeight = sysInfo.windowHeight - uni.getSystemInfoSync().statusBarHeight - 44;
    // #endif
    this.getCategoryList();
  },
  methods: {
    getCategoryList() {
      this.loading = true;
      getTherapistCategoryApi(this.merId).then(res => {
        this.categoryList = res.data || [];
        if (this.categoryList.length > 0) {
          this.getTherapistList();
        } else {
          this.loading = false;
        }
      }).catch(() => {
        // 接口暂未对接时使用默认分类
        this.categoryList = [
          { id: 1, name: '淋漓祛湿' },
          { id: 2, name: '艾灸调理' },
          { id: 3, name: '通经络' },
          { id: 4, name: '局部调理' },
          { id: 5, name: '其他' },
          { id: 6, name: '菌群移植' },
          { id: 7, name: '针灸' },
          { id: 8, name: '拔罐' },
          { id: 9, name: '正骨' },
          { id: 10, name: '膏膜保健' },
          { id: 11, name: '香养香灸' },
          { id: 12, name: '经筋骨' },
          { id: 13, name: '射灸' },
          { id: 14, name: '推拿' }
        ];
        this.loading = false;
      });
    },

    getTherapistList() {
      if (this.loadend) return;
      this.loading = true;
      let currentCate = this.categoryList[this.currentCateIndex];
      getTherapistListApi({
        merId: this.merId,
        categoryId: currentCate ? currentCate.id : '',
        page: this.page,
        limit: this.limit
      }).then(res => {
        let list = res.data.list || res.data || [];
        if (list.length < this.limit) this.loadend = true;
        this.therapistList = this.therapistList.concat(list);
        this.page++;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },

    switchCategory(index) {
      if (this.currentCateIndex === index) return;
      this.currentCateIndex = index;
      this.resetList();
      this.getTherapistList();
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
      this.$util.navigateTo(`/pages/clinic/therapist/detail?id=${item.id}&merId=${this.merId}`);
    },

    goBookTherapist(item) {
      if (!this.isLogin) {
        return this.$util.navigateTo('/pages/users/login/index');
      }
      this.$util.navigateTo(`/pages/activity/reservation/reservation/index?productId=${item.productId}&merId=${this.merId}`);
    }
  }
}
</script>

<style lang="scss" scoped>
.therapist-page {
  background-color: #f5f5f5;
}

.content-box {
  display: flex;
  width: 100%;
}

.aside {
  width: 200rpx;
  background: #f7f7f7;
  flex-shrink: 0;
}

.aside-item {
  padding: 30rpx 20rpx;
  font-size: 26rpx;
  color: #333;
  position: relative;
  text-align: center;

  &.active {
    background: #fff;
    color: var(--view-theme);
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 40rpx;
      background: var(--view-theme);
      border-radius: 0 3rpx 3rpx 0;
    }
  }
}

.aside-text {
  display: block;
  line-height: 1.4;
}

.main-content {
  flex: 1;
  background: #fff;
  overflow: hidden;
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

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;

  .tag {
    padding: 4rpx 12rpx;
    background: #f5f5f5;
    border-radius: 6rpx;
    font-size: 20rpx;
    color: #666;
  }
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
  padding-top: 200rpx;
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
