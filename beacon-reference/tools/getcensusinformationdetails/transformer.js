(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("eim/Census.aspx?IsShowButtons=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  async function payload(url) {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")(url);

    if (updateurl.updateUrl) {
      return {
        pageUrl: updateurl.updateUrl,
        param: updateurl.updateParams
      }
    } else {
      return {
        pageUrl: url,
        param: "IsShowButtons=1"
      }
    }
  }

  const updateUrlData = await payload("eim/Census.aspx?IsShowButtons=1");

  const digest = await BeaconBar.executeFunction('getDigest')(updateUrlData.param);
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`, requestOptions);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");

  const empNumber = doc.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";
  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "");
  urlencoded.append("scrollTop", "");
  urlencoded.append("__EVENTTARGET", "GetSearchResult");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", viewStateGenerator);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00$body$hdnSelectedTempTab", "0");

  const requestOptionsPost = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };


  const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`, requestOptionsPost);
  const textPost = await responsePost.text();

  const updateUrlData1 = await payload("eim/Dependant.aspx?IsShowButtons=1");

  const digest1 = await BeaconBar.executeFunction('getDigest')(updateUrlData1.param);

  const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData1.pageUrl}&digest=${digest1.digest}`, requestOptions);
  const text2 = await response2.text();
  const document = parser.parseFromString(text2, "text/html");

  const dependantDetails = {
    "Does the dependant work in the same company as you?": document.querySelector("#chkDefSameCompany")?.checked ? "Yes" : "No",
    "Name": document.querySelector("#txtDefFullName")?.value.trim() || "",
    "Relationship": document.querySelector("#cbodefRelationship")?.value || "",
    "Date of Birth": document.querySelector("#txtDateOfBirth")?.value.trim() || "",
    "Age": document.querySelector("#lblDefAge")?.value.trim() || "0",
    "Place of Birth": document.querySelector("#txtdepbirthplace")?.value.trim() || "",
    "Gender": document.querySelector("#cboGender option:checked")?.textContent.trim() || "",
    "Nationality": document.querySelector("#cboNationality option:checked")?.textContent.trim() || "",
    "ID No": document.querySelector("#txtDefNICNo")?.value.trim() || "",
    "Entitled for Death Donations": document.querySelector("#chkdefEligiDeathDonet")?.checked ? "Yes" : "No",
    "Married": document.querySelector("#chkIsMarried")?.checked ? "Yes" : "No",
    "Entitled for Medical Benefits": document.querySelector("#chkDefMedical")?.checked ? "Yes" : "No",
    "Employed": document.querySelector("#chkIsWorking")?.checked ? "Yes" : "No",
    "Living": document.querySelector("#chkDefLiving")?.checked ? "Yes" : "No",
    "PF Nominee": document.querySelector("#chkDefPFNominee")?.checked ? "Yes" : "No",
    "Telephone": document.querySelector("#txtDefTelephone")?.value.trim() || "",
    "Official Telephone": document.querySelector("#txtDefSpouseTP")?.value.trim() || "",
    "Email": document.querySelector("#txtDefEmail")?.value.trim() || "",
    "Email (Office)": document.querySelector("#txtdefEmailoff")?.value.trim() || "",
    "Working Address": document.querySelector("#txtDefSpouseWorkingAdd")?.value.trim() || "",
    "Home Address": document.querySelector("#txtDefSpouseHome")?.value.trim() || "",
    "Is the dependent a child?": document.querySelector("#txtDefSchool")?.value.trim() ? "Yes" : "No",
    "School / University Details": document.querySelector("#txtDefSchool")?.value.trim() || "",
    "Attachment Type": document.querySelector("#cboAttType option:checked")?.textContent.trim() || "",
    "Visible To": document.querySelector("#cboAttVisibility option:checked")?.textContent.trim() || "",
    "Document date": document.querySelector("#txtAttDocDate")?.value.trim() || "",
    "Submitted date": document.querySelector("#txtAttSubmitDate")?.value.trim() || "",
    "Path": document.querySelector("#fileAttatchment")?.value.trim() || "No file chosen",
    "Attachment Name": document.querySelector("#txtAttchName")?.value.trim() || "",
    "Comments": document.querySelector("#txtDefComments")?.value.trim() || ""
  };

  const dependants = [];
  document.querySelectorAll("#grdDefInfo_ctl00 tbody tr").forEach(row => {
    const columns = row.querySelectorAll("td");
    if (columns.length >= 4) {
      dependants.push({
        "Name": columns[0]?.innerText.trim() || "",
        "Relationship": columns[1]?.innerText.trim() || "",
        "Date of Birth": columns[2]?.innerText.trim() || "",
        "Gender": columns[3]?.innerText.trim() || ""
      });
    }
  });

  dependantDetails["Dependants"] = dependants;

  const updateUrlData2 = await payload("eim/Emergency.aspx?IsShowButtons=1");

  const digest2 = await BeaconBar.executeFunction('getDigest')(updateUrlData2.param);

  const response3 = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData2.pageUrl}&digest=${digest2.digest}`, requestOptions);
  const text3 = await response3.text();
  const document1 = parser.parseFromString(text3, "text/html");

  const emergencyDetails = {
    "Dependant as Emergency contact": document1.querySelector("#cboDepend option:checked")?.textContent.trim() || "",
    "Emergency Contact Type": document1.querySelector("#optEmeExt1")?.checked ? "External" :
      document1.querySelector("#optEmeInternal1")?.checked ? "Internal" : "",
    "Employee Name": document1.querySelector("#txtEmeEmpNo")?.value.trim() || "",
    "Name": document1.querySelector("#txtEmeFullName")?.value.trim() || "",
    "Relationship": document1.querySelector("#cboEmeRelation option:checked")?.textContent.trim() || "",
    "Priority Order": document1.querySelector("#nuEmeOrder")?.value.trim() || "",
    "Telephone Home": document1.querySelector("#txtEmeExHomeTP")?.value.trim() || "",
    "Telephone Mobile": document1.querySelector("#txtEmeExMobileTP")?.value.trim() || "",
    "Telephone Office": document1.querySelector("#txtEmeExOfficeTP")?.value.trim() || "",
    "Home Address": document1.querySelector("#txtEmeHomeadd")?.value.trim() || "",
    "Working Address": document1.querySelector("#txtEmeOffice")?.value.trim() || ""
  };

  const emergencyContacts = [];
  document1.querySelectorAll("#grdEmeContact_ctl00 tbody tr").forEach(row => {
    const columns = row.querySelectorAll("td");
    if (columns.length >= 5) {
      emergencyContacts.push({
        "Name": columns[0]?.innerText.trim() || "",
        "Type": columns[1]?.innerText.trim() || "",
        "Home": columns[2]?.innerText.trim() || "",
        "Office": columns[3]?.innerText.trim() || "",
        "Mobile": columns[4]?.innerText.trim() || ""
      });
    }
  });

  emergencyDetails["Emergency Contacts"] = emergencyContacts;

  const updateUrlData3 = await payload("eim/Transport.aspx?IsShowButtons=1");

  const digest3 = await BeaconBar.executeFunction('getDigest')(updateUrlData3.param);

  const response4 = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData3.pageUrl}&digest=${digest3.digest}`, requestOptions);
  const text4 = await response4.text();
  const document4 = parser.parseFromString(text4, "text/html");

  const transportDetails = {
    "Commuting Route": document4.querySelector("#cboTrnRoute option:checked")?.textContent.trim() || "",
    "Mode of Transport": document4.querySelector("#cboTrnMode option:checked")?.textContent.trim() || "",
    "Distance from Residence to Work (Km)": document4.querySelector("#nuTrnDisReToWork")?.value.trim() || "0",
    "Travel Time to Work (HM.MM)": document4.querySelector("#nuTrnTravalTime")?.value.trim() || "0",
    "Public Transport - Nearest Bus/Railway Stop": document4.querySelector("#txtTrnNearestBusRailway")?.value.trim() || "",
    "Official Transport - Office": document4.querySelector("#optTrnOff")?.checked ? "Yes" : "No",
    "Official Transport - Shift Transport": document4.querySelector("#optTrnShift")?.checked ? "Yes" : "No",
    "Route Coordinator": document4.querySelector("#txtTrnRouteCor")?.value.trim() || "",
    "Dwelling Mode": document4.querySelector("#cboDwellingMode option:checked")?.textContent.trim() || "",
    "Duration Years": document4.querySelector("#nuYears")?.value.trim() || "0",
    "Duration Months": document4.querySelector("#nuMonths")?.value.trim() || "0",
    "Plan to Build a New House": document4.querySelector("#optYes")?.checked ? "Yes" :
      document4.querySelector("#optNo")?.checked ? "No" : "",
    "City": document4.querySelector("#txtCity")?.value.trim() || ""
  };

  const updateUrlData4 = await payload("eim/Nominee.aspx?IsShowButtons=1");

  const digest4 = await BeaconBar.executeFunction('getDigest')(updateUrlData4.param);

  const response5 = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData4.pageUrl}&digest=${digest4.digest}`, requestOptions);
  const text5 = await response5.text();
  const document5 = parser.parseFromString(text5, "text/html");

  const nomineeDetails = {
    "Statutory": document5.querySelector("#grdNominee_ctl00__0 td:nth-child(1)")?.textContent.trim() || "",
    "Nominee": document5.querySelector("#grdNominee_ctl00__0 td:nth-child(2)")?.textContent.trim() || "",
    "Relationship": document5.querySelector("#grdNominee_ctl00__0 td:nth-child(3)")?.textContent.trim() || "",
    "Date of Birth": document5.querySelector("#grdNominee_ctl00__0 td:nth-child(4)")?.textContent.trim() || "",
    "Percentage %": document5.querySelector("#grdNominee_ctl00__0 td:nth-child(5)")?.textContent.trim() || ""
  };
  return { dependantDetails, emergencyDetails, transportDetails, nomineeDetails };
});
