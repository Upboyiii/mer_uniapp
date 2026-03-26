

## 获取医生列表信息


**接口地址**:`/api/front/doctor/page/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|limit|每页数量|query|false|integer(int32)||
|page|页码|query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«CommonPage«Doctor对象»»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||CommonPage«Doctor对象»|CommonPage«Doctor对象»|
|&emsp;&emsp;limit||integer||
|&emsp;&emsp;list||array|Doctor对象|
|&emsp;&emsp;&emsp;&emsp;auditNotes|认证备注|string||
|&emsp;&emsp;&emsp;&emsp;auditStatus|认证状态，-1新建，0未审核，1审核通过，2审核失败|integer||
|&emsp;&emsp;&emsp;&emsp;createTime|注册时间|string||
|&emsp;&emsp;&emsp;&emsp;email|邮箱|string||
|&emsp;&emsp;&emsp;&emsp;filingNotes|备案备注|string||
|&emsp;&emsp;&emsp;&emsp;filingStatus|备案状态，-1新建，0未审核，1审核通过，2审核失败|integer||
|&emsp;&emsp;&emsp;&emsp;graduateSchoolImageUrl|院校毕业证图片|string||
|&emsp;&emsp;&emsp;&emsp;hospitalCareer|医院职业，执业医生，助理医生|string||
|&emsp;&emsp;&emsp;&emsp;hospitalDomain|擅长领域介绍|string||
|&emsp;&emsp;&emsp;&emsp;hospitalLevel|级别 比如三甲 一甲|string||
|&emsp;&emsp;&emsp;&emsp;hospitalName|医院名称|string||
|&emsp;&emsp;&emsp;&emsp;hospitalSub|医院科室，如中医科|string||
|&emsp;&emsp;&emsp;&emsp;hospitalTitle|医院抬头，如主治医生，副主任|string||
|&emsp;&emsp;&emsp;&emsp;hospitalTitleImageUrl|职称证图片|string||
|&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;idcardNum|身份证号码|string||
|&emsp;&emsp;&emsp;&emsp;idcardObverseImageUrl|身份证正面|string||
|&emsp;&emsp;&emsp;&emsp;idcardReverseImageUrl|身份证反面|string||
|&emsp;&emsp;&emsp;&emsp;isLogoff|是否注销|boolean||
|&emsp;&emsp;&emsp;&emsp;lastIp|最后登录IP|string||
|&emsp;&emsp;&emsp;&emsp;lastLoginTime|最后登录时间|string||
|&emsp;&emsp;&emsp;&emsp;licenseImageUrl|医生执业证图片|string||
|&emsp;&emsp;&emsp;&emsp;licenseLocalionImageUrl|医生执业证执业地点页|string||
|&emsp;&emsp;&emsp;&emsp;logoffTime|注销时间|string||
|&emsp;&emsp;&emsp;&emsp;mchId|门店ID|integer||
|&emsp;&emsp;&emsp;&emsp;name|医生姓名|string||
|&emsp;&emsp;&emsp;&emsp;onlineStatus|在线状态 1接诊中 2离线|integer||
|&emsp;&emsp;&emsp;&emsp;password|密码（建议存储加密后的值）|string||
|&emsp;&emsp;&emsp;&emsp;phone|手机号码|string||
|&emsp;&emsp;&emsp;&emsp;picture|头像|string||
|&emsp;&emsp;&emsp;&emsp;qualificationImageUrl|医生资格证图片|string||
|&emsp;&emsp;&emsp;&emsp;responseTime|响应时间|integer||
|&emsp;&emsp;&emsp;&emsp;score|评分|number||
|&emsp;&emsp;&emsp;&emsp;selfInfo|个人简介|string||
|&emsp;&emsp;&emsp;&emsp;sex|性别 0未知 1男 2女 3保密|integer||
|&emsp;&emsp;&emsp;&emsp;signatureImageUrl|签名图片|string||
|&emsp;&emsp;&emsp;&emsp;status|状态，0不可用；1启用|integer||
|&emsp;&emsp;&emsp;&emsp;treatNum|治疗人数|integer||
|&emsp;&emsp;&emsp;&emsp;type|类型，1医院医生 2爱尔康医生|integer||
|&emsp;&emsp;&emsp;&emsp;updateTime|修改时间|string||
|&emsp;&emsp;page||integer||
|&emsp;&emsp;total||integer||
|&emsp;&emsp;totalPage||integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"limit": 0,
		"list": [
			{
				"auditNotes": "",
				"auditStatus": 0,
				"createTime": "",
				"email": "",
				"filingNotes": "",
				"filingStatus": 0,
				"graduateSchoolImageUrl": "",
				"hospitalCareer": "",
				"hospitalDomain": "",
				"hospitalLevel": "",
				"hospitalName": "",
				"hospitalSub": "",
				"hospitalTitle": "",
				"hospitalTitleImageUrl": "",
				"id": 0,
				"idcardNum": "",
				"idcardObverseImageUrl": "",
				"idcardReverseImageUrl": "",
				"isLogoff": true,
				"lastIp": "",
				"lastLoginTime": "",
				"licenseImageUrl": "",
				"licenseLocalionImageUrl": "",
				"logoffTime": "",
				"mchId": 0,
				"name": "",
				"onlineStatus": 0,
				"password": "",
				"phone": "",
				"picture": "",
				"qualificationImageUrl": "",
				"responseTime": 0,
				"score": 0,
				"selfInfo": "",
				"sex": 0,
				"signatureImageUrl": "",
				"status": 0,
				"treatNum": 0,
				"type": 0,
				"updateTime": ""
			}
		],
		"page": 0,
		"total": 0,
		"totalPage": 0
	},
	"message": ""
}
```



