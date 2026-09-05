(async function(id, outputElementId = 'output') {
  const sl = await BeaconBar.getSharedData("sl");
  try {
    // Step 1: Load PDF.js library if not present
    if (!window.pdfjsLib || typeof window.pdfjsLib.getDocument !== 'function') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PDF.js library'));
        document.head.appendChild(script);
      });
    }

    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
      throw new Error('PDF.js library not loaded correctly.');
    }

    // Step 2: Build the PDF URL
    const pdfUrl = `${location.origin}/${sl}/RecruitmentV9/Common/ViewAttachmentOrCVInPreview?attId=${id}&isCv=True`;

    // Step 3: Fetch the PDF with credentials
    const response = await fetch(pdfUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/pdf' }
    });

    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
    const pdfBinary = await response.arrayBuffer();

    // Step 4: Extract text using PDF.js
    const pdf = await pdfjsLib.getDocument({ data: pdfBinary }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      fullText += `\n\n--- Page ${i} ---\n\n${text}`;
    }

    // Step 5: Display result
    const outputElement = document.getElementById(outputElementId);
    if (outputElement) outputElement.textContent = fullText;

    return fullText;
  } catch (err) {
    const outputElement = document.getElementById(outputElementId);
    if (outputElement) outputElement.textContent = 'Failed to extract PDF text.';
    return null;
  }
});
