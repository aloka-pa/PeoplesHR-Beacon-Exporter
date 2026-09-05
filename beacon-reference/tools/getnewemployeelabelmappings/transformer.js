(function (data, args, reqOptions) {
    if (!data || Object.keys(data).length === 0) {
        return { message: "No label mappings configured" };
    }

    return data;
})