## 根据商户获取医生列表信息


**接口地址**:`/api/front/doctor/page/mch/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|limit|每页数量|query|false|integer(int32)||
|mchId|门店ID|query|false|integer(int32)||
|page|页码|query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«CommonPage«Doctor对象»»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||CommonPage«Doctor对象»|CommonPage«Doctor对象»|
|&emsp;&emsp;limit||integer||
|&emsp;&emsp;list||array|Doctor对象|
|&emsp;&emsp;&emsp;&emsp;auditNotes|认证备注|string||
|&emsp;&emsp;&emsp;&emsp;auditStatus|认证状态，-1新建，0未审核，1审核通过，2审核失败|integer||
|&emsp;&emsp;&emsp;&emsp;createTime|注册时间|string||
|&emsp;&emsp;&emsp;&emsp;email|邮箱|string||
|&emsp;&emsp;&emsp;&emsp;filingNotes|备案备注|string||
|&emsp;&emsp;&emsp;&emsp;filingStatus|备案状态，-1新建，0未审核，1审核通过，2审核失败|integer||
|&emsp;&emsp;&emsp;&emsp;graduateSchoolImageUrl|院校毕业证图片|string||
|&emsp;&emsp;&emsp;&emsp;hospitalCareer|医院职业，执业医生，助理医生|string||
|&emsp;&emsp;&emsp;&emsp;hospitalDomain|擅长领域介绍|string||
|&emsp;&emsp;&emsp;&emsp;hospitalLevel|级别 比如三甲 一甲|string||
|&emsp;&emsp;&emsp;&emsp;hospitalName|医院名称|string||
|&emsp;&emsp;&emsp;&emsp;hospitalSub|医院科室，如中医科|string||
|&emsp;&emsp;&emsp;&emsp;hospitalTitle|医院抬头，如主治医生，副主任|string||
|&emsp;&emsp;&emsp;&emsp;hospitalTitleImageUrl|职称证图片|string||
|&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;idcardNum|身份证号码|string||
|&emsp;&emsp;&emsp;&emsp;idcardObverseImageUrl|身份证正面|string||
|&emsp;&emsp;&emsp;&emsp;idcardReverseImageUrl|身份证反面|string||
|&emsp;&emsp;&emsp;&emsp;isLogoff|是否注销|boolean||
|&emsp;&emsp;&emsp;&emsp;lastIp|最后登录IP|string||
|&emsp;&emsp;&emsp;&emsp;lastLoginTime|最后登录时间|string||
|&emsp;&emsp;&emsp;&emsp;licenseImageUrl|医生执业证图片|string||
|&emsp;&emsp;&emsp;&emsp;licenseLocalionImageUrl|医生执业证执业地点页|string||
|&emsp;&emsp;&emsp;&emsp;logoffTime|注销时间|string||
|&emsp;&emsp;&emsp;&emsp;mchId|门店ID|integer||
|&emsp;&emsp;&emsp;&emsp;name|医生姓名|string||
|&emsp;&emsp;&emsp;&emsp;onlineStatus|在线状态 1接诊中 2离线|integer||
|&emsp;&emsp;&emsp;&emsp;password|密码（建议存储加密后的值）|string||
|&emsp;&emsp;&emsp;&emsp;phone|手机号码|string||
|&emsp;&emsp;&emsp;&emsp;picture|头像|string||
|&emsp;&emsp;&emsp;&emsp;qualificationImageUrl|医生资格证图片|string||
|&emsp;&emsp;&emsp;&emsp;responseTime|响应时间|integer||
|&emsp;&emsp;&emsp;&emsp;score|评分|number||
|&emsp;&emsp;&emsp;&emsp;selfInfo|个人简介|string||
|&emsp;&emsp;&emsp;&emsp;sex|性别 0未知 1男 2女 3保密|integer||
|&emsp;&emsp;&emsp;&emsp;signatureImageUrl|签名图片|string||
|&emsp;&emsp;&emsp;&emsp;status|状态，0不可用；1启用|integer||
|&emsp;&emsp;&emsp;&emsp;treatNum|治疗人数|integer||
|&emsp;&emsp;&emsp;&emsp;type|类型，1医院医生 2爱尔康医生|integer||
|&emsp;&emsp;&emsp;&emsp;updateTime|修改时间|string||
|&emsp;&emsp;page||integer||
|&emsp;&emsp;total||integer||
|&emsp;&emsp;totalPage||integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"limit": 0,
		"list": [
			{
				"auditNotes": "",
				"auditStatus": 0,
				"createTime": "",
				"email": "",
				"filingNotes": "",
				"filingStatus": 0,
				"graduateSchoolImageUrl": "",
				"hospitalCareer": "",
				"hospitalDomain": "",
				"hospitalLevel": "",
				"hospitalName": "",
				"hospitalSub": "",
				"hospitalTitle": "",
				"hospitalTitleImageUrl": "",
				"id": 0,
				"idcardNum": "",
				"idcardObverseImageUrl": "",
				"idcardReverseImageUrl": "",
				"isLogoff": true,
				"lastIp": "",
				"lastLoginTime": "",
				"licenseImageUrl": "",
				"licenseLocalionImageUrl": "",
				"logoffTime": "",
				"mchId": 0,
				"name": "",
				"onlineStatus": 0,
				"password": "",
				"phone": "",
				"picture": "",
				"qualificationImageUrl": "",
				"responseTime": 0,
				"score": 0,
				"selfInfo": "",
				"sex": 0,
				"signatureImageUrl": "",
				"status": 0,
				"treatNum": 0,
				"type": 0,
				"updateTime": ""
			}
		],
		"page": 0,
		"total": 0,
		"totalPage": 0
	},
	"message": ""
}
```




