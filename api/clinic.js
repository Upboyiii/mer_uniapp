import request from "@/utils/request.js";

/**
 * 获取诊所/门店详情信息
 */
export function getClinicDetailApi(id) {
  return request.get(`merchant/index/info/${id}`, {}, {noAuth:true});
}

/**
 * 获取诊所商品分类
 */
export function getClinicProductCategoryApi(id) {
  return request.get(`merchant/product/category/cache/tree/${id}`, {}, {noAuth:true});
}

/**
 * 获取诊所商品列表
 */
export function getClinicProductListApi(data) {
  return request.get(`product/merchant/pro/list`, data, {noAuth:true});
}

/**
 * 旧路径，项目内未再调用；理疗类目请用 getPhysiotherapyCategoryListApi({ mchId, page, limit })
 */
export function getTherapistCategoryApi(merId) {
  return request.get(`clinic/therapist/category/${merId}`, {}, {noAuth:true});
}

/**
 * 获取理疗师列表（旧接口，已停用；统一走 therapist/page/mch/list + mchId）
 */
// export function getTherapistListApi(data) {
//   return request.get(`clinic/therapist/list`, data, {noAuth:true});
// }

/**
 * 我的预约列表（旧路径 clinic/appointment/list，预约商品体系）
 * 「我的预约」页已改用 getPhysiotherapyAppointmentListApi（interface.md 用户理疗预约）
 */
export function getMyAppointmentListApi(data) {
  return request.get(`clinic/appointment/list`, data);
}

/**
 * 获取诊所列表（所有门店）
 */
export function getClinicListApi(data) {
  return request.get(`merchant/street`, data, {noAuth:true});
}

/**
 * 获取我的诊所列表
 */
export function getMyClinicListApi(data) {
  return request.get(`clinic/my/list`, data);
}

/**
 * 切换当前诊所
 */
export function switchClinicApi(id) {
  return request.post(`clinic/switch/${id}`);
}

/**
 * 获取诊所精选商品
 */
export function getClinicFeaturedProductApi(merId, data) {
  return request.get(`product/merchant/pro/list`, { merId, ...data }, {noAuth:true});
}

// ========== interface.md：医生侧「医院/科室/疾病」数据字典 ==========

/** GET /api/front/doctor/Hospital/sub/alllist — 医院科室列表（字典） */
export function getHospitalSubAllListApi() {
  return request.get('doctor/Hospital/sub/alllist', {}, { noAuth: true });
}

/** GET /api/front/doctor/Hospital/ill/alllist — 疾病列表（字典） */
export function getIllAllListApi() {
  return request.get('doctor/Hospital/ill/alllist', {}, { noAuth: true });
}

/**
 * GET /api/front/doctor/Hospital/list/{keyword} — 医院检索（path: keyword）
 */
export function getHospitalListByKeywordApi(keyword) {
  const k = keyword != null && keyword !== undefined ? String(keyword) : '';
  return request.get(`doctor/Hospital/list/${encodeURIComponent(k)}`, {}, { noAuth: true });
}

/**
 * 获取医生列表（全平台）
 * GET /api/front/doctor/page/list
 * 常用参数：page、limit；筛选时可传 hospitalSub（科室）、specialization（擅长疾病，与 Doctor 对象字段一致，以后端为准）
 */
export function getDoctorListApi(data) {
  return request.get('doctor/page/list', data, { noAuth: true });
}

/**
 * 根据商户获取医生列表
 */
export function getDoctorByMchApi(data) {
  return request.get('doctor/page/mch/list', data, { noAuth: true });
}

/**
 * 我的医生列表
 */
export function getMyDoctorListApi(data) {
  return request.get('doctor/page/user/list', data);
}

/**
 * 理疗师分页（全平台可浏览）
 * 完整路径：GET /api/front/therapist/page/list
 * 与「用户理疗预约列表」无关：那是 therapist/physiotherapy-appointment/list（预约单，需登录）
 */
export function getTherapistPageListApi(data) {
  return request.get('therapist/page/list', data, { noAuth: true });
}

/**
 * 根据商户获取理疗师列表（新接口）
 * 用于「选理疗师去下单」；本店预约记录列表请用 getPhysiotherapyAppointmentListApi + mchId
 */
export function getTherapistByMchApi(data) {
  return request.get('therapist/page/mch/list', data, { noAuth: true });
}

/**
 * 我的理疗师列表
 */
export function getMyTherapistListApi(data) {
  return request.get('therapist/page/user/list', data);
}

/**
 * GET /api/front/therapist/physiotherapy-category/list
 * query: page, limit, mchId(门店)；返回 CommonPage，list 为 PhysiotherapyCategory（封面 coverImage、是否上门 homeService、上门价 homePrice 等）
 */
export function getPhysiotherapyCategoryListApi(data) {
  return request.get('therapist/physiotherapy-category/list', data, { noAuth: true });
}

