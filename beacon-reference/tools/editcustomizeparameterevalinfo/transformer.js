(async function (data, args, reqOptions) {
  debugger;

  if (!BeaconBar.user.metaData.menus.includes("Perf/CompanyEvaluation.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const details = await BeaconBar.executeFunction("getApiListPerf")("CompanyEvaluation");

  const myHeaders = new Headers();
  myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
  myHeaders.append("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('Perf/CompanyEvaluation.aspx');
  let url;
  if (updateurl.updateUrl) {
    url = `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    url = `${window.origin}/${reqOptions.sl}/Perf/CompanyEvaluation.aspx`;
  }

  let currentViewState = details.viewState;
  let currentEventValidation = details.eventValidation;
  let currentViewStateGen = details.viewStateGen;
  let eventTarget = "";
  let evaluationFound = null;
  let doc;

  /* ---------------- FIND EVALUATION (PAGINATION) ---------------- */

  while (true) {
    const formData = new FormData();
    formData.append("scrollLeft", "0");
    formData.append("scrollTop", "0");
    formData.append("__EVENTTARGET", eventTarget);
    formData.append("__EVENTARGUMENT", "");
    formData.append("__VIEWSTATE", currentViewState);
    formData.append("__VIEWSTATEGENERATOR", currentViewStateGen);
    formData.append("__VIEWSTATEENCRYPTED", "");
    formData.append("__EVENTVALIDATION", currentEventValidation);

    const response = await fetch(url, {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow"
    });

    const html = await response.text();
    const parser = new DOMParser();
    doc = parser.parseFromString(html, "text/html");

    currentViewState = doc.querySelector("#__VIEWSTATE")?.value || currentViewState;
    currentEventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || currentEventValidation;
    currentViewStateGen = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || currentViewStateGen;

    const rows = doc.querySelectorAll("#grdsummary tbody tr");

    for (let row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 3) continue;

      if (cells[0].textContent.trim() === args.evaluationName) {
        const editHref = cells[2].querySelector("a")?.getAttribute("href") || "";
        const editTarget = editHref.match(/__doPostBack\('([^']+)'/)?.[1];
        evaluationFound = { editTarget };
        break;
      }
    }

    if (evaluationFound) break;

    const pageLinks = doc.querySelectorAll("#grdsummary a[href*='__doPostBack']");
    let nextFound = false;
    for (let link of pageLinks) {
      const txt = link.textContent.trim();
      if (txt && !isNaN(txt) && parseInt(txt) > 1) {
        eventTarget = link.getAttribute("href").match(/__doPostBack\('([^']+)'/)?.[1];
        nextFound = true;
        break;
      }
    }
    if (!nextFound) break;
  }

  if (!evaluationFound) {
    return { error: "Evaluation not found", evaluationName: args.evaluationName };
  }

  /* ---------------- CLICK EDIT ---------------- */

  let editForm = new FormData();
  editForm.append("scrollLeft", "0");
  editForm.append("scrollTop", "0");
  editForm.append("__EVENTTARGET", evaluationFound.editTarget);
  editForm.append("__EVENTARGUMENT", "");
  editForm.append("__VIEWSTATE", currentViewState);
  editForm.append("__VIEWSTATEGENERATOR", currentViewStateGen);
  editForm.append("__VIEWSTATEENCRYPTED", "");
  editForm.append("__EVENTVALIDATION", currentEventValidation);

  let editRes = await fetch(url, { method: "POST", headers: myHeaders, body: editForm });
  let editHtml = await editRes.text();
  let editDoc = new DOMParser().parseFromString(editHtml, "text/html");

  /* ---------------- ENABLE EDIT ---------------- */

  let enableEditForm = new FormData();
  enableEditForm.append("scrollLeft", "0");
  enableEditForm.append("scrollTop", "0");
  enableEditForm.append("__EVENTTARGET", "");
  enableEditForm.append("__EVENTARGUMENT", "");
  enableEditForm.append("__VIEWSTATE", editDoc.querySelector("#__VIEWSTATE").value);
  enableEditForm.append("__VIEWSTATEGENERATOR", editDoc.querySelector("#__VIEWSTATEGENERATOR").value);
  enableEditForm.append("__VIEWSTATEENCRYPTED", "");
  enableEditForm.append("__EVENTVALIDATION", editDoc.querySelector("#__EVENTVALIDATION").value);
  enableEditForm.append("cmdEdit", "Edit");

  let enableRes = await fetch(url, { method: "POST", headers: myHeaders, body: enableEditForm });
  let enableHtml = await enableRes.text();
  let enableDoc = new DOMParser().parseFromString(enableHtml, "text/html");

  /* ---------------- CUSTOMIZE PARAMETERS ---------------- */

  let paramForm = new FormData();
  paramForm.append("scrollLeft", "0");
  paramForm.append("scrollTop", "0");
  paramForm.append("__EVENTTARGET", "");
  paramForm.append("__EVENTARGUMENT", "");
  paramForm.append("__VIEWSTATE", enableDoc.querySelector("#__VIEWSTATE").value);
  paramForm.append("__VIEWSTATEGENERATOR", enableDoc.querySelector("#__VIEWSTATEGENERATOR").value);
  paramForm.append("__VIEWSTATEENCRYPTED", "");
  paramForm.append("__EVENTVALIDATION", enableDoc.querySelector("#__EVENTVALIDATION").value);
  paramForm.append("butParameter", "Customize Parameters");

  let paramRes = await fetch(url, { method: "POST", headers: myHeaders, body: paramForm });
  let paramHtml = await paramRes.text();
  let paramDoc = new DOMParser().parseFromString(paramHtml, "text/html");

  /* ---------------- UPDATE PARAMETERS ---------------- */

  const requested = {};
  args.parameterList.forEach(p => {
    requested[p.parameterName.trim()] = String(p.parameterValue);
  });

  const rows = paramDoc.querySelectorAll("#grdParameter tbody tr");

  for (let row of rows) {
    const cells = row.querySelectorAll("td");
    if (cells.length < 4) continue;

    const name = cells[0].textContent.trim();
    const currentValue = cells[2].querySelector("span")?.textContent.trim();

    if (!(name in requested)) continue;
    if (currentValue === requested[name]) continue;

    const editHref = cells[3].querySelector("a")?.getAttribute("href");
    const editTarget = editHref?.match(/__doPostBack\('([^']+)'/)?.[1];
    if (!editTarget) continue;

    /* Click parameter edit */
    let peForm = new FormData();
    peForm.append("scrollLeft", "0");
    peForm.append("scrollTop", "0");
    peForm.append("__EVENTTARGET", editTarget);
    peForm.append("__EVENTARGUMENT", "");
    peForm.append("__VIEWSTATE", paramDoc.querySelector("#__VIEWSTATE").value);
    peForm.append("__VIEWSTATEGENERATOR", paramDoc.querySelector("#__VIEWSTATEGENERATOR").value);
    peForm.append("__VIEWSTATEENCRYPTED", "");
    peForm.append("__EVENTVALIDATION", paramDoc.querySelector("#__EVENTVALIDATION").value);

    let peRes = await fetch(url, { method: "POST", headers: myHeaders, body: peForm });
    let peHtml = await peRes.text();
    let peDoc = new DOMParser().parseFromString(peHtml, "text/html");

    const chk = peDoc.querySelector("input[type='checkbox']");
    const okHref = peDoc.querySelector("img[alt='Save changes']")?.parentElement?.getAttribute("href");
    const okTarget = okHref?.match(/__doPostBack\('([^']+)'/)?.[1];
    if (!chk || !okTarget) continue;

    let saveForm = new FormData();
    saveForm.append("scrollLeft", "0");
    saveForm.append("scrollTop", "0");
    saveForm.append("__EVENTTARGET", okTarget);
    saveForm.append("__EVENTARGUMENT", "");
    saveForm.append("__VIEWSTATE", peDoc.querySelector("#__VIEWSTATE").value);
    saveForm.append("__VIEWSTATEGENERATOR", peDoc.querySelector("#__VIEWSTATEGENERATOR").value);
    saveForm.append("__VIEWSTATEENCRYPTED", "");
    saveForm.append("__EVENTVALIDATION", peDoc.querySelector("#__EVENTVALIDATION").value);

    if (requested[name] === "1") {
      saveForm.append(chk.name, "on");
    }

    let saveRes = await fetch(url, { method: "POST", headers: myHeaders, body: saveForm });
    let saveHtml = await saveRes.text();
    paramDoc = new DOMParser().parseFromString(saveHtml, "text/html");
  }

  return {
    success: true,
    evaluationName: args.evaluationName,
    updatedParameters: args.parameterList
  };
})();
