// https://stremio-urip-addon.vercel.app/catalog/movie/ur-nfx-movie.json
const mainUrl = "https://stremio-urip-addon.vercel.app";
const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
};

function getManifest() {
    // ID must be unique and consistent! 
    // It is used to match updates and persist data. 
    // Format: com.yourname.providername
    return { name: "Urip Provider", id: "com.uripsub.uripskyprovider", version: 1, baseUrl: mainUrl };
}

function getHome(callback) {
    // 1. Fetch the page
    // https://stremio-urip-addon.vercel.app/catalog/movie/ur-nfx-movie.json
    http_get(mainUrl + "/catalog/movie/ur-nfx-movie.json", commonHeaders, (status, json) => {
        const data = (json.metas || []).map((d, i) => {
            return {
                link: d.imdb_id,
                name: d.name,           // Avatar
                image: d.poster
            }
        });
        
       
        // 4. Return formatted for CloudStream
        callback(JSON.stringify([
            { title: "Home", Data: data }
        ]));
    });
}

function search(query, callback) {
    // 1. Construct URL
    const searchUrl = "https://v3-cinemeta.strem.io/catalog/movie/top/search=" + encodeURIComponent(query);
    
    http_get(searchUrl, commonHeaders, (status, json) => {
        // 2. Parse (Logic often identical to getHome!)
       const data = (json.metas || []).map((d, i) => {
            return {
                link: d.imdb_id,
                name: d.name,           // Avatar
                image: d.poster
            }
        });
        
        callback(JSON.stringify([
            { title: "Search Results", Data: data }
        ]));
    });
}

function load(url, callback) {
    const detailUrl = "https://cinemeta-live.strem.io/meta/movie/" + url + ".json"
    http_get(detailUrl, commonHeaders, (status, json) => {
        const data = json.meta || {};
        // 1. Extract Metadata using Regex
        
        // 2. Prepare Data for 'loadStreams'
        // If the stream link is hidden in the HTML, we can extract it here 
        // and pass it as 'data' to the next step.
        // Example: var videoId = html.match(/data-id="(\d+)"/)[1];
        
        callback(JSON.stringify({
            url: url,          // Pass-through ID
            data: url,        // Pass full HTML to next step (or just videoId)
            title: data.name,
            description: data.description,
            year: parseInt(data.releaseInfo || "0"),
        }));
    });
}

function loadStreams(url, callback) {
    const streamsUrl = "https://webstreamr.hayd.uk/%7B%22multi%22%3A%22on%22%2C%22en%22%3A%22on%22%2C%22showErrors%22%3A%22on%22%2C%22includeExternalUrls%22%3A%22on%22%2C%22mediaFlowProxyUrl%22%3A%22https%3A%2F%2Fmediaflow.uripsub.dev%2F%22%2C%22mediaFlowProxyPassword%22%3A%22pppp%22%7D/stream/movie/" + url + ".json";
    // Step 1: Fetch Movie Page
    http_get(streamsUrl, commonHeaders, (status, json) => {
        const data = (json.streams || []).map(d => {
            return {
                     name: d.title,
                     url: d.url,
                     headers: commonHeaders // Always pass headers!
                 }
        });
        
        callback(JSON.stringify(data));
    });
}
