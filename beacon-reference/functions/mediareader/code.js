async function uploadBlobFile(blobFile) {
  try {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

    const formdata = new FormData();

    formdata.append("files", blobFile, "uploaded.pdf");
    formdata.append("query", "extract the data");

    const requestOptions = {
      method: "POST",
      headers: myHeaders, 
      body: formdata,
      redirect: "follow"
    };

    const response = await fetch("https://edge.beacon.li/api/v1/user/mediaReader", requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.text();
    return result;

  } catch (error) {
    throw error;
  }
}
