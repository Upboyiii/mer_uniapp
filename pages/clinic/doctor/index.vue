<template>
  <view class="doctor-page" :data-theme="theme">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-inner">
        <text class="iconfont icon-ic_search"></text>
        <input
          class="search-input"
          :placeholder="filterMode === 'dept' ? '搜索医生姓名/科室' : filterMode === 'disease' ? '搜索医生姓名/疾病' : '搜索医生姓名/擅长领域'"
          v-model="keyword"
          confirm-type="search"
          @confirm="onSearch"
        />
      </view>
    </view>

    <!-- 按科室 / 按疾病：筛选项来自字典接口 Hospital/sub/alllist、Hospital/ill/alllist；列表请求带 hospitalSub / specialization -->
    <view v-if="filterMode === 'dept'" class="filter-strip">
      <text class="filter-strip-label">科室</text>
      <picker mode="selector" :range="deptOptions" :value="pickerDeptIndex" @change="onDeptPick">
        <view class="filter-strip-picker">
          <text class="filter-strip-val">{{ hospitalSub || "请选择" }}</text>
          <text class="iconfont icon-ic_downarrow filter-arrow"></text>
        </view>
      </picker>
    </view>
    <view v-if="filterMode === 'disease'" class="filter-strip">
      <text class="filter-strip-label">疾病</text>
      <picker mode="selector" :range="diseaseOptions" :value="pickerDisIndex" @change="onDiseasePick">
        <view class="filter-strip-picker">
          <text class="filter-strip-val">{{ specialization || "请选择" }}</text>
          <text class="iconfont icon-ic_downarrow filter-arrow"></text>
        </view>
      </picker>
    </view>

    <!-- 医生列表 -->
    <scroll-view
      scroll-y
      class="doctor-scroll"
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
          <view class="card-left">
            <image
              class="doctor-avatar"
              :src="item.picture || '/static/images/f.png'"
              mode="aspectFill"
            ></image>
            <view v-if="item.onlineStatus === 1" class="online-dot"></view>
          </view>
          <view class="card-center">
            <view class="doctor-name-row">
              <text class="doctor-name">{{ item.name }}</text>
              <text class="doctor-title" v-if="item.hospitalTitle">{{ item.hospitalTitle }}</text>
            </view>
            <view class="doctor-hospital-wrap">
              <view class="doctor-hospital" v-if="item.hospitalName">
                <text>{{ item.hospitalName }}</text>
                <text v-if="item.hospitalSub"> · {{ item.hospitalSub }}</text>
                <text v-if="item.hospitalLevel" class="level-tag">{{ item.hospitalLevel }}</text>
              </view>
            </view>
            <view class="doctor-domain-wrap">
              <view class="doctor-domain line2" v-if="item.hospitalDomain || item.specialization">
                擅长：{{ item.hospitalDomain || item.specialization }}
              </view>
            </view>
            <view class="doctor-stats">
              <view class="stat-item" v-if="hasStat(item.score)">
                <text class="stat-val">{{ item.score }}</text>
                <text class="stat-label">评分</text>
              </view>
              <view class="stat-item" v-if="hasStat(item.treatNum)">
                <text class="stat-val">{{ item.treatNum }}</text>
                <text class="stat-label">已治疗</text>
              </view>
              <view class="stat-item" v-if="hasStat(item.responseTime)">
                <text class="stat-val">{{ item.responseTime }}min</text>
                <text class="stat-label">响应</text>
              </view>
            </view>
          </view>
          <view class="card-right">
            <view
              class="consult-btn"
              :class="{ offline: item.onlineStatus !== 1 }"
              @click.stop="goConsult(item)"
            >
              {{ item.onlineStatus === 1 ? '问诊' : '离线' }}
            </view>
          </view>
        </view>
      </view>

      <view v-if="doctorList.length === 0 && !loading" class="empty-wrap">
        <emptyPage title="暂无名医数据~" mTop="0" :imgSrc="urlDomain + 'crmebimage/presets/noJilu.png'"></emptyPage>
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
import {
  getDoctorListApi,
  getDoctorByMchApi,
  getHospitalSubAllListApi,
  getIllAllListApi
} from "@/api/clinic.js";
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
      mchId: 0,
      keyword: "",
      /** dept | disease | '' */
      filterMode: "",
      filterOptionsReady: false,
      deptOptions: ["全部"],
      diseaseOptions: ["全部"],
      pickerDeptIndex: 0,
      pickerDisIndex: 0,
      hospitalSub: "全部",
      specialization: "全部",
      doctorList: [],
      loading: false,
      loadend: false,
      isRefreshing: false,
      page: 1,
      limit: 10,
      scrollHeight: 0
    };
  },
  onLoad(options) {
    this.mchId = options.mchId ? parseInt(options.mchId, 10) : 0;
    const m = options.mode;
    this.filterMode = m === "dept" || m === "disease" ? m : "";
    if (this.filterMode === "dept") {
      uni.setNavigationBarTitle({ title: "按科室找医生" });
    } else if (this.filterMode === "disease") {
      uni.setNavigationBarTitle({ title: "按疾病找医生" });
    }
    let sys = uni.getSystemInfoSync();
    const stripPx = this.filterMode ? 44 : 0;
    this.scrollHeight = sys.windowHeight - 100 - stripPx;
    if (this.filterMode) {
      this.loadFilterOptions()
        .then(() => {
          this.filterOptionsReady = true;
          this.getDoctorList();
        })
        .catch(() => {
          this.filterOptionsReady = true;
          this.getDoctorList();
        });
    } else {
      this.filterOptionsReady = true;
      this.getDoctorList();
    }
  },
  onPullDownRefresh() {
    this.onRefresh();
  },
  methods: {
    loadFilterOptions() {
      if (this.filterMode === "dept") {
        return getHospitalSubAllListApi().then(res => {
          const raw = res.data;
          const list = Array.isArray(raw) ? raw : [];
          const names = list
            .filter(it => it && (it.status === undefined || it.status === 1))
            .map(it => (it.name != null ? String(it.name).trim() : ""))
            .filter(Boolean);
          const uniq = [...new Set(names)].sort((a, b) => a.localeCompare(b, "zh-CN"));
          this.deptOptions = ["全部", ...uniq];
          this.pickerDeptIndex = 0;
          this.hospitalSub = this.deptOptions[0];
        });
      }
      if (this.filterMode === "disease") {
        return getIllAllListApi().then(res => {
          const raw = res.data;
          const list = Array.isArray(raw) ? raw : [];
          const sorted = list
            .filter(it => it && (it.status === undefined || it.status === 1))
            .sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0));
          const names = sorted
            .map(it => (it.name != null ? String(it.name).trim() : ""))
            .filter(Boolean);
          this.diseaseOptions = ["全部", ...names];
          this.pickerDisIndex = 0;
          this.specialization = this.diseaseOptions[0];
        });
      }
      return Promise.resolve();
    },

    onDeptPick(e) {
      const idx = parseInt(e.detail.value, 10);
      if (!isNaN(idx) && this.deptOptions[idx] != null) {
        this.pickerDeptIndex = idx;
        this.hospitalSub = this.deptOptions[idx];
        this.onRefresh();
      }
    },

    onDiseasePick(e) {
      const idx = parseInt(e.detail.value, 10);
      if (!isNaN(idx) && this.diseaseOptions[idx] != null) {
        this.pickerDisIndex = idx;
        this.specialization = this.diseaseOptions[idx];
        this.onRefresh();
      }
    },

    getDoctorList() {
      if (this.filterMode && !this.filterOptionsReady) return;
      if (this.loadend || this.loading) return;
      this.loading = true;
      let params = { page: this.page, limit: this.limit };
      let apiFn = getDoctorListApi;
      if (this.mchId) {
        params.mchId = this.mchId;
        apiFn = getDoctorByMchApi;
      }
      if (this.filterMode === "dept" && this.hospitalSub && this.hospitalSub !== "全部") {
        params.hospitalSub = this.hospitalSub;
      }
      if (this.filterMode === "disease" && this.specialization && this.specialization !== "全部") {
        params.specialization = this.specialization;
      }
      apiFn(params)
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
      this.getDoctorList();
    },

    onSearch() {
      this.onRefresh();
    },

    loadMore() {
      this.getDoctorList();
    },

    goDoctorDetail(item) {
      try {
        if (item && item.id != null) {
          uni.setStorageSync("doctor_detail_prefill_" + item.id, JSON.stringify(item));
        }
      } catch (e) {}
      this.$util.navigateTo(`/pages/clinic/doctor/detail?id=${item.id}`);
    },

    goConsult(item) {
      if (!this.isLogin) {
        return this.$util.navigateTo("/pages/users/login/index");
      }
      if (item.onlineStatus !== 1) {
        return this.$util.Tips({ title: "医生当前离线" });
      }
      try {
        if (item && item.id != null) {
          uni.setStorageSync("doctor_detail_prefill_" + item.id, JSON.stringify(item));
        }
      } catch (e) {}
      this.$util.navigateTo(`/pages/clinic/doctor/detail?id=${item.id}`);
    },

    /** 接口有有效值才展示统计项（null/undefined/空串不展示；数字 0 视为无数据不展示） */
    hasStat(val) {
      if (val === null || val === undefined || val === "") return false;
      if (typeof val === "number") return val > 0;
      return String(val).trim() !== "";
    }
  }
};
</script>

