(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIMV9/SetupConfiguration/SetupConfiguration?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const requiredOpt = {
    method: "GET",
    headers: myHeaders
  };

  const resposne = await fetch(`${location.origin}/${reqOptions.sl}/EIMV9/SetupConfiguration/SetupConfiguration?mvc=1&_=${Date.now()}`, requiredOpt);

  const details = await resposne.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(details, 'text/html');

  const scripts = Array.from(doc.querySelectorAll('script'));

  let modelConfText = "";

  for (const script of scripts) {
    if (script.textContent.includes("var modelConf =")) {
      modelConfText = script.textContent;
      break;
    }
  }

  if (!modelConfText) {
    return [];
  }

  const modelConfJsonStr = modelConfText
    .split("var modelConf =")[1]
    .split(";")[0]
    .trim();

  const modelConf = JSON.parse(modelConfJsonStr);

  const profileData = {
    "Employee Self Service": 1,
    "Manager Self Service": 2
  }

  const sectionData = modelConf.SectionList.map(section => ({
    SectionCode: section.SectionCode,
    SectionName: section.SectionName
  }));

  window.list = sectionData;
  return { sectionData, profileData };
})