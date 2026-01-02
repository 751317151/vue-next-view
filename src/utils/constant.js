export default {
  // 从环境变量读取敏感配置
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081",
  imBaseURL: import.meta.env.VITE_IM_BASE_URL || "http://localhost:81",
  webURL: import.meta.env.VITE_WEB_URL || "http://localhost",

  live2d_path:
    "https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/",
  cdnPath: "https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/",
  waifuPath: "/webInfo/getWaifuJson",
  hitokoto: "https://v1.hitokoto.cn",
  shehui: "https://api.oick.cn/yulu/api.php",
  tocbot: "https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.11.1/tocbot.min.js",
  jinrishici: "https://v1.jinrishici.com/all.json",
  random_image: "https://picsum.photos/800/400?random=",
  // 加密密钥从环境变量读取
  cryptojs_key: import.meta.env.VITE_CRYPTO_KEY || "",
  qiniuUrl: import.meta.env.VITE_QINIU_URL || "https://upload.qiniup.com",
  qiniuDownload: import.meta.env.VITE_QINIU_DOWNLOAD || "",

  favoriteVideo: "src/assets/file/hutao.mp4",

  loveWeiYan: "https://s1.ax1x.com/2022/12/04/zsKgDs.jpg",
  loveMessage: "https://s1.ax1x.com/2022/12/04/zsKgDs.jpg",
  lovePhoto: "https://s1.ax1x.com/2022/12/04/zsKh5V.jpg",
  loveLike: "https://cdn.cbd.int//hexo-butterfly-envelope/lib/violet.jpg",
  loveSortId: 1,
  loveLabelId: 1,

  friendBG: "https://s1.ax1x.com/2022/12/04/zsKgDs.jpg",
  friendLetterTop: "https://cdn.cbd.int/hexo-butterfly-envelope/lib/before.png",
  friendLetterBottom:
    "https://cdn.cbd.int/hexo-butterfly-envelope/lib/after.png",
  friendLetterBiLi: "https://cdn.cbd.int/hexo-butterfly-envelope/lib/line.png",
  friendLetterMiddle:
    "https://cdn.cbd.int//hexo-butterfly-envelope/lib/violet.jpg",

  before_color_list: [
    "rgb(60 94 110)",
    "#EF794F",
    "#67C23A",
    "orange",
    "rgb(131, 123, 199)",
    "#23d5ab",
  ],

  tree_hole_color: [
    "#ee7752",
    "#e73c7e",
    "#23a6d5",
    "#23d5ab",
    "rgb(131, 123, 199)",
    "#23d5ab",
  ],

  two_poem_image: [
    "https://picsum.photos/1920/600?random=1",
    "https://picsum.photos/1920/600?random=2", 
    "https://picsum.photos/1920/600?random=3",
    "https://picsum.photos/1920/600?random=4",
    "https://picsum.photos/1920/600?random=5"
  ],

  before_color_1: "black",
  after_color_1: "linear-gradient(45deg, #f43f3b, #ec008c)",

  before_color_2: "rgb(131, 123, 199)",
  after_color_2: "linear-gradient(45deg, #f43f3b, #ec008c)",

  sortColor: [
    "linear-gradient(to right, #358bff, #15c6ff)",
    "linear-gradient(to right, #18e7ae, #1eebeb)",
    "linear-gradient(to right, #ff6655, #ffbf37)",
    "linear-gradient(120deg, rgba(255, 39, 232, 1) 0%, rgba(255, 128, 0, 1) 100%)",
    "linear-gradient(120deg, rgba(91, 39, 255, 1) 0%, rgba(0, 212, 255, 1) 100%)",
  ],

  pageColor: "#ee7752",
  commentPageColor: "#23d5ab",
  userId: 1,
  source: 0,

  emojiList: [
    "衰",
    "鄙视",
    "再见",
    "捂嘴",
    "摸鱼",
    "奋斗",
    "白眼",
    "可怜",
    "皱眉",
    "鼓掌",
    "烦恼",
    "吐舌",
    "挖鼻",
    "委屈",
    "滑稽",
    "啊这",
    "生气",
    "害羞",
    "晕",
    "好色",
    "流泪",
    "吐血",
    "微笑",
    "酷",
    "坏笑",
    "吓",
    "大兵",
    "哭笑",
    "困",
    "呲牙",
  ],
};
