# 用户端接口新增 & 页面对接开发指引

> 生成日期：2026-03-26
> 基于 interface.md 新增的 6 个接口，结合用户端流程图进行页面映射

---

## 一、新增接口清单总览

| 序号 | 接口名称 | 请求方式 | 接口地址 | 请求参数 |
|------|---------|---------|---------|---------|
| 1 | 获取医生列表信息 | GET | `/api/front/doctor/page/list` | page, limit |
| 2 | 根据商户获取医生列表信息 | GET | `/api/front/doctor/page/mch/list` | page, limit, mchId |
| 3 | 我的医生列表信息 | GET | `/api/front/doctor/page/user/list` | page, limit |
| 4 | 获取理疗师列表信息 | GET | `/api/front/therapist/page/list` | page, limit |
| 5 | 根据商户获取理疗师列表信息 | GET | `/api/front/therapist/page/mch/list` | page, limit, mchId |
| 6 | 我的理疗师列表信息 | GET | `/api/front/therapist/page/user/list` | page, limit |

---

## 二、接口与页面映射关系（对照流程图）

### 接口 1：获取医生列表 — `GET /api/front/doctor/page/list`

**流程图位置**：`用户端 → 首页 → 名医专家 → 名医列表`

| 项目 | 说明 |
|------|------|
| 所属模块 | 首页 - 名医专家 |
| 现有页面 | **无**（需新建） |
| 建议页面路径 | `pages/clinic/doctor/index.vue`（名医列表页） |
| 入口页 | `pages/index/index.vue`（首页 DIY 组件或固定入口） |
| API 注册位置 | `api/clinic.js` 新增 `getDoctorListApi` |
| request.js 路径 | `doctor/page/list`（框架自动拼接 `/api/front/` 前缀） |
| 是否需要登录 | 否（`noAuth: true`） |
| 分页 | 是，page + limit |

**开发要点**：
- 首页需增加"名医专家"入口区域（可参考首页 DIY 组件或硬编码入口）
- 名医列表页展示：头像(picture)、姓名(name)、医院(hospitalName)、科室(hospitalSub)、职称(hospitalTitle)、擅长领域(hospitalDomain)、评分(score)、治疗人数(treatNum)
- 点击进入名医详情页（需后续增加医生详情接口）
- 列表需支持下拉刷新 + 上拉加载更多

---

### 接口 2：根据商户获取医生列表 — `GET /api/front/doctor/page/mch/list`

**流程图位置**：`用户端 → 门店 → 当前门店信息 → 名医列表`

| 项目 | 说明 |
|------|------|
| 所属模块 | 门店 - 名医列表 |
| 现有页面 | **无**（需新建） |
| 建议页面路径 | `pages/clinic/doctor/index.vue`（复用名医列表页，通过 mchId 参数区分） |
| 入口页 | `pages/clinic/home/index.vue`（门店首页，需增加"名医列表"入口） |
| API 注册位置 | `api/clinic.js` 新增 `getDoctorByMchApi` |
| request.js 路径 | `doctor/page/mch/list` |
| 是否需要登录 | 否（`noAuth: true`） |
| 分页 | 是，page + limit + mchId |

**开发要点**：
- `pages/clinic/home/index.vue` 的快捷操作区需增加"名医列表"入口卡片（参考现有"预约服务"等入口样式）
- 或在门店首页增加独立的"名医专家"板块（类似"精选商品"板块）
- 名医列表页可与接口1共用，通过路由参数 `mchId` 判断是否按商户筛选
- 点击名医卡片 → 名医详情页 → 子功能：名医预约、问诊

---

### 接口 3：我的医生列表 — `GET /api/front/doctor/page/user/list`

**流程图位置**：`用户端 → 我的 → 我的医生`

| 项目 | 说明 |
|------|------|
| 所属模块 | 我的 - 我的医生 |
| 现有页面 | **无**（需新建） |
| 建议页面路径 | `pages/clinic/my_doctor/index.vue`（我的医生列表） |
| 入口页 | `pages/user/index.vue`（个人中心"我的服务"菜单） |
| API 注册位置 | `api/clinic.js` 新增 `getMyDoctorListApi` |
| request.js 路径 | `doctor/page/user/list` |
| 是否需要登录 | **是**（需携带 token） |
| 分页 | 是，page + limit |

