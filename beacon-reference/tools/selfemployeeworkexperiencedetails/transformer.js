(async function (data, args, reqOptions) {
  function parseDotNetDate(dotNetDateStr) {
    const match = /\/Date\((\d+)\)\//.exec(dotNetDateStr);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      const date = new Date(timestamp);

      // Format as dd/MM/yyyy
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    }
    return null;
  }
  const url = await BeaconBar.executeFunction("updateUrlParams")("WorkExperience/WorkExperience?mvc=1&subordinate=0")
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
  const match = details.match(/var\s+modelWorkExperience\s*=\s*(\{[\s\S]*?\});/);
  const work = JSON.parse(match[1]);
  window.empNumber1 = work.EmpNumber;

  return work.WorkExperienceList.map(x => ({
    "Internal / External": x.Category || "",
    "Company Name": x.Company || "",
    "Work Related": x.WorkRelatedFlg ? "Yes" : "No",
    "From Date": parseDotNetDate(x.ExpFromDate),
    "To Date": parseDotNetDate(x.ExpToDate),
    "Confirmed Date": parseDotNetDate(x.ConfirmedDate),
    "Contact Person": x.ContactPerson || "",
    "Department/Division": x.Department || "",
    "Designation on Leaving": x.DesignationOnLeave || "",
    "Reason for Leaving": x.ReasonForLeave || "",
    "Industry Type": x.IndustryTypeName || "",
    "Address": [x.Address1, x.Address2, x.Address3].filter(Boolean).join(", "),
    "Telephone": x.ExpTelNo || "",
    "E-mail": x.ExpEmail || "",
    "Accountabilities": x.Accountabilities || "",
    "Achievements": x.Achievments || "",
    "No of Years": x.ExpYears || 0,
    "No of Months": x.ExpMonths || 0,
    "Benefit Consideration": x.BenifitConsiderFlg ? "Yes" : "No"
  }));

})