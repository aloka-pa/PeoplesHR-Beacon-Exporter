(async function (vacancy) {
  try {
    const iframe = document.querySelector("iframe"); // Change selector if needed
    const iframeWindow = iframe.contentWindow;

    const requestId = vacancy.Id;
    const url = iframeWindow.RctUrl("HiringManagerProcess/ProcessView") 
              + "?reqId=" + encodeURIComponent(requestId);

    const response = await iframeWindow.fetch(url, {
      method: "GET",
      headers: { "Accept": "text/html" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const html = await response.text();
    iframeWindow.RctHiringMngrSum.ProFormData = html;

    iframeWindow.document.getElementById('rct-sumPage').style.display = 'none';
    const mainPage = iframeWindow.document.getElementById('rct-mainPage');
    mainPage.innerHTML = html;
    mainPage.style.display = 'block';

  } catch (error) {
    const iframe = document.querySelector("iframe");
    const iframeWindow = iframe.contentWindow;
    vacancy.IsLoadingDetailedView(false);
    iframeWindow.RctShowError(null, "Error", error.message);
  }
})