## 我的医生列表信息


**接口地址**:`/api/front/doctor/page/user/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|limit|每页数量|query|false|integer(int32)||
|page|页码|query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«CommonPage«Doctor对象»»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||CommonPage«Doctor对象»|CommonPage«Doctor对象»|
|&emsp;&emsp;limit||integer||
|&emsp;&emsp;list||array|Doctor对象|
|&emsp;&emsp;&emsp;&emsp;auditNotes|认证备注|string||
|&emsp;&emsp;&emsp;&emsp;auditStatus|认证状态，-1新建，0未审核，1审核通过，2审核失败|integer||
|&emsp;&emsp;&emsp;&emsp;createTime|注册时间|string||
|&emsp;&emsp;&emsp;&emsp;email|邮箱|string||
|&emsp;&emsp;&emsp;&emsp;filingNotes|备案备注|string||
|&emsp;&emsp;&emsp;&emsp;filingStatus|备案状态，-1新建，0未审核，1审核通过，2审核失败|integer||
|&emsp;&emsp;&emsp;&emsp;graduateSchoolImageUrl|院校毕业证图片|string||
|&emsp;&emsp;&emsp;&emsp;hospitalCareer|医院职业，执业医生，助理医生|string||
|&emsp;&emsp;&emsp;&emsp;hospitalDomain|擅长领域介绍|string||
|&emsp;&emsp;&emsp;&emsp;hospitalLevel|级别 比如三甲 一甲|string||
|&emsp;&emsp;&emsp;&emsp;hospitalName|医院名称|string||
|&emsp;&emsp;&emsp;&emsp;hospitalSub|医院科室，如中医科|string||
|&emsp;&emsp;&emsp;&emsp;hospitalTitle|医院抬头，如主治医生，副主任|string||
|&emsp;&emsp;&emsp;&emsp;hospitalTitleImageUrl|职称证图片|string||
|&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;idcardNum|身份证号码|string||
|&emsp;&emsp;&emsp;&emsp;idcardObverseImageUrl|身份证正面|string||
|&emsp;&emsp;&emsp;&emsp;idcardReverseImageUrl|身份证反面|string||
|&emsp;&emsp;&emsp;&emsp;isLogoff|是否注销|boolean||
|&emsp;&emsp;&emsp;&emsp;lastIp|最后登录IP|string||
|&emsp;&emsp;&emsp;&emsp;lastLoginTime|最后登录时间|string||
|&emsp;&emsp;&emsp;&emsp;licenseImageUrl|医生执业证图片|string||
|&emsp;&emsp;&emsp;&emsp;licenseLocalionImageUrl|医生执业证执业地点页|string||
|&emsp;&emsp;&emsp;&emsp;logoffTime|注销时间|string||
|&emsp;&emsp;&emsp;&emsp;mchId|门店ID|integer||
|&emsp;&emsp;&emsp;&emsp;name|医生姓名|string||
|&emsp;&emsp;&emsp;&emsp;onlineStatus|在线状态 1接诊中 2离线|integer||
|&emsp;&emsp;&emsp;&emsp;password|密码（建议存储加密后的值）|string||
|&emsp;&emsp;&emsp;&emsp;phone|手机号码|string||
|&emsp;&emsp;&emsp;&emsp;picture|头像|string||
|&emsp;&emsp;&emsp;&emsp;qualificationImageUrl|医生资格证图片|string||
|&emsp;&emsp;&emsp;&emsp;responseTime|响应时间|integer||
|&emsp;&emsp;&emsp;&emsp;score|评分|number||
|&emsp;&emsp;&emsp;&emsp;selfInfo|个人简介|string||
|&emsp;&emsp;&emsp;&emsp;sex|性别 0未知 1男 2女 3保密|integer||
|&emsp;&emsp;&emsp;&emsp;signatureImageUrl|签名图片|string||
|&emsp;&emsp;&emsp;&emsp;status|状态，0不可用；1启用|integer||
|&emsp;&emsp;&emsp;&emsp;treatNum|治疗人数|integer||
|&emsp;&emsp;&emsp;&emsp;type|类型，1医院医生 2爱尔康医生|integer||
|&emsp;&emsp;&emsp;&emsp;updateTime|修改时间|string||
|&emsp;&emsp;page||integer||
|&emsp;&emsp;total||integer||
|&emsp;&emsp;totalPage||integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"limit": 0,
		"list": [
			{
				"auditNotes": "",
				"auditStatus": 0,
				"createTime": "",
				"email": "",
				"filingNotes": "",
				"filingStatus": 0,
				"graduateSchoolImageUrl": "",
				"hospitalCareer": "",
				"hospitalDomain": "",
				"hospitalLevel": "",
				"hospitalName": "",
				"hospitalSub": "",
				"hospitalTitle": "",
				"hospitalTitleImageUrl": "",
				"id": 0,
				"idcardNum": "",
				"idcardObverseImageUrl": "",
				"idcardReverseImageUrl": "",
				"isLogoff": true,
				"lastIp": "",
				"lastLoginTime": "",
				"licenseImageUrl": "",
				"licenseLocalionImageUrl": "",
				"logoffTime": "",
				"mchId": 0,
				"name": "",
				"onlineStatus": 0,
				"password": "",
				"phone": "",
				"picture": "",
				"qualificationImageUrl": "",
				"responseTime": 0,
				"score": 0,
				"selfInfo": "",
				"sex": 0,
				"signatureImageUrl": "",
				"status": 0,
				"treatNum": 0,
				"type": 0,
				"updateTime": ""
			}
		],
		"page": 0,
		"total": 0,
		"totalPage": 0
	},
	"message": ""
}
```



