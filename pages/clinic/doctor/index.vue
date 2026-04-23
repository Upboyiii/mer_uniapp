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

    <!-- 按科室 / 按疾病：样式与理疗页「精选」分类一致 -->
    <view v-if="filterMode" class="project-cat-row">
      <scroll-view
        scroll-x
        class="project-cat-scroll"
        :show-scrollbar="false"
        :enable-flex="true"
      >
        <view class="project-cat-inner">
          <view
            v-for="(label, idx) in activeFilterOptions"
            :key="label + idx"
            class="project-cat-item"
            :class="{ active: activeFilterValue === label, 'project-cat-item--lead': idx === 0 }"
            hover-class="none"
            @click="selectFilterOption(label, idx)"
          >
            <view class="project-cat-pill">
              <text class="project-cat-text">{{ label }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
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
          <view class="doc-top-row">
            <view class="doc-avatar-wrap">
              <view class="doc-avatar-circle">
                <view class="doc-avatar-outer-ring">
                  <view class="doc-avatar-white-ring">
                    <view class="doc-avatar-inner">
                      <easy-loadimage
                        class="doc-avatar-easy"
                        :image-src="doctorAvatarSrc(item)"
                        mode="aspectFill"
                        width="134rpx"
                        height="134rpx"
                        radius="50%"
                      />
                    </view>
                  </view>
                </view>
                <view v-if="item.onlineStatus === 1" class="online-badge-below">
                  <text>· 接诊中</text>
                </view>
              </view>
            </view>
            <view class="doc-head-info">
              <view class="doc-name-row">
                <text class="doc-name">{{ item.name }}</text>
                <view v-if="hasStat(item.score)" class="doctor-score-tag">
                  <text class="iconfont icon-ic_love_2"></text>
                  <text>评分 {{ formatScore(item.score) }}</text>
                </view>
              </view>
              <view class="doc-title-dept" v-if="item.hospitalTitle || item.hospitalSub">
                <text v-if="item.hospitalTitle">{{ item.hospitalTitle }}</text>
                <text v-if="item.hospitalTitle && item.hospitalSub"> | </text>
                <text v-if="item.hospitalSub">{{ item.hospitalSub }}</text>
              </view>
              <view class="doc-hospital-line" v-if="item.hospitalName || item.hospitalLevel">
                <text v-if="item.hospitalLevel" class="level-tag">{{ item.hospitalLevel }}</text>
                <text class="hosp-name line1">{{ item.hospitalName }}</text>
              </view>
            </view>
          </view>
          <view class="doc-domain">
            <text class="doc-domain-line2">
              <text class="domain-label">擅长：</text>
              <text class="domain-body">{{ item.hospitalDomain || item.specialization || "—" }}</text>
            </text>
          </view>
          <view class="doc-stats-line">
            <text class="stat-num">{{ item.treatNum != null ? item.treatNum : 0 }}</text>
            <text class="stat-txt"> 接诊数</text>
            <text class="stat-split"> · </text>
            <text class="stat-txt">{{ doctorResponseLine(item) }}</text>
          </view>
          <view class="doc-actions">
            <view
              class="action-pill"
              v-if="doctorImageFee(item) != null"
              @click.stop="goConsult(item, 'text')"
            >
              <text class="iconfont icon-ic_edit"></text>
              <text>图文</text>
              <text class="pill-price">¥{{ formatDoctorPrice(doctorImageFee(item)) }}</text>
            </view>
            <view
              class="action-pill action-pill-video"
              v-if="doctorVideoFee(item) != null"
              @click.stop="goConsult(item, 'video')"
            >
              <text class="iconfont icon-ic_video1"></text>
              <text>视频</text>
              <text class="pill-price">¥{{ formatDoctorPrice(doctorVideoFee(item)) }}</text>
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
import easyLoadimage from "@/components/base/easy-loadimage.vue";
import { formatDoctorScoreDisplay } from "@/utils/doctorScoreDisplay.js";

export default {
  components: { emptyPage, easyLoadimage },
  computed: {
    ...mapGetters(["isLogin"]),
    activeFilterOptions() {
      return this.filterMode === "dept" ? this.deptOptions : this.diseaseOptions;
    },
    activeFilterValue() {
      return this.filterMode === "dept" ? this.hospitalSub : this.specialization;
    }
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

    selectFilterOption(label, idx) {
      if (!label) return;
      if (this.filterMode === "dept") {
        if (this.hospitalSub === label) return;
        this.pickerDeptIndex = idx;
        this.hospitalSub = label;
      } else if (this.filterMode === "disease") {
        if (this.specialization === label) return;
        this.pickerDisIndex = idx;
        this.specialization = label;
      }
      this.onRefresh();
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
      const midQ = item && item.mchId ? `&mchId=${item.mchId}` : "";
      this.$util.navigateTo(`/pages/clinic/doctor/detail?id=${item.id}${midQ}`);
    },

    goConsult(item, type) {
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
      const mode = type === "video" ? "video" : "text";
      const midQ = item && item.mchId ? `&mchId=${item.mchId}` : "";
      this.$util.navigateTo(`/pages/clinic/doctor/detail?id=${item.id}&mode=${mode}${midQ}`);
    },

    resolveImgUrl(path) {
      if (!path || !String(path).trim()) return "";
      const p = String(path).trim();
      if (/^https?:\/\//i.test(p)) return p;
      const base = (this.urlDomain || this.$Cache.get("imgHost") || "").replace(/\/?$/, "");
      if (!base) return p;
      return p.startsWith("/") ? base + p : `${base}/${p}`;
    },
    doctorAvatarSrc(doc) {
      const p = doc && doc.picture;
      if (p != null && String(p).trim() !== "") {
        const u = this.resolveImgUrl(String(p).trim());
        if (u) return u;
      }
      return "/static/images/f.png";
    },
    doctorImageFee(doc) {
      const v = doc.imageFee != null && doc.imageFee !== "" ? doc.imageFee : doc.textPrice;
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) return null;
      return n;
    },
    doctorVideoFee(doc) {
      const v = doc.videoFee != null && doc.videoFee !== "" ? doc.videoFee : doc.videoPrice;
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) return null;
      return n;
    },
    formatDoctorPrice(val) {
      if (val == null || val === "") return "0.00";
      const n = Number(val);
      if (!Number.isFinite(n)) return String(val);
      return n.toFixed(2);
    },
    doctorResponseLine(doc) {
      const t = doc && doc.responseTime;
      if (t == null || t === "" || Number(t) === 0) return "平均响应 --";
      return `${t} 分钟内 平均响应`;
    },
    formatScore(score) {
      return formatDoctorScoreDisplay(score);
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

/* 科室/疾病筛选：同理疗页「精选」样式 */
.project-cat-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}

.project-cat-row .project-cat-item {
  -webkit-tap-highlight-color: transparent;
}

.project-cat-scroll {
  flex: 1;
  min-width: 0;
  height: 92rpx;
}

.project-cat-inner {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  min-height: 92rpx;
  padding: 0 10rpx 0 0;
  box-sizing: border-box;
  padding-left: 0;
}

.project-cat-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-right: 7rpx;
  box-sizing: border-box;
}

.project-cat-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  border-radius: 0;
  transition: background-color 0.22s ease, box-shadow 0.22s ease;
}

