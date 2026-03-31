

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


# 用户理疗预约

## 分页列表


**接口地址**:`/api/front/therapist/physiotherapy-appointment/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|limit|每页数量|query|false|integer(int32)||
|mchId|商户ID|query|false|integer(int32)||
|page|页码|query|false|integer(int32)||
|status|预约状态 0待服务  1已完成 2已取消|query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«CommonPage«PhysiotherapyAppointmentSearchResponse对象»»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||CommonPage«PhysiotherapyAppointmentSearchResponse对象»|CommonPage«PhysiotherapyAppointmentSearchResponse对象»|
|&emsp;&emsp;limit||integer||
|&emsp;&emsp;list||array|PhysiotherapyAppointmentSearchResponse对象|
|&emsp;&emsp;&emsp;&emsp;address|理疗地点|string||
|&emsp;&emsp;&emsp;&emsp;appointTime|预约时间|string||
|&emsp;&emsp;&emsp;&emsp;createTime|创建时间|string||
|&emsp;&emsp;&emsp;&emsp;fee|预约费用|number||
|&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;payOrderNo|支付单号|string||
|&emsp;&emsp;&emsp;&emsp;payStatus|支付状态 0未支付 1已支付 2已退款|integer||
|&emsp;&emsp;&emsp;&emsp;physiotherapyType|理疗项目/类型|string||
|&emsp;&emsp;&emsp;&emsp;remark|备注说明|string||
|&emsp;&emsp;&emsp;&emsp;status|预约状态 0待确认 1已确认 2已完成 3已取消|integer||
|&emsp;&emsp;&emsp;&emsp;therapistInfo|理疗师信息|Therapist对象|Therapist对象|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;addressDetail|详细地址|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;city|市|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;createTime|注册时间|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;district|区|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;hospitalDomain|擅长领域介绍|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;hospitalDomainImageUrl|擅长领域图片|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;idcardNum|身份证号码|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;idcardObverseImageUrl|身份证正面|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;idcardReverseImageUrl|身份证反面|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;latitude|纬度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;longitude|经度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;mchId|门店ID|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;name|理疗师姓名|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;password|密码|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phone|手机号码|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;picture|头像|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;province|省|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;responseTime|响应时间|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;score|评分|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;selfInfo|个人简介|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;sex|性别 0未知 1男 2女 3保密|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;specialization|擅长的领域（通经络，针灸等，逗号分开）|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;status|状态，0不可用；1启用|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;treatNum|治疗人数|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;updateTime|修改时间|string||
|&emsp;&emsp;&emsp;&emsp;updateTime|更新时间|string||
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
				"address": "",
				"appointTime": "",
				"createTime": "",
				"fee": 0,
				"id": 0,
				"payOrderNo": "",
				"payStatus": 0,
				"physiotherapyType": "",
				"remark": "",
				"status": 0,
				"therapistInfo": {
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
					"specialization": "",
					"status": 0,
					"treatNum": 0,
					"updateTime": ""
				},
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

## 详情


**接口地址**:`/api/front/therapist/physiotherapy-appointment/info`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|id|id|query|true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«PhysiotherapyAppointment对象»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||PhysiotherapyAppointment对象|PhysiotherapyAppointment对象|
|&emsp;&emsp;address|理疗地点|string||
|&emsp;&emsp;appointTime|预约时间|string||
|&emsp;&emsp;createTime|创建时间|string||
|&emsp;&emsp;fee|预约费用|number||
|&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;payOrderNo|支付单号|string||
|&emsp;&emsp;payStatus|支付状态 0未支付 1已支付 2已退款|integer||
|&emsp;&emsp;physiotherapyType|理疗项目/类型|string||
|&emsp;&emsp;remark|备注说明|string||
|&emsp;&emsp;status|预约状态 0待确认 1已确认 2已完成 3已取消|integer||
|&emsp;&emsp;therapistId|理疗师ID|integer||
|&emsp;&emsp;updateTime|更新时间|string||
|&emsp;&emsp;userId|用户ID|integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"address": "",
		"appointTime": "",
		"createTime": "",
		"fee": 0,
		"id": 0,
		"payOrderNo": "",
		"payStatus": 0,
		"physiotherapyType": "",
		"remark": "",
		"status": 0,
		"therapistId": 0,
		"updateTime": "",
		"userId": 0
	},
	"message": ""
}
```




