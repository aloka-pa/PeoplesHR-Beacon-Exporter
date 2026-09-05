(async function (param) {

  const EXCLUDE_KEYS = ["mvc", "bs"];

  // Strip leading ../ or ./
  const trimmedUrl = param.replace(/^(\.\.\/)+|(\.\/)+/, "");

  // Normalize URL by removing EXCLUDE_KEYS from query params for comparison
  function normalizeUrl(url) {
    const [path, query] = url.split("?");
    const params = new URLSearchParams(query || "");
    EXCLUDE_KEYS.forEach(key => params.delete(key));
    const remaining = params.toString();
    return remaining ? `${path}?${remaining}` : path;
  }

  const normalizedInput = normalizeUrl(trimmedUrl).toLowerCase();

  // Match menu by comparing normalized URLs (excluding mvc, bs)
  const matchedMenu = BeaconBar?.user?.metaData?.menus?.find(menu =>
    normalizeUrl(menu).toLowerCase() === normalizedInput
  ) ?? null;


  // If no match, use loadModuleUrl directly
  if (!matchedMenu) {
    top.loadModuleUrl(trimmedUrl);
    return;
  }

  const updatedParam = await BeaconBar.executeFunction("updateUrlParams")(matchedMenu);

  let finalUrl;

  // 🔑 Key fix: only hit the digest API when the MATCHED MENU URL actually has params.
  // updatedParam.updateParams reflects the matched menu's own params, not the user's input.
  const hasParams = updatedParam.updateParams !== null &&
                     updatedParam.updateParams !== undefined &&
                     Object.keys(updatedParam.updateParams).length > 0;

  if (!hasParams) {

    // No params on the matched menu URL -> skip digest entirely, just use updateUrl as-is
    if (matchedMenu.includes("#")) {
      const [base, hashPart] = updatedParam.updateUrl.split("#");
      finalUrl = `../${base.replace(/^\//, "")}${hashPart ? `#${hashPart}` : ""}`;
    } else {
      const parser = new URL(updatedParam.updateUrl, window.location.origin);
      const cleanPath = parser.pathname.replace(/^\//, "");
      const remainingQuery = parser.searchParams.toString();
      finalUrl = `../${cleanPath}${remainingQuery ? `?${remainingQuery}` : ""}`;
    }

  } else if (matchedMenu.includes("#")) {

    const [base, hashPart] = updatedParam.updateUrl.split("#");
    const [hashPath, hashQuery] = hashPart.split("?");
    const queryParams = new URLSearchParams(hashQuery || "");
    const digestObj = await BeaconBar.executeFunction("getDigest")(updatedParam.updateParams);
    queryParams.set("digest", decodeURIComponent(digestObj.digest));
    finalUrl = `../${base.replace(/^\//, "")}#${hashPath}?${queryParams.toString()}`;

  } else {

    const parser = new URL(updatedParam.updateUrl, window.location.origin);
    const digestObj = await BeaconBar.executeFunction("getDigest")(updatedParam.updateParams);
    parser.searchParams.set("digest", decodeURIComponent(digestObj.digest));
    const cleanPath = parser.pathname.replace(/^\//, "");
    finalUrl = `../${cleanPath}?${parser.searchParams.toString()}`;

  }

  top.loadModulePageUrl(finalUrl);

})