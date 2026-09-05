(async function () {
  //done
  try {
    const myHeaders = new Headers({
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    });

    const data = await BeaconBar.executeFunction('getemployeeUtils')();
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();

    const fetchPage = async (pageNo) => {
      const payload = {
        empNumber: data.EmpNumber,
        criteriaValues: [],
        key: data.KeyValue,
        modeId: "2",
        supEmpNumber: null,
        tblPageNo: pageNo,
        tblSearchText: "",
        sortColumn: "2",
        sortOrder: "asc"
      };

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(payload),
        redirect: "follow"
      };

      const response = await fetch(`${reqOptions}CommonComponents/Search/GetSearchList/`, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      const simplified = result.Object.data.map(item => ({
        empCode: item.Col1,
        empName: item.Col2,
        dob: item.Col3
      }));

      return {
        data: simplified,
        totalPages: result._pageData.TotalPages
      };
    };

    const firstPage = await fetchPage(1);
    let allResults = [...firstPage.data];
    if (firstPage.totalPages > 1) {
      for (let page = 2; page <= firstPage.totalPages; page++) {
        const nextPage = await fetchPage(page);
        allResults = allResults.concat(nextPage.data);
      }
    }
    BeaconBar.setSharedData("utils", data);
    return allResults;

  } catch (error) {
    return null;
  }
})();