**开发要点**：
- `pages/user/index.vue` 的 `centerMenu`（我的服务区域）由后端接口 `userCenterInfoMenu` 动态配置，需后端也配合新增"我的医生"菜单项；或在前端硬编码入口
- 列表展示用户关联过的医生信息
- 点击进入医生详情，可再次预约或问诊

---

### 接口 4：获取理疗师列表 — `GET /api/front/therapist/page/list`

**流程图位置**：`用户端 → 理疗 → 理疗师列表`

| 项目 | 说明 |
|------|------|
| 所属模块 | 理疗（Tab页） |
| 现有页面 | `pages/physio/index.vue`（**当前为空占位页**，只显示"暂无理疗记录"） |
| 建议改造 | 直接改造 `pages/physio/index.vue`，接入理疗师列表 |
| API 注册位置 | `api/clinic.js` 新增 `getTherapistPageListApi` |
| request.js 路径 | `therapist/page/list` |
| 是否需要登录 | 否（`noAuth: true`） |
| 分页 | 是，page + limit |

**开发要点**：
- **注意**：已有旧接口 `getTherapistListApi` 使用路径 `clinic/therapist/list`，新接口路径为 `therapist/page/list`，两者**不同**
- `pages/physio/index.vue` 当前为空页面，需要完整改造：
  - 展示全平台理疗师列表（不限门店）
  - 理疗师卡片：头像(picture)、姓名(name)、擅长领域(hospitalDomain)、评分(score)、治疗人数(treatNum)
  - 支持下拉刷新 + 上拉加载更多
- 点击进入理疗师详情页（可复用 `pages/clinic/therapist/detail`）
- 可增加预约按钮

---

### 接口 5：根据商户获取理疗师列表 — `GET /api/front/therapist/page/mch/list`

**流程图位置**：`用户端 → 门店 → 当前门店信息 → 理疗师列表`

| 项目 | 说明 |
|------|------|
| 所属模块 | 门店 - 理疗师列表 |
| 现有页面 | `pages/clinic/therapist/index.vue`（已有，但使用旧接口 `clinic/therapist/list`） |
| 建议改造 | 更新/新增接口调用，或根据场景切换新旧接口 |
| 入口页 | `pages/clinic/home/index.vue`（门店首页"预约服务"按钮已跳转至此） |
| API 注册位置 | `api/clinic.js` 新增 `getTherapistByMchApi` |
| request.js 路径 | `therapist/page/mch/list` |
| 是否需要登录 | 否（`noAuth: true`） |
| 分页 | 是，page + limit + mchId |

**开发要点**：
- `pages/clinic/therapist/index.vue` 已有左侧分类 + 右侧列表布局
- 需评估是否用新接口 `therapist/page/mch/list` 替换旧接口 `clinic/therapist/list`
- 新接口返回 Therapist 对象字段与旧接口可能不同，注意字段映射
- 新接口 Therapist 对象字段：name, picture, phone, hospitalDomain, score, treatNum, selfInfo, sex, mchId 等

---

### 接口 6：我的理疗师列表 — `GET /api/front/therapist/page/user/list`

**流程图位置**：`用户端 → 我的 → 我的理疗师`

| 项目 | 说明 |
|------|------|
| 所属模块 | 我的 - 我的理疗师 |
| 现有页面 | **无**（需新建） |
| 建议页面路径 | `pages/clinic/my_therapist/index.vue`（我的理疗师列表） |
| 入口页 | `pages/user/index.vue`（个人中心"我的服务"菜单） |
| API 注册位置 | `api/clinic.js` 新增 `getMyTherapistListApi` |
| request.js 路径 | `therapist/page/user/list` |
| 是否需要登录 | **是**（需携带 token） |
| 分页 | 是，page + limit |

**开发要点**：
- 同接口3，入口在 `pages/user/index.vue` 的"我的服务"区域
- 列表展示用户关联过的理疗师信息
- 点击进入理疗师详情，可再次预约

---

## 三、需要新建/改造的文件清单

### 3.1 API 层（`api/clinic.js` 新增函数）

