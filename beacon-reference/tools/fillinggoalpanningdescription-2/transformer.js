(function (data, args, reqOptions) {
  const goalTitle = args.GoalTitle || "";
  const goalDescription = args.GoalPlaningDescription || "";

  const iframe = document.getElementById('ifrmPage');
  if (!iframe || !iframe.contentDocument || !iframe.contentWindow) {
    return "iframe or its content not available.";
  }

  const iframeDoc = iframe.contentDocument;
  const iframeWin = iframe.contentWindow;
  const iframeCKEDITOR = iframeWin.CKEDITOR;

  if (!iframeCKEDITOR) {
    return "CKEditor not found inside iframe.";
  }

  const textareas = iframeDoc.querySelectorAll("textarea[id*='txtTitle_']:not(.label-Hide):not(.label-Hide *)");

  let goalFilled = false;

  for (const txtTitleElement of textareas) {
    txtTitleElement.value = goalTitle;

    const koCtx = iframeWin.ko.contextFor(txtTitleElement);
    if (koCtx?.$data?.GOAL_TITLE && typeof koCtx.$data.GOAL_TITLE === "function") {
      koCtx.$data.GOAL_TITLE(goalTitle);
      goalFilled = true;
      break;
    }
  }

  if (!goalFilled) {
    alert("Please click 'Add Goal' first before proceeding.");
    return "No goal section found. Prompted user to add goal.";
  }

  for (const instanceName in iframeCKEDITOR.instances) {
    if (iframeCKEDITOR.instances.hasOwnProperty(instanceName)) {
      iframeCKEDITOR.instances[instanceName].setData(goalDescription);
    }
  }

  setTimeout(() => {
    if (typeof BeaconBar?.closeChat === "function") {
      BeaconBar.closeChat();
    }
  }, 12000);

  setTimeout(() => {
    if (typeof BeaconBar?.showSnackbar === "function") {
      BeaconBar.showSnackbar("If you want to add a goal, please click 'Generate Goal Planning Description' again.");
    }
  }, 14000);

  return {
    message: "Goal title and description filled. Chat will collapse in 12 secs. Click 'Generate Goal Description' again to repeat."
  };
});
