// Clash Party 覆写脚本（JavaScript）
// 转换自：Aethersailor/Custom_OpenClash_Rules 的 Custom_Clash.ini
// 额外添加：🪙 加密货币 分流（规则与分组参考 Custom_Clash_Full.ini）
// 行为与模板一致：overwrite_original_rules=true（完全替换原有 rules 与 proxy-groups）

const TEST_URL = 'https://www.gstatic.com/generate_204'
const CDN = 'https://cdn.jsdelivr.net/gh/Aethersailor/Custom_OpenClash_Rules@main/rule/'

// ---------- 常用策略组名称 ----------
const DIRECT = '🎯 全球直连'
const MANUAL = '🚀 手动选择'
const AUTO = '♻️ 自动选择'
const FISH = '🐟 漏网之鱼'
const HK = '🇭🇰 香港节点'
const US = '🇺🇸 美国节点'
const JP = '🇯🇵 日本节点'
const SG = '🇸🇬 新加坡节点'
const TW = '🇼🇸 台湾节点'
const KR = '🇰🇷 韩国节点'

const REGIONS = [HK, US, JP, SG, TW, KR]
const SG_FIRST = [SG, HK, US, JP, TW, KR]
const BASE = [MANUAL, AUTO]

// ---------- 地区节点过滤正则 ----------
const FILTER = {
  [HK]: String.raw`(🇭🇰|港|\bHK(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{2,})?)?\b|hk|Hong Kong|Hongkong|Hong kong|HongKong|hongkong|HONG KONG|HONGKONG|深港|HKG|九龙|Kowloon|新界|沙田|荃湾|葵涌)`,
  [US]: String.raw`(🇺🇸|美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|纽约|纽纽|亚特兰大|迈阿密|华盛顿|\bUS(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{2,})?)?\b|United States|UnitedStates|UNITED STATES|USA|America|AMERICA|JFK|EWR|IAD|ATL|ORD|MIA|NYC|LAX|SFO|SEA|DFW|SJC)`,
  [JP]: String.raw`(🇯🇵|日本|川日|东京|大阪|泉日|埼玉|沪日|深日|(?<!尼|-)日|\bJP(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{2,})?)?\b|Japan|JAPAN|JPN|NRT|HND|KIX|TYO|OSA|关西|Kansai|KANSAI)`,
  [SG]: String.raw`(🇸🇬|新加坡|坡|狮城|\bSG(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{2,})?)?\b|Singapore|SINGAPORE|SIN)`,
  [TW]: String.raw`(🇹🇼|🇼🇸|台|新北|彰化|\bTW(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{2,})?)?\b|Taiwan|TAIWAN|TWN|TPE|ROC)`,
  [KR]: String.raw`(🇰🇷|\bKR(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{2,})?)?\b|Korea|KOREA|KOR|首尔|韩|韓|春川|Chuncheon|ICN)`,
}

// ---------- 策略组构造 ----------
// all = true 表示模板中末尾带 `.*`（追加全部节点）
const select = (name, proxies, all = false) => ({
  name,
  type: 'select',
  proxies,
  ...(all ? { 'include-all': true } : {}),
})

const urlTest = (name, filter) => ({
  name,
  type: 'url-test',
  'include-all': true,
  ...(filter ? { filter } : {}),
  url: TEST_URL,
  interval: 300,
  tolerance: 50,
})

