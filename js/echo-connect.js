/**
 * 交互响应区域功能 - Echo Connect
 * 功能包括：微信弹窗、微信ID复制、打赏弹窗
 */
document.addEventListener('DOMContentLoaded', function() {
  // 微信连接按钮点击事件
  const wechatConnectBtn = document.getElementById('wechat-connect-btn');
  const wechatQrPopup = document.querySelector('.wechat-qr-popup');
  
  if (wechatConnectBtn && wechatQrPopup) {
    wechatConnectBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      wechatQrPopup.style.display = wechatQrPopup.style.display === 'flex' ? 'none' : 'flex';
    });
  }
  
  // 点击其他区域关闭微信二维码
  document.addEventListener('click', function(e) {
    if (wechatQrPopup && wechatQrPopup.style.display === 'flex') {
      if (!wechatQrPopup.contains(e.target) && e.target !== wechatConnectBtn) {
        wechatQrPopup.style.display = 'none';
      }
    }
  });
  
  // 复制微信ID功能
  const copyWechatIdBtn = document.getElementById('copy-wechat-id-btn');
  
  if (copyWechatIdBtn) {
    copyWechatIdBtn.addEventListener('click', function() {
      const wechatId = this.querySelector('span:first-child').textContent.split(': ')[1];
      
      // 创建临时输入框来复制文本
      const tempInput = document.createElement('input');
      tempInput.value = wechatId;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      // 显示复制成功提示
      const originalText = this.querySelector('.copy-tip').textContent;
      this.querySelector('.copy-tip').textContent = '复制成功!';
      
      // 2秒后恢复原始文本
      setTimeout(() => {
        this.querySelector('.copy-tip').textContent = originalText;
      }, 2000);
    });
  }
  
  // 支持按钮点击事件
  const supportBtn = document.getElementById('support-btn');
  const supportModal = document.getElementById('support-modal');
  const closeButton = supportModal?.querySelector('.close-button');
  
  if (supportBtn && supportModal) {
    supportBtn.addEventListener('click', function() {
      supportModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
    
    // 关闭按钮点击事件
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        supportModal.classList.remove('active');
        document.body.style.overflow = ''; // 恢复滚动
      });
    }
    
    // 点击模态框外部区域关闭
    supportModal.addEventListener('click', function(e) {
      if (e.target === supportModal) {
        supportModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && supportModal.classList.contains('active')) {
        supportModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});
