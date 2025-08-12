//TODO Cloudflare migration with worker instead of api calls

export type NetworkInfo = {
  ipV4: string;
  ipV6: string;
  userCity: string;
  userTime: string;
  localTime: string;
  localCity: string;
};

const DEV_LOCAL = import.meta.env.DEV;

function getLocalTime(timezone: string): string {
  try {
    const now = new Date();
    const userDate = new Date(
      now.toLocaleString('en-US', { timeZone: timezone })
    );
    const hh = String(userDate.getHours()).padStart(2, '0');
    const mm = String(userDate.getMinutes()).padStart(2, '0');
    const sep = userDate.getMilliseconds() < 500 ? ':' : ' ';
    return `${hh}${sep}${mm}`;
  } catch {
    return '';
  }
}

export async function getNetworkInfo(): Promise<NetworkInfo> {
  if (DEV_LOCAL) {
    return {
      ipV4: '192.168.1.42',
      ipV6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      userCity: 'Hong Kong',
      userTime: getLocalTime('Asia/Hong_Kong'),
      localTime: getLocalTime('Europe/Paris'),
      localCity: 'Paris',
    };
  }
  // Mode prod : fetch les vraies valeurs
  try {
    const [ipV4Res, ipV6Res, locRes] = await Promise.all([
      fetch('https://api.ipify.org?format=json').then((r) => r.json()),
      fetch('https://api64.ipify.org?format=json').then((r) => r.json()),
      fetch('https://ipapi.co/json/').then((r) => r.json()),
    ]);
    const timezone = locRes.timezone || '';
    return {
      ipV4: ipV4Res.ip || '',
      ipV6: ipV6Res.ip || '',
      userCity: locRes.city || '',
      localCity: 'Paris',
      localTime: getLocalTime('Europe/Paris'),
      userTime: getLocalTime(timezone),
    };
  } catch {
    return {
      ipV4: '',
      ipV6: '',
      userCity: '',
      localTime: '',
      userTime: '',
      localCity: '',
    };
  }
}
