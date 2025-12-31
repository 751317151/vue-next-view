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
          v-if="!common.isEmpty(state.photoTitleList)"
        >
          <div
            v-for="(item, index) in state.photoTitleList"
            :key="index"
            :class="{
              isActive: state.photoPagination.classify === item.classify,
            }"
            @click="changePhotoTitle(item.classify)"
          >
            <ProTag
              :info="item.classify + ' ' + item.count"
              :color="constant.before_color_list[Math.floor(Math.random() * 6)]"
              style="margin: 12px"
            >
            </ProTag>
          </div>
        </div>

        <div class="photo-title">
          {{ state.photoPagination.classify }}
        </div>

        <Photo :resourcePathList="state.photoList"></Photo>
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
    size: 12,
    total: 0,
    resourceType: "lovePhoto",
    classify: "全部",
  },
  photoTitleList: [
    { classify: "全部", count: 24 },
    { classify: "风景", count: 8 },
    { classify: "人物", count: 6 },
    { classify: "建筑", count: 5 },
    { classify: "美食", count: 3 },
    { classify: "动物", count: 2 },
  ],
  photoList: [
    "https://picsum.photos/400/300?random=1",
    "https://picsum.photos/400/300?random=2",
    "https://picsum.photos/400/300?random=3",
    "https://picsum.photos/400/300?random=4",
    "https://picsum.photos/400/300?random=5",
    "https://picsum.photos/400/300?random=6",
    "https://picsum.photos/400/300?random=7",
    "https://picsum.photos/400/300?random=8",
    "https://picsum.photos/400/300?random=9",
    "https://picsum.photos/400/300?random=10",
    "https://picsum.photos/400/300?random=11",
    "https://picsum.photos/400/300?random=12",
  ],
});

const getPhotoTitles = () => {
  // 已在state中初始化
};

const changePhotoTitle = (classify) => {
  if (classify !== state.photoPagination.classify) {
    state.photoPagination = {
      current: 1,
      size: 12,
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

const changePhoto = () => {
  // 模拟根据分类加载不同的照片
  const allPhotos = Array.from({ length: 24 }, (_, i) => 
    `https://picsum.photos/400/300?random=${i + 1}`
  );
  
  const categoryPhotos = {
    "全部": allPhotos,
    "风景": allPhotos.slice(0, 8),
    "人物": allPhotos.slice(8, 14),
    "建筑": allPhotos.slice(14, 19),
    "美食": allPhotos.slice(19, 22),
    "动物": allPhotos.slice(22, 24),
  };
  
  const photos = categoryPhotos[state.photoPagination.classify] || allPhotos;
  const startIndex = (state.photoPagination.current - 1) * state.photoPagination.size;
  const endIndex = startIndex + state.photoPagination.size;
  
  state.photoList = [...state.photoList, ...photos.slice(startIndex, endIndex)];
  state.photoPagination.total = photos.length;
};

getPhotoTitles();
changePhoto();
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
