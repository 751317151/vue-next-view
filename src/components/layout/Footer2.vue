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
              &nbsp;©&nbsp;2019 - 2024 ─=≡Σ(((つ•̀ω•́)つ
              <a href="/" target="_blank" class="black-text">BlackStar</a>
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
            <br /><br />
            <div class="v-badge"></div>
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
            <input type="hidden" id="busuanzi_value_site_uv" />
            <input type="hidden" id="busuanzi_value_site_pv" />
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
import { reactive } from "vue";
import constant from "@/utils/constant";
import common from "@/utils/common";

const state = reactive({
  newBlogList: [
    {
      id: 163,
      articleCover: "https://bu.dusays.com/2022/05/03/627010707b598.webp",
      articleTitle: "学习资源（包含一些实战项目和笔记）",
      articleContent:
        "# \n\n\n[https://www.yuque.com/g/xiaoyao-5mwtc/tvez8k/collaborator/join?token=kiGEhewzAiqSHSYl#](https://www.yuque.com/g/xiaoyao-5mwtc/tvez8k/collaborator/join?token=kiGEhewzAiqSHSYl#) 邀请你共同编辑知识库《资源·分享库》\n\n声明：加入协作可进行编辑，语雀目前开通会员。博客日志笔记等逐步更新。资源的话就是作为分享了，可以参与进来，赋予编辑权限。\n\n# 技术社交平台（开发者交流的平台）\n##  1 gitter（世界编程大佬交流）\n这里推荐一个，其它的耳熟能详的就不说了。这里先推荐一个。我觉得很多人还是没有关注过的。\n**_gitter_**\n这里是世界大佬的一个交流的平台，很多大佬会在这里发出一些交流。相信你来到这里会受益匪浅。\n我们可以进来这个网站\n‘[https://gitter.im/home/explore](https://gitter.im/home/explore)\n是个什么网站呢？\n![imag",
      isTop: null,
      isFeatured: null,
      author: null,
      categoryName: null,
      tags: null,
      status: null,
      createTime: "2023-06-26T18:20:01",
      updateTime: null,
      viewCount: 99,
      commentCount: 99,
      likeCount: 99,
    },
    {
      id: 161,
      articleCover: "https://bu.dusays.com/2022/05/03/627010707b598.webp",
      articleTitle: "SpringAMQP对RabbitMQ消息的确认（发送）",
      articleContent:
        "# SpringAMQP对RabbitMQ消息的确认（发送）\n本篇主要实现一个对生产者发送消息的确认。也就是当我们的生产者发送消息后，消费者这里是否有正确的接收等等，以及对于消息的反馈。\n\n简单的说就是一个对消息的处理方案。\n下面我们介绍两个方案。\n\n## 发送者确认\n发送者确认就是publisher-confirm，这个方案主要在交换机这里进行处理。\n具体的处理逻辑呢，直接就开始用代码去演示好了。\n\n首先我们需要开启这个发送者确认，我们需要在yml文件中配置\n```yml\n publisher-confirm-type: correlated #开启确认模式\n```\n```java\n /**\n     * 在yml配置文件当中开启去人模式\n     * 在RabbitTemplate定义ConfirmCallBack回调函数\n     */\n    @Test\n    public void testConfirm()\n    {\n        //定义回调\n        template.setConfirmCallback(new RabbitTemplate.Confirm",
      isTop: null,
      isFeatured: null,
      author: null,
      categoryName: null,
      tags: null,
      status: null,
      createTime: "2023-06-26T10:58:10",
      updateTime: null,
      viewCount: 99,
      commentCount: 99,
      likeCount: 99,
    },
    {
      id: 161,
      articleCover: "https://bu.dusays.com/2022/05/03/627010707b598.webp",
      articleTitle: "SpringAMQP对RabbitMQ消息的确认（发送）",
      articleContent:
        "# SpringAMQP对RabbitMQ消息的确认（发送）\n本篇主要实现一个对生产者发送消息的确认。也就是当我们的生产者发送消息后，消费者这里是否有正确的接收等等，以及对于消息的反馈。\n\n简单的说就是一个对消息的处理方案。\n下面我们介绍两个方案。\n\n## 发送者确认\n发送者确认就是publisher-confirm，这个方案主要在交换机这里进行处理。\n具体的处理逻辑呢，直接就开始用代码去演示好了。\n\n首先我们需要开启这个发送者确认，我们需要在yml文件中配置\n```yml\n publisher-confirm-type: correlated #开启确认模式\n```\n```java\n /**\n     * 在yml配置文件当中开启去人模式\n     * 在RabbitTemplate定义ConfirmCallBack回调函数\n     */\n    @Test\n    public void testConfirm()\n    {\n        //定义回调\n        template.setConfirmCallback(new RabbitTemplate.Confirm",
      isTop: null,
      isFeatured: null,
      author: null,
      categoryName: null,
      tags: null,
      status: null,
      createTime: "2023-06-26T10:58:10",
      updateTime: null,
      viewCount: 99,
      commentCount: 99,
      likeCount: 99,
    },
  ],
  hitokoto: {
    hitokoto: "...",
    from: "...",
    from_who: "...",
  },
  siteInfo: {
    blogName: "",
    webTitleSuffix: "",
    playlistServer: "",
    playlistId: "",
    copyright: {
      title: "",
      siteName: "",
    },
    beian: "",
  },
  badges: [],
});

const getHitokoto = () => {
  let xhr = new XMLHttpRequest();
  xhr.open("get", constant.hitokoto);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      state.hitokoto = JSON.parse(xhr.responseText);
    }
  };
  xhr.send();
};
</script>

<style lang="scss" scoped>
.center-align {
  text-align: center;
}
.page-footer {
  position: relative;
  color: rgba(255, 255, 255, 0.7);
  &:before {
    content: "";
    position: absolute;
    background-color: rgba(0, 0, 0, 0.25) !important;
    width: 100%;
    height: 100%;
    left: 0;
  }
}
.black-text {
  color: #000 !important;
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
}
</style>
