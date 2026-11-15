import { defineStore } from 'pinia';
import { ref } from 'vue';
import { storage } from '@/utils/storage';

interface UserInfo {
    id: number;
    nickname: string;
    email: string;
    website: string;
    avatar: string;
}

export const useUserStore = defineStore('user', () => {
    const userInfo = ref<UserInfo | null>(null);
    const token = ref<string | null>(null);
    const isLogin = ref(false);

    // 初始化
    const init = () => {
        const localUser = storage.get('userInfo');
        const localToken = storage.get('token');

        if (localUser && localToken) {
            try {
                userInfo.value = JSON.parse(localUser) as UserInfo;
                token.value = localToken;
                isLogin.value = true;
            } catch {
                logout();
            }
        }
    };

    // 登录
    const login = (user: UserInfo) => {
        const nextToken = 'mock-token-' + Date.now();
        userInfo.value = user;
        token.value = nextToken;
        isLogin.value = true;

        storage.set('userInfo', JSON.stringify(user));
        storage.set('token', nextToken);
    };

    // 退出
    const logout = () => {
        userInfo.value = null;
        token.value = null;
        isLogin.value = false;

        storage.remove('userInfo');
        storage.remove('token');
    };

    return {
        userInfo,
        token,
        isLogin,
        init,
        login,
        logout
    };
});
