<template>
  <div class="myTag" :style="state.bg">
    <span class="name">🔖 {{ info }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  info: {
    type: String,
    default: "一只小毛驴",
  },
  color: {
    type: String,
  },
});
const state = reactive({
  bg: { background: props.color },
});
</script>

<style scoped>
.myTag {
  cursor: pointer;
  color: var(--white);
  border-radius: 5px;
  padding: 8px;
}

.myTag:hover {
  background: var(--gradualRed) !important;
}
</style>
