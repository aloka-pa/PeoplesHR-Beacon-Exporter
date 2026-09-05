(function(action, stringresponse) {
    
const response = stringresponse ? JSON.parse(stringresponse) : {};
    BeaconBar.close();

    if (action === "Reject") {
        if (response && response.Message) {
            BeaconBar.showSnackbar(response.Message, "error" , false);
        } else {
            BeaconBar.showSnackbar("Successfully Rejected", "error" , false);
        }
    } else if (action === "Approve") {
        if (response && response.Message) {
            BeaconBar.showSnackbar(response.Message, "success" , false);
        } else {
            BeaconBar.showSnackbar("Successfully Approved", "success" , false);
        }
    } else {
    }
})