.project-cat-item--lead .project-cat-pill {
  min-width: 140rpx;
  padding-left: 26rpx;
  padding-right: 26rpx;
}

.project-cat-text {
  font-size: 27rpx;
  color: #666;
  line-height: 1.2;
  white-space: nowrap;
  text-align: center;
}

.project-cat-item.active .project-cat-pill {
  background: var(--view-theme, #3a9d8f);
  transform: none;
  clip-path: polygon(0 0, 100% 0, 89% 100%, 0 100%);
  border-radius: 0;
  box-shadow: 0 4rpx 14rpx rgba(58, 157, 143, 0.2);
  padding-left: 30rpx;
  padding-right: 38rpx;
}

.project-cat-item--lead.active .project-cat-pill {
  min-width: 152rpx;
  padding-left: 32rpx;
  padding-right: 38rpx;
}

.project-cat-item.active .project-cat-text {
  color: #fff;
  font-weight: 600;
  letter-spacing: 0;
}

.doctor-scroll {
  width: 100%;
}

.doctor-list {
  padding: 0 24rpx 20rpx;
}

.doctor-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 24rpx 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

.doc-top-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.doc-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
  margin-right: 20rpx;
  width: 144rpx;
}

.doc-avatar-circle {
  position: relative;
  width: 144rpx;
  height: 144rpx;
  flex-shrink: 0;
  overflow: visible;
}

.doc-avatar-outer-ring {
  width: 144rpx;
  height: 144rpx;
  box-sizing: border-box;
  padding: 3rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffb04d, #ff9a3d 40%, #ff7a00);
  box-shadow: 0 4rpx 14rpx rgba(255, 140, 60, 0.28);
}

.doc-avatar-white-ring {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 2rpx;
  border-radius: 50%;
  background: #fff;
}

.doc-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
}

.doc-avatar-easy {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}

.online-badge-below {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 3;
  transform: translate(-50%, 42%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #ff9a3d, #ff7a00);
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 10rpx;
  width: 116rpx;
  border-radius: 20rpx;
  white-space: nowrap;
  line-height: 1.2;
  box-shadow: 0 2rpx 8rpx rgba(255, 122, 0, 0.25);
}

.doc-head-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}

.doc-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.doc-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #282828;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doctor-score-tag {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #c45c12;
  background: rgba(255, 154, 61, 0.18);
  padding: 6rpx 14rpx;
  border-radius: 22rpx;
  line-height: 1.2;
  font-weight: 500;

  .iconfont {
    font-size: 26rpx;
  }
}

.doc-title-dept {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 6rpx;
  line-height: 1.4;
  width: 100%;
  text-align: left;
}

.doc-hospital-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  width: 100%;
}

.level-tag {
  display: inline-block;
  background: #fff3e0;
  color: #b8860b;
  font-size: 22rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  flex-shrink: 0;
  font-weight: 500;
}

.hosp-name {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  min-width: 0;
}

.doc-domain {
  width: 100%;
  margin-top: 22rpx;
  margin-bottom: 8rpx;
  text-align: left;
}

.doc-domain-line2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  font-size: 26rpx;
  padding-right: 10rpx;
  line-height: 1.45;
}

.domain-label {
  font-weight: 600;
  color: #333;
}

.domain-body {
  color: #888;
}

.doc-stats-line {
  width: 100%;
  font-size: 24rpx;
  color: #a67c52;
  margin-bottom: 12rpx;
  line-height: 1.45;
  text-align: left;
}

.doc-stats-line .stat-num {
  color: #b87333;
  font-weight: 700;
}

.doc-stats-line .stat-txt {
  color: #a67c52;
}

.doc-stats-line .stat-split {
  color: #ccc;
}

.doc-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 16rpx;
  width: 100%;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-width: 240rpx;
  padding: 16rpx 40rpx;
  border-radius: 50rpx;
  font-size: 26rpx;
  background: #fff;
  color: #333;
  border: 1rpx solid #e5e5e5;
  box-sizing: border-box;

  .iconfont {
    font-size: 28rpx;
    color: #666;
  }
}

.pill-price {
  font-weight: 600;
  margin-left: 4rpx;
  color: #e65c1a;
}

.line1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
