(async function (data, args, reqOptions) {
  const jsonHeaders = new Headers();
  jsonHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  jsonHeaders.append("Content-Type", "application/json; charset=UTF-8");
  jsonHeaders.append("X-Requested-With", "XMLHttpRequest");

  if (window.benCode.benName === "Data Reimbursement") {

    window.structure.applicationRowVms[3].ApplicationStructureRowVms[0].RefValue = args.dataReimbursement.yearValue;
    window.structure.applicationRowVms[3].ApplicationStructureRowVms[1].RefValue = args.dataReimbursement.monthValue;
    window.structure.applicationRowVms[4].ApplicationStructureRowVms[0].RefValue = args.dataReimbursement.amount;
    window.structure.applicationRowVms[5].ApplicationStructureRowVms[0].RefValue = args.dataReimbursement.requestAmount;

    const raw = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      BetCommentMandatoryFlg: window.benefitdetails.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.dataReimbursement.benComment,
      VisibilityState: window.benefitdetails.VisibilityState,
      KeyValue: window.benefitdetails.KeyValue
    });

    const requestOptions = {
      method: "POST",
      headers: jsonHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/SaveApplication`, requestOptions);
    const details = await response.json();

    return details.Message;
  }

  if (window.benCode.benName === "Fuel Reimbursements") {

    window.structure.applicationRowVms.forEach(x => {
      x.ApplicationStructureRowVms.forEach(y => {
        if (y.ApplicationGridDefVm === null) {
          y.ApplicationGridDefVm = {
            ApplicationGridRowVms: [],
            GridData: {
              RowItems: []
            }
          };
        }
        if (y.RefMultiValue === null) {
          y.RefMultiValue = []
        }
      });
    });

    window.structure.applicationRowVms[1].ApplicationStructureRowVms[0].RefValue = args.fuelReimbursements.applDate;
    window.structure.applicationRowVms[2].ApplicationStructureRowVms[1].RefValue = args.fuelReimbursements.billAmount;
    window.structure.applicationRowVms[2].ApplicationStructureRowVms[2].RefValue = args.fuelReimbursements.reqAmount;
    // window.structure.applicationRowVms[5].ApplicationStructureRowVms[0].RefValue = args.fuelReimbursements.requestAmount;

    const raw = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      BetCommentMandatoryFlg: window.benefitdetails.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.fuelReimbursements.benComment,
      VisibilityState: window.benefitdetails.VisibilityState,
      KeyValue: window.benefitdetails.KeyValue
    });

    const requestOptions = {
      method: "POST",
      headers: jsonHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9//api/ApplicationApi/SaveApplication/`, requestOptions);
    const details = await response.json();

    return details.Message;
  }

  if (window.benCode.benName === "Medical Reimbursement") {
    window.structure.applicationRowVms[8].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.noOfDaysNormalRoom || "0.00";
    window.structure.applicationRowVms[9].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.noOfDaysNICU || "0.00";
    window.structure.applicationRowVms[13].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.consultation || "0.00";
    window.structure.applicationRowVms[14].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.medication || "0.00";
    window.structure.applicationRowVms[15].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.theater || "0.00";
    window.structure.applicationRowVms[16].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.tests || "0.00";
    window.structure.applicationRowVms[19].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.amountMentionedInBill || "0.00";
    window.structure.applicationRowVms[17].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.otherChanges || "0.00";
    window.structure.applicationRowVms[20].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.natureOfIllness || "";
    window.structure.applicationRowVms[21].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.billedDate;
    window.structure.applicationRowVms[22].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.accept
    // window.structure.applicationRowVms[2].ApplicationStructureRowVms[0].RefValue = args.medicalReimbursement.reqAmount;

    const raw = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      BetCommentMandatoryFlg: window.benefitdetails.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.medicalReimbursement.applicantComment,
      VisibilityState: window.benefitdetails.VisibilityState,
      KeyValue: window.benefitdetails.KeyValue
    });

    const requestOptions = {
      method: "POST",
      headers: jsonHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/SaveApplication`, requestOptions);
    const details = await response.json();

    return details.Message;
  }

  if (window.benCode.benName === "Parking Reimbursement") {
    const extData = args.parkingReimbursement.parkingReimbursement1.map((item, index) => ({
      RowId: index + 1,
      IsEdit: false,
      ColumnItems: [
        {
          BesId: "P100003",
          BesCtrlType: "5",
          Code: item.applicationDate,
          Value: item.applicationDate,
          CurrencyValue: `undefined ${item.applicationDate}`
        },
        {
          BesId: "P100010",
          BesCtrlType: "1",
          Code: item.reason,
          Value: item.reason,
          CurrencyValue: `undefined ${item.reason}`
        },
        {
          BesId: "P100006",
          BesCtrlType: "2",
          Code: `${item.claimAmount}`,
          Value: `${item.claimAmount}`,
          CurrencyValue: `undefined ${item.claimAmount}`
        }
      ]
    }));

    window.structure.applicationRowVms.forEach(x => {
      x.ApplicationStructureRowVms.forEach(y => {
        if (y.ApplicationGridDefVm === null) {
          y.ApplicationGridDefVm = {
            ApplicationGridRowVms: [],
            GridData: {
              RowItems: []
            }
          };
        }
      });
    });

    window.structure.applicationRowVms[4].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms.forEach(x => {
      x.ApplicationStructureRowVms.forEach(y => {
        if (y.ApplicationGridDefVm === null) {
          y.ApplicationGridDefVm = {
            ApplicationGridRowVms: [],
            GridData: {
              RowItems: []
            }
          };
        }
      });
    })

    const ark = window.structure.applicationRowVms[4].ApplicationStructureRowVms[0].ApplicationGridDefVm.GridData.RowItems = extData;
    window.structure.applicationRowVms[5].ApplicationStructureRowVms[0].RefValue = args.parkingReimbursement.totalRequestAmount


    const raw = JSON.stringify({
      "GridData": {
        "RowItems": []
      },
      "GridColumn": extData[0],
      "GridDef": window.structure.applicationRowVms[4].ApplicationStructureRowVms[0].ApplicationGridDefVm.GridDef,
      "GridState": window.structure.applicationRowVms[4].ApplicationStructureRowVms[0].ApplicationGridDefVm.GridState,
      "StepId": window.benefitdetails?.StepId,
      "AppId": window.benefitdetails?.AppId,
      "WfMainId": window.benefitdetails.WfMainId,
      "ApplicationRowVms": window.structure.applicationRowVms,
      "CurrentEmployeeNumber": window.Emp,
      "CurrentBenefitTypeCode": window.benCode.benCode,
      "VisibilityState": window.benefitdetails.VisibilityState,
      "ReadOnlyState": window.benefitdetails.ReadOnlyState,
      "IsEditGrid": false,
      "IsWorkflow": window.benefitdetails.IsWorkflow,
      "IsSummary": window.benefitdetails.IsSummary,
      "KeyValue": window.benefitdetails.KeyValue,
      "BetAppYear": window.benefitdetails.BetAppYear
    });

    const requestOptions = {
      method: "POST",
      headers: jsonHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9//api/ApplicationApi/ValidateGridControl/`, requestOptions);
    const details = await response.json();

    const raw1 = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      BetCommentMandatoryFlg: window.benefitdetails.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.parkingReimbursement.applicantComment,
      VisibilityState: window.benefitdetails.VisibilityState,
      KeyValue: window.benefitdetails.KeyValue
    });

    const requestOptions1 = {
      method: "POST",
      headers: jsonHeaders,
      body: raw1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/SaveApplication`, requestOptions1);
    const details1 = await response1.json();

    return details1.Message;
  }

  if (window.benCode.benName === "Telephone Bill Reimbursement") {
    window.structure.applicationRowVms[1].ApplicationStructureRowVms[0].RefValue = args.telephoneBillReimbursement.applicationDate;

    const raw = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentBenefitStructId: window.structure.applicationRowVms[1].ApplicationStructureRowVms[0].BesId,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      VisibilityState: window.benefitdetails.VisibilityState,
      ReadOnlyState: window.benefitdetails.ReadOnlyState,
      StepId: window.benefitdetails.StepId,
      AppId: window.benefitdetails.AppId,
      WfMainId: window.benefitdetails.WfMainId,
      CancelWfMainId: window.benefitdetails.CancelWfMainId,
      IsWorkflow: window.benefitdetails.IsWorkflow,
      IsSummary: window.benefitdetails.IsSummary,
      BetAppYear: window.benefitdetails.BetAppYear
    });

    const requestOptions = {
      method: "POST",
      headers: jsonHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9//api/ApplicationApi/GetDependentControlValues`, requestOptions);
    const details = await response.json();

    window.structure.applicationRowVms[2].ApplicationStructureRowVms[1].RefValue = args.telephoneBillReimbursement.amountInBills;
    const target = window.structure?.applicationRowVms?.[2]?.ApplicationStructureRowVms?.[2];

    if (target) {
      target['RefValue'] = args.telephoneBillReimbursement.totalRequest;
    }



    const raw1 = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      BetCommentMandatoryFlg: window.benefitdetails.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.telephoneBillReimbursement.applicantComment,
      VisibilityState: window.benefitdetails.VisibilityState,
      KeyValue: window.benefitdetails.KeyValue
    });

    const requestOptions1 = {
      method: "POST",
      headers: jsonHeaders,
      body: raw1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/SaveApplication`, requestOptions1);
    const details1 = await response1.json();

    return details1.Message;
  }

  if (window.benCode.benName === "Vehicle Number Registration") {

    window.structure.applicationRowVms[3].ApplicationStructureRowVms[0].RefValue = args.vehicleNumberRegistration.applicationDate;
    window.structure.applicationRowVms[2].ApplicationStructureRowVms[1].RefValue = args.vehicleNumberRegistration.vehicleRegistrationNumber;

    const raw = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      BetCommentMandatoryFlg: window.benefitdetails.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.vehicleNumberRegistration.applicantComment,
      VisibilityState: window.benefitdetails.VisibilityState,
      KeyValue: window.benefitdetails.KeyValue
    });

    const requestOptions = {
      method: "POST",
      headers: jsonHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/SaveApplication`, requestOptions);
    const details = await response.json();

    return details.Message;
  }
  if (window.benCode.benName === "Telephone Bill Reimbursement") {
    window.structure.applicationRowVms[1].ApplicationStructureRowVms[0].RefValue = args.telephoneBillReimbursement.applicationDate;

    const raw = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentBenefitStructId: window.structure.applicationRowVms[1].ApplicationStructureRowVms[0].BesId,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      VisibilityState: window.benefitdetails.VisibilityState,
      ReadOnlyState: window.benefitdetails.ReadOnlyState,
      StepId: window.benefitdetails.StepId,
      AppId: window.benefitdetails.AppId,
      WfMainId: window.benefitdetails.WfMainId,
      CancelWfMainId: window.benefitdetails.CancelWfMainId,
      IsWorkflow: window.benefitdetails.IsWorkflow,
      IsSummary: window.benefitdetails.IsSummary,
      BetAppYear: window.benefitdetails.BetAppYear
    });

    const requestOptions = {
      method: "POST",
      headers: jsonHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9//api/ApplicationApi/GetDependentControlValues`, requestOptions);
    const details = await response.json();

    window.structure.applicationRowVms[2].ApplicationStructureRowVms[1].RefValue = args.telephoneBillReimbursement.amountInBills;
    window.structure.applicationRowVms[2].ApplicationStructureRowVms[2].RefValue = args.telephoneBillReimbursement.totalRequestAmount;

    const raw1 = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      BetCommentMandatoryFlg: window.benefitdetails.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.telephoneBillReimbursement.applicantComment,
      VisibilityState: window.benefitdetails.VisibilityState,
      KeyValue: window.benefitdetails.KeyValue
    });

    const requestOptions1 = {
      method: "POST",
      headers: jsonHeaders,
      body: raw1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/SaveApplication`, requestOptions1);
    const details1 = await response1.json();

    return details1.Message;


  }

  if (window.benCode.benName === "Health Plan") {

    window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms.forEach(x => {
      x.ApplicationStructureRowVms.forEach(y => {
        if (y.ApplicationGridDefVm === null) {
          y.ApplicationGridDefVm = {
            ApplicationGridRowVms: [],
            GridData: {
              RowItems: []
            }
          };
        }
      });
    });

    const extData = args.healthPlan.enrollments.map((item, index) => ({
      RowId: index + 1,
      IsEdit: false,
      ColumnItems: [
        {
          "BesId": "P300006",
          "BesCtrlType": "3",
          "Code": item.dependent,
          "Value": item.dependentName,
          "CurrencyValue": `undefined ${item.dependentName}`
        },
        {
          "BesId": "P300009",
          "BesCtrlType": "3",
          "Code": item.planValue,
          "Value": item.planName,
          "CurrencyValue": `undefined ${item.planName}`
        },
        {
          "BesId": "P300007",
          "BesCtrlType": "7",
          "Code": item.totalRequestAmount,
          "Value": item.totalRequestAmount,
          "CurrencyValue": `undefined ${item.totalRequestAmount}`
        },
        {
          "BesId": "P300008",
          "BesCtrlType": "3",
          "Code": item.dependentDentalEnrollmentValue,
          "Value": item.dependentDentalEnrollmentName,
          "CurrencyValue": `undefined ${item.dependentDentalEnrollmentName}`
        }
      ]
    }));

    window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.GridData.RowItems = extData;

    window.structure.applicationRowVms[3].ApplicationStructureRowVms[0].RefValue = args.healthPlan.enrollments[0].healthPlanYear;
    window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms[0].ApplicationStructureRowVms[0].RefValue = args.healthPlan.enrollments[0].dependent;
    window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms[1].ApplicationStructureRowVms[0].RefValue = args.healthPlan.enrollments[0].planValue;
    window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms[3].ApplicationStructureRowVms[0].RefValue = args.healthPlan.enrollments[0].dependentDentalEnrollmentValue;

    const raw = JSON.stringify({
      "ApplicationRowVms": window.structure.applicationRowVms,
      "CurrentBenefitStructId": window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms[1].ApplicationStructureRowVms[0].BesId,
      "CurrentEmployeeNumber": window.Emp,
      "CurrentBenefitTypeCode": window.benCode.benCode,
      "VisibilityState": window.benefitdetails.VisibilityState,
      "ReadOnlyState": window.benefitdetails.ReadOnlyState,
      "StepId": window.benefitdetails.StepId,
      "AppId": window.benefitdetails.AppId,
      "WfMainId": window.benefitdetails.WfMainId,
      "CancelWfMainId": window.benefitdetails.CancelWfMainId,
      "IsWorkflow": window.benefitdetails.IsWorkflow,
      "IsSummary": window.benefitdetails.IsSummary,
      "BetAppYear": window.benefitdetails.BetAppYear
    });

    const requestOptions = {
      method: "POST",
      headers: jsonHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9//api/ApplicationApi/GetDependentControlValues/`, requestOptions);
    const details = await response.json();

    window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms[0].ApplicationStructureRowVms[0].RefValue = args.healthPlan.enrollments[0].dependent;
    window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms[1].ApplicationStructureRowVms[0].RefValue = args.healthPlan.enrollments[0].planValue;
    window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms[2].ApplicationStructureRowVms[0].RefValue = args.healthPlan.enrollments[0].totalRequestAmount;
    window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.ApplicationGridRowVms[3].ApplicationStructureRowVms[0].RefValue = args.healthPlan.enrollments[0].dependentDentalEnrollmentValue;

    const raw2 = JSON.stringify({
      "GridData": {
        "RowItems": []
      },
      "GridColumn": extData[0],
      "GridDef": window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.GridDef,
      "GridState": window.structure.applicationRowVms[7].ApplicationStructureRowVms[0].ApplicationGridDefVm.GridState,
      "StepId": window.benefitdetails?.StepId,
      "AppId": window.benefitdetails?.AppId,
      "WfMainId": window.benefitdetails.WfMainId,
      "ApplicationRowVms": window.structure.applicationRowVms,
      "CurrentEmployeeNumber": window.Emp,
      "CurrentBenefitTypeCode": window.benCode.benCode,
      "VisibilityState": window.benefitdetails.VisibilityState,
      "ReadOnlyState": window.benefitdetails.ReadOnlyState,
      "IsEditGrid": false,
      "IsWorkflow": window.benefitdetails.IsWorkflow,
      "IsSummary": window.benefitdetails.IsSummary,
      "KeyValue": window.benefitdetails.KeyValue,
      "BetAppYear": window.benefitdetails.BetAppYear
    });

    const requestOptions2 = {
      method: "POST",
      headers: jsonHeaders,
      body: raw2,
      redirect: "follow"
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9//api/ApplicationApi/ValidateGridControl/`, requestOptions2);
    const details2 = await response2.json();

    const raw3 = JSON.stringify({
      ApplicationRowVms: window.structure.applicationRowVms,
      CurrentEmployeeNumber: window.Emp,
      CurrentBenefitTypeCode: window.benCode.benCode,
      BetCommentMandatoryFlg: window.benefitdetails.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.healthPlan.applicantComment,
      VisibilityState: window.benefitdetails.VisibilityState,
      KeyValue: window.benefitdetails.KeyValue
    });

    const requestOptions3 = {
      method: "POST",
      headers: jsonHeaders,
      body: raw3,
      redirect: "follow"
    };

    const response3 = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/SaveApplication`, requestOptions3);
    const details3 = await response3.json();

    return details3.Message;
  }

})
