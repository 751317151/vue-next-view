/**
 * 代码高亮增强工具
 * 为代码块添加复制按钮和语言标签
 */

export const enhanceCodeBlocks = () => {
  // 延迟执行，确保 DOM 已渲染
  setTimeout(() => {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement;
      if (!pre || pre.querySelector('.code-copy-btn')) return;
      
      // 添加包装容器
      pre.style.position = 'relative';
      
      // 获取语言类型
      const langClass = codeBlock.className.match(/language-(\w+)/);
      const language = langClass ? langClass[1] : 'code';
      
      // 创建头部工具栏
      const toolbar = document.createElement('div');
      toolbar.className = 'code-toolbar';
      toolbar.innerHTML = `
        <span class="code-lang">${language}</span>
        <button class="code-copy-btn" title="复制代码">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>复制</span>
        </button>
      `;
      
      pre.insertBefore(toolbar, codeBlock);
      
      // 添加复制功能
      const copyBtn = toolbar.querySelector('.code-copy-btn');
      copyBtn?.addEventListener('click', async () => {
        const code = codeBlock.textContent || '';
        
        try {
          await navigator.clipboard.writeText(code);
          
          // 显示成功状态
          copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>已复制</span>
          `;
          copyBtn.classList.add('copied');
          
          // 恢复原状
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>复制</span>
            `;
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('复制失败:', err);
        }
      });
    });
  }, 100);
};

export default enhanceCodeBlocks;
