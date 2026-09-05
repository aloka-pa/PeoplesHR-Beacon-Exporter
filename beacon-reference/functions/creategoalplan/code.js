(async function goalPlanningFromIframe() {
  const iframe = document.querySelector('#ifrmPage');
  if (!iframe) {
    return;
  }

  // Wait until iframe is fully loaded
  await new Promise(resolve => {
    if (iframe.contentDocument?.readyState === 'complete') return resolve();
    iframe.addEventListener('load', () => resolve(), { once: true });
  });

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  const iframeCKEDITOR = iframe.contentWindow?.CKEDITOR;

  // Extract all goal descriptions
  function extractIframeDescriptions() {
    const result = [];
    const textareas = iframeDoc.querySelectorAll("textarea[id*='txtTitle_']:not(.label-Hide):not(.label-Hide *)");

    textareas.forEach((txtTitleElement) => {
      const txtTitleId = txtTitleElement.id;
      const ckInstance = iframeCKEDITOR?.instances?.[txtTitleId];
      const value = ckInstance ? ckInstance.getData() : txtTitleElement.value;

      const panel = txtTitleElement.closest('.panel') || txtTitleElement.closest('[class*="panel"]');
      let groupHeaderText = '';

      if (panel) {
        const header = panel.querySelector('.panel-heading .normal.HeaderJs') ||
                       panel.querySelector('.panel-heading') ||
                       panel.querySelector('[class*="panel-heading"]');
        groupHeaderText = header?.innerText?.trim() || '[No Header Found]';
      }

      result.push({
        id: txtTitleId,
        header: groupHeaderText,
        value: value
      });
    });

    return result;
  }

  const alertheader = extractIframeDescriptions(); 
  if (alertheader.length === 0) {
    alert("Please click 'Add Goal' to add at least one goal description");
    return "Please click 'Add Goal' to add at least one goal description";
  }

  // Find only the OPENED/EXPANDED goal group
  const expandedDiv = iframeDoc.querySelector('div[id^="DivGGGoals_"]:not([style*="display: none"])');
  if (!expandedDiv) {
    alert("Please expand a goal group before proceeding.");
    return;
  }

  // Find the corresponding anchor <a> tag (header) for the expanded group
  const divId = expandedDiv.id;  // e.g., DivGGGoals_123
  const openedHeader = iframeDoc.querySelector(`a[href="#${divId}"]`);

  if (!openedHeader) {
    alert("Unable to locate the opened group header.");
    return;
  }

  const groupName = openedHeader.querySelector('.HeaderJs')?.innerText.trim();
  const weightage = openedHeader.querySelector('[data-bind*="GGRP_WEIGHTAGE"]')?.innerText.trim();
  const minGoals = openedHeader.querySelector('[data-bind*="GGRP_MIN"]')?.innerText.trim();
  const maxGoals = openedHeader.querySelector('[data-bind*="GGRP_MAX"]')?.innerText.trim();

  if (!groupName) {
    alert("Opened group has no name. Please verify.");
    return;
  }

  // Construct the message for ONLY the opened group
  let message = `You are tasked with creating a **Goal Planning Description** for the designation.

###  Objective:
Generate **meaningful, measurable goal descriptions** for the group shown below based on the role's responsibilities:
- Suggest at least **one detailed goal description**
- Include **evaluation focus** (e.g., efficiency, innovation, leadership)
- Ensure alignment with job responsibilities 
- Avoid repetition
- If user confirms, invoke the tool \`fillingGoalPanningDescription\` to auto-fill.

---

###  Evaluation Group:
**${alertheader[0]. header}**  
- Weightage: ${weightage || "N/A"}%  
- Required Goals: ${minGoals || "?"} to ${maxGoals || "?"} `;


  BeaconBar.openChatV2({
    agentName: "goalplanning",
    message: "Create Goal Descriptions",
    hiddenText: message
  });

})();