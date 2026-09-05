(async function() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("priority", "u=0, i");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}Talent/SelectLeadershipCandiddates.aspx?`, requestOptions);
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

  function extractReviewCycleData(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const reviewCycleDropdown = doc.getElementById('ctl00_body_ucCycleHeader_ddlReviewCycle');
    const reviewCycles = Array.from(reviewCycleDropdown?.options || []).map(option => ({
      value: option.value,
      label: option.text,
      selected: option.selected
    }));

    const startDate = doc.getElementById('ctl00_body_ucCycleHeader_lblStartDateCustom')?.innerText.trim();
    const feedbackCutoffDate = doc.getElementById('ctl00_body_ucCycleHeader_lblFeedBackCutOffDateCustom')?.innerText.trim();
    const endDate = doc.getElementById('ctl00_body_ucCycleHeader_lblEndDateCustom')?.innerText.trim();
    const reviewCutoffDate = doc.getElementById('ctl00_body_ucCycleHeader_lblReviewCutOffDateCustom')?.innerText.trim();

    const reviewCycleData = reviewCycles.map(cycle => ({
      ...cycle,
      dates: {
        startDate,
        feedbackCutoffDate,
        endDate,
        reviewCutoffDate
      }
    }));

    return reviewCycleData;
  }

  const extracted = extractViewState(data);
  BeaconBar.setSharedData('selectLeaderShipViewState', extracted);

  const reviewCycleData = extractReviewCycleData(data);
  return reviewCycleData;
})();
