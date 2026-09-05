(async function (args) {
  //done
  const state = await BeaconBar.getSharedData("failedViewState");
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('WorkFlow_v6/DefineWorkflowGroup.aspx');
  const headers = new Headers({
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    "x-requested-with": "XMLHttpRequest"
  });

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const baseUrl = `${reqOptions}${updateurl.updateUrl}`;

  const randomX = Math.floor(Math.random() * 10).toString();
  const randomY = Math.floor(Math.random() * 90 + 10).toString();

  const formData = new URLSearchParams();

  formData.append("ctl00_body_RadScriptManager1_HiddenField", "");
  formData.append("__EVENTTARGET", "");
  formData.append("__EVENTARGUMENT", "");
  formData.append("__VIEWSTATE", state.viewState.viewState);
  formData.append("__VIEWSTATEGENERATOR", state.viewState.viewStateGenerator);
  formData.append("__VIEWSTATEENCRYPTED", "");
  formData.append("__EVENTVALIDATION", state.viewState.eventValidation);
  formData.append("ctl00$action$hdnWFGrpStatus", "");
  formData.append("ctl00$action$hdnWFGrpMemberStatus", "");

  if (args) {
    formData.append(`${args}.x`, randomX);
    formData.append(`${args}.y`, randomY);
  } else {
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: formData,
    redirect: "follow"
  });

  const responseData = await response.text();
  return responseData;
});