## 问诊支付


**接口地址**:`/api/front/therapist/physiotherapy-appointment/pay`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "from": "",
  "id": 0,
  "payChannel": "",
  "payType": ""
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|request|理疗师预约支付对象|body|true|AppointmentPayRequest对象|AppointmentPayRequest对象|
|&emsp;&emsp;from|支付平台||false|string||
|&emsp;&emsp;id|预约id||false|integer||
|&emsp;&emsp;payChannel|支付渠道：public-公众号,mini-小程序，h5-网页支付,yue-余额，wechatIos-微信Ios，wechatAndroid-微信Android,alipay-支付宝，alipayApp-支付宝App, video=视频号, native=微信native支付， alipayPc=支付宝PC支付, shoppingCredits-购物金||true|string||
|&emsp;&emsp;payType|支付方式:weixin,alipay,yue,shoppingCredits||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«AppointmentPayResponse对象»|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||AppointmentPayResponse对象|AppointmentPayResponse对象|
|&emsp;&emsp;id|主键自增|integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"id": 0
	},
	"message": ""
}
```



## 新增


**接口地址**:`/api/front/therapist/physiotherapy-appointment/save`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "appointTime": "",
  "fee": 0,
  "physiotherapyType": "",
  "therapistId": 0
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|physiotherapyAppointmentRequest|理疗预约请求对象|body|true|PhysiotherapyAppointmentRequest对象|PhysiotherapyAppointmentRequest对象|
|&emsp;&emsp;appointTime|预约时间||false|string||
|&emsp;&emsp;fee|预约费用||false|number||
|&emsp;&emsp;physiotherapyType|理疗项目/类型||false|string||
|&emsp;&emsp;therapistId|理疗师ID||false|integer||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«string»|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||string||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": "",
	"message": ""
}
```


# 问诊
## 详情


