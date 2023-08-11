<template>
  <div class="timeline-main">
    <!--年月标题-->
    <div class="timeline-title">
      {{ timeData.yearData }}
      <i
        :class="state.showCards ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"
        @click="state.showCards = !state.showCards"
      ></i>
    </div>
    <ul class="timeline-body">
      <!--时间线顶部圆点-->
      <li class="timeline-item-head">
        <div class="item-node"></div>
        <div class="item-tail"></div>
      </li>
      <!--时间线内容-->
      <template v-if="state.showCards">
        <li
          v-for="(mouthItem, i) in timeData.mouthData"
          :key="'mm' + i"
          class="timeline-item"
        >
          <div class="item-left">
            <div class="item-left-data">{{ mouthItem.dateData }}</div>
            <div class="item-left-total">
              <div class="item-left-total-text">
                共{{ mouthItem.dateArr.length }}条
              </div>
              <div class="item-left-total-end"></div>
            </div>
          </div>
          <div class="item-tail"></div>
          <div class="item-node"></div>
          <div class="item-content">
            <slot v-for="v in mouthItem.dateArr" :card="v"></slot>
          </div>
        </li>
      </template>
      <!--时间线尾部圆点-->
      <li class="timeline-item-foot">
        <div class="item-node"></div>
        <div class="item-tail"></div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const props = defineProps({
  timeData: {
    type: Object,
    default: () => ({}),
  },
});
const state = reactive({
  showCards: true,
});
console.log("aa");
console.log(props.timeData);
</script>

<style lang="scss" scoped>
.timeline-main {
  padding: 0 0 0 20px;

  .timeline-title {
    margin-bottom: 10px;
    font-weight: bold;

    i {
      cursor: pointer;
    }
  }

  .timeline-body {
    margin: 0;
    font-size: 14px;
    list-style: none;
    // 顶尾圆圈
    .timeline-item-head,
    .timeline-item-foot {
      position: relative;
      height: 15px;

      .item-tail {
        position: absolute;
        left: 45px;
        height: 100%;
        border-left: 2px solid #e4e7ed;
      }

      .item-node {
        position: absolute;
        left: 42px;
        width: 8px;
        height: 8px;
        background-color: #e4e7ed;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .timeline-item-foot {
      .item-node {
        top: 14px;
      }
    }

    // 时间线主体内容
    .timeline-item {
      position: relative;
      padding-bottom: 10px;

      .item-left {
        position: absolute;
        top: 13px;
        left: -9px;

        .item-left-data {
          font-weight: bold;
          line-height: 20px;
        }

        .item-left-total {
          display: flex;
          font-size: 12px;

          .item-left-total-text {
            padding: 0 3px;
            line-height: 20px;
            color: #ffffff;
            background: #409eff;
          }

          .item-left-total-end {
            width: 0;
            height: 0;
            border-top: 10px solid transparent;
            border-left: 6px solid #409eff;
            border-bottom: 10px solid transparent;
          }
        }
      }

      .item-tail {
        position: absolute;
        left: 45px;
        height: 100%;
        border-left: 2px solid #e4e7ed;
      }

      .item-node {
        position: absolute;
        top: 38px;
        left: 41px;
        width: 6px;
        height: 6px;
        background-color: #ffffff;
        border: 2px solid #409eff;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .item-content {
        position: relative;
        padding-top: 15px;
        padding-left: 60px;
        // top: -3px;
      }
    }
  }
}
</style>
