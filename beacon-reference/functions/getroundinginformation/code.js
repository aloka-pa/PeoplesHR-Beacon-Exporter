(async function () {
  //done
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("priority", "u=1, i");
  myHeaders.append("x-requested-with", "XMLHttpRequest");
  myHeaders.append("referer", "https://devtest-echoengineers.phrsandbox.dev/hrb5/home/index");
  myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"137\", \"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"");
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append("sec-ch-ua-platform", "\"macOS\"");
  myHeaders.append("sec-fetch-dest", "empty");
  myHeaders.append("sec-fetch-mode", "cors");
  myHeaders.append("sec-fetch-site", "same-origin");
  myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36");
  myHeaders.append("Cookie", "filter=0; ASP.NET_SessionId=vhzhifhpcbjdfsnrt3olofej; __RequestVerificationToken_L2hyYjU1=dG4DJ1zhvTJbv6TqF2H7H5_Pxdj4ySWoTtDD-5M6BrbZI7XouRwjNsC_aFzrBe15FYeyjGBlgdBYbBuaf8cfJc8h0Wc1; THEME_V8=default; .ASPXAUTH=9ECA7154735E5F7608B29CA0E00574A524C38F080D275FD54A5F12D29FFBF5988FEB71987B744B3655DC1F8C4592822346B1791534DDDACD1560322209C31066D8C4C30A73DE44A14803039218D6EE4694B05EEAEBAE617A1C35FE6637156093; my-application-browser-tab={\"guid\":\"e71b573f-dbbb-e4f9-002d-fdf4f4d98452\",\"timestamp\":1749124393822}; ehrm85=EAAAAIw303Ki8+tR0X2mRniWqU8vHoPcRK4WxLjjM+mQ14E2jM6eM5cHsrxwBA9XDgEEuNkEuNL0zgpd0EskvS+n3qmnTVp+bb3VG+Jxy3Y3AXUSLbal82n4xwYOXH88W4W5xn4+6WLNoNvFgqM1o3P5D9oTAeWBKXt9lFHe5FntbtkQ2UVs8o/D95cX0mMFEtDlcNv32imTNfK/Rv1Yu/4Tqslv1rCrSL2Mo0jflLxY7W+8BCBAwVrRAEnzRkxbSS3h+APd1nhYwA1LjiJaHZgfvnOBDjWmx8O5ZHggtTQcMI38XGNdNqfEmW1xhj8sKR1I9/NAYhh51hBw1D2EzgRfjrp29rLhxHdVxKJVckWHsg6Lr8f21CkiugCy1/VaN0wDfJSIBff88Z0gwVOds1RmRfGCTfcUZ2fJAArBKisaFJ4MNScec7nXkYnb84jIXCnH6/QcdOQmvYYdAueIYdTLaXS1ak3y6L+LGu+WT8ehfgih3KQ52kLYm7apYufWLg0N6G1qYWdof1CjMHREkznJ468C3xsSHtlS9ca6dJxiMattENte3J94aS6XIuhgd0Q/c1uocFd6rVHM17lGxyc3q0MZbd3NlapsgFNqKvvvoOInFkJ2Yg3Lrz747El+Q/mCbQ7cL6D53gHju3GpOF0yTQQ3B94qFNqntiWhdaSxlPOon9LQNcMEzgP4M2ky7ch3PE6Oe0Sr6A8eZsBsOG4kX8Ksgn51q7lt+qiRGCefzl5J1hOyLIG28XZRfmQv8jpVzpVHo5TUE9mVdzi+NQa/EnlDMjJA+iKXm28wQ3iAcxW8eapTP4p6iOnYx0084cqouRUH/Tvln68Zd2sYJLl6fcOUBpDFmjid/ywTcTlYWzH6IGr3htFRWpouE/LYxLao8mpKb9+565PCHcmPWp9HJD7BW4C/m7MCOJ0vjKazd/zRxxZmBQYGvkF1j0FK8x5DhaBJH2dgUkOYKQlL+OxzsbP7bjpsWVnry1iC0NqZG+kl; ehrm85=EAAAAIw303Ki8+tR0X2mRniWqU8vHoPcRK4WxLjjM+mQ14E2jM6eM5cHsrxwBA9XDgEEuNkEuNL0zgpd0EskvS+n3qmnTVp+bb3VG+Jxy3Y3AXUSLbal82n4xwYOXH88W4W5xn4+6WLNoNvFgqM1o3P5D9oTAeWBKXt9lFHe5FntbtkQ2UVs8o/D95cX0mMFEtDlcNv32imTNfK/Rv1Yu/4Tqslv1rCrSL2Mo0jflLxY7W+8BCBAwVrRAEnzRkxbSS3h+APd1nhYwA1LjiJaHZgfvnOBDjWmx8O5ZHggtTQcMI38XGNdNqfEmW1xhj8sKR1I9/NAYhh51hBw1D2EzgRfjrp29rLhxHdVxKJVckWHsg6Lr8f21CkiugCy1/VaN0wDfJSIBff88Z0gwVOds1RmRfGCTfcUZ2fJAArBKisaFJ4MNScec7nXkYnb84jIXCnH6/QcdOQmvYYdAueIYdTLaXS1ak3y6L+LGu+WT8ehfgih3KQ52kLYm7apYufWLg0N6G1qYWdof1CjMHREkznJ468C3xsSHtlS9ca6dJxiMattENte3J94aS6XIuhgd0Q/c1uocFd6rVHM17lGxyc3q0MZbd3NlapsgFNqKvvvoOInFkJ2Yg3Lrz747El+Q/mCbQ7cL6D53gHju3GpOF0yTQQ3B94qFNqntiWhdaSxlPOon9LQNcMEzgP4M2ky7ch3PE6Oe0Sr6A8eZsBsOG4kX8Ksgn51q7lt+qiRGCefzl5J1hOyLIG28XZRfmQv8jpVzpVHo5TUE9mVdzi+NQa/EnlDMjJA+iKXm28wQ3iAcxW8eapTP4p6iOnYx0084cqouRUH/Tvln68Zd2sYJLl6fcOUBpDFmjid/ywTcTlYWzH6IGr3htFRWpouE/LYxLao8mpKb9+565PCHcmPWp9HJD7BW4C/m7MCOJ0vjKazd/zRxxZmBQYGvkF1j0FK8x5DhaBJH2dgUkOYKQlL+OxzsbP7bjpsWVnry1iC0NqZG+kl");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}TNA/RoundingInformation.aspx`, requestOptions)
  const data = await response.text();
  function extractViewState(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    return {
      viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
      viewStateGenerator: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
      eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || "",
      SupervisorEmpNumber: doc.querySelector("#body_hdnSupervisorEmpNumber")?.value || "",
      comapanydetails: doc.querySelector("#body_hdnIsCompanyDetail")?.value || "",
      eventarguement: doc.querySelector("#__EVENTARGUMENT")?.value || "",
      talentemployee: doc.querySelector("#TalentEmployeeSearch_ctl05_ctl07")?.value || "",
      searchCreteria: doc.querySelector('#TalentEmployeeSearch_ctl05_ctl19')?.value || ""
    };
  }

  function extractTableDataWithViewState(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract the view state once
    const viewStateData = extractViewState(htmlString);

    const rows = doc.querySelectorAll('tbody tr');
    const result = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const code = cells[0]?.textContent.trim();
      const name = cells[1]?.textContent.trim();
      const type = cells[2]?.textContent.trim();

      const editImage = row.querySelector('input[type="image"][id*="butEditGrid_imgGRDEditButton"]');
      const eventKey = editImage?.getAttribute('name');

      if (code && name && type && eventKey) {
        result.push({
          code,
          name,
          type,
          eventKey,
          ...viewStateData  // Spread the view state data into each row
        });
      }
    });

    return result;
  }

  const dtas = extractTableDataWithViewState(data);

  return dtas;

})