// Clash Party 覆写脚本（JavaScript）
// 转换自：Custom_Home_Return.ini（基于 Aethersailor/Custom_OpenClash_Rules 的 Lite / 标准版规则）
// 行为与模板一致：overwrite_original_rules=true（完全替换原有 rules 与 proxy-groups）
// 特点：私有网络地址全部走回家节点（🚀 手动选择），海外相关全部走 🚀 手动选择

const TEST_URL = 'https://www.gstatic.com/generate_204'
const CDN = 'https://cdn.jsdelivr.net/gh/Aethersailor/Custom_OpenClash_Rules@main/rule/'
const DIRECT_LIN_URL =
  'https://cdn.jsdelivr.net/gh/donglailin/Custom_Home_Return@main/DIRECT_Lin.yaml'

// ---------- 策略组名称 ----------
const DIRECT = '🎯 全球直连'
const MANUAL = '🚀 手动选择'
const AUTO = '♻️ 自动选择'
const FISH = '🐟 漏网之鱼'
const PORT = '🔀 非标端口'

// ---------- 策略组 ----------
// include-all: true 对应模板中末尾的 `.*`（追加全部节点）
const groups = [
  {
    name: 'GLOBAL',
    type: 'select',
    proxies: [MANUAL, AUTO, 'DIRECT'],
    'include-all': true,
  },
  {
    name: MANUAL,
    type: 'select',
    proxies: [AUTO],
    'include-all': true,
  },
  {
    name: AUTO,
    type: 'url-test',
    'include-all': true,
    url: TEST_URL,
    interval: 300,
    tolerance: 50,
  },
  {
    name: FISH,
    type: 'select',
    proxies: [MANUAL, AUTO, DIRECT],
    'include-all': true,
  },
  {
    name: PORT,
    type: 'select',
    proxies: [FISH, DIRECT],
  },
  {
    name: DIRECT,
    type: 'select',
    proxies: ['DIRECT'],
  },
]

// ---------- 规则集（rule-providers） ----------
const provider = (behavior, format, file, interval) => ({
  type: 'http',
  behavior,
  format,
  interval,
  url: CDN + file,
})

const ruleProviders = {
  // 个人维护的直连域名（DOMAIN-SUFFIX 列表）
  DIRECT_Lin: {
    type: 'http',
    behavior: 'classical',
    format: 'yaml',
    interval: 28800,
    url: DIRECT_LIN_URL,
  },
  Custom_Direct_Domain: provider('domain', 'mrs', 'Custom_Direct_Domain.mrs', 1800),
  Custom_Direct_Classical_IP: provider('classical', 'yaml', 'Custom_Direct_Classical_IP.yaml', 28800),
  Custom_Proxy_Domain: provider('domain', 'mrs', 'Custom_Proxy_Domain.mrs', 28800),
  Custom_Proxy_Classical_IP: provider('classical', 'yaml', 'Custom_Proxy_Classical_IP.yaml', 28800),
  Game_Download_CDN_Domain: provider('domain', 'mrs', 'Game_Download_CDN_Domain.mrs', 28800),
  Game_Download_CDN_Classical_IP: provider('classical', 'yaml', 'Game_Download_CDN_Classical_IP.yaml', 28800),
  Custom_Port_Direct: provider('classical', 'yaml', 'Custom_Port_Direct.yaml', 28800),
}

// ---------- 规则（自上而下匹配，命中即停止，顺序与模板一致） ----------
const rules = [
  // 【核心】私有网络地址全部走回家节点
  `GEOSITE,private,${MANUAL}`,
  `GEOIP,private,${MANUAL},no-resolve`,
  // 个人维护的直连域名
  `RULE-SET,DIRECT_Lin,${DIRECT}`,
  // 项目自维护的直连规则
  `RULE-SET,Custom_Direct_Domain,${DIRECT}`,
  `RULE-SET,Custom_Direct_Classical_IP,${DIRECT}`,
  // 项目自维护的代理规则（补充海外）
  `RULE-SET,Custom_Proxy_Domain,${MANUAL}`,
  `RULE-SET,Custom_Proxy_Classical_IP,${MANUAL}`,
  // 国内游戏直连
  `GEOSITE,category-games@cn,${DIRECT}`,
  // 游戏下载 CDN 直连
  `RULE-SET,Game_Download_CDN_Domain,${DIRECT}`,
  `RULE-SET,Game_Download_CDN_Classical_IP,${DIRECT}`,
  // BT Tracker 直连
  `GEOSITE,category-public-tracker,${DIRECT}`,

  // ===== 海外相关全部走回家节点 =====
  `GEOSITE,category-communication,${MANUAL}`,
  `GEOSITE,category-social-media-!cn,${MANUAL}`,
  `GEOSITE,openai,${MANUAL}`,
  `GEOSITE,category-ai-!cn,${MANUAL}`,
  `GEOSITE,github,${MANUAL}`,
  `GEOSITE,category-speedtest,${MANUAL}`,
  `GEOSITE,google,${MANUAL}`,
  `GEOSITE,youtube,${MANUAL}`,
  `GEOSITE,netflix,${MANUAL}`,
  `GEOSITE,disney,${MANUAL}`,
  `GEOSITE,tiktok,${MANUAL}`,
  `GEOSITE,spotify,${MANUAL}`,
  `GEOSITE,gfw,${MANUAL}`,
  `GEOIP,telegram,${MANUAL},no-resolve`,
  `GEOIP,facebook,${MANUAL},no-resolve`,
  `GEOIP,twitter,${MANUAL},no-resolve`,
  `GEOIP,google,${MANUAL},no-resolve`,
  `GEOIP,netflix,${MANUAL},no-resolve`,

  // 国内兜底直连
  `GEOSITE,cn,${DIRECT}`,
  `GEOIP,cn,${DIRECT},no-resolve`,

  // 非标端口（BT/PT 优化）
  `RULE-SET,Custom_Port_Direct,${PORT}`,

  // 漏网之鱼默认走代理（防止海外漏网）
  `MATCH,${FISH}`,
]

// ---------- 入口 ----------
function main(config) {
  config['rule-providers'] = { ...(config['rule-providers'] || {}), ...ruleProviders }
  config['proxy-groups'] = groups
  config.rules = rules
  return config
}
