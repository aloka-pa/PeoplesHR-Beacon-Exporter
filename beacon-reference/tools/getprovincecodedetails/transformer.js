(async function (data, args, reqOptions) {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Location.aspx")) {
        return "It seems you don't have access. Please check with the HR Admin";
    }
    const sl = await BeaconBar.getSharedData("sl");
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const formdata = new FormData();
    formdata.append("scrollLeft", "0");
    formdata.append("scrollTop", "0");
    formdata.append("__EVENTTARGET", "ctl00$body$ddlCountry");
    formdata.append("__EVENTARGUMENT", "");
    formdata.append("__LASTFOCUS", "");
    formdata.append("__VIEWSTATE", window.viewState.viewState);
    formdata.append("__VIEWSTATEGENERATOR", window.viewState.viewStateGen);
    formdata.append("__VIEWSTATEENCRYPTED", "");
    formdata.append("__EVENTVALIDATION", window.viewState.eventValidation);
    formdata.append("ctl00$hdnDateFormat", "dd/mm/yy");
    formdata.append("ctl00$body$hdnIsHead", "");
    formdata.append("ctl00$body$hdnEditItemIndex", "");
    formdata.append("ctl00_body_RadWindowManager1_ClientState", "");
    formdata.append("ctl00$body$txtName", args.locationName);
    formdata.append("ctl00$body$txtAbbreviation", "");
    formdata.append("ctl00$body$txttp", "");
    formdata.append("ctl00$body$txtFax", "");
    formdata.append("ctl00$body$txtemail", "");
    formdata.append("ctl00$body$txturl", "");
    formdata.append("ctl00$body$txtaddress", "");
    formdata.append("ctl00$body$ddlCountry", args.countryCode);
    formdata.append("ctl00$body$ddlProvince", "-1");
    formdata.append("ctl00$body$cboTimeZone", "");
    formdata.append("ctl00$body$txtHeadName", "");
    formdata.append("ctl00$body$txtHTitle", "");
    formdata.append("ctl00$body$txtAdminName", "");
    formdata.append("ctl00$body$filMyFile", "file");
    formdata.append("ctl00$body$hdnDefCountry", "-1");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${sl}/EIM/Location.aspx`, requestOptions)
    const html = await response.text();

    const districtDetails = await BeaconBar.executeFunction("getDomExtract")(html);
    window.viewState = districtDetails;

    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    const provinceSelect = document.querySelector('#ctl00_body_ddlProvince');
    const provinces = Array.from(provinceSelect.options)
        .filter(option => option.value !== "-1")
        .map(option => ({
            name: option.textContent.trim(),
            value: option.value
        }));
    return provinces;
})