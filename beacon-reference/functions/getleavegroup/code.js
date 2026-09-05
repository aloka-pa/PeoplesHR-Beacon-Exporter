(async function getShortLeaveType(year) {
  //done
  try {
    const cfavalue = BeaconBar.getSharedData("token");
    const employeenumber = BeaconBar.getSharedData("EmpNumber");
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    debugger;
    const myHeaders = new Headers();
    myHeaders.append("__cfafvalue", cfavalue);
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("content-type", "application/json");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const raw = JSON.stringify({
      EmpNumber: employeenumber,
      LeaveYear: year
    });

    const response = await fetch(
      `${reqOptions}AbsenceV9/api/ShortLeaveApplication/GetEntitledShortLeaveTypes/`,
      {
        method: "POST",
        headers: myHeaders,
        body: raw
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        typecode: data[0].TypeCode,
        LGCode: data[0].LGCode
      };
    } else {
      throw new Error("No leave types returned");
    }
  } catch (error) {
    return null;
  }
})
