const mainUrl = "https://stremio-urip-addon.vercel.app";
const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
};

function getManifest() {
    return { name: "Urip Provider", id: "com.uripsub.uripskyprovider", version: 1, baseUrl: mainUrl, type: "Movie", language: "en" };
}

function getHome(callback) {
    http_get(mainUrl + "/catalog/movie/ur-nfx-movie.json", commonHeaders, (status, json) => {
        const data = (json.metas || []).map((d, i) => {
            return {
                link: d.imdb_id,
                name: d.name,
                image: d.poster
            }
        });
        
        callback(JSON.stringify([
            { title: "Home", Data: data }
        ]));
    });
}

function search(query, callback) {
    const searchUrl = "https://v3-cinemeta.strem.io/catalog/movie/top/search=" + encodeURIComponent(query);
    
    http_get(searchUrl, commonHeaders, (status, json) => {
       const data = (json.metas || []).map((d, i) => {
            return {
                link: d.imdb_id,
                name: d.name, 
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
       
        callback(JSON.stringify({
            url: url,
            data: url,
            title: data.name,
            description: data.description,
            year: parseInt(data.releaseInfo || "0"),
        }));
    });
}

function loadStreams(url, callback) {
    const streamsUrl = "https://webstreamr.hayd.uk/%7B%22multi%22%3A%22on%22%2C%22en%22%3A%22on%22%2C%22showErrors%22%3A%22on%22%2C%22includeExternalUrls%22%3A%22on%22%2C%22mediaFlowProxyUrl%22%3A%22https%3A%2F%2Fmediaflow.uripsub.dev%2F%22%2C%22mediaFlowProxyPassword%22%3A%22pppp%22%7D/stream/movie/" + url + ".json";
    
    http_get(streamsUrl, commonHeaders, (status, json) => {
        const data = (json.streams || []).map(d => {
            return {
                     name: d.title,
                     url: d.url,
                     headers: commonHeaders
                 }
        });
        
        callback(JSON.stringify(data));
    });
}
