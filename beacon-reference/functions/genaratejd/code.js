(function () {
  const date = document.querySelector('[data-bind="text:DispDate"]')?.textContent.trim() || "";
  const requester = document.querySelector('[data-bind="text: Requester"]')?.textContent.trim() || "";
  const hiringManagers = document.querySelector('[data-bind="text: HirMgrs"]')?.textContent.trim() || "";

  const vacTitleValue = document.querySelector('input[name="req-a-VacTitle"]')?.value || "";

  const designationCode = document.querySelector('select[name="req-a-DsgCode"]')?.selectedOptions[0]?.textContent.trim() || "";
  const corporateTitle = document.querySelector('select[name="req-a-CtCode"]')?.selectedOptions[0]?.textContent.trim() || "";
  const salaryGrade = document.querySelector('select[name="req-a-SalGrd"]')?.selectedOptions[0]?.textContent.trim() || "";
  const empType = document.querySelector('select[name="req-a-TypeId"]')?.selectedOptions[0]?.textContent.trim() || "";

  const exStartDate = document.querySelector('input[name="req-a-ExStartDate"]')?.value || "";
  const reqDate = document.querySelector('input[name="req-a-reqDate"]')?.value || "";

  const statutorySelect = document.querySelector('#rct-requisitions-partial-requisition-120 select');
  const statutoryItem = statutorySelect?.selectedOptions[0]?.textContent.trim() || "";

  const requisitionData = {
    requisitionDate: date,
    requester,
    hiringManagers,
    vacancyTitle: vacTitleValue,
    designationCode,
    corporateTitle,
    salaryGrade,
    employmentType: empType,
    expectedStartDate: exStartDate,
    requisitionEntryDate: reqDate,
    statutoryItem
  };

  return requisitionData;
})