## 获取理疗师列表信息


**接口地址**:`/api/front/therapist/page/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|limit|每页数量|query|false|integer(int32)||
|page|页码|query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«CommonPage«Therapist对象»»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||CommonPage«Therapist对象»|CommonPage«Therapist对象»|
|&emsp;&emsp;limit||integer||
|&emsp;&emsp;list||array|Therapist对象|
|&emsp;&emsp;&emsp;&emsp;addressDetail|详细地址|string||
|&emsp;&emsp;&emsp;&emsp;city|市|string||
|&emsp;&emsp;&emsp;&emsp;createTime|注册时间|string||
|&emsp;&emsp;&emsp;&emsp;district|区|string||
|&emsp;&emsp;&emsp;&emsp;hospitalDomain|擅长领域介绍|string||
|&emsp;&emsp;&emsp;&emsp;hospitalDomainImageUrl|擅长领域图片|string||
|&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;idcardNum|身份证号码|string||
|&emsp;&emsp;&emsp;&emsp;idcardObverseImageUrl|身份证正面|string||
|&emsp;&emsp;&emsp;&emsp;idcardReverseImageUrl|身份证反面|string||
|&emsp;&emsp;&emsp;&emsp;latitude|纬度|string||
|&emsp;&emsp;&emsp;&emsp;longitude|经度|string||
|&emsp;&emsp;&emsp;&emsp;mchId|门店ID|integer||
|&emsp;&emsp;&emsp;&emsp;name|理疗师姓名|string||
|&emsp;&emsp;&emsp;&emsp;password|密码|string||
|&emsp;&emsp;&emsp;&emsp;phone|手机号码|string||
|&emsp;&emsp;&emsp;&emsp;picture|头像|string||
|&emsp;&emsp;&emsp;&emsp;province|省|string||
|&emsp;&emsp;&emsp;&emsp;responseTime|响应时间|integer||
|&emsp;&emsp;&emsp;&emsp;score|评分|number||
|&emsp;&emsp;&emsp;&emsp;selfInfo|个人简介|string||
|&emsp;&emsp;&emsp;&emsp;sex|性别 0未知 1男 2女 3保密|integer||
|&emsp;&emsp;&emsp;&emsp;status|状态，0不可用；1启用|integer||
|&emsp;&emsp;&emsp;&emsp;treatNum|治疗人数|integer||
|&emsp;&emsp;&emsp;&emsp;updateTime|修改时间|string||
|&emsp;&emsp;page||integer||
|&emsp;&emsp;total||integer||
|&emsp;&emsp;totalPage||integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"limit": 0,
		"list": [
			{
				"addressDetail": "",
				"city": "",
				"createTime": "",
				"district": "",
				"hospitalDomain": "",
				"hospitalDomainImageUrl": "",
				"id": 0,
				"idcardNum": "",
				"idcardObverseImageUrl": "",
				"idcardReverseImageUrl": "",
				"latitude": "",
				"longitude": "",
				"mchId": 0,
				"name": "",
				"password": "",
				"phone": "",
				"picture": "",
				"province": "",
				"responseTime": 0,
				"score": 0,
				"selfInfo": "",
				"sex": 0,
				"status": 0,
				"treatNum": 0,
				"updateTime": ""
			}
		],
		"page": 0,
		"total": 0,
		"totalPage": 0
	},
	"message": ""
}
```



