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
            <div>旅拍集</div>
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
        <div
          class="photo-title-warp"
          v-if="common.isEmpty(state.photoTitleList)"
        >
          <div
            v-for="(item, index) in state.photoTitleList"
            :key="index"
            :class="{
              isActive: state.photoPagination.classify === item.classify,
            }"
            @click="changePhotoTitle(item.classify)"
          >
            <proTag
              :info="item.classify + ' ' + item.count"
              :color="constant.before_color_list[Math.floor(Math.random() * 6)]"
              style="margin: 12px"
            >
            </proTag>
          </div>
        </div>

        <div class="photo-title">
          {{ state.photoPagination.classify }}
        </div>

        <photo :resourcePathList="state.photoList"></photo>
        <div class="pagination-wrap">
          <div
            @click="pagePhotos()"
            class="pagination"
            v-if="state.photoPagination.total !== state.photoList.length"
          >
            下一页
          </div>
          <div v-else style="user-select: none">~~到底啦~~</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "vue";
import common from "@/utils/common";
import constant from "@/utils/constant";

const state = reactive({
  photoPagination: {
    current: 1,
    size: 10,
    total: 0,
    resourceType: "lovePhoto",
    classify: "",
  },
  photoTitleList: [],
  photoList: [],
});

const getPhotoTitles = () => {};
const changePhotoTitle = (classify) => {
  if (classify !== state.photoPagination.classify) {
    state.photoPagination = {
      current: 1,
      size: 10,
      total: 0,
      resourceType: "lovePhoto",
      classify: classify,
    };
    state.photoList = [];
    changePhoto();
  }
};
const pagePhotos = () => {
  state.photoPagination.current = state.photoPagination.current + 1;
  changePhoto();
};
const changePhoto = () => {};

getPhotoTitles();
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
