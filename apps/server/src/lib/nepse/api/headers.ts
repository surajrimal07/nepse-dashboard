export function createNepseHeaders(token: string): Record<string, string> {
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    Connection: 'keep-alive',
    Referer: 'www.nepalstock.com.np',
    Authorization: `Salter ${token}`,
    'Content-Type': 'application/json',
    Host: 'www.nepalstock.com.np',
  };
}