```javascript
// ===== 医生相关 =====

/** 获取医生列表（全平台） */
export function getDoctorListApi(data) {
  return request.get('doctor/page/list', data, { noAuth: true });
}

/** 根据商户获取医生列表 */
export function getDoctorByMchApi(data) {
  return request.get('doctor/page/mch/list', data, { noAuth: true });
}

/** 我的医生列表 */
export function getMyDoctorListApi(data) {
  return request.get('doctor/page/user/list', data);
}

// ===== 理疗师相关（新接口） =====

/** 获取理疗师列表（全平台，新接口） */
export function getTherapistPageListApi(data) {
  return request.get('therapist/page/list', data, { noAuth: true });
}

/** 根据商户获取理疗师列表（新接口） */
export function getTherapistByMchApi(data) {
  return request.get('therapist/page/mch/list', data, { noAuth: true });
}

/** 我的理疗师列表 */
export function getMyTherapistListApi(data) {
  return request.get('therapist/page/user/list', data);
}
```

### 3.2 需要新建的页面

| 页面 | 路径 | 用途 | 路由参数 |
|------|------|------|---------|
| 名医列表页 | `pages/clinic/doctor/index.vue` | 展示医生列表，支持全平台和按门店筛选 | `mchId?`（可选，有值则按门店筛选） |
| 我的医生页 | `pages/clinic/my_doctor/index.vue` | 展示当前用户关联的医生 | 无 |
| 我的理疗师页 | `pages/clinic/my_therapist/index.vue` | 展示当前用户关联的理疗师 | 无 |

### 3.3 需要改造的页面

| 页面 | 路径 | 改造内容 |
|------|------|---------|
| 理疗Tab页 | `pages/physio/index.vue` | 从空占位改为理疗师列表（接入接口4） |
| 门店首页 | `pages/clinic/home/index.vue` | 快捷操作区增加"名医列表"入口 / 增加名医板块 |
| 门店理疗师页 | `pages/clinic/therapist/index.vue` | 评估是否切换到新接口5 |
| 个人中心 | `pages/user/index.vue` | "我的服务"增加"我的医生""我的理疗师"入口 |

### 3.4 需要更新的路由（`pages.json`）

在 `subPackages` 中 `pages/clinic` 根下新增页面路由：

```json
{
  "path": "doctor/index",
  "style": {
    "navigationBarTitleText": "名医专家"
  }
},
{
  "path": "my_doctor/index",
  "style": {
    "navigationBarTitleText": "我的医生"
  }
},
{
  "path": "my_therapist/index",
  "style": {
    "navigationBarTitleText": "我的理疗师"
  }
}
```

---

## 四、数据模型参考

### Doctor 对象关键字段

| 字段 | 说明 | 类型 | 展示建议 |
|------|------|------|---------|
| id | 主键 | integer | - |
| name | 医生姓名 | string | 卡片标题 |
| picture | 头像 | string | 头像图 |
| hospitalName | 医院名称 | string | 副标题 |
| hospitalSub | 科室 | string | 标签 |
| hospitalTitle | 职称（主治医生/副主任等） | string | 标签 |
| hospitalCareer | 职业（执业医生/助理医生） | string | 标签 |
| hospitalDomain | 擅长领域 | string | 简介 |
| hospitalLevel | 医院级别（三甲/一甲等） | string | 标签 |
| score | 评分 | number | 星级 |
| treatNum | 治疗人数 | integer | 数据展示 |
| selfInfo | 个人简介 | string | 详情页 |
| onlineStatus | 在线状态 1接诊中 2离线 | integer | 状态标记 |
| sex | 性别 | integer | - |
| mchId | 门店ID | integer | 关联门店 |
| responseTime | 响应时间 | integer | 数据展示 |

### Therapist 对象关键字段

| 字段 | 说明 | 类型 | 展示建议 |
|------|------|------|---------|
| id | 主键 | integer | - |
| name | 理疗师姓名 | string | 卡片标题 |
| picture | 头像 | string | 头像图 |
| hospitalDomain | 擅长领域 | string | 简介 |
| hospitalDomainImageUrl | 擅长领域图片 | string | 展示图 |
| score | 评分 | number | 星级 |
| treatNum | 治疗人数 | integer | 数据展示 |
| selfInfo | 个人简介 | string | 详情页 |
| sex | 性别 | integer | - |
| mchId | 门店ID | integer | 关联门店 |
| responseTime | 响应时间 | integer | 数据展示 |
| province/city/district | 省市区 | string | 位置信息 |
| addressDetail | 详细地址 | string | 位置信息 |
| latitude/longitude | 经纬度 | string | 地图导航 |

