(function (html){
    //done
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    const details = {
        viewState: document.querySelector('#__VIEWSTATE')?.value || '',
        eventValidation: document.querySelector('#__EVENTVALIDATION')?.value || '',
        viewStateGen: document.querySelector('#__VIEWSTATEGENERATOR')?.value || '',
        publicKey : document.querySelector("#ctl00_body_txtPublicKey")?.value || "",
        rawData:html
    }

    return details
})