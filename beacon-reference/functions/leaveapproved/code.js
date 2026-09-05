(async function(args , comment){
    const myHeaders = new Headers();
myHeaders.append("__cfafvalue", "1PM74tPIgMp3BSUu1YEJVcImmSz4IQNlDRDsNTLyKf6thSZ4pdd6z1T1VMZBcRk5rltIKjDRf3tXfd6-kiqNDS3nx4Y1,IwaP99Jz2KGTfdbp1Tj1smh2h-P2PUoffkVbnvUTqbDNvBBtSYh-tMQDM5UfHH8hbB9YkACJGjMwY1vLwjMNTtOqpCQ1");
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("content-type", "application/json");

const raw = JSON.stringify({
  "LDetail": {
    "WFMainID": "MAAwADAAMAAwADAAMAAyADcANgA%3D",
    "ApprovalEmpNumber": "MHZxbmFKUDkwRXVaN1VMMGJVRVFqREpEc2dDbmpzVTBIS3pnOUVYNW1XbXUyYVJRTVBjcGc4QjBjTGtyZXJzSkt2Um43OW5oRjhiNGlvVHQ1YmFxaTJ1NXdOT1o3N3dkWENBZ2VXZVZCTXgza3ovMHF1OE9iMnUzdXptbVpMQVhnZ2dLeGlBN1NMZUMrUDdOK20wMEVBcTRaVWNFcGlWc2d2UUlOSkFZbFM1cldBaEhtTlNWM0wxaTRRTkdyam1rMVNaaTgxRk5CSWdUbm9pL1VrWGVhd25HMVpuRVBTMnNPRXJyaTM0c29UZ3d0RzBhYTJseUhtOTlZbSttSWdhWFBOV1ZnQlBOY0twQmRWWmdsMW8wTkdjbDdCcXpreVF0QXJ5bTlzYVF2b05UdjFTYW5IelpEUkpMQTRHTUN2WTltUkx2UW40cFBOL3hTMUxkWHNOYTJ3Mmd3NHFTR1lkbVhpVERac05wS2lxaXM1QTB3djgzckloNWp0eCtzUktNbFo5ZGYzOFNsQlcvTXJKamF2Z1pVaVNzTHYya3Y0OVlMcTJFVzY2bm43QVhpN2pZNFRwd0dsYk5ST1JJaVVGWC9JVmg3MTRLOVo2eXVuOWxTSUk5OC9qWG0yenJvdlpSM2JaN0t4QU5HQlkrWmRFMDBVQmlUL0pYaUNmbkxuaTVITWxKa1IwYXRlMEJoZ0FrOElQZmN0anJ1blU2UWdPVEZzQjVqVTRlUldLVVFUN0Eyb1JUMkUycWhWRzRJS0I5YXNpanJsd3F6RTYxbkFMSVhQWk9Lcm85SHM2c1B3bU1kcnowU2JGalhONkR1UmF4V0FERmp3dHVDQWlzYUljZWkvM0gwU1MwdHZna2JZUGJ4L09FZFE9PQ==",
    "Comment": "hello",
    "EmpNumber": "VDhkYkJGQVJpMTVVby9VMDc4Rjh4Q2RwQTFZamtqM2hMSCs1S1pHenJ6dzU4bGx4bFVJMkp4NXFybDBKMi9uMFRvMUp1TjRSMmNvWmFJMnI5alRLOXFuVG1NWElsbkRzY3pZMzJNelAyck1KYjg5SEcyNi9BcnFmZHZIWWdONis1WENSdC9kU1kzY21XcVVxZy95a0s4UWpFTmk0VnA5Y05wRk01SW1xajgvZ1NBcmRndjljNVBaTnVmK0hVY2ZqUmdTTUZIclhtL2c1TkJZcmZZdVV0eXovUHhQQWhLUTRNV09UZ0p3a3RlanR5b2N3SURYTjRRakM2Sys5ZkNMY2tnOWphb0w2ekJScGh5dDdNSm5qUVNVVkFJTW82RkxtSHB1Sy9RZ0hOZklGUllBMGpLWVpSVjdsWjg1YzAwZ0RVNGx4WFh1THE4VzBPSHAveFRRWW91ZXpmaWVGM0pxbHE2TGh3aGgyeVpQajJ2MTYyTlFuUXhZVGoxTzFZR0ZBSWJYZU1ZNkd1SkNmcmJQS3oyNWpFemxaWXY2cDBncGsxWGw0b1hkbGFYRDNvNVpQUGlrQmo2emgwaU80bjZzTmU4TVVWYnp4SXVNMjZhbDBaRm05QVJPelo2MjA3NzRtaHQ4S3p0QU05dEwzYUFrZHhXRjd6WGtteXNjRlZRSEJkTWV3YVp4L284UnRuc0k5cjlpcDR5MkdBRjRvZWg2ZGdDSlN3SW1uM2NTUEdMWmJMTWZiRzdSTFQ2bUVhclFrNzBoU3JORW8xa2I5aklQc1BVYThOTmV3d0pLZGQ2MlRyNEI0YWU1VkQ0WGtrVDZrZ0MxZTREQURRQkxLZzZreVRZeEswdHZEdTEwWThWMStVdW9zY2c9PQ==",
    "IsInformed": -1,
    "InformedMethod": "000001",
    "BreakdownList": [
      {
        "AppId": "57",
        "LeaveDate": "/Date(1732905000000)/",
        "DayMode": 2,
        "DayModeText": "Whole Day",
        "DayValue": 1,
        "StartTime": 0,
        "EndTime": 0,
        "FullLeaveAmount": 0,
        "WorkHours": 1,
        "MaxWorkHours": 0,
        "LeaveType": null,
        "IsMidnighthift": false
      }
    ]
  },
  "LeaveCategory": 1,
  "IsMedicalSeen": 0,
  "ApproveAttachments": null
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

const response = await fetch("https://hrmv101phqaupgrade.phrsandbox.dev/hr/AbsenceV9/api/LeaveApproval/SubmitLeaveApplicationApproval/", requestOptions)
  const data = await  response.json()
  
return data ;
})