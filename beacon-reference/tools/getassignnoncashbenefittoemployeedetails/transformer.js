(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignNonCashBenifitEmployee.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  async function payload(url) {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")(url);

    if (updateurl.updateUrl) {
      return {
        pageUrl: updateurl.updateUrl,
        param: updateurl.updateParams
      }
    } else {
      return {
        pageUrl: url,
        param: "IsShowButtons=1"
      }
    }
  }

  const updateUrlData = await payload("EIM/AssignNonCashBenifitEmployee.aspx");

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const response = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });

  const detailsText = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(detailsText, "text/html");

  const empNumber = doc.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";
  window.pqn = empNumber;

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "");
  urlencoded.append("scrollTop", "");
  urlencoded.append("__EVENTTARGET", "GetSearchResult");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", viewStateGenerator);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00_body_grdavailable_ClientState", "");
  urlencoded.append("ctl00$body$hdnDateFormate", "m/d/yyyy");
  urlencoded.append("ctl00$body$txtempnumber", empNumber);

  const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  const textPost = await responsePost.text();
  const docPost = parser.parseFromString(textPost, "text/html");

  const viewState2 = docPost.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGen2 = docPost.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation2 = docPost.querySelector("#__EVENTVALIDATION")?.value || "";
  const publicKey = docPost.querySelector("#ctl00_body_txtPublicKey")?.value || "";

  const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(publicKey, args.id);

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewState2);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen2);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", eventValidation2);
  urlencoded2.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded2.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded2.append("ctl00$body$EmpSearch$hdnEmpNumber", args.id);
  urlencoded2.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded2.append("ctl00_body_grdavailable_ClientState", "");
  urlencoded2.append("ctl00$body$butEdit", "Edit");
  urlencoded2.append("ctl00$body$hdnDateFormate", "m/d/yyyy");
  urlencoded2.append("ctl00$body$txtPublicKey", publicKey);
  urlencoded2.append("ctl00$body$txtempnumber", empEnc);

  const finalResponse = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  });

  const finalText = await finalResponse.text();
  const docPost1 = parser.parseFromString(finalText, "text/html");

  window.assigned = {
    viewState3: docPost1.querySelector("#__VIEWSTATE")?.value || "",
    viewStateGen3: docPost1.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
    eventValidation3: docPost1.querySelector("#__EVENTVALIDATION")?.value || "",
    publicKey3: docPost1.querySelector("#ctl00_body_txtPublicKey")?.value || "",
    empEnc: empEnc
  };

  const nondeallocatedBenefits = [];
  const groupHeaders = docPost1.querySelectorAll(".GroupHeader_Default");

  groupHeaders.forEach(header => {
    const categoryText = header.querySelector("p")?.textContent.trim().replace("Category :", "").trim() || "";
    let nextRow = header.nextElementSibling;

    while (nextRow && (nextRow.classList.contains("GridRow_Default") || nextRow.classList.contains("GridAltRow_Default"))) {
      const cells = nextRow.querySelectorAll("td");
      nondeallocatedBenefits.push({
        category: categoryText,
        benefitName: cells[1]?.textContent.trim() || "",
        quantity: cells[2]?.textContent.trim() || ""
      });
      nextRow = nextRow.nextElementSibling;
      if (nextRow && nextRow.classList.contains("GroupHeader_Default")) break;
    }
  });

  const nonassignedBenefits = Array.from(
    docPost1.querySelectorAll("#ctl00_body_grdallocated tr")
  )
    .slice(1) // Skip header row
    .map((row) => {
      const cells = row.querySelectorAll("td");
      const editHref = cells[2]?.querySelector("a")?.getAttribute("href") || "";
      const editIdMatch = editHref.match(/__doPostBack\('([^']+)'/);
      return {
        benefitName: cells[0]?.textContent.trim() || "",
        quantity: cells[1]?.textContent.trim() || "",
        editId: editIdMatch ? editIdMatch[1] : null
      };
    });

  const empNum = docPost.querySelector("#ctl00_body_EmpSearch_txtEmpDisplayNumber").value || "";
  if (empNum === args.id) {
    return {
      nondeallocatedBenefits,
      nonassignedBenefits
    };
  } else {
    return "no employee is exist in this assigned non cash benefit."
  }
});
