<template>
  <div class="comment-container">
    <div class="comment-head">
      <i class="el-icon-chat-dot-round" style="margin-right: 5px"></i>
      <span>评论</span>
      <span class="count">({{ comments.length }})</span>
    </div>

    <!-- 评论输入框 -->
    <div class="comment-input-wrapper">
      <div class="input-header">
        <el-input
          v-model="commentForm.nickname"
          placeholder="昵称 (必填)"
          prefix-icon="User"
          size="small"
          class="input-item"
        />
        <el-input
          v-model="commentForm.email"
          placeholder="邮箱 (可选)"
          prefix-icon="Message"
          size="small"
          class="input-item"
        />
        <el-input
          v-model="commentForm.website"
          placeholder="网址 (可选)"
          prefix-icon="Link"
          size="small"
          class="input-item"
        />
      </div>
      <div class="input-body">
        <el-input
          v-model="commentForm.content"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
          resize="none"
        />
        <div class="input-footer">
          <div class="emoji-btn disabled-btn">
            <i class="iconfont icon-biaoqing"></i> 表情
          </div>
          <el-button
            type="primary"
            size="small"
            class="submit-btn"
            :loading="submitting"
            @click="handleSubmit"
          >
            发布评论
          </el-button>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list" v-loading="loading">
      <div v-if="comments.length === 0 && !loading" class="no-comment">
        暂无评论，快来抢沙发吧~
      </div>
      
      <div v-else class="comment-items">
        <!-- 递归渲染评论项 -->
        <div v-for="item in comments" :key="item.id" class="comment-item">
          <div class="comment-avatar">
            <el-avatar :src="item.avatar" :size="40">{{ item.nickname.charAt(0) }}</el-avatar>
          </div>
          <div class="comment-main">
            <div class="comment-header">
              <span class="nickname">{{ item.nickname }}</span>
              <span class="time">{{ item.createTime }}</span>
            </div>
            <div class="comment-content">{{ item.content }}</div>
            <div class="comment-footer">
              <span 
                class="action-btn like-btn" 
                :class="{ active: item.isLiked }"
                @click="handleLike(item)"
              >
                <i class="iconfont icon-dianzan"></i> {{ item.likeCount || '点赞' }}
              </span>
              <span class="action-btn reply-btn" @click="toggleReply(item.id)">
                <i class="iconfont icon-huifu"></i> 回复
              </span>
            </div>
            
            <!-- 回复输入框 -->
            <div v-if="replyId === item.id" class="reply-input-wrapper">
              <el-input
                v-model="replyForm.content"
                type="textarea"
                :rows="2"
                :placeholder="'回复 @' + item.nickname + '...'"
              />
              <div class="reply-footer">
                <el-input
                  v-model="replyForm.nickname"
                  placeholder="昵称"
                  size="small"
                  style="width: 120px; margin-right: 10px;"
                />
                <el-button size="small" @click="replyId = null">取消</el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  :loading="submittingReply"
                  @click="handleReplySubmit(item)"
                >
                  提交回复
                </el-button>
              </div>
            </div>

            <!-- 子评论 (递归) -->
            <div v-if="item.children && item.children.length > 0" class="sub-comments">
              <div v-for="subItem in item.children" :key="subItem.id" class="sub-comment-item">
                <div class="comment-avatar small">
                  <el-avatar :src="subItem.avatar" :size="30">{{ subItem.nickname.charAt(0) }}</el-avatar>
                </div>
                <div class="comment-main">
                  <div class="comment-header">
                    <span class="nickname">{{ subItem.nickname }}</span>
                    <span v-if="subItem.replyTo" class="reply-to">回复 @{{ subItem.replyTo }}</span>
                    <span class="time">{{ subItem.createTime }}</span>
                  </div>
                  <div class="comment-content">{{ subItem.content }}</div>
                  <div class="comment-footer">
                    <span 
                      class="action-btn like-btn" 
                      :class="{ active: subItem.isLiked }"
                      @click="handleLike(subItem)"
                    >
                      <i class="iconfont icon-dianzan"></i> {{ subItem.likeCount || '点赞' }}
                    </span>
                    <span class="action-btn reply-btn" @click="toggleReply(subItem.id)">
                      <i class="iconfont icon-huifu"></i> 回复
                    </span>
                  </div>

                  <!-- 子评论的回复输入框 -->
                  <div v-if="replyId === subItem.id" class="reply-input-wrapper">
                    <el-input
                      v-model="replyForm.content"
                      type="textarea"
                      :rows="2"
                      :placeholder="'回复 @' + subItem.nickname + '...'"
                    />
                    <div class="reply-footer">
                      <el-input
                        v-model="replyForm.nickname"
                        placeholder="昵称"
                        size="small"
                        style="width: 120px; margin-right: 10px;"
                      />
                      <el-button size="small" @click="replyId = null">取消</el-button>
                      <el-button 
                        type="primary" 
                        size="small" 
                        :loading="submittingReply"
                        @click="handleReplySubmit(subItem, item.id)"
                      >
                        提交回复
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getArticleComments, submitComment, likeComment } from '@/api/article';
import type { Comment } from '@/types';
import common from '@/utils/common';

const props = defineProps({
  source: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    default: 'article'
  },
  userId: {
    type: Number,
    default: 0
  }
});

const loading = ref(false);
const submitting = ref(false);
const submittingReply = ref(false);
const comments = ref<Comment[]>([]);
const replyId = ref<number | null>(null);

