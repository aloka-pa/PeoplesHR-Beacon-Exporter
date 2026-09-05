(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("Benefit/DefineMasterData.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('Benefit/DefineMasterData.aspx');
  let url;
  if (updateurl.updateUrl) {
    url = updateurl.updateUrl;
  } else {
    url = "Benefit/DefineMasterData.aspx"
  }
  const detail = await BeaconBar.executeFunction('getmodule')(url);

  window.details = detail;

  const parser = new DOMParser();
  const document = parser.parseFromString(detail.rawData, "text/html");

  const listItems = document.querySelectorAll('#body_cboMasterDataType_DropDown .rcbList .rcbItem');
  const values = [...detail.rawData.matchAll(/"value":\s*"([^"]+)"/g)]
    .map(m => m[1])
    .filter(v => v.trim() !== "");
  const masterDataReimbursementTypes = [];
  let valueIndex = 0;

  listItems.forEach((item) => {
    const text = item.textContent.trim();
    if (text) {
      masterDataReimbursementTypes.push({
        index: valueIndex + 1,
        text: text,
        value: values[valueIndex]
      });
      valueIndex++;
    }
  });
  return masterDataReimbursementTypes;
});
