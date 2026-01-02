import type { Friend, Message, WebInfo } from '@/types';

// 模拟网站信息
export const mockWebInfo: WebInfo = {
  webName: "BlackStar's Blog",
  webTitle: ["一个热爱编程的开发者", "记录技术成长的点滴", "分享生活中的美好"],
  notices: ["欢迎来到我的博客！", "网站持续更新中..."],
  footer: "© 2024 BlackStar's Blog. All rights reserved.",
  backgroundImage: "https://picsum.photos/1920/1080?random=bg",
  avatar: "https://bu.dusays.com/2022/05/03/627010707b598.webp",
};

// 模拟友链数据
export const mockFriends: Friend[] = [
  {
    id: 1,
    name: "阮一峰的网络日志",
    avatar: "https://picsum.photos/100/100?random=f1",
    url: "https://www.ruanyifeng.com/blog/",
    description: "科技爱好者周刊",
  },
  {
    id: 2,
    name: "张鑫旭博客",
    avatar: "https://picsum.photos/100/100?random=f2",
    url: "https://www.zhangxinxu.com/",
    description: "专注 Web 前端偏前领域",
  },
  {
    id: 3,
    name: "廖雪峰的官方网站",
    avatar: "https://picsum.photos/100/100?random=f3",
    url: "https://www.liaoxuefeng.com/",
    description: "研究互联网产品和技术",
  },
  {
    id: 4,
    name: "技术胖",
    avatar: "https://picsum.photos/100/100?random=f4",
    url: "https://jspang.com/",
    description: "专注前端开发教程",
  },
];

// 模拟留言数据
export const mockMessages: Message[] = [
  {
    id: 1,
    content: "博客做得很漂亮，学习了！",
    nickname: "访客A",
    avatar: "https://picsum.photos/50/50?random=m1",
    createTime: "2024-12-28 10:30:00",
  },
  {
    id: 2,
    content: "文章写得很详细，感谢分享~",
    nickname: "前端小白",
    avatar: "https://picsum.photos/50/50?random=m2",
    createTime: "2024-12-27 15:20:00",
  },
  {
    id: 3,
    content: "请问可以转载吗？会注明出处的",
    nickname: "技术爱好者",
    avatar: "https://picsum.photos/50/50?random=m3",
    createTime: "2024-12-26 09:15:00",
  },
];
