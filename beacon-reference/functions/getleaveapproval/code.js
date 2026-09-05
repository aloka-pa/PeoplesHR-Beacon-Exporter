(async function getLeaveApproval() {
  try {
    const token = await BeaconBar.executeFunction("getToken")();
    if (!token) {
      throw new Error("Failed to retrieve token.");
    }

    const url = `https://${location.host}/hr/AbsenceV9/api/LeaveApplication/GetEntitledLeaveTypes/`;
    const body = {
      EmpNumber: "MAAwADAAMAAwADIA",
      LeaveYear: new Date().getFullYear()
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '__cfafvalue': token
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const details = await response.json();
    const annualLeaveDataArray = details.filter(item => item.TypeName === "Annual Leave");
    return annualLeaveDataArray;
  } catch (error) {
  }
});
