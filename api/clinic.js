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
 * 获取理疗师服务分类
 */
export function getTherapistCategoryApi(merId) {
  return request.get(`clinic/therapist/category/${merId}`, {}, {noAuth:true});
}

/**
 * 获取理疗师列表
 */
export function getTherapistListApi(data) {
  return request.get(`clinic/therapist/list`, data, {noAuth:true});
}

/**
 * 获取我的预约列表
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
