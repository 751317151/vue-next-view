<template>
  <div style="background-color: gray">
    <div style="padding: 20px">
      <ul class="timeline timeline-centered">
        <template
          v-for="archive in archives"
          :key="archive.time.split('-')[1] + '-' + archive.time.split('-')[0]"
        >
          <li class="timeline-item period">
            <div class="timeline-info"></div>
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h2 class="timeline-title">
                {{ archive.time.split("-")[0] }}
              </h2>
            </div>
          </li>
          <li
            class="timeline-item"
            v-for="article in archive.articles"
            :key="article.id"
          >
            <div class="timeline-info">
              <span>
                {{ new Date(article.createTime).getMonth() }}
                {{ new Date(article.createTime).getDate() }},
                {{ new Date(article.createTime).getFullYear() }}
              </span>
            </div>
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-item-card">
                <div class="card-image">
                  <el-image
                    class="my-el-image"
                    v-once
                    lazy
                    :src="article.articleCover"
                    fit="cover"
                  >
                    <div
                      slot="error"
                      class="image-slot myCenter"
                      style="background-color: var(--lightGreen)"
                    >
                      <div class="error-text">
                        <div>遇事不决，可问春风</div>
                      </div>
                    </div>
                  </el-image>
                </div>
                <div class="card-body">
                  <div class="card-title">
                    {{ article.articleTitle }}
                  </div>
                  <div class="card-desc">
                    {{ article.articleContent }}
                  </div>
                </div>
              </div>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Archives",
  setup() {
    data: {
      return {
        archives: [
          {
            articles: [
              {
                id: 163,
                articleCover:
                  "https://bu.dusays.com/2022/05/03/627010707b598.webp",
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
                articleCover:
                  "https://bu.dusays.com/2022/05/03/627010707b598.webp",
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
                articleCover:
                  "https://bu.dusays.com/2022/05/03/627010707b598.webp",
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
            time: "2023-6",
          },
          {
            articles: [
              {
                id: 155,
                articleCover:
                  "https://bu.dusays.com/2022/05/03/627010707b598.webp",
                articleTitle: "计算机轻量级硬件性能测试软件推荐",
                articleContent:
                  "@[TOC](计算机轻量级硬件测试软件推荐)\n# 硬盘测试\n##  硬盘读写测试\n有没有一种必要去检测一下你的电脑的硬盘状态或者是硬盘的读写工具，当然市面上还是有许多可以测试的，但是我今天介绍的这款软件是非常轻量，而且可以较为直观的观察到硬盘的性能分析数据。\n\n链接[网站点击](https://crystalmark.info/en/software/crystaldiskmark/)\n\n首先我们进入这个页面\n\n![在这里插入图片描述](https://img-blog.csdnimg.cn/4668e51a0e7b4b6fbf0362ac4f21f234.png)\n![在这里插入图片描述](https://img-blog.csdnimg.cn/6991fb0144b94be494e9cd9eb3583123.png)\n\n进入到这个网站我们去下载工具，点到download,你看这里是这些工具。\n![在这里插入图片描述](https://img-blog.csdnimg.cn/7469e85f64e34fe2a0b36e3692a022ce.png)这里面啊有几个版本我们去下载一个。最",
                isTop: null,
                isFeatured: null,
                author: null,
                categoryName: null,
                tags: null,
                status: null,
                createTime: "2023-01-28T09:46:49",
                updateTime: null,
                viewCount: 99,
                commentCount: 99,
                likeCount: 99,
              },
              {
                id: 154,
                articleCover:
                  "https://bu.dusays.com/2022/05/03/627010707b598.webp",
                articleTitle: "对象序列化",
                articleContent:
                  "# 为什么要进行序列化？\n#  序列化概念\n序列化：把对象转化为可传输的字节序列过程称为序列化。\n反序列化：把字节序列还原为对象的过程称为反序列化。\n##  对象序列化流与反序列化流\n###  什么是序列化与反序列化\n**=java序列化，就是指吧java对象转换为字节序列的过程。而反序列自然就是将字节对象恢复为java对象。==**\n\n**这样做的意义在哪呢？对象进行序列化，会转换为字节流，这样在网络上传输，或者是进行保存为本地文件都是非常方便的。反序列很明显就是进行对象的重构。**\n\n**其实你可以和通信联系在一起。==网络上的文本，图片，视频，音频都是通过二进制进行传输的，我们的java所创建的对象在传输的时候也应该进行序列化，转换为字节流，然后通过网络，io传入，当我们的对象序列传输完成后，对方进行反序列化，就可以读取到数据内容。==**\n###  对象序列化流（ ObjectOutputStream）\n**api对这个类有很多的说明，主要说明**\n>public class ObjectOutputStreamextends OutputStreamimplements Ob",
                isTop: null,
                isFeatured: null,
                author: null,
                categoryName: null,
                tags: null,
                status: null,
                createTime: "2023-01-26T19:19:29",
                updateTime: null,
                viewCount: 99,
                commentCount: 99,
                likeCount: 99,
              },
              {
                id: 153,
                articleCover:
                  "https://bu.dusays.com/2022/05/03/627010707b598.webp",
                articleTitle: "Java从入门到精通十八（反射）",
                articleContent:
                  "@[TOC](Java从入门到精通十八(反射）\n## 反射的概念以及机制\n\n**反射机制是什么？是通过字节码文件找到其中的一个类，然后也可以找到类中的相关属性等。**\n**我们正常一般的思维是编写java代码，然后代码会被编译为字节码文件。而我们的方法都是**\n**自己在代码中写的，现在这个机制可以通过字节码找到代码中的属性。这就是反射机制的特**\n**点。**\n### 一： 获取字节码文件对象的三种方式\n#### 1：通过getClass() 方法获取到Class对象。\n**这个方法是在Object类中的一个方法，去api查找详细的说明。**\n![image.png](https://img-blog.csdnimg.cn/img_convert/9009dc08ed867fbc7b49cd23cb63741b.png#clientId=u0aff33a4-765b-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=157&id=u3b5cb2b9&margin=%5Bobject%20Object%5D&name=image.png&o",
                isTop: null,
                isFeatured: null,
                author: null,
                categoryName: null,
                tags: null,
                status: null,
                createTime: "2023-01-22T22:54:35",
                updateTime: null,
                viewCount: 99,
                commentCount: 99,
                likeCount: 99,
              },
            ],
            time: "2023-1",
          },
        ],
      };
    }
  },
});
</script>

