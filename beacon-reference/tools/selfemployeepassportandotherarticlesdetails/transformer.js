(async function (data, args, reqOptions) {
  function parseDotNetDate(dotNetDateStr) {
    const match = /\/Date\((\d+)\)\//.exec(dotNetDateStr);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      const date = new Date(timestamp);

      // Format as dd/MM/yyyy
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    }
    return null;
  }

  if (BeaconBar.user.metaData.role === "sshr") {
    const url = await BeaconBar.executeFunction("updateUrlParams")("EIMV9/PassportDetails/PassportDetails?mvc=1&subordinate=0");
    const digest = await BeaconBar.executeFunction("getDigest")(url.updateParams);

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const response = await fetch(`${location.origin}/${reqOptions.sl}/${url.updateUrl}&digest=${digest.digest}&_=${Date.now()}`, {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    });

    const details = await response.text();
    const match = details.match(/var\s+modelPassport\s*=\s*(\{[\s\S]*?\});/);
    if (!match) throw new Error("modelPassport not found in response");
    const passport = JSON.parse(match[1]);

    return passport.PassportList.map(x => ({
      passportandOtherArticles: x.IdentityName,
      documentNo: x.PassportNumber,
      articleSubcategory: x.VisaType,
      countryOfOrigin: x.CountryName,
      noOfEntries: x.NumberOfEntries,
      placeOfIssue: x.IssedPlace,
      dateOfIssue: parseDotNetDate(x.IssedDate),
      dateOfExpiry: parseDotNetDate(x.ExpireDate),
      comments: x.Comment
    }));
  }
  else if (BeaconBar.user.metaData.role === "ehrm") {
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/EIM/AssignPassport.aspx`, requestOptions);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
    const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
    const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
    const publicKey = doc.querySelector("#ctl00_body_txtPublicKey")?.value || ""; // fixed selector (was missing #)

    const empNum = BeaconBar.user.metaData.empDisplayNo;
    await BeaconBar.executeFunction("censusInformation")(empNum);

    const urlencoded = new URLSearchParams();
    urlencoded.append("scrollLeft", "");
    urlencoded.append("scrollTop", "");
    urlencoded.append("__EVENTTARGET", "GetSearchResult");
    urlencoded.append("__EVENTARGUMENT", "");
    urlencoded.append("__VIEWSTATE", viewState);
    urlencoded.append("__VIEWSTATEGENERATOR", viewStateGenerator);
    urlencoded.append("__VIEWSTATEENCRYPTED", "");
    urlencoded.append("__EVENTVALIDATION", eventValidation);
    urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded.append("ctl00$hdnQuickmenu", "1");
    urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
    urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNum);
    urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
    urlencoded.append("ctl00$body$grdPassport$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded.append("ctl00_body_grdPassport_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded.append("ctl00$body$grdPassport$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    urlencoded.append("ctl00_body_grdPassport_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded.append("ctl00_body_grdPassport_ClientState", "");
    urlencoded.append("ctl00$body$txtPublicKey", publicKey);
    urlencoded.append("ctl00$body$txtpassport", "");
    urlencoded.append("ctl00$body$txtempnumber", empNum);

    const requestOptionsPost = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    };

    const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/EIM/AssignPassport.aspx`, requestOptionsPost);
    const textPost = await responsePost.text();
    const docPost = parser.parseFromString(textPost, "text/html");
    const tbody = docPost.querySelector("tbody");
    const result = [];

    let currentCategory = null;

    // Loop through all rows
    tbody.querySelectorAll("tr").forEach(row => {
      // 1️⃣ Check if this is a category header row
      if (row.classList.contains("GroupHeader_Default")) {
        const text = row.textContent.trim();
        const match = text.match(/Article Category:\s*(.*)/i);
        if (match) {
          currentCategory = match[1].trim();
        }
      }

      // 2️⃣ Check if this is a data row (GridRow_Default or GridAltRow_Default)
      else if (
        row.classList.contains("GridRow_Default") ||
        row.classList.contains("GridAltRow_Default")
      ) {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 6) {
          result.push({
            "Article Category": currentCategory || "",
            "Document No": cells[2].textContent.trim(),
            "Country of Origin": cells[3].textContent.trim(),
            "Date of Issue": cells[4].textContent.trim(),
            "Date of Expiry": cells[5].textContent.trim()
          });
        }
      }
    });

    return result;
  }
});
