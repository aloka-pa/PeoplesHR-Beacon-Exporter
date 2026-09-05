(async function (url) {
    //done
    const sl = await BeaconBar.getSharedData("sl");
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    let finalUrl = url.includes(".aspx") ? `${location.origin}/${sl}/${url}` : `${location.origin}/${url}.aspx`;

    const response = await fetch(finalUrl, requestOptions);
    const data = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');

    const details = {
        viewState: doc.querySelector('#__VIEWSTATE')?.value || '',
        eventValidation: doc.querySelector('#__EVENTVALIDATION')?.value || '',
        viewStateGen: doc.querySelector('#__VIEWSTATEGENERATOR')?.value || '',
        rawData: data
    }
    return details;
});