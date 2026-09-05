(function (data, args, reqOptions) {

  function parseGoalPlaningDescriptions(rawText) {
    const descriptionMap = {};
    if (!rawText) {
      return descriptionMap;
    }

    rawText.split(";").forEach((entry) => {
      const [title, ...descParts] = entry.split(":");
      if (title && descParts.length > 0) {
        const key = title.trim().toLowerCase();
        const value = descParts.join(":").trim();
        if (key && value) {
          descriptionMap[key] = value;
        }
      }
    });

    return descriptionMap;
  }

  const rawGoalPlaningDescriptions = args.GoalPlaningDescriptions || "";
  const goalTitle = args.title || "";
  const descriptionMap = parseGoalPlaningDescriptions(rawGoalPlaningDescriptions);

  if (Object.keys(descriptionMap).length === 0) {
    return "No valid descriptions found to process.";
  }

  const iframe = document.getElementById('ifrmPage');
  if (!iframe || !iframe.contentDocument || !iframe.contentWindow) {
    return "iframe or its content not available.";
  }

  const iframeDoc = iframe.contentDocument;
  const iframeCKEDITOR = iframe.contentWindow.CKEDITOR;
  if (!iframeCKEDITOR) {
    return "CKEditor not found inside iframe.";
  }

  const textareas = iframeDoc.querySelectorAll("textarea[id*='txtTitle_']:not(.label-Hide):not(.label-Hide *)");
  let filled = false;

  textareas.forEach((txtTitleElement) => {
    const panel = txtTitleElement.closest('.panel') || txtTitleElement.closest('[class*="panel"]');
    if (!panel) return;

    const groupHeader = panel.querySelector('.panel-heading .normal.HeaderJs') ||
                        panel.querySelector('.panel-heading') ||
                        panel.querySelector('.HeaderJs');
    if (!groupHeader) return;

    const groupName = groupHeader.textContent.trim();
    const groupKey = groupName.toLowerCase();

    if (descriptionMap[groupKey]) {
      // Fill the title
      txtTitleElement.value = goalTitle;

      const koCtx = iframe.contentWindow.ko.contextFor(txtTitleElement);
      if (koCtx?.$data?.GOAL_TITLE && typeof koCtx.$data.GOAL_TITLE === "function") {
        koCtx.$data.GOAL_TITLE(goalTitle);
      }

      // Fill the description in CKEditor
      for (const instanceName in iframeCKEDITOR.instances) {
        const editorInstance = iframeCKEDITOR.instances[instanceName];
        editorInstance.setData(descriptionMap[groupKey]);
      }

      filled = true;
    }
  });

  setTimeout(() => {
    BeaconBar.closeChat();
  }, 12000);

  setTimeout(() => {
    BeaconBar.showSnackbar("If you want to add a goal, please click 'Generate Goal Planning Description' again.");
  }, 14000);

  if (filled) {
    return {
      message: "Generated based on the description. Now show actions and measurements suggestions — each description needs a goal title. the chat is collapsed in 12 secs if you want again do that click generate goal Desription show in strong text "
    };
  } else {
    alert("Please click 'Add Goal' first before proceeding.");
    return "No matching goal section found to fill. Prompted user to add goal.";
  }
});
