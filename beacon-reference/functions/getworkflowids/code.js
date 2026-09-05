(async function(){
        const reqOptions = BeaconBar.executeFunction("reqOptions")();

    const myHeaders = new Headers();
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("priority", "u=1, i");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};

const digest = BeaconBar.executeFunction("getDigest")('bs=4');
const response = await fetch(`${reqOptions}WorkFlowV5/Approval/Summary?bs=4&digest=${digest}`, requestOptions)
  const data = await response.text();
const extractModules = (htmlString) => {
  const doc = new DOMParser().parseFromString(htmlString, "text/html");
  const select = doc.querySelector("#selectWFModules");
  if (!select) return [];

  const options = select.querySelectorAll("option");
  const modules = [];

  options.forEach((opt) => {
    const [moduleId, workflowId] = opt.value.split(" _ ").map(v => v.trim());
    const name = opt.textContent.trim();

    if (moduleId === "0" || name.toLowerCase() === "all") return;

    modules.push({
      name,
      moduleId,
      workflowId,
    });
  });

  return modules;
};
const datas = extractModules(data);
  return datas
})