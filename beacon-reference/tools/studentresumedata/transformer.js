(async function(data, args, reqOptions) {
  const resumeId = document.querySelector("#hdnViewappId").value;
  const resumeText = await BeaconBar.executeFunction('pdfcv')(resumeId);
  return resumeText;
})