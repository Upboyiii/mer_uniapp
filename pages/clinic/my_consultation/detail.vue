<template>
  <view class="consultation-detail-page" :data-theme="theme">
    <view v-if="loading" class="loading-center">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="detail" class="detail-content">
      <!-- 状态横幅 -->
      <view class="status-banner" :class="statusBannerClass(detail.status)">
        <text class="status-icon iconfont" :class="statusIcon(detail.status)"></text>
        <view class="status-info">
          <text class="status-title">{{ statusText(detail.status) }}</text>
          <text class="status-sub">{{ statusDesc(detail.status) }}</text>
        </view>
      </view>

      <!-- 问诊信息 -->
      <view class="section-card">
        <view class="section-title">问诊信息</view>
        <view class="info-item">
          <text class="item-label">问诊类型</text>
          <text class="consult-type-tag" :class="detail.consultType === 2 ? 'type-video' : 'type-img'">
            {{ detail.consultType === 2 ? '视频问诊' : '图文问诊' }}
          </text>
        </view>
        <view class="info-item" v-if="detail.diseaseType">
          <text class="item-label">就诊科室</text>
          <text class="item-val">{{ detail.diseaseType }}</text>
        </view>
        <view class="info-item" v-if="detail.diseaseDesc">
          <text class="item-label">病情描述</text>
          <text class="item-val desc-val">{{ detail.diseaseDesc }}</text>
        </view>
        <view class="info-item" v-if="detail.consultFee != null">
          <text class="item-label">问诊费用</text>
          <text class="item-val fee-val">¥{{ detail.consultFee }}</text>
        </view>
      </view>

      <!-- 支付信息 -->
      <view class="section-card">
        <view class="section-title">支付信息</view>
        <view class="info-item">
          <text class="item-label">支付状态</text>
          <text class="item-val" :class="payStatusClass(detail.payStatus)">
            {{ payStatusText(detail.payStatus) }}
          </text>
        </view>
        <view class="info-item" v-if="detail.payOrderNo">
          <text class="item-label">支付单号</text>
          <text class="item-val order-no">{{ detail.payOrderNo }}</text>
        </view>
      </view>

      <!-- 时间信息 -->
      <view class="section-card">
        <view class="section-title">时间记录</view>
        <view class="info-item" v-if="detail.createTime">
          <text class="item-label">创建时间</text>
          <text class="item-val">{{ detail.createTime }}</text>
        </view>
        <view class="info-item" v-if="detail.updateTime">
          <text class="item-label">更新时间</text>
          <text class="item-val">{{ detail.updateTime }}</text>
        </view>
      </view>
    </view>

    <view v-else-if="!loading" class="empty-wrap">
      <emptyPage title="问诊记录不存在~" mTop="30%" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></emptyPage>
    </view>
  </view>
</template>

<script>
import { getDoctorConsultationInfoApi } from "@/api/clinic.js";
import emptyPage from "@/components/emptyPage.vue";

export default {
  components: { emptyPage },
  data() {
    return {
      urlDomain: this.$Cache.get("imgHost"),
      theme: getApp().globalData.theme,
      id: null,
      detail: null,
      loading: false
    };
  },
  onLoad(options) {
    this.id = options.id;
    this.getDetail();
  },
  methods: {
    getDetail() {
      if (!this.id) return;
      this.loading = true;
      getDoctorConsultationInfoApi(this.id)
        .then(res => {
          this.detail = res.data || null;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },

    statusText(status) {
      const map = { 0: '待接诊', 1: '问诊中', 2: '已完成', 3: '已取消' };
      return map[status] !== undefined ? map[status] : '未知';
    },

    statusDesc(status) {
      const map = {
        0: '您的问诊已提交，等待医生接诊',
        1: '医生正在为您提供问诊服务',
        2: '问诊已完成，感谢您的信任',
        3: '该问诊已取消'
      };
      return map[status] || '';
    },

    statusBannerClass(status) {
      const map = {
        0: 'banner-pending',
        1: 'banner-ongoing',
        2: 'banner-done',
        3: 'banner-cancelled'
      };
      return map[status] || '';
    },

    statusIcon(status) {
      const map = {
        0: 'icon-ic_clock',
        1: 'icon-ic_notes',
        2: 'icon-ic_complete',
        3: 'icon-ic_close'
      };
      return map[status] || 'icon-ic_notes';
    },

    payStatusText(payStatus) {
      const map = { 0: '未支付', 1: '已支付', 2: '已退款' };
      return map[payStatus] !== undefined ? map[payStatus] : '未知';
    },

    payStatusClass(payStatus) {
      const map = { 0: 'pay-unpaid', 1: 'pay-paid', 2: 'pay-refunded' };
      return map[payStatus] || '';
    }
  }
};
</script>

<style lang="scss" scoped>
.consultation-detail-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.loading-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.detail-content {
  padding: 24rpx;
}

/* 状态横幅 */
.status-banner {
  display: flex;
  align-items: center;
  border-radius: 16rpx;
  padding: 30rpx 28rpx;
  margin-bottom: 20rpx;
}

.banner-pending {
  background: linear-gradient(135deg, #fff7e6, #ffecd2);

  .status-icon { color: #fa8c16; }
  .status-title { color: #fa8c16; }
}

.banner-ongoing {
  background: linear-gradient(135deg, #f6ffed, #d9f7be);

  .status-icon { color: #52c41a; }
  .status-title { color: #52c41a; }
}

.banner-done {
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);

  .status-icon { color: #888; }
  .status-title { color: #555; }
}

.banner-cancelled {
  background: linear-gradient(135deg, #fff1f0, #ffd8d8);

  .status-icon { color: #ff4d4f; }
  .status-title { color: #ff4d4f; }
}

.status-icon {
  font-size: 56rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 32rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 6rpx;
}

.status-sub {
  font-size: 22rpx;
  color: #888;
}

/* 通用卡片 */
.section-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #282828;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.item-label {
  font-size: 26rpx;
  color: #999;
  width: 120rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.item-val {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

.desc-val {
  line-height: 1.6;
}

.fee-val {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--view-theme);
}

.consult-type-tag {
  font-size: 24rpx;
  padding: 4rpx 18rpx;
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

.pay-unpaid {
  color: #fa8c16;
}

.pay-paid {
  color: #52c41a;
}

.pay-refunded {
  color: #999;
}

.order-no {
  font-size: 22rpx;
  color: #999;
  word-break: break-all;
}

.empty-wrap {
  padding-top: 100rpx;
}
</style>
