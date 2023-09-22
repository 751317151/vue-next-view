<template>
  <div class="container">
    <div class="left-top">左侧</div>
    <div class="main"></div>
    <div class="right-top">右侧</div>
  </div>
</template>

<style lang="scss" scoped>
.left-top {
  width: 80%;
  height: 100px;
  background-color: blue;
}
.right-top {
  width: 80%;
  height: 100px;
  background-color: red;
}

@media (max-width: 500px) {
  .container {
    flex-direction: column;
  }

  .left-top,
  .right-top {
    width: 100%;
  }

  .main::before {
    top: unset;
    bottom: 0;
  }
}
</style>
