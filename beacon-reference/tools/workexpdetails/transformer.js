(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/WorkExperience.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

  const editResponse = await BeaconBar.executeFunction('module')({
    "scrollLeft": "0",
    "scrollTop": "0",
    "__EVENTTARGET": args.editId,
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": window.view.editResponse.viewState,
    "__VIEWSTATEGENERATOR": window.view.editResponse.viewStateGen,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": window.view.editResponse.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.empId,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$radInternal": "0",
    "ctl00$body$txtPublicKey": window.view.editResponse.publicKey,
    "ctl00$body$txtempNo": window.view.empEncId,
    "ctl00$body$txtperemail": "",
    "ctl00$body$txtconpname": "",
    "ctl00$body$hdncompname": "PeoplesHR",
    "ctl00$body$txtStartDate": args.fromDate || formattedDate,
    "ctl00$body$txtEndDate": args.endDate || formattedDate,
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
    "ctl00$body$hdnDateFormate": "dd/mm/yyyy"
  }, `${reqOptions.sl}/EIM/WorkExperience.aspx`);

  window.view1 = editResponse

  const parser = new DOMParser();
  const document = parser.parseFromString(editResponse.rawData, "text/html");

  window.emailId = document.getElementById('ctl00_body_txtemail').value

  const checkedInput = document.querySelector('input[name="ctl00$body$radInternal"]:checked');

  const userselectedCategoryType = {
    value: checkedInput?.value || "",
    label: checkedInput
      ? document.querySelector(`label[for="${checkedInput.id}"]`)?.textContent.trim()
      : ""
  };

  const userSelectWorkExperienceDetails = {
    EmploymentType: document.querySelector('input[name="ctl00$body$radInternal"]:checked')?.nextSibling.textContent.trim(), // Internal or External
    FromDate: document.querySelector('#ctl00_body_txtStartDate')?.value,
    ToDate: document.querySelector('#ctl00_body_txtEndDate')?.value,
    DateOfConfirmation: document.querySelector('#ctl00_body_txtconfDate')?.value,
    DepartmentDivision: document.querySelector('#ctl00_body_txtDept')?.value,
    CompanyName: document.querySelector('#ctl00_body_txtconpname')?.value,
    WorkRelated: document.querySelector('#ctl00_body_chkworkrelated')?.checked ? 'Yes' : 'No',
    ContactPerson: document.querySelector('#ctl00_body_txtcontact')?.value,
    FunctionalTitle: document.querySelector('#ctl00_body_txtposition')?.value,
    ReasonForLeaving: document.querySelector('#ctl00_body_txtreason')?.value,
    Address: document.querySelector('#ctl00_body_txtaddress')?.value.trim(),
    Telephone: document.querySelector('#ctl00_body_nutel')?.value,
    Email: document.querySelector('#ctl00_body_txtemail')?.value,
    Accountabilities: document.querySelector('#ctl00_body_txtresp')?.value.trim(),
    Achievements: document.querySelector('#ctl00_body_txtachv')?.value.trim(),
    NoOfYears: document.querySelector('#ctl00_body_nurears')?.value,
    NoOfMonths: document.querySelector('#ctl00_body_numonth')?.value,
    BenefitConsideration: document.querySelector('#ctl00_body_chkBenefit')?.checked ? 'Yes' : 'No',
    BenefitsofLiving: document.querySelector('#ctl00_body_txtbenifitesonleave').textContent.trim()
  };
  return { userSelectWorkExperienceDetails, userselectedCategoryType }
})