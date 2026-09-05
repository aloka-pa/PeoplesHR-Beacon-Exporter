(function (arg) {
  const menus = window.BeaconBar.user.metaData.menus;
  const commandMenu = arg.metaData.menu;

  // Normalize a URL by removing mvc and bs query params
  function normalizeUrl(url) {
    try {
      // Handle relative URLs by prepending a dummy base
      const fullUrl = new URL(url, window.origin);
      fullUrl.searchParams.delete('mvc');
      fullUrl.searchParams.delete('bs');

      // Reconstruct: pathname + remaining search + hash
      let normalized = fullUrl.pathname.replace(/^\//, ''); // remove leading slash from dummy base
      if (fullUrl.search) normalized += fullUrl.search;
      if (fullUrl.hash) normalized += fullUrl.hash;

      return normalized.toLowerCase();
    } catch (e) {
      // Fallback: manual strip
      return url
        .replace(/[?&]mvc=[^&]*/g, '')
        .replace(/[?&]bs=[^&]*/g, '')
        .replace(/\?&/, '?')
        .replace(/&&/g, '&')
        .replace(/[?&]$/, '')
        .toLowerCase();
    }
  }

  const normalizedInput = normalizeUrl(commandMenu);

  const matched = menus.some(menuUrl => {
    const normalizedMenu = normalizeUrl(menuUrl);
    return normalizedMenu === normalizedInput;
  });
  return matched;
});