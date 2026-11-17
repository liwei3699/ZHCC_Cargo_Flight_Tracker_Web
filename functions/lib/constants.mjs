export const SOURCE_BASE = "https://www.zzcargo.com";
export const FLIGHT_PATH = "/flightDynamic/skipTo";
export const AIRLINE_PATH = "/airline/airlineTwo";
export const PAGE_CONCURRENCY = 6;
export const PAGE_TIMEOUT_MS = 15000;
export const PAGE_RETRIES = 2;
export const SYNC_DEADLINE_MS = 25000;
export const AIRLINE_TIMEOUT_MS = 8000;
export const CACHE_TTL_MS = 30 * 60 * 1000;
export const MANUAL_COOLDOWN_MS = 30 * 1000;
export const FAILURE_BACKOFF_MS = 2 * 60 * 1000;
export const LEASE_TTL_MS = 2 * 60 * 1000;
export const WAIT_FOR_SYNC_MS = 8000;
export const WAIT_POLL_MS = 500;
export const AIRLINE_REFRESH_MS = 24 * 60 * 60 * 1000;

export const SOURCE_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  Accept: "application/json, text/javascript, */*; q=0.01",
  "X-Requested-With": "XMLHttpRequest",
  Referer: "https://www.zzcargo.com/airline/1",
  Origin: "https://www.zzcargo.com",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0",
  "Accept-Language": "zh-CN,zh;q=0.9",
};

export const REGION_LABELS = { DOM: "国内", INT: "国际", REG: "地区", MIX: "混合", UNKNOWN: "未知" };

export const AIRCRAFT_FAMILY_ORDER = [
  "波音737", "波音747", "波音757", "波音767", "波音777", "波音787",
  "空客A320", "空客A330", "空客A350", "空客A380", "中国商飞", "其他机型",
];

export const AIRCRAFT_PATTERNS = [
  { family: "波音737", test: /^B73|^B38M|^B39M/ },
  { family: "波音747", test: /^B74/ },
  { family: "波音757", test: /^B75/ },
  { family: "波音767", test: /^B76/ },
  { family: "波音777", test: /^B77/ },
  { family: "波音787", test: /^B78/ },
  { family: "空客A320", test: /^A31|^A32|^A20N|^A21N/ },
  { family: "空客A330", test: /^A33/ },
  { family: "空客A350", test: /^A35/ },
  { family: "空客A380", test: /^A38/ },
  { family: "中国商飞", test: /^ARJ|^C919/ },
];

export const FALLBACK_AIRLINES = {
  "3U": "四川航空", "8L": "祥鹏航空", "9C": "春秋航空", A6: "红土航空", AE: "华信航空",
  AQ: "九元航空", BK: "奥凯航空", BL: "捷星太平洋航空", BR: "长荣航空", CA: "中国国际航空",
  CX: "国泰货运", CZ: "中国南方航空", DZ: "东海航空", EK: "阿联酋航空", EU: "成都航空",
  FM: "上海航空", FU: "福州航空", G5: "华夏航空", GA: "印尼鹰航", GJ: "长龙航空",
  GS: "天津航空", GT: "桂林航空", GX: "北部湾航空", GY: "贵州多彩航空", HO: "吉祥航空",
  HU: "海南航空", JD: "首都航空", JQ: "澳大利亚捷星航空", JR: "幸福航空", KE: "大韩航空",
  KY: "昆明航空", MF: "厦门航空", MU: "东方航空", NS: "河北航空", NX: "澳门航空",
  PN: "西部航空", QW: "青岛航空", RY: "江西航空", SC: "山东航空", SL: "印尼狮子航空",
  TR: "新加坡酷虎航空", TV: "西藏航空", UQ: "乌鲁木齐航空", VJ: "越捷航空", VN: "越南航空",
  WE: "泰国微笑航空", Y8: "金鹏航空", ZA: "天空吴哥航空", ZH: "深圳航空",
};
