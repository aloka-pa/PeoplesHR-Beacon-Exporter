(function (_data, args, reqOptions) {
  const description = new DOMParser().parseFromString(args.description, "text/html");
  document.querySelector("#ifrmPage").contentDocument.body.querySelector("#ctl00_body_txtdes").textContent = description.body.textContent;
  return {
    success: true,
  }
})