(async function(name){
    const map = {
        "fuse": "https://cdn.beacon.li/libs/fuse.js-7.0.0.js",
        "alasql": "https://cdn.beacon.li/libs/alasql-4.js",
        "axios": "https://cdn.beacon.li/libs/axios-0.19.2.js",
        "pdf" : "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"
    }
    const url = map[name];
    if(!url) {
        throw new Error("Script doesn't exists");
    }
    await BeaconBar.executeFunction("loadJS")(name, url);
    if(name === "alasql") {
        return window.alasql;
    }
    if(name === "fuse") {
        return window.Fuse;
    }
    if(name === "axios") {
        return window.axios;
    }
     if(name === "pdf") {
        return window.pdf;
    }
})