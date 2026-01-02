import { defineStore } from 'pinia';
import { ref } from 'vue';

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
        const localUser = localStorage.getItem('userInfo');
        const localToken = localStorage.getItem('token');

        if (localUser && localToken) {
            userInfo.value = JSON.parse(localUser);
            token.value = localToken;
            isLogin.value = true;
        }
    };

    // 登录
    const login = (user: UserInfo) => {
        userInfo.value = user;
        token.value = 'mock-token-' + Date.now();
        isLogin.value = true;

        localStorage.setItem('userInfo', JSON.stringify(user));
        localStorage.setItem('token', token.value);
    };

    // 退出
    const logout = () => {
        userInfo.value = null;
        token.value = null;
        isLogin.value = false;

        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
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
