---
title: 用十个 div 画一只会眨眼的猫
category: 创意实验
tags: [CSS, 动画]
date: 2024-02-08
updatedAt: 2024-02-15
id: 3
summary: 不用任何图片，只用渐变、伪元素和关键帧，让一只 CSS 小猫眨眼、摆尾，顺便复习图层与 transform-origin。
---

不加载任何图片，只用 CSS 渐变、伪元素和关键帧，就能画出一只会眨眼、尾巴会摆的猫。核心技巧是把每个身体部位拆成独立图层，再让 `border-radius` 做出圆润的轮廓。

## 关键三步

1. 用 `box-shadow` 的多层叠加画出眼睛和胡须
2. `animation` 的 `steps()` 让眨眼看起来是瞬时的
3. `transform-origin` 定在尾巴根部，摆动才自然

完整代码不到 200 行，但把这三步组合起来，效果比很多动画库更轻。
