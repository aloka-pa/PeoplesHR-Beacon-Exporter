(async function (data, args, reqOptions) {
    const dats = await BeaconBar.executeFunction("saveRoundinginformation")(args);
    return { message: "successfully updated" }
})