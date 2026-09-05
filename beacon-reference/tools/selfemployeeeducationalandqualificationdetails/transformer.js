(async function (data, args, reqOptions) {
  const url = await BeaconBar.executeFunction("updateUrlParams")("EIMV9/Qualification/Qualification?mvc=1&subordinate=0")
  const digest = await BeaconBar.executeFunction('getDigest')(url.updateParams);

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const response = await fetch(`${location.origin}/${reqOptions.sl}/${url.updateUrl}&digest=${digest.digest}&_=${Date.now()}`, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });
  const details = await response.text();
  const match = details.match(/var\s+modelQualification\s*=\s*(\{[\s\S]*?\});/);
  const educate = JSON.parse(match[1]);
  window.educate = educate;
  const originalData = educate.EmpQualObjList.map(item => ({

    EmpNumber: item.EmpNumber,

    // Flatten Qualification
    QuliObj: {
      QualificationCode: item.QuliObj?.QualificationCode ?? "",
      QualificationName: item.QuliObj?.QualificationName ?? ""
    },

    // Flatten Type
    TypeObj: {
      QualTypeCode: item.TypeObj?.QualTypeCode ?? "",
      QualTypeName: item.TypeObj?.QualTypeName ?? ""
    },

    // Flatten MBBS
    MBBSObj: {
      MBBSCode: item.MBBSObj?.MBBSCode ?? "",
      MBBSName: item.MBBSObj?.MBBSName ?? ""
    },

    // Flatten Status
    StatusObj: {
      QualStatusCode: item.StatusObj?.QualStatusDescription ?? "",
      QualStatusDescription: item.StatusObj?.QualStatusDescription ?? ""
    },

    // Carry over directly if present
    Institute: item.Institute ?? "",
    QualYear: item.QualYear ?? "",
    Comment: item.Comment ?? "",
    Distinction: item.Distinction ?? "",
    MedleReword: item.MedleReword ?? "",
    Sequence: item.Sequence ?? 0,
    AdmissionDate: item.AdmissionDate ?? "",
    EffectiveDate: item.EffectiveDate ?? "",
    ActionType: item.ActionType ?? 0,
    CourseMethod: item.CourseMethod ?? 0,
    CourseType: item.CourseType ?? 0,
    EmpSubjectList: item.EmpSubjectList ?? []
  }));
  window.payData = originalData;
  return {
    existingQualificationDetails: educate.EmpQualObjList,
    statusDetails: educate.StatusObjList
  }
})