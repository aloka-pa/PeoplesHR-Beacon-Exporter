(async function (data, args, reqOptions) {
  BeaconBar.setSharedData("argscycle" , args)
  const State = BeaconBar.getSharedData("selectLeaderShipViewState");
  await BeaconBar.executeFunction("selectedLeaderShip")(args, State);

  const searchEmployees = await BeaconBar.executeFunction("searchEmployee")();
  const selectingEmployees = await BeaconBar.executeFunction("selectEmployees")(searchEmployees);

function extractEmployeeDataFromHTMLAdvanced(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const table = doc.querySelector('table.MasterTable_Default');

  if (!table) {
    return { employees: [], invalidRows: [] };
  }

  const rows = table.querySelectorAll('tbody tr');
  const employees = [];
  const invalidRows = [];

  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 4) {
      const checkbox = cells[0].querySelector('input[type="checkbox"]'); // ✅ new
      const employeeNo = cells[1].textContent.trim();
      const name = cells[2].textContent.trim();
      const dateJoined = cells[3].textContent.trim();

      // collect checkbox info if available
      const checkboxInfo = checkbox
        ? {
            name: checkbox.name || null,
          }
        : null;

      const potentialEmployee = {
        employeeNo,
        name,
        dateJoined,
        checkbox: checkboxInfo, // ✅ include checkbox
        rowIndex: index
      };

      const isValidName = name.length > 0 && name !== '';
      const isValidDate = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateJoined);

      if (isValidName && isValidDate) {
        employees.push(potentialEmployee);
      } else {
        invalidRows.push({
          ...potentialEmployee,
          issues: {
            invalidName: !isValidName,
            invalidDate: !isValidDate
          }
        });
      }
    }
  });

  return { employees, invalidRows };
}


  // ✅ fix: access only employees
  const { employees, invalidRows } = extractEmployeeDataFromHTMLAdvanced(selectingEmployees);
  BeaconBar.setSharedData("employeesname", employees)
 function removeCheckboxInfo(employees) {
  return employees.map(({ checkbox, ...rest }) => rest);
}
const removedCheckboxInfo = removeCheckboxInfo(employees);
  await BeaconBar.executeFunction("downloadcsv")(removedCheckboxInfo, "selectedList");

  // ✅ reformatted only employees array
  const reformatted = removedCheckboxInfo.map((item, i) => ({
    ...item,
    rowIndex: i
  }));
  
  return { employees: reformatted, message: "do you want add any creteria filters ask just as consent" };
})