## 根据商户获取理疗师列表信息


**接口地址**:`/api/front/therapist/page/mch/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|limit|每页数量|query|false|integer(int32)||
|mchId|门店ID|query|false|integer(int32)||
|page|页码|query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«CommonPage«Therapist对象»»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||CommonPage«Therapist对象»|CommonPage«Therapist对象»|
|&emsp;&emsp;limit||integer||
|&emsp;&emsp;list||array|Therapist对象|
|&emsp;&emsp;&emsp;&emsp;addressDetail|详细地址|string||
|&emsp;&emsp;&emsp;&emsp;city|市|string||
|&emsp;&emsp;&emsp;&emsp;createTime|注册时间|string||
|&emsp;&emsp;&emsp;&emsp;district|区|string||
|&emsp;&emsp;&emsp;&emsp;hospitalDomain|擅长领域介绍|string||
|&emsp;&emsp;&emsp;&emsp;hospitalDomainImageUrl|擅长领域图片|string||
|&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;idcardNum|身份证号码|string||
|&emsp;&emsp;&emsp;&emsp;idcardObverseImageUrl|身份证正面|string||
|&emsp;&emsp;&emsp;&emsp;idcardReverseImageUrl|身份证反面|string||
|&emsp;&emsp;&emsp;&emsp;latitude|纬度|string||
|&emsp;&emsp;&emsp;&emsp;longitude|经度|string||
|&emsp;&emsp;&emsp;&emsp;mchId|门店ID|integer||
|&emsp;&emsp;&emsp;&emsp;name|理疗师姓名|string||
|&emsp;&emsp;&emsp;&emsp;password|密码|string||
|&emsp;&emsp;&emsp;&emsp;phone|手机号码|string||
|&emsp;&emsp;&emsp;&emsp;picture|头像|string||
|&emsp;&emsp;&emsp;&emsp;province|省|string||
|&emsp;&emsp;&emsp;&emsp;responseTime|响应时间|integer||
|&emsp;&emsp;&emsp;&emsp;score|评分|number||
|&emsp;&emsp;&emsp;&emsp;selfInfo|个人简介|string||
|&emsp;&emsp;&emsp;&emsp;sex|性别 0未知 1男 2女 3保密|integer||
|&emsp;&emsp;&emsp;&emsp;status|状态，0不可用；1启用|integer||
|&emsp;&emsp;&emsp;&emsp;treatNum|治疗人数|integer||
|&emsp;&emsp;&emsp;&emsp;updateTime|修改时间|string||
|&emsp;&emsp;page||integer||
|&emsp;&emsp;total||integer||
|&emsp;&emsp;totalPage||integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"limit": 0,
		"list": [
			{
				"addressDetail": "",
				"city": "",
				"createTime": "",
				"district": "",
				"hospitalDomain": "",
				"hospitalDomainImageUrl": "",
				"id": 0,
				"idcardNum": "",
				"idcardObverseImageUrl": "",
				"idcardReverseImageUrl": "",
				"latitude": "",
				"longitude": "",
				"mchId": 0,
				"name": "",
				"password": "",
				"phone": "",
				"picture": "",
				"province": "",
				"responseTime": 0,
				"score": 0,
				"selfInfo": "",
				"sex": 0,
				"status": 0,
				"treatNum": 0,
				"updateTime": ""
			}
		],
		"page": 0,
		"total": 0,
		"totalPage": 0
	},
	"message": ""
}
```




