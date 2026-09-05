(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/ContractExtend.aspx?IsShowButtons=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  try {
    const myHeaders = new Headers({
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded"
    });
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

    const updateUrlData = await payload("EIM/ContractExtend.aspx?IsShowButtons=1");

    const id = BeaconBar.getSharedData('employeeid');
    const reqBase = await BeaconBar.executeFunction("reqOptions")();
    const digest = await BeaconBar.executeFunction('getDigest')("IsShowButtons=1");
    const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(window.contract.publickey, id);

    const formData1 = new URLSearchParams({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: window.contract.viewState,
      __VIEWSTATEGENERATOR: window.contract.viewStateGenerator,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.contract.eventValidation,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": id,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "9",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$body$butNew": "New",
      "ctl00$body$txtPublicKey": window.contract.publickey,
      "ctl00$body$txtempNo": empEnc
    });

    const response1 = await fetch(`${reqBase}${updateUrlData.pageUrl}&digest=${digest.digest}`, {
      method: "POST",
      headers: myHeaders,
      body: formData1,
      redirect: "follow"
    });

    const html1 = await response1.text();

    function extractViewState(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      return {
        viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
        viewStateGenerator: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
        eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || "",
        publickey: doc.querySelector('#ctl00_body_txtPublicKey')?.value || "",
        employeetext: doc.querySelector('#ctl00_body_txtempNo')?.value || "",
        currentContractTerminationDate: doc.querySelector("#ctl00_body_txtendDate")?.value || ""
      };
    }
    const viewStates = extractViewState(html1);
    //const empEnc2 = await BeaconBar.executeFunction("employeeEncryptId")(viewStates.publickey, viewStates.employeetext);
    const prevTerminationDate = new Date(viewStates.currentContractTerminationDate);
    const newCommencementDate = new Date(args.StartDate);

    if (newCommencementDate <= prevTerminationDate) {
      return `Contract Extension Commencement Date must be greater than the Previous Contract Extension Termination Date. Previous Contract Termination Date: ${viewStates.currentContractTerminationDate}`;
    }

    const formData2 = new URLSearchParams({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: viewStates.viewState,
      __VIEWSTATEGENERATOR: viewStates.viewStateGenerator,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: viewStates.eventValidation,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": id,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$txtCpStartDate": args.StartDate,
      "ctl00$body$txtCpEndDate": args.EndDate,
      "ctl00$body$butSave": "Save",
      "ctl00$body$txtPublicKey": viewStates.publickey,
      "ctl00$body$txtempNo": viewStates.employeetext
    });

    const response2 = await fetch(`${reqBase}${updateUrlData.pageUrl}&digest=${digest.digest}`, {
      method: "POST",
      headers: myHeaders,
      body: formData2,
      redirect: "follow"
    });

    const finalHtml = await response2.text();
    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(finalHtml, "text/html");

    const validation = parsedDoc.getElementById("ctl00_body_butNew");
  
    if (validation?.disabled) {
      return "Contract Extension Commencement Date must be greater than Previous Contract Extension Termination Date.";
    } else {
      return {
        message: "Successfully created",
        finalHtml
      };
    }

  } catch (error) {
    return {
      message: "Error occurred",
      error: error.message || error.toString()
    };
  }
});
