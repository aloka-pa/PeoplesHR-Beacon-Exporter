(async function () {
  //done
  try {
    const headers = new Headers({
      "accept": "text/html, */*; q=0.01",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "priority": "u=1, i",
      "x-requested-with": "XMLHttpRequest"
    });

    const empInfo = await BeaconBar.executeFunction("callbackemp")();
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();

    const url = `${reqOptions}CommonComponents/Search/Search?` +
      new URLSearchParams({
        empNumber: empInfo.empNumber,
        callBack: empInfo.callBack,
        searchMode: "2",
        searchQueryMode: "all",
        searchQueryState: "activeonly",
        isMultiple: "1",
        breadCrumbEnable: "0",
        isDivLoading: "1"
      }).toString();

    const response = await fetch(url, {
      method: "GET",
      headers,
      redirect: "follow"
    });

    const htmlText = await response.text();

            const match = htmlText.match(/window\.advancedModelObj\s*=\s*(['"])(.*?)\1;/s);

            const datass = JSON.parse(match[2])
    return {EmpNumber : datass.EmpNumber , KeyValue: datass.KeyValue };


  } catch (error) {
    return null;
  }
});
