(function (data, args, reqOptions) {
  const details = BeaconBar.user.metaData.culture;
  const today = new Date();
  let result;

  if (details === "en-US") {
    result = {
      format: "MM/DD/YYYY",
      example: today.toLocaleDateString(details),
      culture: details
    };
  } else if (details === "en-GB") {
    result = {
      format: "DD/MM/YYYY",
      example: today.toLocaleDateString(details),
      culture: details
    };
  } else {
    result = {
      format: "DD/MM/YYYY",
      example: today.toLocaleDateString("en-GB"),
      culture: "en-GB"
    };
  }
  return result;
})
