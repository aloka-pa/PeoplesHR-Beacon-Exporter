(function (_data, args, reqOptions) {
  const iframe = document.querySelector("#ifrmPage");
  const doc = iframe.contentDocument;

  if (!iframe || !iframe.contentDocument) {
    return { success: false, message: "Iframe not found." };
  }

  const setText = (element, value) => {
    if (element && value && value !== '""' && value !== "Not Specified") {
      element.innerText = value;

      const parentEditor = element.closest('.longTextEditor');
      if (parentEditor) {
        const ckeIframe = parentEditor.querySelector('.cke_wysiwyg_frame');
        const textarea = parentEditor.querySelector('textarea');

        if (ckeIframe?.contentDocument?.body) {
          try {
            ckeIframe.contentDocument.body.innerHTML = `<p>${value}</p>`;
          } catch (e) {
          }
        }

        if (textarea && window.CKEDITOR && CKEDITOR.instances[textarea.id]) {
          try {
            const editorInstance = CKEDITOR.instances[textarea.id];
            editorInstance.setData(value);
            editorInstance.updateElement();
            editorInstance.fire('change');
          } catch (e) {
          }
        }
      }

      return true;
    }
    return false;
  };


  if (args.desc) {
    const descriptionSpan = doc.querySelector(
      '[data-bind="html: IncidentDescription"]'
    );

    if (descriptionSpan) {
      setText(descriptionSpan, args.desc);
    }
  }

  return {
    success: true,
    message: `Successfully applied critical incident description field update.`
  };
});
