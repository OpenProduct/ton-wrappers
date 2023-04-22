

const ifpsProtocol = "ipfs://";
const defaultTimeout = 10000;
const defaultIpfsProxy = ["https://ipfs.io/ipfs/", "http://dweb.link/ipfs/", "https://cf-ipfs.com/ipfs/"];

const requestURL = async <T>(
  jsonDataUrl: string,
  options?: RequestOptions
): Promise<T> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), options?.timeout ?? defaultTimeout );

    const fetchApi = options?.fetchApi ?? window.fetch;
    const response = await fetchApi(jsonDataUrl, {
      signal: controller.signal,
      redirect: "follow",
      method: "GET",
    });

    clearTimeout(id);

    return await response.json();
  } catch (e) {
    throw new Error(`Failed to load json data from "${jsonDataUrl}"`);
  }
};

const requestIPFS = async <T>(
  jsonDataUrl: string,
  options?: RequestOptions
): Promise<T> => {

    const proxies = options?.ipfsProxy ?? defaultIpfsProxy;
    
    for (let proxy of proxies) {
        try {
            const url = jsonDataUrl.replace(ifpsProtocol, proxy);
            return await requestURL(url, options);
        } catch (e) {
            console.warn(e);
        }
    }

    throw new Error(`Failed to get ipfs data: ${jsonDataUrl}`)
};

export interface RequestOptions {
    timeout?: number;
    fetchApi?: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;
    ipfsProxy?: string[]
}

export const requestJson = async <T>(
  jsonDataUrl: string,
  options?: RequestOptions,
): Promise<T> => {
  if (jsonDataUrl.startsWith(ifpsProtocol)) {
    return await requestIPFS(jsonDataUrl, options);
  } else {
    return await requestURL(jsonDataUrl, options);
  }
};
