(function(args){
 const myHeaders = new Headers();
myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
myHeaders.append("content-type", "application/x-www-form-urlencoded");

const urlencoded = new URLSearchParams();
urlencoded.append("ctl00_body_RadScriptManager1_HiddenField", "");
urlencoded.append("__EVENTTARGET", "");
urlencoded.append("__EVENTARGUMENT", "");
urlencoded.append("__VIEWSTATE", args.viewState);
urlencoded.append("__VIEWSTATEGENERATOR", args.generator);
urlencoded.append("__VIEWSTATEENCRYPTED", "");
urlencoded.append("__EVENTVALIDATION", args.validation);
urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
urlencoded.append("ctl00$body$grdWFTypes$ctl02$imgbtnEdit.x", "5");
urlencoded.append("ctl00$body$grdWFTypes$ctl02$imgbtnEdit.y", "12");
urlencoded.append("ctl00$body$hdnFlModID", "");
urlencoded.append("ctl00$body$hdnFldTypeCodeStatus", "");
urlencoded.append("ctl00$body$hdnFldTypeCode", "");

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: urlencoded,
  redirect: "follow"
};
const reqOptions = BeaconBar.executeFunction("reqOptions")();
const response = await fetch(`${reqOptions}WorkFlow_v6/DefineWorkflowType.aspx`, requestOptions)
 const data  = await  response.text();
return data ;
})