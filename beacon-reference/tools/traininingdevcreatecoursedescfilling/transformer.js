(function (_data, args, reqOptions) {
  const iframe = document.querySelector("#ifrmPage");

  if (!iframe || !iframe.contentDocument) {
    return { success: false, message: "Iframe not found." };
  }

  const doc = iframe.contentDocument;
  const MAX_LENGTH = 250;

  const setText = (element, value) => {
    if (element && value && value !== '""' && value !== "Not Specified") {
      element.value = value;

      // Trigger change event to sync with Knockout.js binding
      element.dispatchEvent(new Event('change', { bubbles: true }));

      // Trigger input event as backup
      element.dispatchEvent(new Event('input', { bubbles: true }));

      // Try to update Knockout binding directly
      try {
        if (window.ko && typeof TndCourseAdmin !== 'undefined') {
          const current = TndCourseAdmin.Current();
          if (current && typeof current.CosDesc === 'function') {
            current.CosDesc(value);
          }
        }
      } catch (koError) {
      }

      return true;
    }
    return false;
  };

  if (args.description) {

    if (args.description.length > MAX_LENGTH) {
      return {
        success: false,
        message: `Description exceeds maximum length of ${MAX_LENGTH} characters. Current length: ${args.description.length}.`
      };
    }

    const descriptionTextarea = doc.querySelector(
      'textarea#desgrupid[name="tnd-e-Desc"]'
    );

    if (descriptionTextarea) {
      setText(descriptionTextarea, args.description);
    } else {
      return {
        success: false,
        message: "Description textarea not found."
      };
    }

  } else {
    return {
      success: false,
      message: "No description provided."
    };
  }

  return {
    success: true,
    message: "Successfully applied course description field update."
  };
});
