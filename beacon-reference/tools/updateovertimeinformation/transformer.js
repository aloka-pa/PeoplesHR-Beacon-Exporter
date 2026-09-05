(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("TNA/OvertimeDefintion.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/OvertimeDefintion.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
    // details = await BeaconBar.executeFunction("getmodule")(url);
  } else {
    url = "TNA/OvertimeDefintion.aspx"
    // details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/dashboard`);
  }

  const parser = new DOMParser();
  const randomX = Math.floor(Math.random() * 10).toString();
  const randomY = Math.floor(Math.random() * 90 + 10).toString();

  const formData = async (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    if (!doc) {
      return {};
    }


    const data = {};
    const inputs = doc.querySelectorAll('input, select, textarea');

    inputs.forEach((el) => {
      const name = el.name;
      if (!name) return;

      if (el.tagName === 'SELECT') {
        const selected = el.querySelector('option[selected]');
        data[name] = selected ? selected.value : '';
      } else if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.hasAttribute('checked')) {
          data[name] = el.value;
        }
      } else {
        data[name] = el.value || '';
      }
    });

    return data;
  }

  const extractTableData = async (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const rows = doc.querySelectorAll('table#ctl00_body_grdsummary_ctl00 tbody tr');
    const jsonData = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const inputs = row.querySelectorAll('input');

      const rowData = {
        OTTypeName: cells[0]?.textContent.trim(),
        Multiplier: cells[1]?.textContent.trim(),
        BaseType: cells[2]?.textContent.trim(),
        RoundingRule: cells[3]?.textContent.trim(),
        InputNames: Array.from(inputs).map(input => input.name)
      };

      jsonData.push(rowData);
    });

    return jsonData;
  }


  function getSelectOptionsFromHTML(htmlString, selectId) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const selectElement = doc.getElementById(selectId);
    if (!selectElement) return {};

    const options = {};
    Array.from(selectElement.options).forEach(option => {
      options[option.textContent.trim()] = option.value;
    });

    return options;
  }

  function normalize(str) {
    return str?.toLowerCase().replace(/[^a-z0-9]/gi, '');
  }

  // if(args?.overtTimeName === args?.OTTypeName) {
  //   return "Current OTTypeName and new OTTypeName can not be same"
  // }






  const fetchOvertimeDefinitionPage = async () => {
    const reqOptionss = await BeaconBar.executeFunction('reqOptions')();
    try {
      const response = await fetch(`${reqOptionss}${url}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          "x-requested-with": "XMLHttpRequest"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const htmlText = await response.text();
      await BeaconBar.executeFunction("payload")("fetchOvertimeDefinitionPage", htmlText, false);
      return htmlText;
    } catch (error) {
    }
  }
  const overtimeDefinitionPage = await fetchOvertimeDefinitionPage();

  const overtimeDefinitionPageDetails = await extractTableData(overtimeDefinitionPage);
  const filtered = overtimeDefinitionPageDetails.filter(row =>
    normalize(row.OTTypeName) === normalize(args?.OTTypeName)
  );

  const postOvertimeDefinitionForm = async () => {
    const reqOptionss = await BeaconBar.executeFunction('reqOptions')();
    // const url = `${reqOptionss}${url}`;
    const renewpayload = JSON.parse(localStorage.getItem("fetchOvertimeDefinitionPage"));
    const inputName = filtered[0]?.InputNames?.find(id => id.includes('imgGRDEditButton'));
    if (!inputName) {
      return;
    }

    const payload = new URLSearchParams({
      'ctl00$main$RadScriptManager': `ctl00$body$UpdatePanel2|${filtered[0]?.InputNames[0]}`,
      'ctl00_main_RadScriptManager_HiddenField': '',
      '__EVENTTARGET': '',
      '__EVENTARGUMENT': '',
      '__LASTFOCUS': '',
      '__VIEWSTATE': renewpayload?.viewState,
      '__VIEWSTATEGENERATOR': renewpayload?.viewStateGenerator,
      '__VIEWSTATEENCRYPTED': '',
      '__EVENTVALIDATION': renewpayload?.eventValidation,
      'ctl00_main_RadWindowManager1_ClientState': '',
      'ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_OT Type Name': '',
      'ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_Multiplier': '',
      'ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox': '1',
      'ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState': '',
      'ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox': '10',
      'ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState': '',
      'ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl04$butDeleteGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl06$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl06$butDeleteGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl08$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl08$butDeleteGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl10$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl10$butDeleteGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl12$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl12$butDeleteGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl14$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl14$butDeleteGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl16$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl16$butDeleteGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl18$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl18$butDeleteGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl20$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl20$butDeleteGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl22$butEditGrid$isControlEnabled': 'True',
      'ctl00$body$grdsummary$ctl00$ctl22$butDeleteGrid$isControlEnabled': 'True',
      'ctl00_body_grdsummary_rfltMenu_ClientState': '',
      'ctl00_body_grdsummary_ClientState': '',
      'ctl00$action$ButtonPanel$butNew$isControlEnabled': 'True',
      'ctl00$hdnCulturDateFormat': 'M/d/yyyy',
      '__ASYNCPOST': 'true',
      [`${inputName}.x`]: randomX,
      [`${inputName}.y`]: randomY
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-MicrosoftAjax': 'Delta=true',
      'X-Requested-With': 'XMLHttpRequest'
    };

    try {
      const response = await fetch(`${reqOptionss}/${url}`, {
        method: 'POST',
        headers: headers,
        body: payload.toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.text();
      await BeaconBar.executeFunction("payload")("getOvertimeDefinitionForm", result, true);
      return result;
    } catch (error) {
    }
  }

  const getOvertimeDefinitionForm = await postOvertimeDefinitionForm();
  const beforeUpdate = await formData(getOvertimeDefinitionForm);
  const optionsJsonRounding = getSelectOptionsFromHTML(getOvertimeDefinitionForm, "ctl00_body_ddlOTRoundingPattern");
  const optionsJsonBaseType = getSelectOptionsFromHTML(getOvertimeDefinitionForm, "ctl00_body_ddlBaseType");

  const matchedRoudingKey = Object.keys(optionsJsonRounding).find(
    key => normalize(key) === normalize(args?.defaultRoundingPattern)
  );

  const matchedRoundingValue = matchedRoudingKey ? optionsJsonRounding[matchedRoudingKey] : null;

  const matchedBaseTypeKey = Object.keys(optionsJsonBaseType).find(
    key => normalize(key) === normalize(args?.baseType)
  );

  const matchedBaseTypeValue = matchedBaseTypeKey ? optionsJsonBaseType[matchedBaseTypeKey] : null;

  if (args?.defaultRoundingPattern && !matchedRoundingValue) {
    return "provided Rounding Rule not found in the list";
  }

  if (args?.baseType && !matchedBaseTypeValue) {
    return "provided Base Type not found in the list";
  }


  const saveOvertimeDefinition = async () => {
    const reqOptionss = await BeaconBar.executeFunction('reqOptions')();
    // const url = `${reqOptionss}${url}`;
    const renewpayload = JSON.parse(localStorage.getItem("getOvertimeDefinitionForm"));
    const payload = new URLSearchParams({
      'ctl00$main$RadScriptManager': 'ctl00$action$UpdatePanel3|ctl00$action$ButtonPanel$butSave$imgbtnSave',
      'ctl00_main_RadScriptManager_HiddenField': '',
      '__EVENTTARGET': '',
      '__EVENTARGUMENT': '',
      '__LASTFOCUS': '',
      'ctl00_main_RadWindowManager1_ClientState': '',
      'ctl00$body$txtOvertimeName': args?.overtTimeName ? args?.overtTimeName : beforeUpdate?.ctl00$body$txtOvertimeName,
      'ctl00$body$ddlOTRoundingPattern': matchedRoundingValue ? matchedRoundingValue : beforeUpdate?.ctl00$body$ddlOTRoundingPattern,
      'ctl00$body$ddlBaseType': matchedBaseTypeValue ? matchedBaseTypeValue : beforeUpdate?.ctl00$body$ddlBaseType,
      'ctl00$body$txtCustomMultiplier$txtUpDownValue': args?.customMultiplier ? args?.customMultiplier : beforeUpdate?.ctl00$body$txtCustomMultiplier$txtUpDownValue,
      'ctl00$action$ButtonPanel$butDelete$isControlEnabled': 'True',
      'ctl00$action$ButtonPanel$butReset$isControlEnabled': 'True',
      'ctl00$action$ButtonPanel$butSave$isControlEnabled': 'True',
      'ctl00$action$ButtonPanel$butSummary$isControlEnabled': 'True',
      'ctl00$hdnCulturDateFormat': 'M/d/yyyy',
      '__VIEWSTATE': renewpayload?.viewState,
      '__VIEWSTATEGENERATOR': renewpayload?.viewStateGenerator,
      '__EVENTVALIDATION': renewpayload?.eventValidation,
      'hiddenInputToUpdateATBuffer_CommonToolkitScripts': '1',
      '__VIEWSTATEENCRYPTED': '',
      '__ASYNCPOST': 'true',
      'ctl00$action$ButtonPanel$butSave$imgbtnSave': 'Save'
    });

    try {
      const response = await fetch(`${reqOptionss}/${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-MicrosoftAjax': 'Delta=true',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: payload.toString()
      });

      const text = await response.text();
      return text;

    } catch (err) {
    }
  }

  const updatedOvertimeDefinition = await saveOvertimeDefinition();
  const updatedHtml = parser.parseFromString(updatedOvertimeDefinition, "text/html");
  const updatedData = await formData(updatedHtml);

  return {
    updatedData,
    // "message": `Updated the details successfully for ${args?.overtTimeName}`
  };
})