## 我的理疗师列表列表信息


**接口地址**:`/api/front/therapist/page/user/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|limit|每页数量|query|false|integer(int32)||
|page|页码|query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«CommonPage«Therapist对象»»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||CommonPage«Therapist对象»|CommonPage«Therapist对象»|
|&emsp;&emsp;limit||integer||
|&emsp;&emsp;list||array|Therapist对象|
|&emsp;&emsp;&emsp;&emsp;addressDetail|详细地址|string||
|&emsp;&emsp;&emsp;&emsp;city|市|string||
|&emsp;&emsp;&emsp;&emsp;createTime|注册时间|string||
|&emsp;&emsp;&emsp;&emsp;district|区|string||
|&emsp;&emsp;&emsp;&emsp;hospitalDomain|擅长领域介绍|string||
|&emsp;&emsp;&emsp;&emsp;hospitalDomainImageUrl|擅长领域图片|string||
|&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;idcardNum|身份证号码|string||
|&emsp;&emsp;&emsp;&emsp;idcardObverseImageUrl|身份证正面|string||
|&emsp;&emsp;&emsp;&emsp;idcardReverseImageUrl|身份证反面|string||
|&emsp;&emsp;&emsp;&emsp;latitude|纬度|string||
|&emsp;&emsp;&emsp;&emsp;longitude|经度|string||
|&emsp;&emsp;&emsp;&emsp;mchId|门店ID|integer||
|&emsp;&emsp;&emsp;&emsp;name|理疗师姓名|string||
|&emsp;&emsp;&emsp;&emsp;password|密码|string||
|&emsp;&emsp;&emsp;&emsp;phone|手机号码|string||
|&emsp;&emsp;&emsp;&emsp;picture|头像|string||
|&emsp;&emsp;&emsp;&emsp;province|省|string||
|&emsp;&emsp;&emsp;&emsp;responseTime|响应时间|integer||
|&emsp;&emsp;&emsp;&emsp;score|评分|number||
|&emsp;&emsp;&emsp;&emsp;selfInfo|个人简介|string||
|&emsp;&emsp;&emsp;&emsp;sex|性别 0未知 1男 2女 3保密|integer||
|&emsp;&emsp;&emsp;&emsp;status|状态，0不可用；1启用|integer||
|&emsp;&emsp;&emsp;&emsp;treatNum|治疗人数|integer||
|&emsp;&emsp;&emsp;&emsp;updateTime|修改时间|string||
|&emsp;&emsp;page||integer||
|&emsp;&emsp;total||integer||
|&emsp;&emsp;totalPage||integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"limit": 0,
		"list": [
			{
				"addressDetail": "",
				"city": "",
				"createTime": "",
				"district": "",
				"hospitalDomain": "",
				"hospitalDomainImageUrl": "",
				"id": 0,
				"idcardNum": "",
				"idcardObverseImageUrl": "",
				"idcardReverseImageUrl": "",
				"latitude": "",
				"longitude": "",
				"mchId": 0,
				"name": "",
				"password": "",
				"phone": "",
				"picture": "",
				"province": "",
				"responseTime": 0,
				"score": 0,
				"selfInfo": "",
				"sex": 0,
				"status": 0,
				"treatNum": 0,
				"updateTime": ""
			}
		],
		"page": 0,
		"total": 0,
		"totalPage": 0
	},
	"message": ""
}
```