**接口地址**:`/api/front/doctor/consultation/info`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|id|id|query|true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«Consultation对象»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||Consultation对象|Consultation对象|
|&emsp;&emsp;consultFee|问诊费用|number||
|&emsp;&emsp;consultType|问诊类型 1图文问诊 2视频问诊|integer||
|&emsp;&emsp;createTime|创建时间|string||
|&emsp;&emsp;diseaseDesc|病情描述|string||
|&emsp;&emsp;diseaseType|疾病类型/就诊科室|string||
|&emsp;&emsp;doctorId|医生ID|integer||
|&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;patientId|患者身份ID（关联eb_patient_identity.id）|integer||
|&emsp;&emsp;payOrderNo|支付单号|string||
|&emsp;&emsp;payStatus|支付状态 0未支付 1已支付 2已退款|integer||
|&emsp;&emsp;status|问诊状态 0待接诊 1问诊中 2已完成 3已取消|integer||
|&emsp;&emsp;updateTime|更新时间|string||
|&emsp;&emsp;userId|用户ID|integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"consultFee": 0,
		"consultType": 0,
		"createTime": "",
		"diseaseDesc": "",
		"diseaseType": "",
		"doctorId": 0,
		"id": 0,
		"patientId": 0,
		"payOrderNo": "",
		"payStatus": 0,
		"status": 0,
		"updateTime": "",
		"userId": 0
	},
	"message": ""
}
```



## 分页列表


**接口地址**:`/api/front/doctor/consultation/list`


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
|payStatus|支付状态 0未支付 1已支付 2已退款|query|false|integer(int32)||
|status|问诊状态 0待接诊 1问诊中 2已完成 3已取消|query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«CommonPage«ConsultationSearchResponse对象»»|
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||CommonPage«ConsultationSearchResponse对象»|CommonPage«ConsultationSearchResponse对象»|
|&emsp;&emsp;limit||integer||
|&emsp;&emsp;list||array|ConsultationSearchResponse对象|
|&emsp;&emsp;&emsp;&emsp;consultFee|问诊费用|number||
|&emsp;&emsp;&emsp;&emsp;consultType|问诊类型 1图文问诊 2视频问诊|integer||
|&emsp;&emsp;&emsp;&emsp;createTime|创建时间|string||
|&emsp;&emsp;&emsp;&emsp;diseaseDesc|病情描述|string||
|&emsp;&emsp;&emsp;&emsp;diseaseType|疾病类型/就诊科室|string||
|&emsp;&emsp;&emsp;&emsp;doctorInfo|医生信息|Doctor对象|Doctor对象|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;addressDetail|商户详细地址|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;auditNotes|认证备注|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;auditStatus|认证状态，-1新建，0未审核，1审核通过，2审核失败|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;city|市|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;createTime|注册时间|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;district|区|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;email|邮箱|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;filingNotes|备案备注|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;filingStatus|备案状态，-1新建，0未审核，1审核通过，2审核失败|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;graduateSchoolImageUrl|院校毕业证图片|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;hospitalCareer|医院职业，执业医生，助理医生|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;hospitalDomain|擅长领域介绍|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;hospitalLevel|级别 比如三甲 一甲|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;hospitalName|医院名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;hospitalSub|医院科室，如中医科|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;hospitalTitle|医院抬头，如主治医生，副主任|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;hospitalTitleImageUrl|职称证图片|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;idcardNum|身份证号码|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;idcardObverseImageUrl|身份证正面|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;idcardReverseImageUrl|身份证反面|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;imageFee|图片咨询价格|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;isLogoff|是否注销|boolean||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;lastIp|最后登录IP|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;lastLoginTime|最后登录时间|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;latitude|纬度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;licenseImageUrl|医生执业证图片|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;licenseLocalionImageUrl|医生执业证执业地点页|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;logoffTime|注销时间|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;longitude|经度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;mchId|门店ID|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;name|医生姓名|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;onlineStatus|在线状态 1接诊中 2离线|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;password|密码（建议存储加密后的值）|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phone|手机号码|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;picture|头像|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;province|省|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;qualificationImageUrl|医生资格证图片|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;responseTime|响应时间|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;score|评分|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;selfInfo|个人简介|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;sex|性别 0未知 1男 2女 3保密|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;signatureImageUrl|签名图片|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;specialization|医生擅长的疾病（男性问题、女性问题 ，逗号分开）|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;status|状态，0不可用；1启用|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;treatNum|治疗人数|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;type|类型，1医院医生 2爱尔康医生|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;updateTime|修改时间|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;videoFee|视频咨询价格|number||
|&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;patientInfo|患者身份|PatientIdentity对象|PatientIdentity对象|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;age|年龄|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;city|市|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;createTime|注册时间|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;district|区|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;id|主键自增|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;idNo|证件号码|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;name|科室名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;province|省|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;relationType|1本人 2父母 3爱人 4子女 5亲戚 6朋友 7其他|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;sex|性别 0未知 1男 2女 3保密|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;status|状态，0不可用；1启用|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;type|证件类型（1居民身份证 2港澳居民居住证 3台湾居民居住证 4港澳居民来往内地通行证 5台湾居民来往内地通行证 6护照）|integer||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;updateTime|修改时间|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;userId|用户ID|integer||
|&emsp;&emsp;&emsp;&emsp;payOrderNo|支付单号|string||
|&emsp;&emsp;&emsp;&emsp;payStatus|支付状态 0未支付 1已支付 2已退款|integer||
|&emsp;&emsp;&emsp;&emsp;status|问诊状态 0待接诊 1问诊中 2已完成 3已取消|integer||
|&emsp;&emsp;&emsp;&emsp;updateTime|更新时间|string||
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
				"consultFee": 0,
				"consultType": 0,
				"createTime": "",
				"diseaseDesc": "",
				"diseaseType": "",
				"doctorInfo": {
					"addressDetail": "",
					"auditNotes": "",
					"auditStatus": 0,
					"city": "",
					"createTime": "",
					"district": "",
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
					"imageFee": 0,
					"isLogoff": true,
					"lastIp": "",
					"lastLoginTime": "",
					"latitude": "",
					"licenseImageUrl": "",
					"licenseLocalionImageUrl": "",
					"logoffTime": "",
					"longitude": "",
					"mchId": 0,
					"name": "",
					"onlineStatus": 0,
					"password": "",
					"phone": "",
					"picture": "",
					"province": "",
					"qualificationImageUrl": "",
					"responseTime": 0,
					"score": 0,
					"selfInfo": "",
					"sex": 0,
					"signatureImageUrl": "",
					"specialization": "",
					"status": 0,
					"treatNum": 0,
					"type": 0,
					"updateTime": "",
					"videoFee": 0
				},
				"id": 0,
				"patientInfo": {
					"age": 0,
					"city": "",
					"createTime": "",
					"district": "",
					"id": 0,
					"idNo": "",
					"name": "",
					"province": "",
					"relationType": 0,
					"sex": 0,
					"status": 0,
					"type": 0,
					"updateTime": "",
					"userId": 0
				},
				"payOrderNo": "",
				"payStatus": 0,
				"status": 0,
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



## 预约支付


**接口地址**:`/api/front/doctor/consultation/pay`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "consultType": 0,
  "from": "",
  "id": 0,
  "payChannel": "",
  "payType": ""
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|request|问诊支付对象|body|true|ConsultationPayRequest对象|ConsultationPayRequest对象|
|&emsp;&emsp;consultType|问诊类型 1图文问诊 2视频问诊||false|integer||
|&emsp;&emsp;from|支付平台||false|string||
|&emsp;&emsp;id|问诊id||false|integer||
|&emsp;&emsp;payChannel|支付渠道：public-公众号,mini-小程序，h5-网页支付,yue-余额，wechatIos-微信Ios，wechatAndroid-微信Android,alipay-支付宝，alipayApp-支付宝App, video=视频号, native=微信native支付， alipayPc=支付宝PC支付, shoppingCredits-购物金||true|string||
|&emsp;&emsp;payType|支付方式:weixin,alipay,yue,shoppingCredits||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«ConsultationPayResponse对象»|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||ConsultationPayResponse对象|ConsultationPayResponse对象|
|&emsp;&emsp;id|问诊ID|integer||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"id": 0
	},
	"message": ""
}
```




## 新增


**接口地址**:`/api/front/doctor/consultation/save`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "consultFee": 0,
  "consultType": 0,
  "diseaseDesc": "",
  "diseaseType": "",
  "doctorId": 0,
  "patientId": 0
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|consultationRequest|问诊支付对象|body|true|ConsultationRequest对象|ConsultationRequest对象|
|&emsp;&emsp;consultFee|问诊费用||false|number||
|&emsp;&emsp;consultType|问诊类型 1图文问诊 2视频问诊||false|integer||
|&emsp;&emsp;diseaseDesc|病情描述||false|string||
|&emsp;&emsp;diseaseType|疾病类型/就诊科室||false|string||
|&emsp;&emsp;doctorId|医生ID||false|integer||
|&emsp;&emsp;patientId|患者身份ID（关联eb_patient_identity.id）||false|integer||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«string»|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||string||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": "",
	"message": ""
}
```




## 取消预约服务订单


**接口地址**:`/api/front/order/cancel/reservation/{orderNo}`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|orderNo|orderNo|path|true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|CommonResult«boolean»|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int64)|integer(int64)|
|data||boolean||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": true,
	"message": ""
}
```