const buildGroups = () => [
  select(MANUAL, [AUTO, ...REGIONS], true),
  urlTest(AUTO),
  select('💬 即时通讯', [...BASE, ...REGIONS, DIRECT]),
  select('🌐 社交媒体', [...BASE, ...REGIONS, DIRECT], true),
  select('🚀 GitHub', [...BASE, ...REGIONS, DIRECT]),
  select('🤖 ChatGPT', [...BASE, ...SG_FIRST], true),
  select('🤖 AI服务', [...BASE, ...SG_FIRST], true),
  select('🎶 TikTok', [...BASE, ...REGIONS], true),
  select('📹 YouTube', [...BASE, ...SG_FIRST], true),
  select('🎥 Netflix', [...BASE, ...SG_FIRST], true),
  select('🎥 DisneyPlus', [...BASE, ...SG_FIRST], true),
  select('🎥 HBO', [...BASE, ...SG_FIRST], true),
  select('🎥 PrimeVideo', [...BASE, ...SG_FIRST], true),
  select('🎥 AppleTV+', [...BASE, ...SG_FIRST, DIRECT], true),
  select('🎥 Emby', [...BASE, DIRECT, ...REGIONS], true),
  select('🎻 Spotify', [...BASE, DIRECT, ...REGIONS], true),
  select('📺 Bahamut', [TW, HK, MANUAL, DIRECT], true),
  select('🌎 国外媒体', [...BASE, ...REGIONS], true),
  select('🛒 国外电商', [...BASE, DIRECT, ...REGIONS], true),
  // ★ 新增：加密货币（参考 Custom_Clash_Full.ini，地区仅保留本模板已有的 6 个）
  select('🪙 加密货币', [...BASE, ...REGIONS], true),
  select('📢 谷歌FCM', [...BASE, DIRECT, ...REGIONS]),
  select('🇬 谷歌服务', [...BASE, ...REGIONS], true),
  select('🍎 苹果服务', [DIRECT, ...BASE, ...REGIONS], true),
  select('Ⓜ️ 微软服务', [DIRECT, ...BASE, ...REGIONS], true),
  select('🎮 游戏平台', [DIRECT, ...BASE, ...REGIONS], true),
  select('🎮 Steam', [DIRECT, ...BASE, ...REGIONS], true),
  select('🚀 测速工具', [DIRECT, ...BASE, ...REGIONS], true),
  select(FISH, [...BASE, DIRECT, ...REGIONS], true),
  select('🔀 非标端口', [FISH, DIRECT]),
  ...REGIONS.map((name) => urlTest(name, FILTER[name])),
  select(DIRECT, ['DIRECT']),
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
  Custom_Direct_Domain: provider('domain', 'mrs', 'Custom_Direct_Domain.mrs', 1800),
  Custom_Direct_Classical_IP: provider('classical', 'yaml', 'Custom_Direct_Classical_IP.yaml', 28800),
  Custom_Proxy_Domain: provider('domain', 'mrs', 'Custom_Proxy_Domain.mrs', 28800),
  Custom_Proxy_Classical_IP: provider('classical', 'yaml', 'Custom_Proxy_Classical_IP.yaml', 28800),
  Steam_CDN_Domain: provider('domain', 'mrs', 'Steam_CDN_Domain.mrs', 28800),
  Steam_CDN_Classical_IP: provider('classical', 'yaml', 'Steam_CDN_Classical_IP.yaml', 28800),
  Custom_Port_Direct: provider('classical', 'yaml', 'Custom_Port_Direct.yaml', 28800),
}

