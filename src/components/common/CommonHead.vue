<template>
  <div class="poem-container myCenter my-animation-hideToShow">
    <!-- 背景图片 -->
    <el-image
      class="my-el-image"
      style="position: absolute; margin-top: -50px"
      v-once
      lazy
      :src="
        constant.two_poem_image[
          Math.floor(Math.random() * constant.two_poem_image.length)
        ]
      "
      fit="cover"
    >
      <!-- <div slot="error" class="image-slot"></div> -->
      <template #error>
        <div class="image-slot">
          <el-icon><icon-picture /></el-icon>
        </div>
      </template>
    </el-image>
    <div class="poem-wrap">
      <div>
        <span>{{ typeName }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive } from "vue";
import constant from "@/utils/constant";
import common from "@/utils/common";

const props = defineProps({
  typeName: {
    type: String,
    default: "分类1",
  },
});
const state = reactive({
  hitokoto: {
    hitokoto: "...",
    from: "...",
    from_who: "...",
  },
});
</script>
<style scoped>
.poem-container {
  padding: 90px 0 40px;
  position: relative;
  height: 400px;
}

.poem-wrap {
  border-radius: 10px;
  z-index: 10;
  text-align: center;
  letter-spacing: 4px;
  font-weight: 300;
  width: 100%;
  max-width: 800px;
}

.poem-wrap div span {
  padding: 5px 10px;
  color: var(--white);
  font-size: 2em;
  border-radius: 5px;
}

.poem-wrap p {
  width: 100%;
  max-width: 800px;
  color: var(--white);
}

.poem-wrap p.poem {
  margin: 40px auto;
  font-size: 1.5em;
}

.poem-wrap p.info {
  margin: 20px auto 40px;
  font-size: 1.1em;
}

.my-el-image::before {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  content: "";
}
</style>
