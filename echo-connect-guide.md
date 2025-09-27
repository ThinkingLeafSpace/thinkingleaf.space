# 连接与支持功能使用指南

## 概述

本文档说明如何在筑居思博客中使用"连接与支持"功能模块。这个模块包含两个主要功能：
1. 微信连接 - 允许读者通过微信与你建立联系
2. 支持打赏 - 允许读者通过微信支付或支付宝支持你的创作

## 如何使用

### 步骤1：引入必要文件

在你的博客文章HTML头部添加以下引用：
```html
<link rel="stylesheet" href="../css/echo-connect.css">
<script src="../js/echo-connect.js" defer></script>
```

### 步骤2：替换二维码图片

在模块中有三个需要替换的二维码图片：
1. 微信个人二维码 - 用于读者添加你为好友
2. 微信支付二维码 - 用于支持打赏
3. 支付宝二维码 - 用于支持打赏

请将这些图片放置在以下位置：
- 微信个人二维码：`/images/qrcode/wechat-personal-qr.png`
- 微信支付二维码：`/images/qrcode/wechat-pay-qr.png`
- 支付宝二维码：`/images/qrcode/alipay-qr.png`

然后修改HTML中的图片路径：

```html
<!-- 微信个人二维码 -->
<img src="../images/qrcode/wechat-personal-qr.png" alt="我的微信二维码">

<!-- 在支持模态框中 -->
<div class="qr-code-item">
  <img src="../images/qrcode/wechat-pay-qr.png" alt="微信支付">
  <p>微信支付</p>
</div>
<div class="qr-code-item">
  <img src="../images/qrcode/alipay-qr.png" alt="支付宝">
  <p>支付宝</p>
</div>
```

### 步骤3：更新你的微信ID

在HTML中修改你的微信ID：
```html
<div class="copy-wechat-id" id="copy-wechat-id-btn">
  <span>微信号: ColorfulALQian</span> <!-- 修改这里的微信号 -->
  <span class="copy-tip">点击复制</span>
</div>
```

### 步骤4：添加到博客文章

将以下HTML代码插入到你的博客文章内容的底部：

```html
<!-- 连接与支持区块 -->
<div class="echo-area">
  <p class="echo-text">
    如果这篇文章让你有所思考，或者我们恰好在世界的某一处产生了共鸣，欢迎通过下面的方式与我建立更深的连接。思想的火花，值得被温柔对待。
  </p>
  
  <div class="echo-buttons">
    <div class="echo-button-wrapper">
      <button class="echo-button" id="wechat-connect-btn">与我连接</button>
      
      <div class="wechat-qr-popup">
        <img src="../images/qrcode/wechat-personal-qr.png" alt="我的微信二维码">
        <span class="popup-main-text">扫码加我，期待与你思想碰撞</span>
        <div class="copy-wechat-id" id="copy-wechat-id-btn">
          <span>微信号: ColorfulALQian</span>
          <span class="copy-tip">点击复制</span>
        </div>
      </div>
    </div>
    
    <div class="echo-button-wrapper">
      <button class="echo-button" id="support-btn">为思考发电</button>
    </div>
  </div>
</div>
```

同时，还需要在页面底部（在body闭合标签之前）添加模态框HTML：

```html
<!-- 支持模态框 -->
<div id="support-modal" class="modal-overlay">
  <div class="modal-content">
    <button class="close-button">&times;</button>
    <h2>感谢你，同行者</h2>
    
    <div class="qr-codes">
      <div class="qr-code-item">
        <img src="../images/qrcode/wechat-pay-qr.png" alt="微信支付">
        <p>微信支付</p>
      </div>
      <div class="qr-code-item">
        <img src="../images/qrcode/alipay-qr.png" alt="支付宝">
        <p>支付宝</p>
      </div>
    </div>
    
    <p class="modal-footer-text">每一份支持，都是吹向思想之帆的风</p>
  </div>
</div>
```

## 自定义

你可以根据需要修改以下内容：
- 文本内容 - 可以修改连接区域的主要文字和按钮文字
- 按钮颜色 - 通过修改CSS变量来改变按钮颜色
- 弹窗样式 - 可以在CSS中调整弹窗的外观

## 功能说明

1. **与我连接按钮**：点击后显示你的微信二维码和微信号
2. **微信号复制**：用户可以点击复制你的微信号
3. **为思考发电按钮**：点击后显示支付二维码模态框
4. **关闭模态框**：可以通过点击关闭按钮、点击模态框外部区域或按ESC键关闭
5. **主题适配**：自动适配网站的明暗主题切换

## 测试方法

实现后，请确认以下功能正常工作：
- 点击"与我连接"按钮，确认微信二维码弹出
- 点击微信ID区域，确认可以复制微信号
- 点击"为思考发电"按钮，确认支付模态框弹出
- 测试关闭模态框的各种方式
- 测试在不同屏幕尺寸下的显示效果
- 测试在深色模式下的显示效果
