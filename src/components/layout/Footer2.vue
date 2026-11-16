<template>
  <div class="page-footer center-align">
    <div class="container">
      <div class="copyright" style="position: relative">
        <div>
          <div class="info">
            <br />
            <a
              href="https://spring.io/projects/spring-boot"
              target="_blank"
              title="本站使用SpringBoot搭建"
            >
              <img
                class="lazyload hide-on-med-and-down"
                src="@/assets/svg/springLogo.svg"
                data-src="@/assets/svg/springLogo.svg"
                alt="Spring"
                width="85"
              /> </a
            > 
            <a
              href="https://cloud.tencent.com/"
              target="_blank"
              title="本站运行于腾讯云轻量服务器"
            >
              <img
                width="80"
                class="lazyload"
                src="@/assets/svg/txyun.svg"
                data-src="@/assets/svg/txyun.svg"
              /> </a
            > 
            <a
              href="https://portal.qiniu.com/"
              target="_blank"
              title="本站图片cdn加速由七牛云提供"
            >
              <img
                class="lazyload"
                src="@/assets/svg/qnyun.svg"
                data-src="@/assets/svg/qnyun.svg"
                width="80"
              /> </a
            > 

            <a
              href="https://github.com/sunlicp"
              target="_blank"
              alt="github"
              style="top: 13px"
              title="本站代码由github托管"
            >
              <img
                class="lazyload"
                src="@/assets/file/github1.png"
                data-src="@/assets/file/github1.png"
                alt="github"
                width="23"
              />
              <img
                class="lazyload"
                src="@/assets/file/github2.png"
                data-src="@/assets/file/github2.png"
                alt="github"
                width="54"
                style="margin-left: -3px"
              /> </a
            > <br /><br />
            <div
              style="
                display: flex;
                justify-content: center;
                align-items: center;
              "
            >
              <div>
                &nbsp;©&nbsp;2019 - 2024 ─=≡Σ(((つ•̀ω•́)つ
                <a href="/" target="_blank" class="black-text">BlackStar</a>
              </div>

              <div
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
              >
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  class="icp-Slcp black-text text-lighten-4"
                >
                  <img
                    src="@/assets/file/icp.png"
                    width="20"
                    style="position: relative; top: 4px"
                  />湘ICP备2022003002号
                </a>

                <a
                  href="https://icp.gov.moe/?keyword=20222522"
                  target="_blank"
                  class="icp-Slcp black-text text-lighten-4"
                >
                  <img
                    src="@/assets/file/icon400.png"
                    width="20"
                    style="position: relative; top: 4px"
                  />萌ICP备20222522号
                </a>
              </div>
            </div>
            <br />
            <div>
              <div class="V-badge">
                <a
                  style="color: #fff"
                  rel="license"
                  href="https://github.com/"
                  target="_blank"
                >
                  <span class="badge-subject">Theme</span
                  ><span class="badge-value bg-red">Vino</span>
                </a>
              </div>
              <div class="V-badge">
                <a
                  style="color: #fff"
                  rel="license"
                  href="https://www.slcp.top"
                  target="_blank"
                  title="主题由Slcp修改"
                >
                  <span class="badge-subject">Modified</span
                  ><span class="badge-value" style="background-color: #483d8b"
                    >Slcp</span
                  ></a
                >
              </div>
              <div class="V-badge">
                <a
                  style="color: #fff"
                  rel="license"
                  href="https://spring.io/projects/spring-boot"
                  target="_blank"
                  title="本站使用springBoot搭建"
                >
                  <span class="badge-subject">Powered</span
                  ><span class="badge-value bg-green">SpringBoot</span></a
                >
              </div>
              <div class="V-badge">
                <a
                  style="color: #fff"
                  rel="license"
                  href="https://portal.qiniu.com/"
                  target="_blank"
                  title="本站图片CDN加速由七牛云提供"
                  data-pjax-state=""
                >
                  <span class="badge-subject">CDN</span
                  ><span class="badge-value bg-blue">Qiniu</span></a
                >
              </div>
              <div class="V-badge">
                <a
                  style="color: #fff"
                  rel="license"
                  href="https://cloud.tencent.com/"
                  target="_blank"
                  title="运行于腾讯云轻量服务器"
                  data-pjax-state=""
                >
                  <span class="badge-subject">Hosted</span
                  ><span class="badge-value bg-orange">Tencent</span></a
                >
              </div>
            </div>
          </div>
        </div>
        <div id="blog-message">
          <div>
            <div class="V-badge" title="您所在的IP地址">
              <span class="badge-subject">Y-IP</span
              ><span class="badge-value bg-dm" id="ip">34.209.254.139</span>
            </div>
            <!--<div class="V-badge" title="您所在的地理位置">
                        <span class="badge-subject">GPS</span><span class="badge-value bg-bi" id="address"></span>
                    </div>
                    <div class="V-badge" title="您所在的纬度">
                        <span class="badge-subject">LAT</span><span class="badge-value bg-dmt" id="lat"></span>
                    </div>
                    <div class="V-badge" title="您所在的经度">
                        <span class="badge-subject">LON</span><span class="badge-value bg-cc" id="lon"></span>
                    </div>-->

            <div class="V-badge" title="文章总数">
              <span class="badge-subject">AC</span
              ><span class="badge-value bg-ms">103</span>
            </div>
            <div class="V-badge" title="访问总数">
              <span class="badge-subject">PV</span
              ><span class="badge-value bg-ba" style="background-color: #ffa07a"
                >160348</span
              >
            </div>
            <div class="V-badge" title="运行时间">
              <span class="badge-subject">Running</span
              ><span
                id="runningTime"
                class="badge-value bg-lc"
                style="background-color: #a4a492"
                >1859 days</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
.center-align {
  text-align: center;
}
.page-footer {
  position: relative;
  padding: 20px 20px;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
}
.black-text {
  color: rgba(255, 255, 255, 0.7);
}
.V-badge {
  display: inline-block;
  border-radius: 4px;
  text-shadow: none;
  font-size: 12px;
  color: #fff !important;
  line-height: 15px;
  background-color: #abbac3;
  margin-bottom: 5px;
  margin-left: 2px;

  .badge-subject {
    display: inline;
    background-color: #4d4d4d;
    padding: 4px 4px 4px 6px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    color: #fff !important;
  }
  .badge-value {
    display: inline;
    padding: 4px 6px 4px 4px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    color: #fff !important;
    background-color: #e05d44 !important;
  }
}
</style>