/**
 * GET /api/front/therapist/tcm-category/list（interface.md：中医类目分页列表）
 * query：page、limit、mchId（商户/门店）
 */
export function getTcmCategoryListApi(data) {
  return request.get('therapist/tcm-category/list', data, { noAuth: true });
}

// ========== interface.md：理疗预约 / 问诊 / 取消预约（与 /api/front 文档对应） ==========
// 注意：以下为「理疗预约单」资源；therapist/page/list 是「理疗师人员」列表，路径与语义均不同。

/** GET /api/front/therapist/physiotherapy-appointment/list — 当前用户的理疗预约分页（需登录；query: page,limit,mchId,status） */
export function getPhysiotherapyAppointmentListApi(data) {
  return request.get('therapist/physiotherapy-appointment/list', data);
}

/** GET /api/front/therapist/physiotherapy-appointment/info 理疗预约详情 */
export function getPhysiotherapyAppointmentInfoApi(id) {
  return request.get('therapist/physiotherapy-appointment/info', { id });
}

/** POST /api/front/therapist/physiotherapy-appointment/pay 理疗预约支付 */
export function physiotherapyAppointmentPayApi(data) {
  return request.post('therapist/physiotherapy-appointment/pay', data);
}

/** POST /api/front/therapist/physiotherapy-appointment/save 新增理疗预约 */
export function physiotherapyAppointmentSaveApi(data) {
  return request.post('therapist/physiotherapy-appointment/save', data);
}

/**
 * POST（application/json）/api/front/therapist/physiotherapy-appointment/cancel
 * @param {{ appointmentId: number, cancelReason: string }} data
 */
export function physiotherapyAppointmentCancelApi(data) {
  return request.post('therapist/physiotherapy-appointment/cancel', data);
}

/**
 * GET /api/front/doctor/tcm-appointment/list（interface.md）
 * query：page、limit、mchId、status（0待确认 1已确认 2已完成 3已取消）；「全部」不传 status
 */
export function getTcmAppointmentListApi(data) {
  return request.get('doctor/tcm-appointment/list', data);
}

/** GET /api/front/doctor/tcm-appointment/info — 中医预约详情 */
export function getTcmAppointmentInfoApi(id) {
  return request.get('doctor/tcm-appointment/info', { id });
}

/** POST /api/front/doctor/tcm-appointment/pay */
export function tcmAppointmentPayApi(data) {
  return request.post('doctor/tcm-appointment/pay', data);
}

/**
 * POST /api/front/doctor/tcm-appointment/cancel
 * @param {{ appointmentId: number, cancelReason: string }} data
 */
export function tcmAppointmentCancelApi(data) {
  return request.post('doctor/tcm-appointment/cancel', data);
}

/** POST /api/front/doctor/tcm-appointment/save 新增中医预约 */
export function tcmAppointmentSaveApi(data) {
  return request.post('doctor/tcm-appointment/save', data);
}

/** GET /api/front/doctor/consultation/info 问诊详情 */
export function getDoctorConsultationInfoApi(id) {
  return request.get('doctor/consultation/info', { id });
}

/** GET /api/front/doctor/consultation/list 问诊分页列表 */
export function getDoctorConsultationListApi(data) {
  return request.get('doctor/consultation/list', data);
}

/** POST /api/front/doctor/consultation/pay 问诊支付 */
export function doctorConsultationPayApi(data) {
  return request.post('doctor/consultation/pay', data);
}

/** POST /api/front/doctor/consultation/save 新增问诊 */
export function doctorConsultationSaveApi(data) {
  return request.post('doctor/consultation/save', data);
}

/** GET /api/front/doctor/patient-identity/list 就诊人（患者身份）分页 */
export function getPatientIdentityListApi(data) {
  return request.get('doctor/patient-identity/list', data);
}

/** POST /api/front/doctor/patient-identity/save 新增就诊人 */
export function patientIdentitySaveApi(data) {
  return request.post('doctor/patient-identity/save', data);
}

/** GET /api/front/doctor/patient-identity/info 就诊人详情 */
export function getPatientIdentityInfoApi(id) {
  return request.get('doctor/patient-identity/info', { id });
}

/** GET /api/front/doctor/patient-identity/delete 删除就诊人 */
export function patientIdentityDeleteApi(id) {
  return request.get('doctor/patient-identity/delete', { id });
}

/** POST /api/front/doctor/patient-identity/update 修改就诊人（id 为 query） */
export function patientIdentityUpdateApi(id, data) {
  const q = encodeURIComponent(id);
  return request.post(`doctor/patient-identity/update?id=${q}`, data);
}

/** POST /api/front/order/cancel/reservation/{orderNo} 取消预约服务订单 */
export function cancelReservationOrderApi(orderNo) {
  return request.post(`order/cancel/reservation/${orderNo}`, {});
}
