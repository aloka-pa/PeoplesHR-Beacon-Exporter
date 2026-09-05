(async function (args) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("cache-control", "max-age=0");
  myHeaders.append("content-type", "application/x-www-form-urlencoded");

  // Shared data
  const rawEmployees = BeaconBar.getSharedData("employeesname"); // array of employees
  const viewStates = BeaconBar.getSharedData("finaloutputViewState");


const employeesNameId = rawEmployees.map((emp, i) => ({
  ...emp,
  rowIndex: i // ✅ starts at 0
}));

  // Parse selected indexes (string like "0,1" → ["0","1"])
  const selectedIndexes = args?.selectedIndexes
    ? args.selectedIndexes.split(",").map(num => num.trim())
    : employeesNameId.map(e => String(e.rowIndex)); // fallback → all employees

  const urlencoded = new URLSearchParams();

  // Add viewstate + form basics
  urlencoded.append("__EVENTTARGET", "");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__LASTFOCUS", "");
  urlencoded.append("__VIEWSTATE", viewStates.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", viewStates.viewStateGenerator);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", viewStates.eventValidation);
  urlencoded.append("RadWindowManager1_ClientState", "");
  urlencoded.append("TalentEmployeeSearch$ctl05$RadioButtonGroup1", viewStates.totalSubmit);
  urlencoded.append("TalentEmployeeSearch$ctl05$ctl14", "0");
  urlencoded.append("TalentEmployeeSearch$ctl05$ctl16", "");
  urlencoded.append("TalentEmployeeSearch$ctl05$ctl21", "");
  urlencoded.append("TalentEmployeeSearch$ctl05$ctl38", "Submit");

  // ✅ Dynamically add checkboxes using rowIndex
  selectedIndexes.forEach(idx => {
    const emp = employeesNameId.find(e => String(e.rowIndex) === idx);
    if (emp?.checkbox?.name) {
      urlencoded.append(emp.checkbox.name, "on");
    }
  });

  // Client state for Telerik
  const clientState = {
    selectedIndexes: selectedIndexes,
    reorderedColumns: [],
    expandedItems: [],
    expandedGroupItems: [],
    expandedFilterItems: [],
    deletedItems: [],
    popUpLocations: {},
    draggedItemsIndexes: []
  };

  urlencoded.append("TalentEmployeeSearch_ctl06_ClientState", JSON.stringify(clientState));

  // Request config
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  // Digest + Eligibility
  const eligibility = BeaconBar.getSharedData("eligibility");
  const digest = await BeaconBar.executeFunction("getDigest")(eligibility);
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();

  // Send request
  const response = await fetch(
    `${reqOptions}Talent/SearchDialog.aspx?${eligibility}&digest=${digest.digest}`,
    requestOptions
  );

  const data = await response.text();

  function extractViewState(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
  const comapanydetails = doc.querySelector("#body_hdnIsCompanyDetail")?.value || "";
  const eventarguement = doc.querySelector("#__EVENTARGUMENT")?.value || "";

  // Get the first script containing "Talent" in its src
  const talentScript = Array.from(doc.querySelectorAll("script[src]"))
    .map(s => s.getAttribute("src"))
    .find(src => src.includes("/Talent/") && src.includes("Telerik"));

  return {
    viewState,
    viewStateGenerator,
    eventValidation,
    comapanydetails,
    eventarguement,
    talentScript
  };
}
const utils = extractViewState(data);
BeaconBar.setSharedData("utils", utils)
  return data;
});
