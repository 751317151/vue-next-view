<template>
  <div>
    <!-- 两句诗 -->
    <div class="my-animation-slide-top">
      <CommonHead :typeName="'分类'"></CommonHead>
    </div>
    <div style="padding-top: 40px" class="my-animation-slide-bottom">
      <div class="page-container">
        <!-- 标签 -->
        <div class="sort-warp shadow-box" v-if="!common.isEmpty(Categories)">
          <ProTag
            v-for="(category, index) in Categories"
            :key="index"
            @click="
              router.push({
                path: '/categories/' + category.id,
              })
            "
            :info="category.categoryName"
            :color="constant.before_color_list[Math.floor(Math.random() * 6)]"
          >
          </ProTag>
        </div>

        <!-- 文章 -->
        <div class="article-wrap"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useConfig } from "@/stores/config";
import common from "@/utils/common";
import constant from "@/utils/constant";

const storesConfig = useConfig();
const { Categories } = storeToRefs(storesConfig);

const router = useRouter();
</script>

<style lang="scss" scoped>
.page-container {
  justify-content: center;
  width: 90%;
  padding: 0 20px 40px 20px;
  margin: 0 auto;
  flex-direction: row;
  max-width: 1200px;
}
.sort-warp {
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.article-wrap {
  margin: 40px auto 0 auto;
  min-height: 600px;
  padding-bottom: 40px;
}

.isActive {
  animation: scale 1.5s ease-in-out infinite;
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

.pagination:hover {
  border: 1px solid var(--themeBackground);
  color: var(--themeBackground);
  box-shadow: 0 0 5px var(--themeBackground);
}

@media screen and (max-width: 900px) {
  .sort-warp {
    width: 90%;
  }

  .article-wrap {
    width: 90%;
  }
}
</style>