const commentForm = reactive({
  content: '',
  nickname: '',
  email: '',
  website: ''
});

const replyForm = reactive({
  content: '',
  nickname: ''
});

// 加载评论
const loadComments = async () => {
  loading.value = true;
  try {
    const data = await getArticleComments(props.source);
    comments.value = data;
  } catch (error) {
    ElMessage.error('加载评论失败');
  } finally {
    loading.value = false;
  }
};

// 提交主评论
const handleSubmit = async () => {
  if (!commentForm.nickname) {
    ElMessage.warning('请输入昵称');
    return;
  }
  if (!commentForm.content) {
    ElMessage.warning('请输入评论内容');
    return;
  }

  submitting.value = true;
  try {
    const newComment = await submitComment({
      articleId: props.source,
      content: commentForm.content,
      nickname: commentForm.nickname,
      email: commentForm.email,
      website: commentForm.website
    });
    
    comments.value.unshift(newComment);
    commentForm.content = ''; // 清空内容
    ElMessage.success('评论成功！');
  } catch (error) {
    ElMessage.error('评论失败');
  } finally {
    submitting.value = false;
  }
};

// 切换回复框
const toggleReply = (id: number) => {
  if (replyId.value === id) {
    replyId.value = null;
  } else {
    replyId.value = id;
    replyForm.content = '';
    // 如果主评论表单有昵称，自动填充
    if (commentForm.nickname) {
      replyForm.nickname = commentForm.nickname;
    }
  }
};

// 提交回复
const handleReplySubmit = async (targetComment: Comment, rootId?: number) => {
  if (!replyForm.nickname) {
    ElMessage.warning('请输入昵称');
    return;
  }
  if (!replyForm.content) {
    ElMessage.warning('请输入回复内容');
    return;
  }

  submittingReply.value = true;
  try {
    // 确定父评论ID：如果是回复子评论，父评论ID应该是最顶层的评论ID（通常逻辑），这里简单处理为当前被回复对象的ID或传入的rootId
    // 根据 API 定义，parentId 应该是直接父级或根级，这里假设两层结构，parentId 为根评论ID
    const parentId = rootId || targetComment.id;
    
    const newComment = await submitComment({
      articleId: props.source,
      content: replyForm.content,
      nickname: replyForm.nickname,
      parentId: parentId,
      replyTo: targetComment.nickname
    });

    // 找到父评论并加入 children
    const parentComment = comments.value.find(c => c.id === parentId);
    if (parentComment) {
      if (!parentComment.children) {
        parentComment.children = [];
      }
      parentComment.children.push(newComment);
    }
    
    replyId.value = null;
    ElMessage.success('回复成功！');
  } catch (error) {
    ElMessage.error('回复失败');
  } finally {
    submittingReply.value = false;
  }
};

// 点赞
const handleLike = async (item: Comment) => {
  if (item.isLiked) {
    ElMessage.info('您已经点赞过了');
    return;
  }
  
  try {
    const result = await likeComment(item.id);
    if (result.success) {
      item.likeCount = result.likeCount || item.likeCount + 1;
      item.isLiked = true;
      ElMessage.success('点赞成功');
    }
  } catch (error) {
    ElMessage.error('点赞失败');
  }
};

onMounted(() => {
  loadComments();
});
</script>

<style lang="scss" scoped>
.comment-container {
  padding: 20px;
  background: var(--card-background);
  border-radius: 12px;
  margin-top: 20px;
  color: var(--text-color);
}

.comment-head {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  
  .count {
    font-size: 0.9em;
    margin-left: 5px;
    color: var(--text-color-secondary);
  }
}

.comment-input-wrapper {
  margin-bottom: 30px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  background: var(--background);

  .input-header {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    
    .input-item {
      max-width: 200px;
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      .input-item {
        max-width: 100%;
      }
    }
  }
  
  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    
    .emoji-btn {
      cursor: pointer;
      color: var(--text-color-secondary);
      &:hover {
        color: var(--theme-color);
      }
      i {
        font-size: 1.1em;
      }
    }
    
    .disabled-btn {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}

.comment-list {
  min-height: 100px;
}

.no-comment {
  text-align: center;
  padding: 40px;
  color: var(--text-color-secondary);
}

.comment-item {
  display: flex;
  margin-bottom: 20px;
  
  .comment-avatar {
    margin-right: 15px;
    
    &.small {
      margin-right: 10px;
    }
  }
  
  .comment-main {
    flex: 1;
    
    .comment-header {
      margin-bottom: 5px;
      
      .nickname {
        font-weight: bold;
        margin-right: 10px;
        color: var(--text-color);
      }
      
      .reply-to {
        margin-right: 10px;
        color: var(--theme-color);
        font-size: 0.9em;
      }
      
      .time {
        font-size: 0.85em;
        color: var(--text-color-secondary);
      }
    }
    
    .comment-content {
      line-height: 1.6;
      margin-bottom: 8px;
      font-size: 0.95em;
    }
    
    .comment-footer {
      display: flex;
      gap: 15px;
      font-size: 0.85em;
      color: var(--text-color-secondary);
      
      .action-btn {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 3px;
        
        &:hover, &.active {
          color: var(--theme-color);
        }
      }
    }
  }
}

.reply-input-wrapper {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background: var(--background);
  border-radius: 6px;
  
  .reply-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    align-items: center;
  }
}

.sub-comments {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 2px solid var(--border-color);
}

.sub-comment-item {
  display: flex;
  margin-bottom: 15px;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
