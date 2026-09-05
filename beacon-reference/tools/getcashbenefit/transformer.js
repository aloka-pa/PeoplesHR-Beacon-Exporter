(async function (data, args, reqOptions) {

  debugger;
  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignCashBenifit.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  if (!args.salaryGradeCode) {
    return "The salary grade code was not found"
  }

  const details = await BeaconBar.executeFunction("getApiList")("AssignCashBenifit");
  const myHeaders = new Headers();
  myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/AssignCashBenifit.aspx');
  let url;
  if (updateurl.updateUrl) {
    url = `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    url = `${window.origin}/${reqOptions.sl}/EIM/AssignCashBenifit.aspx`;
  }

  const formData = new FormData();

  // Required WebForms fields
  formData.append("scrollLeft", "0");
  formData.append("scrollTop", "0");
  formData.append("__EVENTTARGET", "ctl00$body$dpsalGrsade");
  formData.append("__EVENTARGUMENT", "");
  formData.append("__VIEWSTATE", details.viewState);
  formData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
  formData.append("__VIEWSTATEENCRYPTED", "");
  formData.append("__EVENTVALIDATION", details.eventValidation);

  // Page-level hidden fields
  formData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  formData.append("ctl00$hdnQuickmenu", "1");

  // 🔥 Salary Grade dropdown (THIS is the important one)
  formData.append(
    "ctl00$body$dpsalGrsade",
    args.salaryGradeCode
  );

  const response = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: formData,
    redirect: "follow"
  });


  const htmlText = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  // Helper function to parse a table by its ID
  function parseBenefitsTable(tableId) {
    const table = doc.querySelector(`#${tableId} tbody`);
    if (!table) return [];

    const rows = table.querySelectorAll("tr");
    const benefits = [];

    // Skip the header row
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td");
      if (cells.length < 2) continue;

      const benefitName = cells[0].textContent.trim();

      // Some tables have <span> inside the 2nd cell
      const quantityCell = cells[1].querySelector("span");
      const quantity = quantityCell
        ? quantityCell.textContent.trim()
        : cells[1].textContent.trim();

      benefits.push({ benefitName, quantity });
    }

    return benefits;
  }

  // Get available and allocated benefits
  const availableBenefits = parseBenefitsTable("ctl00_body_grdavailable");
  const allocatedBenefits = parseBenefitsTable("ctl00_body_grdallocated");


  return {
    availableBenefits,
    allocatedBenefits
  }
})

