<template>
  <div>
    <div class="travel-container">
      <div class="page-container">
        <!-- 封面 -->
        <div class="travel-header my-animation-slide-top">
          <!-- 背景图片 -->
          <video
            class="index-video"
            autoplay
            muted
            loop
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
          <div
            style="position: absolute; left: 20px; bottom: 40px; margin: 10px"
          >
            每一张照片都是一次美好的记忆。
          </div>
        </div>

        <div class="travel-content my-animation-slide-bottom">
          <TimeLine2></TimeLine2>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import constant from "@/utils/constant";
import TimeLine2 from "./TimeLine2.vue";

</script>

<style lang="scss" scoped>
.travel-container {
  padding: 25px;
  background: var(--favoriteBg);
}

.page-container {
  justify-content: center;
  padding: 0 20px 40px 20px;
  margin: 0 auto;
  flex-direction: row;
  max-width: 1200px;
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

@media screen and (max-width: 700px) {
  // 小于700时生效
  .page-container {
    padding: 0;
  }
}
</style>
