<template>
  <el-dialog
    v-model="visible"
    title="用户登录"
    width="300px"
    center
    :close-on-click-modal="false"
  >
    <div class="login-form">
      <div class="avatar-select">
        <el-avatar :size="60" :src="form.avatar || defaultAvatar" />
        <div class="refresh-avatar" @click="refreshAvatar">
          <el-icon><Refresh /></el-icon> 随机头像
        </div>
      </div>
      
      <el-form :model="form" ref="formRef">
        <el-form-item>
          <el-input 
            v-model="form.nickname" 
            placeholder="昵称"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input 
            v-model="form.email" 
            placeholder="邮箱 (可选)"
            :prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item>
          <el-input 
            v-model="form.website" 
            placeholder="网站 (可选)"
            :prefix-icon="Link"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleLogin" :loading="loading">
          登录 / 注册
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, User, Message, Link } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'login-success']);

const visible = ref(false);
const loading = ref(false);
const defaultAvatar = 'https://sdn.geekzu.org/avatar/d41d8cd98f00b204e9800998ecf8427e?d=retro';

const form = reactive({
  nickname: '',
  email: '',
  website: '',
  avatar: ''
});

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const refreshAvatar = () => {
  const randomId = Math.floor(Math.random() * 1000);
  form.avatar = `https://sdn.geekzu.org/avatar/${randomId}?d=retro`;
};

const handleLogin = () => {
  if (!form.nickname) {
    ElMessage.warning('请输入昵称');
    return;
  }
  
  loading.value = true;
  // 模拟登录请求
  setTimeout(() => {
    loading.value = false;
    const userInfo = {
      id: Date.now(),
      ...form,
      avatar: form.avatar || defaultAvatar
    };
    
    // 保存到本地
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('token', 'mock-token-' + Date.now());
    
    ElMessage.success('登录成功');
    emit('login-success', userInfo);
    visible.value = false;
  }, 800);
};

// 初始化随机头像
refreshAvatar();
</script>

<style lang="scss" scoped>
.login-form {
  padding: 10px 0;
}

.avatar-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  
  .refresh-avatar {
    margin-top: 10px;
    font-size: 12px;
    color: var(--themeBackground);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
