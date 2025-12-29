const refererRegex = /^(https?:\/\/)?(www\.)?/i;

const cleanReferer = (referer: string) => {
  if (!referer) {
    return '';
  }
  const cleaned = referer.replace(refererRegex, '').split('/')[0];
  if (cleaned) {
    return `https://${cleaned}`;
  }
  return '';
};

export const createheaders = (referer: string) => {
  const cleanedUrl = cleanReferer(referer);
  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9,ne;q=0.8',
    'cache-control': 'max-age=0',
    priority: 'u=0, i',
    'sec-ch-ua':
      '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'sec-gpc': '1',
    DNT: '1',

    Connection: 'keep-alive',
    'upgrade-insecure-requests': '1',
  };

  if (referer) {
    headers.Referer = cleanedUrl;
  }

  return headers;
};

export const chukulHeaders = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9',
  priority: 'u=1, i',
  'sec-ch-ua':
    '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-ch-ua-platform-version': '"15.0.0"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  cookie:
    '_ga=GA1.1.1691013794.1738421243; _ga_BC6B1WV1Y6=GS1.1.1738424405.2.1.1738424565.0.0.0',
  Referer: 'https://chukul.com/nepse-live-market',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;