<style lang="scss" scoped>
.timeline {
  position: relative;
  z-index: 2;
  line-height: 1.4em;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 0;
  }
}

.timeline-item {
  padding-left: 40px;
  position: relative;
  &:last-child {
    padding-bottom: 0;
  }
}

.timeline-info {
  color: red;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  margin: 0 0 0.5em 0;
  text-transform: uppercase;
  white-space: nowrap;
}

.timeline-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 15px;
  &:before {
    background: red;
    border-radius: 100%;
    content: "";
    display: block;
    height: 15px;
    position: absolute;
    top: 4px;
    left: 0;
    width: 15px;
  }
  &:after {
    content: "";
    width: 3px;
    background: blue;
    display: block;
    position: absolute;
    top: 24px;
    bottom: 0;
    left: 6px;
  }
  .timeline-item:last-child &:after {
    content: none;
  }
}

.timeline-content {
  padding-bottom: 40px;
  p {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-wrap: break-word;
    word-break: break-all;
  }
}

.timeline-item-card {
  position: relative;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.88);
  overflow: hidden;
  height: 300px;
  flex-shrink: 0;
  cursor: pointer;
  animation: zoomIn 0.8s ease-in-out;

  .card-image {
    width: 100%;
    height: 180px;
  }

  .card-image ::deep(.el-image__inner) {
    transition: all 1s;
  }

  .card-image ::deep(.el-image__inner:hover) {
    transform: scale(1.2);
  }

  .card-body {
    padding: 10px 20px;

    .card-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      transition: all 0.2s ease-in-out;
    }

    .card-title:hover {
      color: var(--lightGreen);
    }

    .card-desc {
      font-size: 14px;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      letter-spacing: 1px;
    }
  }
}

.timeline-title {
  @apply pb-2 mb-4 text-ob-bright relative text-2xl;
  font-weight: 600;
  &:after {
    @apply absolute bottom-0 h-1 w-24 rounded-full;
    content: "";
    background: var(--main-gradient);
    left: 0;
  }
}

.period {
  padding: 0;
  .timeline-info {
    display: none;
  }
  .timeline-marker {
    &:before {
      background: transparent;
      content: "";
      width: 15px;
      height: auto;
      border: none;
      border-radius: 0;
      top: 0;
      bottom: 30px;
      position: absolute;
      border-top: 3px solid #bebebe;
      border-bottom: 3px solid #bebebe;
    }
    &:after {
      content: "";
      height: 32px;
      top: auto;
    }
  }
  .timeline-content {
    padding: 40px 0 70px;
  }
  .timeline-title {
    margin: 0;
    &:after {
      content: none;
    }
  }
}

.timeline-split {
  @media (min-width: 768px) {
    .timeline {
      display: table;
    }
    .timeline-item {
      display: table-row;
      padding: 0;
    }
    .timeline-info,
    .timeline-marker,
    .timeline-content,
    .period .timeline-info {
      display: table-cell;
      vertical-align: top;
    }
    .timeline-marker {
      position: relative;
    }
    .timeline-content {
      padding-left: 30px;
    }
    .timeline-info {
      padding-right: 30px;
    }
    .period .timeline-title {
      position: relative;
      left: -45px;
    }
  }
}

.timeline-centered {
  @extend .timeline-split;
  @media (min-width: 80%) {
    &,
    .timeline-item,
    .timeline-info,
    .timeline-marker,
    .timeline-content {
      display: block;
      margin: 0;
      padding: 0;
    }
    .timeline-item {
      padding-bottom: 40px;
      overflow: hidden;
    }
    .timeline-marker {
      position: absolute;
      left: 50%;
      margin-left: -7.5px;
    }
    .timeline-info,
    .timeline-content {
      width: 50%;
    }
    > .timeline-item:nth-child(odd) .timeline-info {
      float: left;
      text-align: right;
      padding-right: 30px;
    }
    > .timeline-item:nth-child(odd) .timeline-content {
      float: right;
      text-align: left;
      padding-left: 30px;
      .timeline-title {
        &:after {
          left: 0;
          right: initial;
        }
      }
    }
    > .timeline-item:nth-child(even) .timeline-info {
      float: right;
      text-align: left;
      padding-left: 30px;
    }
    > .timeline-item:nth-child(even) .timeline-content {
      float: left;
      text-align: right;
      padding-right: 30px;
      .timeline-title {
        &:after {
          right: 0;
          left: initial;
        }
      }
    }
    > .timeline-item.period .timeline-content {
      float: none;
      padding: 0;
      width: 100%;
      text-align: center;
    }
    .timeline-item.period {
      padding: 50px 0 90px;
    }
    .period .timeline-marker:after {
      height: 30px;
      bottom: 0;
      top: auto;
    }
    .period .timeline-title {
      left: auto;
    }
  }
}
</style>
