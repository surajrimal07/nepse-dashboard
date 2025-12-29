export function getNepaliTime() {
  return new Date().toLocaleTimeString('en-CA', {
    //10:12 p.m.
    timeZone: 'Asia/Kathmandu',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getNepaliDate() {
  return new Date().toLocaleDateString('en-CA', {
    //2025-07-25
    timeZone: 'Asia/Kathmandu',
  });
}
