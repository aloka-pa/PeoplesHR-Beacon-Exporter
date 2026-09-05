(async function(args){
    const myHeaders = new Headers();
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const  digest = await BeaconBar.executeFunction("getDigest")(`mvc=1&bs=4&WFMainID=${args.WorkflowMainId}&Allowedit=0&CATID=0`);
const response = await fetch(`${reqOptions}AbsenceV9/LeaveApproval/LeaveApproval?mvc=1&bs=4&WFMainID=${args.WorkflowMainId}&Allowedit=0&CATID=0&digest=${digest.digest}`, requestOptions)
  const data = await  response.text()
function extractFromHTML(htmlString) {
  const result = {
    hiddenInputValue: null,
    modelApproval: null
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const inputElement = doc.getElementById('hdbAbsenceV9AFToken');
  if (inputElement) {
    result.hiddenInputValue = inputElement.value;
  }

  const scripts = doc.querySelectorAll('script');
  for (const script of scripts) {
    const match = script.textContent.match(/modelApproval\s*=\s*'([^']+)'/);
    if (match && match[1]) {
      try {
        result.modelApproval = JSON.parse(match[1]);
        break; 
      } catch (e) {
      }
    }
  }

  return result;
}

const datas = extractFromHTML(data)

  return datas ;
})
