(async function (rawPdfString) {
  try {
    if (!window.pdfjsLib || typeof window.pdfjsLib.getDocument !== 'function') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load PDF.js'));
        document.head.appendChild(script);
      });
    }

    const pdfjsLib = window.pdfjsLib;

    const uint8Array = new TextEncoder().encode(rawPdfString);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `\n\nPage ${pageNum}:\n${pageText}`;
    }

    return fullText.trim();
  } catch (error) {
    return '';
  }
})