(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/CompanyHierarchyDefine.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const details = await BeaconBar.executeFunction("getApiList")("CompanyHierarchyDefine");
  window.company = details;
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(details.rawData, 'text/html');

  const extractedData = Array.from(parsedDocument.querySelectorAll("tbody tr")).map(row => {
    const [levelCell, nameCell] = row.querySelectorAll("td");
    const href = row.querySelector("a")?.getAttribute("href") || "";
    const nodeMatch = href.match(/__doPostBack\('([^']+)'/);

    return {
      node: nodeMatch?.[1] || "",
      name: nameCell?.innerText.trim() || "",
      level: levelCell?.innerText.trim() || ""
    };
  }).filter(item => item.node && item.name && item.level);
  return extractedData;
})
