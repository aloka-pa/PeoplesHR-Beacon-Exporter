(async function (data, args, reqOptions) {
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


  if (args.updateType === "educationalAndProfessionalQualifications") {
    const updateUrlData = await payload("EIM/AssignQualification.aspx?IsShowButtons=1");

    const digest = await BeaconBar.executeFunction('getDigest')(updateUrlData.param);
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB');
    if (args.educationalAndProfessionalQualifications.skipType === "skip") {
      const requestParams = {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __LASTFOCUS: "",
        __VIEWSTATE: window.qualification.viewState,
        __VIEWSTATEGENERATOR: window.qualification.viewStateGenerator,
        __SCROLLPOSITIONX: "0",
        __SCROLLPOSITIONY: "0",
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: window.qualification.eventValidation,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.educationalAndProfessionalQualifications.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$cboQaType": args.educationalAndProfessionalQualifications.qualificationTypeId || "",
        // args.educationalAndProfessionalQualifications.qualificationId || ""
        "ctl00$body$cboQa": args.educationalAndProfessionalQualifications.qualificationId || "",
        "ctl00$body$txtschinData": "",
        "ctl00$body$cboStatus": "-1",
        "ctl00$body$optJobRelative": args.educationalAndProfessionalQualifications.jobRelated || "",
        "ctl00$body$nuQualDuration": "",
        "ctl00$body$dpDurationType": args.educationalAndProfessionalQualifications.durationType || "",
        "ctl00$body$txtYear": args.educationalAndProfessionalQualifications.yearOfPassing || "",
        "ctl00$body$txtComment": "",
        "ctl00$body$nuTotalCost": args.educationalAndProfessionalQualifications.totalCost || "",
        "ctl00$body$dpCurrTotalCost": args.educationalAndProfessionalQualifications.currencyForTotalCost || "000081",
        "ctl00$body$txtStartdate": args.educationalAndProfessionalQualifications.CostEffectDate,
        "ctl00$body$nuReimbursed": args.educationalAndProfessionalQualifications.reimbursedAmount || "",
        "ctl00$body$dpCurrReimbursed": args.educationalAndProfessionalQualifications.currencyForReimbursement || "000081",
        "ctl00$body$txtEndDate": args.educationalAndProfessionalQualifications.reimbursementEffectDate,
        "ctl00_body_grdUserDefine_ClientState": "",
        "ctl00$body$grdQualification$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdQualification_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdQualification$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
        "ctl00_body_grdQualification_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdQualification_ClientState": "",
        "ctl00$body$grdTND$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdTND_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdTND$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
        "ctl00_body_grdTND_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdTND_ClientState": "",
        "ctl00$body$lblIsHavingTND": "True",
        "ctl00$body$txtPublicKey": window.view.publicKey,
        "ctl00$body$txtempnumber": window.view.empEncId
      };

      if (window.uqlDates.qualificationEffectStartDate) {
        requestParams["ctl00$body$txtQalStDate"] = window.uqlDates.qualificationEffectStartDate
        requestParams["ctl00$body$txtQalEndDate"] = window.uqlDates.qualificationEffectEndDate
      }

      requestParams["ctl00$body$cboStatus"] = args.educationalAndProfessionalQualifications.qualificationStatus;
      requestParams["ctl00$body$txtschinData"] = args.educationalAndProfessionalQualifications.institutionName;
      requestParams["ctl00$body$butSave"] = "Add to Grid";


      const addTOGrid = await BeaconBar.executeFunction('module')(requestParams, `${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`);
      const second = await BeaconBar.executeFunction('getDomExtract')(addTOGrid.rawData);

      requestParams.__VIEWSTATE = second.viewState;
      requestParams.__EVENTTARGET = "";
      requestParams.__VIEWSTATEGENERATOR = second.viewStateGen;
      requestParams.__EVENTVALIDATION = second.eventValidation;
      requestParams["ctl00$body$dpCurrTotalCost"] = "000112";
      requestParams["ctl00$body$dpCurrReimbursed"] = "000112";
      requestParams["ctl00$body$txtStartdate"] = formattedDate;
      requestParams["ctl00$body$txtEndDate"] = formattedDate;
      requestParams["ctl00$body$butSave1"] = "Save";
      requestParams["ctl00$body$cboQaType"] = "-1";
      requestParams["ctl00$body$cboQa"] = "-1";
      requestParams["ctl00$body$cboStatus"] = "-1";
      requestParams["ctl00$body$nuQualDuration"] = "";
      requestParams["ctl00$body$txtYear"] = "";
      requestParams["ctl00$body$txtComment"] = "";
      requestParams["ctl00$body$nuTotalCost"] = "";
      requestParams["ctl00$body$nuReimbursed"] = "";
      requestParams["ctl00$body$txtschinData"] = "";
      delete requestParams["ctl00$body$txtQalStDate"];
      delete requestParams["ctl00$body$txtQalEndDate"];
      delete requestParams["ctl00$body$chkHighest"];
      delete requestParams["ctl00$body$butSave"];

      const saveResponse = await BeaconBar.executeFunction('module')(requestParams, `${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`);
      const parser = new DOMParser();
      const doc = parser.parseFromString(saveResponse.rawData, 'text/html');

      const updateQualifications = Array.from(doc.querySelectorAll("#ctl00_body_grdQualification_ctl00 tbody tr")).map(row => {
        const columns = row.querySelectorAll("td");
        const editAnchor = columns[7]?.querySelector("a[href*='__doPostBack']");
        const postbackMatch = editAnchor?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/);
        const postbackId = postbackMatch ? postbackMatch[1] : "";

        return {
          "Qualification Type": columns[0]?.textContent.trim() || "",
          "Qualification": columns[1]?.textContent.trim() || "",
          "School/Institute": columns[2]?.textContent.trim() || "",
          "Year of Qualification": columns[3]?.textContent.trim() || "",
          "Status": columns[4]?.textContent.trim() || "",
          "Qualification Effective Start Date": columns[5]?.textContent.trim() || "",
          "Qualification Effective End Date": columns[6]?.textContent.trim() || "",
          "Edit Postback ID": postbackId
        };
      });

      if (saveResponse.Status === 200) {
        return updateQualifications;
      } else {
        return "not update for educational given details api error"
      }
    } else {
      const requestParams = {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "ctl00$body$cboQa",
        __EVENTARGUMENT: "",
        __LASTFOCUS: "",
        __VIEWSTATE: window.qualification.viewState,
        __VIEWSTATEGENERATOR: window.qualification.viewStateGen,
        __SCROLLPOSITIONX: "0",
        __SCROLLPOSITIONY: "0",
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: window.qualification.eventValidation,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.educationalAndProfessionalQualifications.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$cboQaType": args.educationalAndProfessionalQualifications.qualificationTypeId || "",
        // args.educationalAndProfessionalQualifications.qualificationId || ""
        "ctl00$body$cboQa": args.educationalAndProfessionalQualifications.qualificationId || "",
        "ctl00$body$txtschinData": "",
        "ctl00$body$cboStatus": "-1",
        "ctl00$body$optJobRelative": args.educationalAndProfessionalQualifications.jobRelated || "",
        "ctl00$body$nuQualDuration": "",
        "ctl00$body$dpDurationType": args.educationalAndProfessionalQualifications.durationType || "",
        "ctl00$body$txtYear": args.educationalAndProfessionalQualifications.yearOfPassing || "",
        "ctl00$body$txtComment": args.educationalAndProfessionalQualifications.comments || "",
        "ctl00$body$nuTotalCost": args.educationalAndProfessionalQualifications.totalCost || "",
        "ctl00$body$dpCurrTotalCost": args.educationalAndProfessionalQualifications.currencyForTotalCost || "000081",
        "ctl00$body$txtStartdate": args.educationalAndProfessionalQualifications.CostEffectDate,
        "ctl00$body$nuReimbursed": args.educationalAndProfessionalQualifications.reimbursedAmount || "",
        "ctl00$body$dpCurrReimbursed": args.educationalAndProfessionalQualifications.currencyForReimbursement || "000081",
        "ctl00$body$txtEndDate": args.educationalAndProfessionalQualifications.reimbursementEffectDate,
        "ctl00_body_grdUserDefine_ClientState": "",
        "ctl00$body$grdQualification$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdQualification_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdQualification$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
        "ctl00_body_grdQualification_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdQualification_ClientState": "",
        "ctl00$body$grdTND$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdTND_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdTND$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
        "ctl00_body_grdTND_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdTND_ClientState": "",
        "ctl00$body$lblIsHavingTND": "True",
        "ctl00$body$txtPublicKey": window.view.publicKey,
        "ctl00$body$txtempnumber": window.view.empEncId
      };


      if (args.educationalAndProfessionalQualifications.highestQualification === "on") {
        requestParams["ctl00$body$chkHighest"] = "on";
      }

      if (args.educationalAndProfessionalQualifications.qualificationEffectStartDate) {
        requestParams["ctl00$body$txtQalStDate"] = args.educationalAndProfessionalQualifications.qualificationEffectStartDate
        requestParams["ctl00$body$txtQalEndDate"] = args.educationalAndProfessionalQualifications.qualificationEffectEndDate
      }

      const editResponse = await BeaconBar.executeFunction('module')(requestParams, `${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`);
      const first = await BeaconBar.executeFunction('getDomExtract')(editResponse.rawData);

      requestParams.__VIEWSTATE = first.viewState;
      requestParams.__EVENTTARGET = "";
      requestParams.__VIEWSTATEGENERATOR = first.viewStateGen;
      requestParams.__EVENTVALIDATION = first.eventValidation;
      requestParams["ctl00$body$cboStatus"] = args.educationalAndProfessionalQualifications.qualificationStatus;
      requestParams["ctl00$body$txtschinData"] = args.educationalAndProfessionalQualifications.institutionName;
      requestParams["ctl00$body$butSave"] = "Add to Grid";


      const addTOGrid = await BeaconBar.executeFunction('module')(requestParams, `${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`);
      const second = await BeaconBar.executeFunction('getDomExtract')(addTOGrid.rawData);

      requestParams.__VIEWSTATE = second.viewState;
      requestParams.__EVENTTARGET = "";
      requestParams.__VIEWSTATEGENERATOR = second.viewStateGen;
      requestParams.__EVENTVALIDATION = second.eventValidation;
      requestParams["ctl00$body$butSave1"] = "Save";
      requestParams["ctl00$body$cboQaType"] = "-1";
      requestParams["ctl00$body$cboQa"] = "-1";
      requestParams["ctl00$body$cboStatus"] = "-1";
      requestParams["ctl00$body$nuQualDuration"] = "";
      requestParams["ctl00$body$txtYear"] = "";
      requestParams["ctl00$body$txtComment"] = "";
      requestParams["ctl00$body$nuTotalCost"] = "";
      requestParams["ctl00$body$nuReimbursed"] = "";
      requestParams["ctl00$body$txtschinData"] = "";
      delete requestParams["ctl00$body$txtQalStDate"];
      delete requestParams["ctl00$body$txtQalEndDate"];
      delete requestParams["ctl00$body$chkHighest"];
      delete requestParams["ctl00$body$butSave"];

      const saveResponse = await BeaconBar.executeFunction('module')(requestParams, `${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`);
      const parser = new DOMParser();
      const doc = parser.parseFromString(saveResponse.rawData, 'text/html');

      const updateQualifications = Array.from(doc.querySelectorAll("#ctl00_body_grdQualification_ctl00 tbody tr")).map(row => {
        const columns = row.querySelectorAll("td");
        const editAnchor = columns[7]?.querySelector("a[href*='__doPostBack']");
        const postbackMatch = editAnchor?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/);
        const postbackId = postbackMatch ? postbackMatch[1] : "";

        return {
          "Qualification Type": columns[0]?.textContent.trim() || "",
          "Qualification": columns[1]?.textContent.trim() || "",
          "School/Institute": columns[2]?.textContent.trim() || "",
          "Year of Qualification": columns[3]?.textContent.trim() || "",
          "Status": columns[4]?.textContent.trim() || "",
          "Qualification Effective Start Date": columns[5]?.textContent.trim() || "",
          "Qualification Effective End Date": columns[6]?.textContent.trim() || "",
          "Edit Postback ID": postbackId
        };
      });

      if (saveResponse.Status === 200) {
        return updateQualifications;
      } else {
        return "not update for educational given details api error"
      }
    }

  }

  if (args.updateType === "workExperienceDetails") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/WorkExperience.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateUrlData = await payload("EIM/WorkExperience.aspx");

    let viewst = window.view1.viewState;
    let viewstgen = window.view1.viewStateGen;
    let event = window.view1.eventValidation
    if (args.workExperienceDetails.category === "External") {
      const editResponse = await BeaconBar.executeFunction('module')({
        "scrollLeft": "0",
        "scrollTop": "0",
        "__EVENTTARGET": "ctl00$body$txtconpname",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": viewst,
        "__VIEWSTATEGENERATOR": viewstgen,
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": event,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.workExperienceDetails.employeeNumber || "",
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$radInternal": "0",
        "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
        "ctl00$body$txtempNo": window.view.empEncId,
        "ctl00$body$txtperemail": window.empEnc,
        "ctl00$body$txtconpname": args.workExperienceDetails.companyname || "",
        "ctl00$body$hdncompname": "PeoplesHR",
        "ctl00$body$txtStartDate": args.workExperienceDetails.startDate || "",
        "ctl00$body$txtEndDate": args.workExperienceDetails.endDate || "",
        "ctl00$body$txtconfDate": args.workExperienceDetails.confirmationDate || "",
        "ctl00$body$txtcontact": "",
        "ctl00$body$txtDept": "",
        "ctl00$body$txtposition": args.workExperienceDetails.position || "",
        "ctl00$body$txtreason": "",
        "ctl00$body$txtSalaryonleave": "",
        "ctl00$body$txtbenifitesonleave": args.workExperienceDetails.benefitsofLiving || "",
        "ctl00$body$txtaddress": args.workExperienceDetails.companyAddress || "",
        "ctl00$body$nutel": "",
        "ctl00$body$txtemail": "",
        "ctl00$body$txtresp": args.workExperienceDetails.responsibilities || "",
        "ctl00$body$txtachv": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdGrade1_ClientState": "",
        "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
      }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

      viewst = editResponse.viewState;
      viewstgen = editResponse.viewStateGen;
      event = editResponse.eventValidation;

      const emailEnc = await BeaconBar.executeFunction("employeeEncryptId")(window.view1.publicKey, window.emailId);
      const editResponse3 = await BeaconBar.executeFunction('module')({
        "scrollLeft": "0",
        "scrollTop": "0",
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": viewst,
        "__VIEWSTATEGENERATOR": viewstgen,
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": event,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.workExperienceDetails.employeeNumber || "",
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$radInternal": "0",
        "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
        "ctl00$body$txtempNo": window.view.empEncId,
        "ctl00$body$txtperemail": emailEnc,
        "ctl00$body$txtconpname": args.workExperienceDetails.companyname || "",
        "ctl00$body$hdncompname": "PeoplesHR",
        "ctl00$body$txtStartDate": args.workExperienceDetails.startDate || "",
        "ctl00$body$txtEndDate": args.workExperienceDetails.endDate || "",
        "ctl00$body$txtconfDate": args.workExperienceDetails.confirmationDate || "",
        "ctl00$body$txtcontact": "",
        "ctl00$body$txtDept": "",
        "ctl00$body$txtposition": args.workExperienceDetails.position || "",
        "ctl00$body$txtreason": "",
        "ctl00$body$txtSalaryonleave": "",
        "ctl00$body$txtbenifitesonleave": args.workExperienceDetails.benefitsofLiving || "",
        "ctl00$body$txtaddress": args.workExperienceDetails.companyAddress || "",
        "ctl00$body$nutel": "",
        "ctl00$body$txtemail": "",
        "ctl00$body$txtresp": args.workExperienceDetails.responsibilities || "",
        "ctl00$body$txtachv": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdGrade1_ClientState": "",
        "ctl00$body$butAdd": "ADD",
        "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
      }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

      const editResponse4 = await BeaconBar.executeFunction('module')({
        "scrollLeft": "0",
        "scrollTop": "0",
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": editResponse3.viewState,
        "__VIEWSTATEGENERATOR": editResponse3.viewStateGen,
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": editResponse3.eventValidation,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.workExperienceDetails.employeeNumber || "",
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$radInternal": "0",
        "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
        "ctl00$body$txtempNo": window.view.empEncId,
        "ctl00$body$txtperemail": emailEnc,
        "ctl00$body$txtconpname": "",
        "ctl00$body$hdncompname": "PeoplesHR",
        "ctl00$body$txtStartDate": "",
        "ctl00$body$txtEndDate": "",
        "ctl00$body$txtconfDate": "",
        "ctl00$body$txtcontact": "",
        "ctl00$body$txtDept": "",
        "ctl00$body$txtposition": "",
        "ctl00$body$txtreason": "",
        "ctl00$body$txtSalaryonleave": "",
        "ctl00$body$txtbenifitesonleave": "",
        "ctl00$body$txtaddress": "",
        "ctl00$body$nutel": "",
        "ctl00$body$txtemail": "",
        "ctl00$body$txtresp": "",
        "ctl00$body$txtachv": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdGrade1_ClientState": "",
        "ctl00$body$butSave": "Save",
        "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
      }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

      const parser = new DOMParser();
      const docPost = parser.parseFromString(editResponse4.rawData, "text/html");

      const category = docPost.querySelector(".GroupHeader_Default p")?.textContent.trim().replace("Category :", "").trim() || "";
      const rows = docPost.querySelectorAll(".GridRow_Default");
      const updateworkExperience = Array.from(rows).map(row => {
        const cells = row.querySelectorAll("td");

        return {
          fromDate: cells[1]?.textContent.trim() || "",
          toDate: cells[2]?.textContent.trim() || "",
          companyName: cells[3]?.textContent.trim() || "",
          functionalTitle: cells[4]?.textContent.trim() || "",
          noOfYears: cells[5]?.textContent.trim() || "",
          noOfMonths: cells[6]?.textContent.trim() || "",
          category: category
        };
      });
      return updateworkExperience;
    } else if (args.workExperienceDetails.startDateType === "updateStartDate") {
      const editResponse1 = await BeaconBar.executeFunction('module')({
        "scrollLeft": "0",
        "scrollTop": "0",
        "__EVENTTARGET": "ctl00$body$txtStartDate",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": viewst,
        "__VIEWSTATEGENERATOR": viewstgen,
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": event,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.workExperienceDetails.employeeNumber || "",
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$radInternal": "0",
        "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
        "ctl00$body$txtempNo": window.view.empEncId,
        "ctl00$body$txtperemail": "",
        "ctl00$body$txtconpname": args.workExperienceDetails.companyname || "",
        "ctl00$body$hdncompname": "PeoplesHR",
        "ctl00$body$chkworkrelated": args.workExperienceDetails.isWorkRelated || "",
        "ctl00$body$txtStartDate": args.workExperienceDetails.startDate || "",
        "ctl00$body$txtEndDate": args.workExperienceDetails.endDate || "",
        "ctl00$body$txtconfDate": args.workExperienceDetails.confirmationDate || "",
        "ctl00$body$txtcontact": args.workExperienceDetails.contactPerson || "",
        "ctl00$body$txtDept": args.workExperienceDetails.department || "",
        "ctl00$body$txtposition": args.workExperienceDetails.position || "",
        "ctl00$body$txtreason": args.workExperienceDetails.reasonForLeaving || "",
        "ctl00$body$txtSalaryonleave": args.workExperienceDetails.salaryAllowanceLeaving || "",
        "ctl00$body$txtbenifitesonleave": args.workExperienceDetails.benefitsofLiving || "",
        "ctl00$body$txtaddress": args.workExperienceDetails.companyAddress || "",
        "ctl00$body$nutel": args.workExperienceDetails.contactNumber || "",
        "ctl00$body$txtemail": "",
        "ctl00$body$txtresp": args.workExperienceDetails.responsibilities || "",
        "ctl00$body$txtachv": args.workExperienceDetails.achievements || "",
        "ctl00$body$chkBenefit": args.workExperienceDetails.hasBenefits || "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdGrade1_ClientState": "",
        "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
      }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

      viewst = editResponse1.viewState;
      viewstgen = editResponse1.viewStateGen;
      event = editResponse1.eventValidation;

      const emailEnc = await BeaconBar.executeFunction("employeeEncryptId")(window.view1.publicKey, window.emailId);
      const editResponse3 = await BeaconBar.executeFunction('module')({
        "scrollLeft": "0",
        "scrollTop": "0",
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": viewst,
        "__VIEWSTATEGENERATOR": viewstgen,
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": event,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.workExperienceDetails.employeeNumber || "",
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$radInternal": "1",
        "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
        "ctl00$body$txtempNo": window.view.empEncId,
        "ctl00$body$txtperemail": emailEnc,
        "ctl00$body$txtconpname": args.workExperienceDetails.companyname || "",
        "ctl00$body$hdncompname": "PeoplesHR",
        "ctl00$body$chkworkrelated": args.workExperienceDetails.isWorkRelated || "",
        "ctl00$body$txtStartDate": args.workExperienceDetails.startDate || "",
        "ctl00$body$txtEndDate": args.workExperienceDetails.endDate || "",
        "ctl00$body$txtconfDate": args.workExperienceDetails.confirmationDate || "",
        "ctl00$body$txtcontact": args.workExperienceDetails.contactPerson || "",
        "ctl00$body$txtDept": args.workExperienceDetails.department || "",
        "ctl00$body$txtposition": args.workExperienceDetails.position || "",
        "ctl00$body$txtreason": args.workExperienceDetails.reasonForLeaving || "",
        "ctl00$body$txtSalaryonleave": args.workExperienceDetails.salaryAllowanceLeaving || "",
        "ctl00$body$txtbenifitesonleave": args.workExperienceDetails.benefitsofLiving || "",
        "ctl00$body$txtaddress": args.workExperienceDetails.companyAddress || "",
        "ctl00$body$nutel": args.workExperienceDetails.contactNumber || "",
        "ctl00$body$txtemail": "",
        "ctl00$body$txtresp": args.workExperienceDetails.responsibilities || "",
        "ctl00$body$txtachv": args.workExperienceDetails.achievements || "",
        "ctl00$body$chkBenefit": args.workExperienceDetails.hasBenefits || "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdGrade1_ClientState": "",
        "ctl00$body$butAdd": "ADD",
        "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
      }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

      const editResponse4 = await BeaconBar.executeFunction('module')({
        "scrollLeft": "0",
        "scrollTop": "0",
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": editResponse3.viewState,
        "__VIEWSTATEGENERATOR": editResponse3.viewStateGen,
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": editResponse3.eventValidation,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.workExperienceDetails.employeeNumber || "",
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$radInternal": "1",
        "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
        "ctl00$body$txtempNo": window.view.empEncId,
        "ctl00$body$txtperemail": emailEnc,
        "ctl00$body$txtconpname": "",
        "ctl00$body$hdncompname": "PeoplesHR",
        "ctl00$body$txtStartDate": "",
        "ctl00$body$txtEndDate": "",
        "ctl00$body$txtconfDate": "",
        "ctl00$body$txtcontact": "",
        "ctl00$body$txtDept": "",
        "ctl00$body$txtposition": "",
        "ctl00$body$txtreason": "",
        "ctl00$body$txtSalaryonleave": "",
        "ctl00$body$txtbenifitesonleave": "",
        "ctl00$body$txtaddress": "",
        "ctl00$body$nutel": "",
        "ctl00$body$txtemail": "",
        "ctl00$body$txtresp": "",
        "ctl00$body$txtachv": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdGrade1_ClientState": "",
        "ctl00$body$butSave": "Save",
        "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
      }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

      const parser = new DOMParser();
      const docPost = parser.parseFromString(editResponse4.rawData, "text/html");

      const category = docPost.querySelector(".GroupHeader_Default p")?.textContent.trim().replace("Category :", "").trim() || "";
      const rows = docPost.querySelectorAll(".GridRow_Default");
      const updateworkExperience = Array.from(rows).map(row => {
        const cells = row.querySelectorAll("td");

        return {
          fromDate: cells[1]?.textContent.trim() || "",
          toDate: cells[2]?.textContent.trim() || "",
          companyName: cells[3]?.textContent.trim() || "",
          functionalTitle: cells[4]?.textContent.trim() || "",
          noOfYears: cells[5]?.textContent.trim() || "",
          noOfMonths: cells[6]?.textContent.trim() || "",
          category: category
        };
      });
      return updateworkExperience;
    } else if (args.workExperienceDetails.endDateType === "updateEndDate") {
      const editResponse2 = await BeaconBar.executeFunction('module')({
        "scrollLeft": "0",
        "scrollTop": "0",
        "__EVENTTARGET": "ctl00$body$txtEndDate",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": viewst,
        "__VIEWSTATEGENERATOR": viewstgen,
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": event,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.workExperienceDetails.employeeNumber || "",
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$radInternal": "0",
        "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
        "ctl00$body$txtempNo": window.view.empEncId,
        "ctl00$body$txtperemail": window.empEnc,
        "ctl00$body$txtconpname": args.workExperienceDetails.companyname || "",
        "ctl00$body$hdncompname": "PeoplesHR",
        "ctl00$body$chkworkrelated": args.workExperienceDetails.isWorkRelated || "",
        "ctl00$body$txtStartDate": args.workExperienceDetails.startDate || "",
        "ctl00$body$txtEndDate": args.workExperienceDetails.endDate || "",
        "ctl00$body$txtconfDate": args.workExperienceDetails.confirmationDate || "",
        "ctl00$body$txtcontact": args.workExperienceDetails.contactPerson || "",
        "ctl00$body$txtDept": args.workExperienceDetails.department || "",
        "ctl00$body$txtposition": args.workExperienceDetails.position || "",
        "ctl00$body$txtreason": args.workExperienceDetails.reasonForLeaving || "",
        "ctl00$body$txtSalaryonleave": args.workExperienceDetails.salaryAllowanceLeaving || "",
        "ctl00$body$txtbenifitesonleave": args.workExperienceDetails.benefitsofLiving || "",
        "ctl00$body$txtaddress": args.workExperienceDetails.companyAddress || "",
        "ctl00$body$nutel": args.workExperienceDetails.contactNumber || "",
        "ctl00$body$txtemail": "",
        "ctl00$body$txtresp": args.workExperienceDetails.responsibilities || "",
        "ctl00$body$txtachv": args.workExperienceDetails.achievements || "",
        "ctl00$body$chkBenefit": args.workExperienceDetails.hasBenefits || "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdGrade1_ClientState": "",
        "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
      }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

      viewst = editResponse2.viewState;
      viewstgen = editResponse2.viewStateGen;
      event = editResponse2.eventValidation;

    } else {
      const emailEnc = await BeaconBar.executeFunction("employeeEncryptId")(window.view1.publicKey, window.emailId);
      const editResponse3 = await BeaconBar.executeFunction('module')({
        "scrollLeft": "0",
        "scrollTop": "0",
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": viewst,
        "__VIEWSTATEGENERATOR": viewstgen,
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": event,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.workExperienceDetails.employeeNumber || "",
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$radInternal": "1",
        "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
        "ctl00$body$txtempNo": window.view.empEncId,
        "ctl00$body$txtperemail": emailEnc,
        "ctl00$body$txtconpname": "PeoplesHR",
        "ctl00$body$hdncompname": "PeoplesHR",
        "ctl00$body$chkworkrelated": args.workExperienceDetails.isWorkRelated || "",
        "ctl00$body$txtStartDate": args.workExperienceDetails.startDate || "",
        "ctl00$body$txtEndDate": args.workExperienceDetails.endDate || "",
        "ctl00$body$txtconfDate": args.workExperienceDetails.confirmationDate || "",
        "ctl00$body$txtcontact": args.workExperienceDetails.contactPerson || "",
        "ctl00$body$txtDept": args.workExperienceDetails.department || "",
        "ctl00$body$txtposition": args.workExperienceDetails.position || "",
        "ctl00$body$txtreason": args.workExperienceDetails.reasonForLeaving || "",
        "ctl00$body$txtSalaryonleave": args.workExperienceDetails.salaryAllowanceLeaving || "",
        "ctl00$body$txtbenifitesonleave": args.workExperienceDetails.benefitsofLiving || "",
        "ctl00$body$txtaddress": args.workExperienceDetails.companyAddress || "",
        "ctl00$body$nutel": args.workExperienceDetails.contactNumber || "",
        "ctl00$body$txtemail": "",
        "ctl00$body$txtresp": args.workExperienceDetails.responsibilities || "",
        "ctl00$body$txtachv": args.workExperienceDetails.achievements || "",
        "ctl00$body$chkBenefit": args.workExperienceDetails.hasBenefits || "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdGrade1_ClientState": "",
        "ctl00$body$butAdd": "ADD",
        "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
      }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

      const editResponse4 = await BeaconBar.executeFunction('module')({
        "scrollLeft": "0",
        "scrollTop": "0",
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": editResponse3.viewState,
        "__VIEWSTATEGENERATOR": editResponse3.viewStateGen,
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": editResponse3.eventValidation,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.workExperienceDetails.employeeNumber || "",
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$radInternal": "1",
        "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
        "ctl00$body$txtempNo": window.view.empEncId,
        "ctl00$body$txtperemail": emailEnc,
        "ctl00$body$txtconpname": "",
        "ctl00$body$hdncompname": "PeoplesHR",
        "ctl00$body$txtStartDate": "",
        "ctl00$body$txtEndDate": "",
        "ctl00$body$txtconfDate": "",
        "ctl00$body$txtcontact": "",
        "ctl00$body$txtDept": "",
        "ctl00$body$txtposition": "",
        "ctl00$body$txtreason": "",
        "ctl00$body$txtSalaryonleave": "",
        "ctl00$body$txtbenifitesonleave": "",
        "ctl00$body$txtaddress": "",
        "ctl00$body$nutel": "",
        "ctl00$body$txtemail": "",
        "ctl00$body$txtresp": "",
        "ctl00$body$txtachv": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
        "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdGrade1_ClientState": "",
        "ctl00$body$butSave": "Save",
        "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
      }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

      const parser = new DOMParser();
      const docPost = parser.parseFromString(editResponse4.rawData, "text/html");

      const category = docPost.querySelector(".GroupHeader_Default p")?.textContent.trim().replace("Category :", "").trim() || "";
      const rows = docPost.querySelectorAll(".GridRow_Default");
      const updateworkExperience = Array.from(rows).map(row => {
        const cells = row.querySelectorAll("td");

        return {
          fromDate: cells[1]?.textContent.trim() || "",
          toDate: cells[2]?.textContent.trim() || "",
          companyName: cells[3]?.textContent.trim() || "",
          functionalTitle: cells[4]?.textContent.trim() || "",
          noOfYears: cells[5]?.textContent.trim() || "",
          noOfMonths: cells[6]?.textContent.trim() || "",
          category: category
        };
      });
      return updateworkExperience;
    }

    // const emailId = docPost.getElementById('ctl00_body_txtemail').value;
  }

  if (args.updateType === "membershipDetails") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/MemberOfProf.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(window.pk.publicKey, args.membershipDetails.empEmpNumber)

    const updateUrlData = await payload("EIM/MemberOfProf.aspx");

    const editResponse = await BeaconBar.executeFunction('module')({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: window.pk.viewState,
      __VIEWSTATEGENERATOR: window.pk.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.pk.eventValidation,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": args.membershipDetails.empEmpNumber,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$CustomHiddenField": "",
      "ctl00$body$txtMemshipNum": args.membershipDetails.membershipNum,
      "ctl00$body$dpbasis": args.membershipDetails.subscriptionOwnership,
      "ctl00$body$dpmemtitles": args.membershipDetails.membershipTitleId,
      "ctl00$body$txtStartdate": args.membershipDetails.startDate,
      "ctl00$body$txtEndDate": args.membershipDetails.endDate,
      "ctl00$body$nurears": args.membershipDetails.paidbyIndividualAmount,
      "ctl00$body$dpIndCurrency": args.membershipDetails.individualCurrency,
      "ctl00$body$txtIndEffDate": args.membershipDetails.individualEffDate,
      "ctl00$body$nuBornAmount": args.membershipDetails.paidbyCompanyAmount,
      "ctl00$body$dpComCurrency": args.membershipDetails.companyCurrency,
      "ctl00$body$txtComEffDate": args.membershipDetails.companyEffDate,
      "ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdgrade_ClientState": "",
      "ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdBarginingSummary_ClientState": "",
      "ctl00$body$butAdd": "ADD",
      "ctl00$body$txtempnumber": empEnc,
      "ctl00$body$hdnSelectedTab": "0",
      "ctl00$body$hdnHavePendingMemshipWFData": "0",
      "ctl00$body$hdnHavePendingBargainWFData": "0",
      "ctl00$body$txtPublicKey": window.pk.publicKey,
      "ctl00$body$hdnEventType": "1",
      "ctl00$body$HiddenField1": ""
    }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

    const empEncId1 = await BeaconBar.executeFunction("employeeEncryptId")(editResponse.publicKey, args.membershipDetails.empEmpNumber)

    const saveResponse = await BeaconBar.executeFunction('module')({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: editResponse.viewState,
      __VIEWSTATEGENERATOR: editResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: editResponse.eventValidation,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": args.membershipDetails.empEmpNumber,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$dpcountry": "-1",
      "ctl00$body$CustomHiddenField": "1",
      "ctl00$body$dpmemship": "-1",
      "ctl00$body$txtMemshipNum": "",
      "ctl00$body$dpbasis": "-1",
      "ctl00$body$dpmemtitles": "-1",
      "ctl00$body$txtStartdate": formattedDate,
      "ctl00$body$txtEndDate": formattedDate,
      "ctl00$body$nurears": "",
      "ctl00$body$dpIndCurrency": "000112",
      "ctl00$body$txtIndEffDate": formattedDate,
      "ctl00$body$nuBornAmount": "",
      "ctl00$body$dpComCurrency": "000112",
      "ctl00$body$txtComEffDate": formattedDate,
      "ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdgrade_ClientState": "",
      "ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdBarginingSummary_ClientState": "",
      "ctl00$body$butSave": "Save",
      "ctl00$body$txtempnumber": empEncId1,
      "ctl00$body$hdnSelectedTab": "0",
      "ctl00$body$hdnHavePendingMemshipWFData": "0",
      "ctl00$body$hdnHavePendingBargainWFData": "0",
      "ctl00$body$txtPublicKey": editResponse.publicKey,
      "ctl00$body$hdnEventType": "1",
      "ctl00$body$HiddenField1": ""
    }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

    const parser = new DOMParser();
    const document = parser.parseFromString(saveResponse.rawData, "text/html");

    const userUpdateMebershipDetails = {
      membershipType: {
        label: document.querySelector("#ctl00_body_dpcountry")?.selectedOptions[0]?.textContent.trim() || "",
        value: document.querySelector("#ctl00_body_dpcountry")?.value || ""
      },
      noOfMemberships: document.querySelector("#ctl00_body_numonth")?.value.trim() || "",
      membership: {
        label: document.querySelector("#ctl00_body_dpmemship")?.selectedOptions[0]?.textContent.trim() || "",
        value: document.querySelector("#ctl00_body_dpmemship")?.value || ""
      },
      membershipNumber: document.querySelector("#ctl00_body_txtMemshipNum")?.value.trim() || "",
      subscriptionOwnership: {
        label: document.querySelector("#ctl00_body_dpbasis")?.selectedOptions[0]?.textContent.trim() || "",
        value: document.querySelector("#ctl00_body_dpbasis")?.value || ""
      },
      membershipTitle: {
        label: document.querySelector("#ctl00_body_dpmemtitles")?.selectedOptions[0]?.textContent.trim() || "",
        value: document.querySelector("#ctl00_body_dpmemtitles")?.value || ""
      },
      commencementDate: document.querySelector("#ctl00_body_txtStartdate")?.value.trim() || "",
      renewalDate: document.querySelector("#ctl00_body_txtEndDate")?.value.trim() || "",
      paidByIndividualCurrency: {
        label: document.querySelector("#ctl00_body_dpIndCurrency")?.selectedOptions[0]?.textContent.trim() || "",
        value: document.querySelector("#ctl00_body_dpIndCurrency")?.value || ""
      },
      paidByIndividualEffDate: document.querySelector("#ctl00_body_txtIndEffDate")?.value.trim() || "",
      paidByCompanyCurrency: {
        label: document.querySelector("#ctl00_body_dpComCurrency")?.selectedOptions[0]?.textContent.trim() || "",
        value: document.querySelector("#ctl00_body_dpComCurrency")?.value || ""
      },
      paidbyIndividualAmount: document.querySelector("#ctl00_body_nurears")?.value.trim() || "",
      paidbyCompanyAmount: document.querySelector("#ctl00_body_nuBornAmount")?.value.trim() || "",
      paidByCompanyEffDate: document.querySelector("#ctl00_body_txtComEffDate")?.value.trim() || ""
    }

    return userUpdateMebershipDetails;

  }

  if (args.updateType === "bankDetails") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/AssignBankInformation.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateUrlData = await payload("EIM/AssignBankInformation.aspx");

    const empEncId = await BeaconBar.executeFunction("employeeEncryptId")(
      window.bdv.publicKey,
      args.bankDetails.employeeNumber
    );
    const accountEnc = await BeaconBar.executeFunction("employeeEncryptId")(
      window.bdv.publicKey,
      args.bankDetails.accountNumber
    );

    const editResponse = await BeaconBar.executeFunction("module")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: window.bdv.viewState,
        __VIEWSTATEGENERATOR: window.bdv.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: window.bdv.eventValidation,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "1",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.bankDetails.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$cboAccType": args.bankDetails.accountType,
        "ctl00$body$cboCurrency": args.bankDetails.currency,
        "ctl00$body$txtAccountEmpName": args.bankDetails.accountName,
        "ctl00$body$cboAmountType": args.bankDetails.amountType,
        "ctl00$body$nuBnkAmount": args.bankDetails.updateAmount,
        "ctl00$body$nuOrder": args.bankDetails.order,
        "ctl00$body$chkBankActive": args.bankDetails.isActive,
        "ctl00$body$txtAccStartDate": args.bankDetails.startDate,
        "ctl00$body$txtAccEndDate": args.bankDetails.endDate,
        "ctl00$body$txtBankComment": args.bankDetails.comment,
        "ctl00$body$txtPublicKey": window.bdv.publicKey,
        "ctl00$body$txtAccount": accountEnc,
        "ctl00$body$txtempnumber": empEncId,
        "ctl00$body$butAddtoGrid": "Add to Grid",
        "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
        "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdEmpBank_ClientState": "",
        "ctl00$body$hdnCurrentAmount": args.bankDetails.currentAmount,
        "ctl00$body$hdnAmountType": args.bankDetails.amountType,
        "ctl00$body$txtEmpNo": args.bankDetails.employeeNumber,
      },
      `${reqOptions.sl}/${updateUrlData.pageUrl}`
    );

    const saveResponse = await BeaconBar.executeFunction("module")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: editResponse.viewState,
        __VIEWSTATEGENERATOR: editResponse.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: editResponse.eventValidation,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$hdnQuickmenu": "1",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.bankDetails.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$cboBank": "",
        "ctl00$body$cboAccType": "-1",
        "ctl00$body$txtAccountNo": "",
        "ctl00$body$cboCurrency": "",
        "ctl00$body$txtAccountEmpName": "",
        "ctl00$body$cboAmountType": "0",
        "ctl00$body$nuBnkAmount": "",
        "ctl00$body$nuOrder": "",
        "ctl00$body$chkBankActive": "on",
        "ctl00$body$txtAccStartDate": "",
        "ctl00$body$txtAccEndDate": "",
        "ctl00$body$txtBankComment": "",
        "ctl00$body$txtPublicKey": window.bdv.publicKey,
        "ctl00$body$txtAccount": accountEnc,
        "ctl00$body$txtempnumber": empEncId,
        "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
        "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdEmpBank_ClientState": "",
        "ctl00$body$hdnCurrentAmount": "0",
        "ctl00$body$hdnAmountType": "1",
        "ctl00$body$butSave": "Save",
        "ctl00$body$txtEmpNo": args.bankDetails.employeeNumber,
      },
      `${reqOptions.sl}/${updateUrlData.pageUrl}`
    );

    const parser = new DOMParser();
    const document = parser.parseFromString(saveResponse.rawData, "text/html");

    const getSelectedInfo = (selector) => {
      const el = document.querySelector(selector);
      return {
        name: el?.options[el.selectedIndex]?.text?.trim() || "",
        value: el?.value || "",
      };
    };

    const getInputValue = (selector) => {
      return document.querySelector(selector)?.value?.trim() || "";
    };

    const getCheckboxValue = (selector) => {
      return document.querySelector(selector)?.checked || false;
    };

    const bankInformation = {
      "Bank Name": getSelectedInfo("#ctl00_body_cboBank"),
      "Branch Name": getSelectedInfo("#ctl00_body_cboBankBranch"),
      "Account Type": getSelectedInfo("#ctl00_body_cboAccType"),
      "Account Number": getInputValue("#ctl00_body_txtAccountNo"),
      Currency: getSelectedInfo("#ctl00_body_cboCurrency"),
      "Name Given to the Bank": getInputValue("#ctl00_body_txtAccountEmpName"),
      "Amount Type": getSelectedInfo("#ctl00_body_cboAmountType"),
      "Amount / Percentage": getInputValue("#ctl00_body_nuBnkAmount"),
      Order: getInputValue("#ctl00_body_nuOrder"),
      "Bank Active": getCheckboxValue("#ctl00_body_chkBankActive") ? "Yes" : "No",
      "Start Date": getInputValue("#ctl00_body_txtAccStartDate"),
      "End Date": getInputValue("#ctl00_body_txtAccEndDate"),
      Comments: getInputValue("#ctl00_body_txtBankComment"),
    };

    return bankInformation;
  }

  if (args.updateType === "creditCardDetails") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/AssignCreditCard.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateUrlData = await payload("EIM/AssignCreditCard.aspx");

    const empEncId = await BeaconBar.executeFunction("employeeEncryptId")(
      window.ccdv.publicKey,
      args.creditCardDetails.employeeNumber
    );

    const cardNumEnc = await BeaconBar.executeFunction("employeeEncryptId")(
      window.ccdv.publicKey,
      args.creditCardDetails.creditCardNumber
    );

    const editResponse = await BeaconBar.executeFunction("module")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: window.ccdv.viewState,
        __VIEWSTATEGENERATOR: window.ccdv.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: window.ccdv.eventValidation,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.creditCardDetails.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$rbCCType": args.creditCardDetails.creditCardType,
        "ctl00$body$txtIssueDate": args.creditCardDetails.issuedDate,
        "ctl00$body$txtExpDate": args.creditCardDetails.expiryDate,
        "ctl00$body$cmdAddtoGrid": "Add to Grid",
        "ctl00$body$grdCC$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdCC_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdCC$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
        "ctl00_body_grdCC_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdCC_ClientState": "",
        "ctl00$body$txtPublicKey": window.ccdv.publicKey,
        "ctl00$body$txtCCard": cardNumEnc,
        "ctl00$body$txtempnumber": empEncId
      },
      `${reqOptions.sl}/${updateUrlData.pageUrl}`
    );

    const saveResponse = await BeaconBar.executeFunction("module")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: editResponse.viewState,
        __VIEWSTATEGENERATOR: editResponse.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: editResponse.eventValidation,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.creditCardDetails.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$cboBank": "",
        "ctl00$body$txtCCNo": "",
        "ctl00$body$rbCCType": "0",
        "ctl00$body$txtIssueDate": "",
        "ctl00$body$txtExpDate": "",
        "ctl00$body$grdCC$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdCC_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdCC$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
        "ctl00_body_grdCC_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdCC_ClientState": "",
        "ctl00$body$cmdSave": "Save",
        "ctl00$body$txtPublicKey": window.ccdv.publicKey,
        "ctl00$body$txtCCard": cardNumEnc,
        "ctl00$body$txtempnumber": empEncId
      },
      `${reqOptions.sl}/${updateUrlData.pageUrl}`
    );

    const parser = new DOMParser();
    const document = parser.parseFromString(saveResponse.rawData, "text/html");

    const creditCardDetails = {};

    const bankSelect = document.querySelector("#ctl00_body_cboBank");
    const selectedBankOption = bankSelect?.selectedOptions[0];
    creditCardDetails["Bank Name"] = {
      name: selectedBankOption?.textContent.trim() || "",
      value: selectedBankOption?.value || ""
    };

    const ccNumber = document.querySelector("#ctl00_body_txtCCNo")?.value || "";
    creditCardDetails["Credit Card Number"] = ccNumber.trim();

    const selectedCardType = document.querySelector('input[name="ctl00$body$rbCCType"]:checked');
    const selectedCardTypeLabel = document.querySelector(`label[for="${selectedCardType?.id}"]`);
    creditCardDetails["Credit Card Type"] = {
      name: selectedCardTypeLabel?.textContent.trim() || "",
      value: selectedCardType?.value || ""
    };

    const issueDate = document.querySelector("#ctl00_body_txtIssueDate")?.value || "";
    creditCardDetails["Issued Date"] = issueDate.trim();

    const expiryDate = document.querySelector("#ctl00_body_txtExpDate")?.value || "";
    creditCardDetails["Expiry Date"] = expiryDate.trim();

    return creditCardDetails;
  }

  if (args.updateType === "passportAndOtherArticles") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/AssignPassport.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateUrlData = await payload("EIM/AssignPassport.aspx");

    const empEncId = await BeaconBar.executeFunction("employeeEncryptId")(
      window.padv.publicKey,
      args.passportAndOtherArticles.employeeNumber
    );

    const docNumEnc = await BeaconBar.executeFunction("employeeEncryptId")(
      window.padv.publicKey,
      args.passportAndOtherArticles.documentNumber
    );

    const editResponse = await BeaconBar.executeFunction("module")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: window.padv.viewState,
        __VIEWSTATEGENERATOR: window.padv.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: window.padv.eventValidation,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.passportAndOtherArticles.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$DropDownListIdentity": args.passportAndOtherArticles.articleCategory,
        "ctl00$body$txtpassNo": "",
        "ctl00$body$txtpasstype": args.passportAndOtherArticles.articleSubcategory,
        "ctl00$body$cboPassCountry": args.passportAndOtherArticles.countryOfOrigin,
        "ctl00$body$nuNoOfEnt": args.passportAndOtherArticles.numberOfEntries,
        "ctl00$body$txtpassIssuePl": args.passportAndOtherArticles.placeOfIssue,
        "ctl00$body$txtpassIssuedate": args.passportAndOtherArticles.issueDate,
        "ctl00$body$txtpassExpDate": args.passportAndOtherArticles.expiryDate,
        "ctl00$body$txtPaComments": args.passportAndOtherArticles.comments,
        "ctl00$body$grdPassport$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdPassport_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdPassport$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
        "ctl00_body_grdPassport_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdPassport_ClientState": "",
        "ctl00$body$butAdd": "Add",
        "ctl00$body$txtPublicKey": window.padv.publicKey,
        "ctl00$body$txtpassport": docNumEnc,
        "ctl00$body$txtempnumber": empEncId
      },
      `${reqOptions.sl}/${updateUrlData.pageUrl}`
    );

    const saveResponse = await BeaconBar.executeFunction("module")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: editResponse.viewState,
        __VIEWSTATEGENERATOR: editResponse.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: editResponse.eventValidation,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.passportAndOtherArticles.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$DropDownListIdentity": "-1",
        "ctl00$body$txtpassNo": "",
        "ctl00$body$txtpasstype": "",
        "ctl00$body$cboPassCountry": "-1",
        "ctl00$body$nuNoOfEnt": "",
        "ctl00$body$txtpassIssuePl": "",
        "ctl00$body$txtpassIssuedate": "",
        "ctl00$body$txtpassExpDate": "",
        "ctl00$body$txtPaComments": "",
        "ctl00$body$grdPassport$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdPassport_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdPassport$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
        "ctl00_body_grdPassport_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdPassport_ClientState": "",
        "ctl00$body$cmdSave": "Save",
        "ctl00$body$txtPublicKey": window.padv.publicKey,
        "ctl00$body$txtpassport": docNumEnc,
        "ctl00$body$txtempnumber": empEncId
      },
      `${reqOptions.sl}/${updateUrlData.pageUrl}`
    );

    const parser = new DOMParser();
    const document = parser.parseFromString(saveResponse.rawData, "text/html");

    const getValue = (selector) =>
      document.querySelector(selector)?.value.trim() || "";

    const getSelectedData = (selector) => {
      const select = document.querySelector(selector);
      const selectedOption = select?.options[select.selectedIndex];
      return {
        name: selectedOption?.textContent.trim() || "",
        value: selectedOption?.value || ""
      };
    };

    const updatePassportAndOtherArticles = {
      "Article Category": getSelectedData("#ctl00_body_DropDownListIdentity"),
      "Document No": getValue("#ctl00_body_txtpassNo"),
      "Article Subcategory": getValue("#ctl00_body_txtpasstype"),
      "Country of Origin": getSelectedData("#ctl00_body_cboPassCountry"),
      "No of Entries": getValue("#ctl00_body_nuNoOfEnt"),
      "Place of Issue": getValue("#ctl00_body_txtpassIssuePl"),
      "Date of Issue": getValue("#ctl00_body_txtpassIssuedate"),
      "Date of Expiry": getValue("#ctl00_body_txtpassExpDate"),
      "Comments": getValue("#ctl00_body_txtPaComments")
    };

    return updatePassportAndOtherArticles;
  }

  if (args.updateType === "assigendNonCashBenefit") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/AssignNonCashBenifitEmployee.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateUrlData = await payload("EIM/AssignNonCashBenifitEmployee.aspx");
    let viewstate = window.ancb.viewState;
    let viewstategen = window.ancb.viewStateGen;
    let event = window.ancb.eventValidation;
    if (args.assigendNonCashBenefit.returnable === "on") {
      const extra = await BeaconBar.executeFunction("module")(
        {
          scrollLeft: "0",
          scrollTop: "0",
          __EVENTTARGET: "ctl00$body$chkretBle",
          __EVENTARGUMENT: "",
          __LASTFOCUS: "",
          __VIEWSTATE: viewstate,
          __VIEWSTATEGENERATOR: viewstategen,
          __VIEWSTATEENCRYPTED: "",
          __EVENTVALIDATION: event,
          "ctl00$hdnDateFormat": "m/d/yy",
          "ctl00$hdnQuickmenu": "",
          "ctl00_body_RadWindowManager1_ClientState": "",
          "ctl00$body$EmpSearch$hdnEmpNumber": args.assigendNonCashBenefit.employeeNumber,
          "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
          "ctl00$body$txtIssDate": args.assigendNonCashBenefit.issueDate,
          "ctl00$body$nuQuantity": args.assigendNonCashBenefit.quantity,
          "ctl00$body$txtSerialNo": "",
          "ctl00$body$txtModel": "",
          "ctl00$body$txtCondition": "",
          "ctl00$body$txtRemarks": "",
          "ctl00$body$cboBenHead": "-1",
          "ctl00$body$hdnDateFormate": "m/d/yyyy",
          "ctl00$body$txtPublicKey": window.assigned.publicKey3,
          "ctl00$body$txtempnumber": window.assigned.empEnc,
          ...(args.assigendNonCashBenefit.returnable === "on" && {
            "ctl00$body$chkretBle": "on"
          })
        }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);
      viewstate = extra.viewState;
      viewstategen = extra.viewStateGen;
      event = extra.eventValidation;
    }

    const editResponse = await BeaconBar.executeFunction("module")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: viewstate,
        __VIEWSTATEGENERATOR: viewstategen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: event,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.assigendNonCashBenefit.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$txtIssDate": args.assigendNonCashBenefit.issueDate,
        "ctl00$body$nuQuantity": args.assigendNonCashBenefit.quantity,
        ...(args.assigendNonCashBenefit.returnableDate && {
          "ctl00$body$txtRepDate": args.assigendNonCashBenefit.returnableDate
        }),
        "ctl00$body$txtSerialNo": args.assigendNonCashBenefit.serialNumber,
        "ctl00$body$txtModel": args.assigendNonCashBenefit.model,
        "ctl00$body$txtCondition": args.assigendNonCashBenefit.condition,
        "ctl00$body$txtRemarks": args.assigendNonCashBenefit.remarks,
        "ctl00$body$cboBenHead": args.assigendNonCashBenefit.beneficiaryHead,
        "ctl00$body$lnkUpdate": "Update",
        "ctl00$body$hdnDateFormate": "m/d/yyyy",
        "ctl00$body$txtPublicKey": window.assigned.publicKey3,
        "ctl00$body$txtempnumber": window.assigned.empEnc,
        ...(args.assigendNonCashBenefit.returnable === "on" && {
          "ctl00$body$chkretBle": "on"
        })
      },
      `${reqOptions.sl}/${updateUrlData.pageUrl}`
    );
    
    const parser = new DOMParser();
    const errorDoc = parser.parseFromString(editResponse.rawData, "text/html");

    const element = errorDoc.querySelector("#ctl00_body_lnkUpdate");

    if (element) {
      const editError = element.value || "";

      if (editError === "Update") {
        return "The Quantity entered exceeds the Quantity allocated";
      }
    }


    const saveResponse = await BeaconBar.executeFunction("module")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: editResponse.viewState,
        __VIEWSTATEGENERATOR: editResponse.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: editResponse.eventValidation,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$hdnQuickmenu": "",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.assigendNonCashBenefit.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00_body_grdavailable_ClientState": "",
        "ctl00$body$butSave": "Save",
        "ctl00$body$hdnDateFormate": "m/d/yyyy",
        "ctl00$body$txtPublicKey": window.assigned.publicKey3,
        "ctl00$body$txtempnumber": window.assigned.empEnc
      },
      `${reqOptions.sl}/${updateUrlData.pageUrl}`
    );

    // const parser = new DOMParser();
    const document = parser.parseFromString(saveResponse.rawData, "text/html");

    const getValue = (selector) =>
      document.querySelector(selector)?.value.trim() || "";

    const isChecked = (selector) =>
      document.querySelector(selector)?.checked || false;

    const getSelectedOption = (selector) => {
      const select = document.querySelector(selector);
      const selected = select?.options[select.selectedIndex];
      return {
        value: selected?.value || "",
        name: selected?.textContent.trim() || ""
      };
    };

    const upadeAssignedNonCashBenefit = {
      "Date of Issue": getValue("#ctl00_body_txtIssDate"),
      "Quantity": getValue("#ctl00_body_nuQuantity"),
      "Item Returnable": isChecked("#ctl00_body_chkretBle"),
      "Returnable Date": getValue("#ctl00_body_txtRepDate"),
      "Item Returned": isChecked("#ctl00_body_chkret"),
      "Returned Date": getValue("#ctl00_body_txtReturnedDate"),
      "Serial Number": getValue("#ctl00_body_txtSerialNo"),
      "Model": getValue("#ctl00_body_txtModel"),
      "Condition": getValue("#ctl00_body_txtCondition"),
      "Remarks": getValue("#ctl00_body_txtRemarks"),
      "Benefit Clearance Head Position Name": getSelectedOption("#ctl00_body_cboBenHead")
    };

    return upadeAssignedNonCashBenefit;
  }

  if (args.updateType === "assignLanguage") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/AssignLanguage.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateUrlData = await payload("EIM/AssignLanguage.aspx");
    const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(window.language.publicKey, args.assignLanguage.employeeNumber);
    const saveResponse = await BeaconBar.executeFunction("module")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: window.language.viewState,
        __VIEWSTATEGENERATOR: window.language.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: window.language.eventValidation,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$hdnQuickmenu": "1",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.assignLanguage.employeeNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$cboLanuage": args.assignLanguage.languageCode,
        "ctl00$body$chkReading": args.assignLanguage.readingEnabled,
        "ctl00$body$cboLanGradeReading": args.assignLanguage.readingRating,
        "ctl00$body$chkWriting": args.assignLanguage.writingEnabled,
        "ctl00$body$cboLanGradeWriting": args.assignLanguage.writingRating,
        "ctl00$body$chkSpeaking": args.assignLanguage.speakingEnabled,
        "ctl00$body$cboLanGradeSpeaking": args.assignLanguage.speakingRating,
        "ctl00$body$txtPublicKey": window.language.publicKey,
        "ctl00$body$txtEmpNumber": empEnc,
        "ctl00$body$grdLanuages$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdLanuages_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdLanuages$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
        "ctl00_body_grdLanuages_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdLanuages_ClientState": "",
        "ctl00$body$butSave": "Save"
      },`${reqOptions.sl}/${updateUrlData.pageUrl}`);

    const parser = new DOMParser();
    const document = parser.parseFromString(saveResponse.rawData, "text/html");

    const languageSelect = document.querySelector("#ctl00_body_cboLanuage");
    const readingSelect = document.querySelector("#ctl00_body_cboLanGradeReading");
    const writingSelect = document.querySelector("#ctl00_body_cboLanGradeWriting");
    const speakingSelect = document.querySelector("#ctl00_body_cboLanGradeSpeaking");

    const selectedLanguage = {
      label: languageSelect.options[languageSelect.selectedIndex].textContent.trim(),
      value: languageSelect.value
    };

    const reading = {
      label: readingSelect.options[readingSelect.selectedIndex].textContent.trim(),
      value: readingSelect.value
    };

    const writing = {
      label: writingSelect.options[writingSelect.selectedIndex].textContent.trim(),
      value: writingSelect.value
    };

    const speaking = {
      label: speakingSelect.options[speakingSelect.selectedIndex].textContent.trim(),
      value: speakingSelect.value
    };

    const updateLanguageDetails = {
      language: selectedLanguage,
      READING: reading,
      WRITING: writing,
      SPEAKING: speaking
    };
    return updateLanguageDetails
  }
});
