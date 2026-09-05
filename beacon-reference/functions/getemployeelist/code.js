(async function () {
  try {
    const headers = new Headers({
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "x-requested-with" : "XMLHttpRequest"
    });

    const payload = {
      empNumber: "MAAwADAAMAAwADIA",
      criteriaValues: [],
      key: "5faca355-fa62-4fff-9c88-e8f1554afc9d",
      modeId: "2",
      supEmpNumber: null,
      tblPageNo: 1,
      tblSearchText: "",
      sortColumn: "2",
      sortOrder: "asc"
    };

    const reqOptions = await BeaconBar.executeFunction('reqOptions')();
    const response = await fetch(`${reqOptions}CommonComponents/Search/GetSearchList/`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json = await response.json();
    return json?.Object?.data || [];
  } catch (error) {
    return [];
  }
})();