<style lang="scss" scoped>
.doctor-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.search-bar {
  padding: 16rpx 24rpx;
  background: #fff;
}

.search-inner {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 16rpx 24rpx;

  .iconfont {
    font-size: 28rpx;
    color: #999;
    margin-right: 12rpx;
  }
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.filter-strip {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx 16rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.filter-strip-label {
  flex-shrink: 0;
  font-size: 26rpx;
  color: #666;
  margin-right: 16rpx;
}

.filter-strip-picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 16rpx 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;
}

.filter-strip-val {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-arrow {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #999;
  margin-left: 8rpx;
}

.doctor-scroll {
  width: 100%;
}

.doctor-list {
  padding: 16rpx 24rpx;
}

.doctor-card {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  min-height: 248rpx;
  box-sizing: border-box;
}

.card-left {
  position: relative;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.doctor-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

.online-dot {
  position: absolute;
  right: 4rpx;
  bottom: 4rpx;
  width: 20rpx;
  height: 20rpx;
  background: #52c41a;
  border: 3rpx solid #fff;
  border-radius: 50%;
}

.card-center {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 120rpx;
}

.doctor-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.doctor-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #282828;
  margin-right: 12rpx;
}

.doctor-title {
  font-size: 22rpx;
  color: var(--view-theme);
  background: rgba(110, 163, 90, 0.1);
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
}

.doctor-hospital-wrap {
  min-height: 40rpx;
  margin-bottom: 8rpx;
  box-sizing: border-box;
}

.doctor-hospital {
  font-size: 24rpx;
  color: #666;

  .level-tag {
    margin-left: 8rpx;
    font-size: 20rpx;
    color: #f0932b;
    background: rgba(240, 147, 43, 0.1);
    padding: 2rpx 8rpx;
    border-radius: 4rpx;
  }
}

.doctor-domain-wrap {
  min-height: 72rpx;
  margin-bottom: 12rpx;
  box-sizing: border-box;
}

.doctor-domain {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

.doctor-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24rpx;
  min-height: 44rpx;
  margin-top: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.stat-val {
  font-size: 24rpx;
  font-weight: 600;
  color: #f0932b;
}

.stat-label {
  font-size: 20rpx;
  color: #999;
}

.card-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-left: 16rpx;
}

.consult-btn {
  padding: 14rpx 28rpx;
  background: var(--view-theme);
  color: #fff;
  font-size: 24rpx;
  border-radius: 30rpx;

  &.offline {
    background: #ccc;
  }
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
  padding: 60rpx 24rpx;
  box-sizing: border-box;
}

.loading-wrap {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>
