(async function (reqOptions) {
  const args = BeaconBar.getSharedData("datsss")
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("cache-control", "max-age=0");
  myHeaders.append("content-type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "0");
  urlencoded.append("scrollTop", "0");
  urlencoded.append("__EVENTTARGET", "");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__LASTFOCUS", "");
  urlencoded.append("__VIEWSTATE", args.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", args.viewStateGenerator);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", args.eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded.append("ctl00$hdnQuickmenu", "");
  urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", args.employeenumber);
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00$body$cboLanuage", reqOptions.language);
  urlencoded.append("ctl00$body$chkReading", reqOptions.readingcheck);
  urlencoded.append("ctl00$body$cboLanGradeReading", reqOptions.gradeReading);
  urlencoded.append("ctl00$body$chkWriting", reqOptions.writingcheck);
  urlencoded.append("ctl00$body$cboLanGradeWriting", reqOptions.gradewriting);
  urlencoded.append("ctl00$body$chkSpeaking", reqOptions.speakingcheck);
  urlencoded.append("ctl00$body$cboLanGradeSpeaking", reqOptions.gradeSpeaking);
  urlencoded.append("ctl00$body$txtPublicKey", args.publicKey);
  urlencoded.append("ctl00$body$grdLanuages$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdLanuages_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdLanuages$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "2");
  urlencoded.append("ctl00_body_grdLanuages_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded.append("ctl00_body_grdLanuages_ClientState", "");
  urlencoded.append("ctl00$body$butSave", "Save");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  const response = await fetch("https://devtest-echoengineers.phrsandbox.dev/hrb5/EIM/AssignLanguage.aspx", requestOptions)
  const data = await response.text();
    function extractViewState(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const empNumber = doc.querySelector("#ctl00_body_txtEmpNumber")?.value || "";

    const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
    const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
    const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
    const publicKey = doc.querySelector("#ctl00_body_txtPublicKey")?.value || "";
    

    return {
      viewState, viewStateGenerator, eventValidation , publicKey  , empNumber

    }
  }

  return data;

})