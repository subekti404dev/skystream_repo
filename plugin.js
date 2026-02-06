// https://stremio-urip-addon.vercel.app/catalog/movie/ur-nfx-movie.json
const mainUrl = "https://stremio-urip-addon.vercel.app";
const commonHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
};

function getManifest() {
  return {
    name: "Urip Provider",
    id: "com.uripsub.uripskyprovider",
    version: 1,
    baseUrl: mainUrl,
    type: "Movie",
    language: "en",
  };
}

function getHome(callback) {
  // 1. Fetch the page
  // https://stremio-urip-addon.vercel.app/catalog/movie/ur-nfx-movie.json
  const homeUrl = mainUrl + "/catalog/movie/ur-nfx-movie.json";
  console.log({ homeUrl });

  http_get(homeUrl, {}, (response) => {
    const { body } = response;
    const jsonBody = JSON.parse(body) || {};

    const data = (jsonBody.metas || []).map((d, i) => {
      return {
        url: d.imdb_id,
        title: d.name, // Avatar
        posterUrl: d.poster,
      };
    });

    const result = {
      Home: data,
    };
    callback(JSON.stringify(result));
  });
}

function search(query, callback) {
  // 1. Construct URL
  const searchUrl =
    "https://v3-cinemeta.strem.io/catalog/movie/top/search=" +
    encodeURIComponent(query) +
    ".json";

  console.log({ searchUrl });

  http_get(searchUrl, commonHeaders, (response) => {
    const { body } = response;
    const jsonBody = JSON.parse(body) || {};
    const data = (jsonBody.metas || []).map((d, i) => {
      return {
        url: d.imdb_id,
        title: d.name, // Avatar
        posterUrl: d.poster,
      };
    });

    callback(JSON.stringify(data));
  });
}

function load(url, callback) {
  const detailUrl =
    "https://cinemeta-live.strem.io/meta/movie/" + url + ".json";

  console.log({ detailUrl });

  http_get(detailUrl, commonHeaders, (response) => {
    const { body } = response;
    const jsonBody = JSON.parse(body) || {};
    const data = jsonBody.meta || {};
    // 1. Extract Metadata using Regex

    // 2. Prepare Data for 'loadStreams'
    // If the stream link is hidden in the HTML, we can extract it here
    // and pass it as 'data' to the next step.
    // Example: var videoId = html.match(/data-id="(\d+)"/)[1];

    callback(
      JSON.stringify({
        url: url, // Pass-through ID
        data: url, // Pass full HTML to next step (or just videoId)
        title: data.name,
        posterUrl: data.poster,
        bannerUrl: data.background,
        description: data.description,
        year: parseInt(data.releaseInfo || "0"),
        episodes: [{ name: data.name, url: url }],
      }),
    );
  });
}

function loadStreams(url, callback) {
  const streamsUrl =
    "https://webstreamr.hayd.uk/%7B%22multi%22%3A%22on%22%2C%22en%22%3A%22on%22%2C%22showErrors%22%3A%22on%22%2C%22includeExternalUrls%22%3A%22on%22%2C%22mediaFlowProxyUrl%22%3A%22https%3A%2F%2Fmediaflow.uripsub.dev%2F%22%2C%22mediaFlowProxyPassword%22%3A%22pppp%22%7D/stream/movie/" +
    url +
    ".json";

  console.log({ streamsUrl });

  // Step 1: Fetch Movie Page
  http_get(streamsUrl, commonHeaders, (response) => {
    const { body } = response;
    const jsonBody = JSON.parse(body) || {};
    const data = (jsonBody.streams || []).map((d) => {
      return {
        quality: d.title,
        url: d.url,
        headers: commonHeaders, // Always pass headers!
      };
    });

    callback(JSON.stringify(data));
  });
}
