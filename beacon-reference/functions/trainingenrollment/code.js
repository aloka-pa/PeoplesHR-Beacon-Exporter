(function () {
    const reqOptions = BeaconBar.executeFunction("reqOptions")();
    const url = `${reqOptions}TNDV9/TrainingEnrollment/GetEnrollmentCourseDetails`;

    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("content-length", "0");
    myHeaders.append("content-type", "application/json");
    myHeaders.append("origin", "https://devtest-echoengineers.phrsandbox.dev");


    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow"
    };

    return fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text(); 
        })
        .then(result => {
            return result;
        })
        .catch(error => {
        });
});
