(async function (ad, e) {
    try {
        const iframe = document.querySelector('#ifrmPage');
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
            throw new Error('Iframe not found or inaccessible.');
        }

        const iframeDoc = iframe.contentDocument;
        const iframeWin = iframe.contentWindow;

        const response = await fetch(
            iframeWin.RctUrl(`Advertisements/ViewAdvertisement?id=${ad.AdvId}`),
            { method: 'GET' }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch advertisement. Status: ${response.status}`);
        }

        const data = await response.text();

        const mainId = iframeDoc.querySelector('#recApplyVacancy');
        let container = mainId.querySelector('#viewAdContainer');

        if (!container) {
            container = iframeDoc.createElement('div');
            container.id = 'viewAdContainer';
            mainId.appendChild(container);
        }

        container.innerHTML = data;

        const modal = iframeDoc.querySelector('#rctAdView');
        if (modal && typeof iframeWin.$(modal).modal === 'function') {
            iframeWin.$(modal).modal('show'); // Bootstrap modal inside iframe
        }

    } catch (error) {
        const iframe = document.querySelector('#ifrmPage');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.RctShowError(null, 'Fetch Failed', error.message);
        }
    }
});
