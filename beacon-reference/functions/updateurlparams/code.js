(async function (targetUrl) {
    //done
    const menus = BeaconBar?.user?.metaData?.menus || [];

    const result = menus.find(url => url.includes(targetUrl));
    const updateParams = result?.split('?')[1] || null;

    return {
        updateUrl: result,
        updateParams: updateParams
    }
})