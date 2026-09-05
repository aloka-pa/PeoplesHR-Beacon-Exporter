(async function(){
    const myHeaders = new Headers();
myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("content-type", "application/json; charset=UTF-8");

const raw = "{mode:\"multiple\",tableDump:\"true\",isDefault:\"0\" }";

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
const response = await fetch(`${reqOptions}Talent/TalentService/TalentService.asmx/getEligibilityGroup`, requestOptions)
 const data =  await response.json();
 const extract =  data.d ;
const queryString = extract.split('?')[1];
return queryString;

  
})