(async function (data, args, reqOptions) {
  if (
  !BeaconBar.user?.metaData?.menus?.some(menu =>
    menu.includes("EIM/WorkExperience.aspx")
  )
) {
  return { error: true, message: "You do not have access to Work Experience Page. Please contact HR Admin." };
}
  let finalData = args.WorkExperienceRecords.map(x => ({
    ...x,
    EmpNumber: window.empNumber1
  }));
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json");
  myHeaders.append("x-requested-with", "XMLHttpRequest");



  const raw = JSON.stringify(finalData);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch(`${window.origin}/hr/EIMV9/api/WorkExperienceAPI/SaveWorkExperience/`, requestOptions);
  return await response.json();
})
