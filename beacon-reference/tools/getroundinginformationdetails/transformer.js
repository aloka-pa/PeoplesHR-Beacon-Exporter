(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/RoundingInformation`);

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const raw = `ctl00%24main%24RadScriptManager=ctl00%24body%24upPnlBody%7Cctl00%24body%24grdsummary%24ctl00%24ctl02%24ctl02%24FilterTextBox_ROUND_RULE_ID&ctl00_main_RadScriptManager_HiddenField=&__EVENTTARGET=ctl00%24body%24grdsummary%24ctl00%24ctl02%24ctl02%24FilterTextBox_ROUND_RULE_ID&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=${details.viewState}&__VIEWSTATEGENERATOR=${details.viewStateGen}&__SCROLLPOSITIONX=0&__SCROLLPOSITIONY=0&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=${details.eventValidation}&ctl00%24body%24grdsummary%24ctl00%24ctl02%24ctl02%24FilterTextBox_ROUND_RULE_ID=${args.id}&ctl00%24body%24grdsummary%24ctl00%24ctl02%24ctl02%24FilterTextBox_ROUND_RULE_NAME=&ctl00%24body%24grdsummary%24ctl00%24ctl02%24ctl02%24FilterTextBox_ROUND_TYPE=&ctl00%24body%24grdsummary%24ctl00%24ctl03%24ctl01%24GoToPageTextBox=1&ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState=&ctl00%24body%24grdsummary%24ctl00%24ctl03%24ctl01%24ChangePageSizeTextBox=7&ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState=&ctl00%24body%24grdsummary%24ctl00%24ctl04%24butEditGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl04%24butDeleteGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl06%24butEditGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl06%24butDeleteGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl08%24butEditGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl08%24butDeleteGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl10%24butEditGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl10%24butDeleteGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl12%24butEditGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl12%24butDeleteGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl14%24butEditGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl14%24butDeleteGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl16%24butEditGrid%24isControlEnabled=True&ctl00%24body%24grdsummary%24ctl00%24ctl16%24butDeleteGrid%24isControlEnabled=True&ctl00_body_grdsummary_rfltMenu_ClientState=&ctl00_body_grdsummary_ClientState=&ctl00%24body%24tpTest%24txtTime=&ctl00%24action%24ButtonPanel%24butNew%24isControlEnabled=True&ctl00%24hdnCulturDateFormat=M%2Fd%2Fyyyy&__ASYNCPOST=true&`;

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/TNA/RoundingInformation.aspx`, requestOptions1);
  const responseText = await response.text();

  const viewstateMatch = responseText.match(/\|__VIEWSTATE\|([^|]+)/);
  const viewstategenMatch = responseText.match(/\|__VIEWSTATEGENERATOR\|([^|]+)/);
  const eventvalidationMatch = responseText.match(/\|__EVENTVALIDATION\|([^|]+)/);

  const viewstate = viewstateMatch ? viewstateMatch[1] : "";
  const viewstategen = viewstategenMatch ? viewstategenMatch[1] : "";
  const eventvalidation = eventvalidationMatch ? eventvalidationMatch[1] : "";

  const raw1 = `ctl00%24main%24RadScriptManager=ctl00%24body%24upPnlBody%7Cctl00%24body%24grdsummary%24ctl00%24ctl04%24butEditGrid%24imgGRDEditButton&ctl00_main_RadScriptManager_HiddenField=&ctl00%24body%24grdsummary%24ctl00%24ctl02%24ctl02%24FilterTextBox_ROUND_RULE_ID=${args.id}&ctl00%24body%24grdsummary%24ctl00%24ctl02%24ctl02%24FilterTextBox_ROUND_RULE_NAME=&ctl00%24body%24grdsummary%24ctl00%24ctl02%24ctl02%24FilterTextBox_ROUND_TYPE=&ctl00%24body%24grdsummary%24ctl00%24ctl03%24ctl01%24GoToPageTextBox=1&ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState=&ctl00%24body%24grdsummary%24ctl00%24ctl03%24ctl01%24ChangePageSizeTextBox=1&ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState=&ctl00%24body%24grdsummary%24ctl00%24ctl04%24butEditGrid%24isControlEnabled=&ctl00%24body%24grdsummary%24ctl00%24ctl04%24butDeleteGrid%24isControlEnabled=&ctl00_body_grdsummary_rfltMenu_ClientState=&ctl00_body_grdsummary_ClientState=&ctl00%24body%24tpTest%24txtTime=&ctl00%24action%24ButtonPanel%24butNew%24isControlEnabled=True&ctl00%24hdnCulturDateFormat=M%2Fd%2Fyyyy&__EVENTTARGET=&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=${viewstate}&__VIEWSTATEGENERATOR=${viewstategen}&__SCROLLPOSITIONX=0&__SCROLLPOSITIONY=0&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=${eventvalidation}&__ASYNCPOST=true&ctl00%24body%24grdsummary%24ctl00%24ctl04%24butEditGrid%24imgGRDEditButton.x=&ctl00%24body%24grdsummary%24ctl00%24ctl04%24butEditGrid%24imgGRDEditButton.y=`;

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: raw1,
    redirect: "follow"
  };

  const response1 = await fetch(`${location.origin}/${reqOptions.sl}/TNA/RoundingInformation.aspx`, requestOptions2);
  const text1 = await response1.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(text1, "text/html");

  const result = {
    roundingPatternName: "",
    option: [],
    method: "",
    value: ""
  };

  const roundingPatternInput = doc.querySelector("#ctl00_body_txtRoundingPatternName");
  if (roundingPatternInput) {
    result.roundingPatternName = roundingPatternInput.value.trim();
  }

  const radioLabels = doc.querySelectorAll("input[name='ctl00$body$Rounding_pattern']");
  radioLabels.forEach(input => {
    const label = doc.querySelector(`label[for="${input.id}"]`);
    if (label) {
      result.option.push(label.textContent.trim());
    }
  });

  const selectedMethod = doc.querySelector("#ctl00_body_cboMethod option:checked");
  if (selectedMethod) {
    result.method = selectedMethod.textContent.trim();
  }

  const valueInput = doc.querySelector("#ctl00_body_txtNumVal");
  if (valueInput) {
    result.value = valueInput.value.trim();
  }


  return result;
});