// ---------- 规则（自上而下匹配，顺序与模板一致） ----------
const rules = [
  // 本地地址和域名直连
  `GEOSITE,private,${DIRECT}`,
  `GEOIP,private,${DIRECT},no-resolve`,
  // 本项目收录的直连 / 代理规则
  `RULE-SET,Custom_Direct_Domain,${DIRECT}`,
  `RULE-SET,Custom_Direct_Classical_IP,${DIRECT}`,
  `RULE-SET,Custom_Proxy_Domain,${MANUAL}`,
  `RULE-SET,Custom_Proxy_Classical_IP,${MANUAL}`,
  // 谷歌国内可用域名、国内游戏域名直连
  `GEOSITE,google-cn,${DIRECT}`,
  `GEOSITE,category-games@cn,${DIRECT}`,
  // Steam 下载 CDN、游戏平台下载、BT Tracker 直连
  `RULE-SET,Steam_CDN_Domain,${DIRECT}`,
  `RULE-SET,Steam_CDN_Classical_IP,${DIRECT}`,
  `GEOSITE,category-game-platforms-download,${DIRECT}`,
  `GEOSITE,category-public-tracker,${DIRECT}`,
  // 即时通讯 / 社交媒体
  `GEOSITE,category-communication,💬 即时通讯`,
  `GEOSITE,category-social-media-!cn,🌐 社交媒体`,
  // AI / 开发 / 测速
  `GEOSITE,openai,🤖 ChatGPT`,
  `GEOSITE,category-ai-!cn,🤖 AI服务`,
  `GEOSITE,github,🚀 GitHub`,
  `GEOSITE,category-speedtest,🚀 测速工具`,
  // 各类服务
  `GEOSITE,steam,🎮 Steam`,
  `GEOSITE,youtube,📹 YouTube`,
  `GEOSITE,apple-tvplus,🎥 AppleTV+`,
  `GEOSITE,apple,🍎 苹果服务`,
  `GEOSITE,microsoft,Ⓜ️ 微软服务`,
  `GEOSITE,googlefcm,📢 谷歌FCM`,
  `GEOSITE,google,🇬 谷歌服务`,
  `GEOSITE,tiktok,🎶 TikTok`,
  `GEOSITE,netflix,🎥 Netflix`,
  `GEOSITE,disney,🎥 DisneyPlus`,
  `GEOSITE,hbo,🎥 HBO`,
  `GEOSITE,primevideo,🎥 PrimeVideo`,
  `GEOSITE,category-emby,🎥 Emby`,
  `GEOSITE,spotify,🎻 Spotify`,
  `GEOSITE,bahamut,📺 Bahamut`,
  `GEOSITE,category-games,🎮 游戏平台`,
  `GEOSITE,category-entertainment,🌎 国外媒体`,
  `GEOSITE,category-ecommerce,🛒 国外电商`,
  // ★ 新增：加密货币
  `GEOSITE,category-cryptocurrency,🪙 加密货币`,
  `GEOSITE,gfw,${MANUAL}`,
  // IP 规则
  `GEOIP,telegram,💬 即时通讯,no-resolve`,
  `GEOIP,twitter,🌐 社交媒体,no-resolve`,
  `GEOIP,facebook,🌐 社交媒体,no-resolve`,
  `GEOIP,google,🇬 谷歌服务,no-resolve`,
  `GEOIP,netflix,🎥 Netflix,no-resolve`,
  // 国内兜底
  `GEOSITE,cn,${DIRECT}`,
  `GEOIP,cn,${DIRECT},no-resolve`,
  // 非标端口直连（PT/BT 优化）
  `RULE-SET,Custom_Port_Direct,🔀 非标端口`,
  // 漏网之鱼
  `MATCH,${FISH}`,
]

// ---------- 入口 ----------
function main(config) {
  let groups = buildGroups()

  // 与 subconverter 行为一致：剔除订阅里没有对应节点的地区组，并从其他组的列表里移除
  // （仅当订阅以内联 proxies 形式存在时生效；使用 proxy-providers 时跳过）
  const names = (config.proxies || []).map((p) => p.name)
  if (names.length > 0) {
    const empty = new Set()
    groups = groups.filter((g) => {
      if (!g.filter) return true
      let re
      try {
        re = new RegExp(g.filter)
      } catch (e) {
        return true // 正则在 JS 中不兼容时保留，交给内核判断
      }
      if (names.some((n) => re.test(n))) return true
      empty.add(g.name)
      return false
    })
    groups.forEach((g) => {
      if (g.proxies) g.proxies = g.proxies.filter((p) => !empty.has(p))
    })
  }

  config['rule-providers'] = { ...(config['rule-providers'] || {}), ...ruleProviders }
  config['proxy-groups'] = groups
  config.rules = rules
  return config
}
