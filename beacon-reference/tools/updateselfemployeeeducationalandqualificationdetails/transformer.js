(async function (data, args, reqOptions) {
  const fields = [
    "QualificationTypeCaption",
    "Qualification",
    "QualificationSchoolCaption",
    "QualificationStatusCaption",
    "Year",
    "QualificationRemarksCaption"
  ];

  for (const x of fields) {
    const myHeaders = new Headers({
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    });

    const response = await fetch(
      `${location.origin}/${reqOptions.sl}/EIMV9/api/CommonAPI/getMessage/?type=Qualification&key=${x}&_=${Date.now()}`,
      {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      }
    );
    await response.json();

    const response1 = await fetch(
      `${location.origin}/${reqOptions.sl}/EIMV9/api/CommonAPI/getMessage/?type=EIMCommon&key=ValidateblankValue&_=${Date.now()}`,
      {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      }
    );
    await response1.json();
  }

  // 🔹 Update records only after all field calls are done
  window.payData.forEach(x => {
    if (x.QuliObj.QualificationName === args.qualificationName) {
      if (args.status) {
        x.StatusObj.QualStatusCode = args.status;
        x.StatusObj.QualStatusDescription = args.status;
      }
      if (args.yearOfQualification) {
        x.QualYear = args.yearOfQualification;
      }
      if (args.schoolOrInstitute) {
        x.Institute = args.schoolOrInstitute;
      }
      if (args.remarks) {
        x.Comment = args.remarks;
      }
    }
  });

  window.payData = window.payData.map(({ MBBSObj, ...rest }) => {
    const { MBBSCode, ...objRest } = MBBSObj; // remove MBBSCode
    return { ...rest, MBBSObj: objRest };
  });

  // 🔹 Save API executes only after loop & updates
  const saveHeaders = new Headers({
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "content-type": "application/json",
    "x-requested-with": "XMLHttpRequest"
  });

  const saveResponse = await fetch(
    `${location.origin}/${reqOptions.sl}/EIMV9/api/QualificationAPI/SaveQualificationData/`,
    {
      method: "POST",
      headers: saveHeaders,
      body: JSON.stringify(window.payData),
      redirect: "follow"
    }
  );

  const flatData = window.payData.map(item => ({
    EmpNumber: item.EmpNumber,
    TypeCode: item.TypeObj?.QualTypeCode || "",
    TypeName: item.TypeObj?.QualTypeName || "",
    QualificationCode: item.QuliObj?.QualificationCode || "",
    QualificationName: item.QuliObj?.QualificationName || "",
    MBBSName: item.MBBSObj?.MBBSName || "",
    Institute: item.Institute || "",
    StatusName: item.StatusObj?.QualStatusDescription || "", // Flattened
    QualificationYear: parseInt(item.QualYear) || "",
    Remarks: item.Comment || "",
    Distinction: item.Distinction || "",
    MedleReword: item.MedleReword || "",
    Sequence: item.Sequence || 0,
    ActionType: item.ActionType || 0,
    UpdateInsert: item.UpdateInsert || 0, // ensure included
    AdmissionDate: item.AdmissionDate || "",
    EffectiveDate: item.EffectiveDate || "",
    CourseMethod: item.CourseMethod || 0,
    CourseType: item.CourseType || 0,
    EmpSubjectList: item.EmpSubjectList || []
  }));

  let raw = JSON.stringify({
    "ProfConfig": window.educate.ProfConfig,
    "LoginEmp": window.educate.LoginEmp,
    "PendingApproval": false,
    "EmpNumber": window.educate.EmpNumber,
    "EmpDisplayNumber": window.educate.EmpDisplayNumber,
    "EmployeeProfile": 1,
    "FilterQualifiClassifiWise": false,
    "FilterClassificationQualiTypeWise": false,
    "CourseMethodFlg": 1,
    "CourseTypeFlg": 1,
    "IsHaveSubordinates": false,
    "EnableEditing": true,
    "IsAllowFutureYear": true,
    "IsAllowFutureYearStatus": "In Progress",
    "QulifiTypeList": window.educate.TypeObjList,
    "ClassificationTypeList": window.educate.ClassificationObjList,
    "AllQualificationList": window.educate.QualObjList,
    "QualificationList": [],
    "MBBSList": [],
    "Institute": "",
    "QulifiStatusList": window.educate.StatusObjList,
    "QulifiYear": "",
    "Remarks": "",
    "Distinction": "",
    "MedleReword": "",
    "Sequence": 1,
    "EmployeeSubjectList": [],
    "SubjectList": [],
    "IsSubjectNewEntry": true,
    "IsFeildsExpanded": false,
    "IsHaveAnyChange": false,
    "IsNewEntry": true,
    "IsHaveAnyChangeInSubjectList": false,
    "EmployeeQualificationList": flatData,
    "EmployeeQualificationListOriginal": flatData
  });

  const loadSaveData = await fetch(
    `${location.origin}/${reqOptions.sl}/EIMV9/api/QualificationAPI/LoadEmployeeQualificationsOnReset/`,
    {
      method: "POST",
      headers: saveHeaders,
      body: raw,
      redirect: "follow"
    }
  );

  return await loadSaveData.json();
});
