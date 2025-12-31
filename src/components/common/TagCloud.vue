<template>
  <div
    id="tagbox"
    ref="tagbox"
    @mouseenter="handleMouseEnter"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
  >
    <div v-for="(tag, index) in tags" :key="index" class="tag" ref="tagRefs">
      <span :style="getColor()">{{ tag.text }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, nextTick } from "vue";
import constant from "@/utils/constant";

const state = reactive({
  color: {
    color: constant.before_color_list[Math.floor(Math.random() * 6)],
  },
});

const radius = 180; // 3D 球体的半径
const dtr = Math.PI / 180; // 度数转弧度
const d = 250; // 深度
const mcList = ref([]); // 3D 标签的列表
const tagbox = ref(null); // 引用DOM元素
const tagRefs = ref([]); // 引用所有 tag 元素

let active = true;
let lasta = 1;
let lastb = 1;
const tspeed = 5;
let isMouseDown = false;
let lastMouseX, lastMouseY;
let animationTimer = null; // 存储定时器引用

const tags = [
  { text: "Vue.js", color: "blue" },
  { text: "TypeScript", color: "blue" },
  { text: "JavaScript", color: "yellow" },
  { text: "React", color: "blue" },
  { text: "Node.js", color: "green" },
  { text: "CSS3", color: "blue" },
  { text: "HTML5", color: "orange" },
  { text: "Webpack", color: "blue" },
  { text: "Vite", color: "purple" },
  { text: "Element Plus", color: "blue" },
  { text: "Sass", color: "pink" },
  { text: "Git", color: "red" },
  { text: "Docker", color: "blue" },
  { text: "Linux", color: "black" },
  { text: "MySQL", color: "blue" },
  { text: "MongoDB", color: "green" },
  { text: "Redis", color: "red" },
  { text: "Python", color: "blue" },
  { text: "Java", color: "red" },
  { text: "Spring Boot", color: "green" },
];

const sineCosine = (a, b, c) => {
  const sa = Math.sin(a * dtr);
  const ca = Math.cos(a * dtr);
  const sb = Math.sin(b * dtr);
  const cb = Math.cos(b * dtr);
  return { sa, ca, sb, cb };
};

const positionAll = () => {
  // 检查DOM元素是否存在
  if (!tagbox.value || !tagRefs.value.length) return;
  
  let phi = 0;
  let theta = 0;
  const max = mcList.value.length;
  for (let i = 1; i < max + 1; i++) {
    phi = Math.acos(-1 + (2 * i - 1) / max);
    theta = Math.sqrt(max * Math.PI) * phi;

    const tag = mcList.value[i - 1];
    tag.cx = radius * Math.cos(theta) * Math.sin(phi);
    tag.cy = radius * Math.sin(theta) * Math.sin(phi);
    tag.cz = radius * Math.cos(phi);

    const tagElem = tagRefs.value[i - 1];
    // 确保tagElem存在
    if (!tagElem) continue;
    
    tagElem.style.left =
      tag.cx + tagbox.value.offsetWidth / 2 - tagElem.offsetWidth / 2 + "px";
    tagElem.style.top =
      tag.cy + tagbox.value.offsetHeight / 2 - tagElem.offsetHeight / 2 + "px";
  }
};

const update = () => {
  if (!active && !isMouseDown) return;
  if (!tagbox.value || !mcList.value.length) return;

  let { sa, ca, sb, cb } = sineCosine(lasta, lastb, 0);
  for (let i = 0; i < mcList.value.length; i++) {
    let tag = mcList.value[i];
    const rx1 = tag.cx;
    const ry1 = tag.cy * ca + tag.cz * -sa;
    const rz1 = tag.cy * sa + tag.cz * ca;

    const rx2 = rx1 * cb + rz1 * sb;
    const ry2 = ry1;
    const rz2 = rx1 * -sb + rz1 * cb;

    tag.cx = rx2;
    tag.cy = ry2;
    tag.cz = rz2;

    const per = d / (d + rz2);
    tag.x = rx2 * per;
    tag.y = ry2 * per;
    tag.scale = per;
    tag.alpha = per;

    tag.alpha = (tag.alpha - 0.6) * (10 / 6);
  }

  doPosition();
};

const doPosition = () => {
  // 检查DOM元素是否存在
  if (!tagbox.value || !tagRefs.value.length) return;
  
  const l = tagbox.value.offsetWidth / 2;
  const t = tagbox.value.offsetHeight / 2;
  
  for (let i = 0; i < mcList.value.length; i++) {
    const tagElem = tagRefs.value[i];
    const tag = mcList.value[i];
    
    // 确保tagElem存在
    if (!tagElem) continue;
    
    tagElem.style.left = tag.cx + l - tag.offsetWidth / 2 + "px";
    tagElem.style.top = tag.cy + t - tag.offsetHeight / 2 + "px";
    tagElem.style.fontSize = Math.ceil((12 * tag.scale) / 2) + 8 + "px";
    tagElem.style.opacity = tag.alpha;
  }
};

// 事件处理函数
const handleMouseEnter = () => {
  active = false;
};

const handleMouseDown = (ev) => {
  isMouseDown = true;
  active = false;
  lastMouseX = ev.clientX;
  lastMouseY = ev.clientY;
};

const handleMouseMove = (ev) => {
  if (isMouseDown) {
    const deltaX = (lastMouseX - ev.clientX) * 0.1;
    const deltaY = (ev.clientY - lastMouseY) * 0.1;

    lasta = deltaY * tspeed;
    lastb = deltaX * tspeed;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
    update();
  }
};

const handleMouseUp = () => {
  isMouseDown = false;
};

const handleMouseLeave = () => {
  isMouseDown = false;
  active = true;
};

const getColor = () => {
  return {
    color: constant.before_color_list[Math.floor(Math.random() * 6)],
  };
};

onMounted(() => {
  // 使用nextTick确保DOM完全渲染
  nextTick(() => {
    if (!tagbox.value) return;
    
    const aA = tagbox.value.getElementsByClassName("tag");
    if (!aA.length) return;
    
    for (let i = 0; i < aA.length; i++) {
      const oTag = {
        offsetWidth: aA[i].offsetWidth,
        offsetHeight: aA[i].offsetHeight,
      };
      mcList.value.push(oTag);
    }

    positionAll();
    // 存储定时器引用以便清理
    animationTimer = setInterval(update, 30);
  });
});

onBeforeUnmount(() => {
  // 清理定时器
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
});
</script>

<style scoped>
#tagbox {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  width: 100%;
  aspect-ratio: 1 / 1; /* 宽高比为 1:1，确保宽度和高度相等 */
  /* background-image: url(https://blackstar.s3.bitiful.net/img/dark_mode.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=14Cj69yjeDqxvrg7yRPHj2AP%2F20241127%2F%2Fs3%2Faws4_request&X-Amz-Date=20241127T082642Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&x-id=GetObject&X-Amz-Signature=b2304afa40f6fc49c83cd79ba659d0fc9bddb1153f1aee77b598d3cb5c8ebda0); */
}
.tag {
  position: absolute;
  transform-origin: center center;
  transition: transform 0.2s ease; /* 平滑缩放效果 */
  transform: scale(0.8); /* 使用 CSS 变量进行缩放 */
  padding: 3px 6px;
  font-family: Microsoft YaHei;
  color: #fff;
  top: 0px;
  font-weight: bold;
  text-decoration: none;
  left: 0px;
  word-break: keep-all;
}
a:hover {
  border: #eee 1px solid;
  background: #000;
}
.blue {
  color: blue;
}
.red {
  color: red;
}
.yellow {
  color: yellow;
}
</style>
