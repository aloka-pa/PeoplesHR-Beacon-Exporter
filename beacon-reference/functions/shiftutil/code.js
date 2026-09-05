(function(){
    const myHeaders = new Headers();
myHeaders.append("accept", "application/json, text/plain, */*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("content-type", "application/json");

const raw = JSON.stringify({
  "FilterMode": "6",
  "PageIndex": 1,
  "PageSize": 10,
  "LoggedEmployeeNumber": "c2owOG5QTnVEWXE0eENielp4MGl4cWZuZG1TM3NGVG4zaFZCbUJXVkFmN3RKUDc4Qlh6cHJNTnlrNUg4TmZNV3B6dk5PY2RnV2RBTEhoNnRvWGwzWkJWOUtRcEpodUJjVWRlYVVxdEp6WVBxRC9lVlYxY3RTUWtsbHNWUkxSUE5pajhpc1FNOEZtZGVoNFd2Qm5qRDJ3WWQzUU5Jbjc4a2Nmck1CQzQvNHN4YTdKR2VIdnRUeXptTTVUYjkxdXN5RklhRmk1OWl5am1yYXk5blQwRlRrbEc3ZUZGeHZTZ29EL3NuaytMMEN5UVlHSVJhQUcyTjhNd3JZbUJRdzFhTHp4dmh4Nzhxdmo4bzlPTU1CdmRhcGlQenlybk5kejZ1Yk1lT2VMcXJTTVJlSmJvYmJXRTl1RG9TWC9aNFFBbnFQQVFRNFYzYzhxUnJVU1NKcEZDN3ZHWVhOYWpEdUZpc3FMUHc1b3dMR3pRPQ==",
  "LoggedEmployeeUserId": "000005",
  "WfTypeCode": "65004",
  "WfMainId": "0000000680",
  "FromDate": "",
  "ToDate": "",
  "EmpNumber": "ajZlekNFaFduREVIQ01lbk1TTG1sK1Z6NVhjMDBVODNUSnVNMGhYb2U0cUViLzkvdDRBUWV2M2J6WXZNYzAwL1pPU3lYWmNhejVLUi9LWlpHTUkrdlAxeE9PaGhkRXQ0czdOWDdabmd2RUcxbFYva25LZjZhdzNLcXFvdnZVdUo5KyszQnlkRlVXRzB5Z2tkbXdiTkxXczRLampYN0p5NjZ3L0VwNnVRcktRREllRUs1cWt6NjVwQ0VHSG5UMGlpb1F2cVBEMU90SFpSZkxMOU5tZjl0eFNHS2tWUTJnOFJVRjZUeTFLTEQ1b3JvWWFSNDZXY01kQjVzTzJHSGZXQ2R1bld5Qk95ME90ZWNGU1hVZlIvYmVlTkVJbjVoM2Y4anlKckVndWhVK0F0Mk80OWtvSTJuNXcrTzZUdXkzWDQrWjNHcUtweHpZcUJTcFl4Z3d5ODM1SzF0QXc2cEFzYVo2clNVbjg5QUZWbE9EL283K3NxRlV0eXMxRnVEYkJ4bzFBRDJ2aEJacW9wRHZZZHRzSXVlUT09"
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("https://devtest-echoengineers.phrsandbox.dev/hrb5/tnavue/service/api/WorkflowApproval/GetShiftAdjustmentApprovalGridData", requestOptions)
  .then((response) => response.text())
  .then(() => {})
  .catch(() => {});
})