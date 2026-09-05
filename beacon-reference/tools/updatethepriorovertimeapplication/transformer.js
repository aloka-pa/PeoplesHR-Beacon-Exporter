(async function (data, args, reqOptions) {
  window.updatePrior.forEach(x => {
    args.updatePriorOvertimeApplication.forEach(y => {
      if (x.OutDateText === y.selectedDates) {
        x.PreOTHrsText = y.PreOTHrsText;
        x.PostOTHrsText = y.PostOTHrsText;
        x.PriorDetail.PostOTHours = y.PostOTHrsText.trim().replace(':', '.');
        x.PriorDetail.PreOTHours = y.PreOTHrsText.trim().replace(':', '.');
        x.PriorDetail.ReasonCode = y.reason;
        x.IsSelected = true;
        if (y.comments) {
          x.PriorDetail.Comment = y.comments;
        }
      }
    });
  });

  const requestOptions = {
    method: "POST",
    headers: {
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    },
    body: JSON.stringify({
      PageMode: 0,
      PriorOTDetailList: window.updatePrior
    }),
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/TNAV9/api/PriorOT/SubmitPriorOTApplication/`, requestOptions);

  return await response.json();
});