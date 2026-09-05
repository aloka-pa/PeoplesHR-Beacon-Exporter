(async function(data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("absence/ess/ViewSubbordinateLeaveDetail.aspx?subo=0")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  await BeaconBar.executeFunction("updateCustomPageSize")();
  const selectemployee  = await BeaconBar.executeFunction("getemployeelist");
  BeaconBar.setSharedData("selectEmployees",selectemployee )

  return { message :"if user selects  all employees then take all employees or else take employee id or employee name call the tool 'get company leave details tool'" }; 
})