---

## 五、流程图文字版（用户端完整结构）

```
用户端
├── 首页
│   ├── 搜索
│   ├── banner 列表
│   ├── 特色门诊快捷操作
│   ├── 名医专家                          ← 【新增入口】
│   │   ├── 名医列表                      ← 接口1: GET /api/front/doctor/page/list
│   │   ├── 名医详情展示                   ← 待增加医生详情接口
│   │   └── 立即问诊
│   ├── 理疗专区
│   └── 平台商城
│       ├── 商品分类
│       ├── 商品列表
│       └── 商品购买
│
├── 理疗（Tab页）
│   ├── 理疗师列表                         ← 接口4: GET /api/front/therapist/page/list
│   │   （改造 pages/physio/index.vue）
│   ├── 理疗师详情数据
│   └── 理疗师预约
│
├── 舌诊
│   ├── 舌诊历史记录
│   ├── 分享
│   ├── 舌诊拍照
│   └── 数据分析
│
├── 门店（Tab页）
│   ├── 当前门店信息
│   │   ├── 诊所商城
│   │   ├── 预约服务
│   │   ├── 我的预约
│   │   ├── 我的钱包
│   │   ├── 理疗师列表                     ← 接口5: GET /api/front/therapist/page/mch/list
│   │   │   ├── 理疗师详情
│   │   │   └── 理疗师预约
│   │   ├── 名医列表                       ← 【新增】接口2: GET /api/front/doctor/page/mch/list
│   │   │   ├── 名医详情
│   │   │   ├── 名医预约
│   │   │   └── 问诊
│   │   └── 商品展示
│   ├── 门店切换
│   └── 全部门店列表
│
└── 我的
    ├── 注册、登录、密码修改等
    ├── 商城订单、售后
    ├── 门店入驻
    ├── 我的团队
    ├── 我的评价
    ├── 我的医生                            ← 【新增】接口3: GET /api/front/doctor/page/user/list
    ├── 我的理疗师                          ← 【新增】接口6: GET /api/front/therapist/page/user/list
    ├── 地址管理
    ├── 申诉
    └── 客服
```

---

## 六、开发优先级建议

| 优先级 | 任务 | 涉及接口 | 工作量 |
|--------|------|---------|--------|
| P0 | API 层注册 6 个新接口函数（`api/clinic.js`） | 全部 | 小 |
| P1 | 改造理疗Tab页（`pages/physio/index.vue`） | 接口4 | 中 |
| P2 | 新建名医列表页 + 门店首页增加入口 | 接口1、2 | 中 |
| P3 | 门店理疗师页评估切换新接口 | 接口5 | 小 |
| P4 | 新建"我的医生"页 + 个人中心入口 | 接口3 | 中 |
| P5 | 新建"我的理疗师"页 + 个人中心入口 | 接口6 | 中 |
| P6 | pages.json 路由注册 | - | 小 |

---

## 七、注意事项

1. **新旧接口区分**：理疗师已有旧接口 `clinic/therapist/list`（`api/clinic.js` 中的 `getTherapistListApi`），新增的 `therapist/page/list` 和 `therapist/page/mch/list` 是独立的新接口，返回数据结构可能不同，需要确认后端是否逐步替换
2. **Token 要求**：接口3（我的医生）和接口6（我的理疗师）需要用户登录后才能调用，其他接口不需要登录
3. **request.js 路径**：项目使用 `utils/request.js` 统一拼接 `/api/front/` 前缀，所以 API 函数中的路径只需写 `doctor/page/list` 而不是完整路径
4. **个人中心菜单**：`pages/user/index.vue` 的"我的服务"菜单（`centerMenu`）由后端接口动态配置，新增"我的医生""我的理疗师"可能需要后端配合；也可前端硬编码入口
5. **首页入口**：首页 `pages/index/index.vue` 使用 DIY 组件动态渲染，"名医专家"入口可能需要通过后台 DIY 配置添加，或在前端硬编码一个固定入口区域
