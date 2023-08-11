<template>
  <div>
    <div class="travel-container">
      <!-- 封面 -->
      <div class="travel-header my-animation-slide-top">
        <!-- 背景图片 -->
        <video
          class="index-video"
          autoplay="autoplay"
          muted="muted"
          loop="loop"
          :src="constant.favoriteVideo"
        ></video>
        <div style="position: absolute; left: 20px; top: 20px">
          <!-- 标题 -->
          <div style="margin: 10px">
            <div>归档</div>
            <div
              style="
                font-size: 36px;
                font-weight: bold;
                line-height: 1.5;
                margin-top: 20px;
              "
            >
              这里是我的旅拍哦
            </div>
          </div>
        </div>
        <div style="position: absolute; left: 20px; bottom: 40px; margin: 10px">
          每一张照片都是一次美好的记忆。
        </div>
      </div>

      <div class="travel-content my-animation-slide-bottom">
        <!-- 标签 -->
        aa
        <TimeLine :timeData="state.timeData"></TimeLine>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "vue";
import common from "@/utils/common";
import constant from "@/utils/constant";
import Timeline from "./TimeLine.vue";

const state = reactive({
  timeData: {
    yearData: "2021年2月",
    mouthData: [
      {
        dateData: "20日",
        dateArr: [
          {
            workNo: "2321321231233",
            time: "12:00:03",
            status: "1",
            name: "张三",
            type: "1",
          },
        ],
      },
      {
        dateData: "1日",
        dateArr: [
          {
            workNo: "2321321231233",
            time: "12:00:03",
            status: "1",
            name: "张三",
            type: "1",
          },
        ],
      },
    ],
  },
});
</script>

<style lang="scss" scoped>
.travel-container {
  padding: 25px;
  background: var(--favoriteBg);
}

.travel-header {
  margin: 60px auto 30px;
  height: 300px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  max-width: 1200px;
  color: var(--white);
  user-select: none;
}

.index-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--lightGreen);
}

.travel-content {
  margin: 0 auto;
  max-width: 1200px;
}

.photo-title-warp {
  max-width: 1150px;
  margin: 50px auto;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
}

.isActive {
  animation: scale 2.5s ease-in-out infinite;
}

.photo-title {
  text-align: center;
  font-size: 30px;
  font-weight: 700;
  line-height: 80px;
  letter-spacing: 2px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination {
  padding: 13px 15px;
  border: 1px solid var(--lightGray);
  border-radius: 3rem;
  color: var(--greyFont);
  width: 100px;
  user-select: none;
  cursor: pointer;
  text-align: center;
}

@media screen and (max-width: 1150px) {
  .photo-title-warp {
    max-width: 780px;
  }
}
</style>
