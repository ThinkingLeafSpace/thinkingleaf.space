# Folo RSS 源认证指南

## 什么是 Folo 认证？

Folo 认证可以让你的 RSS 源成为"可信源头"，防止他人恶意认领你的内容，确保内容安全。

## 认证步骤

### 第一步：在 Folo 中订阅你的 RSS 源

1. 打开 Folo 应用
2. 点击左上角的"+"号，选择"添加订阅源"
3. 输入你的 RSS 链接：`https://thinkingleaf.space/rss.xml`
4. 完成订阅

### 第二步：申请认证

1. 在 Folo 的订阅列表中，找到刚订阅的 RSS 源
2. **右键点击**该订阅源名称，选择 **"Claim"（认领/认证）** 选项
3. 系统会生成一段独特的认证码，格式类似：

```
This message is used to verify that this feed (feedId:00000000000000000) belongs to me (userId:00000000000000000). Join me in enjoying the next generation information browser https://follow.is.
```

其中，`feedId` 和 `userId` 是系统分配的专属标识。

### 第三步：在网站上发布认证码

1. 创建一个新的博客文章（可以使用模板 `blogs/2025-XX-XX-folo-verification.html`）
2. 在文章正文中，**完整粘贴**上述认证码文本
3. 发布文章，确保该文章可以通过公开链接访问
4. **重要**：确保这篇文章会被包含在你的 RSS feed 中（通常需要更新 RSS 文件）

### 第四步：完成认证

1. 返回 Folo 平台
2. 再次找到你的订阅源，右键点击并选择 **"Claim"** 选项
3. 系统会自动检测你的博客中是否存在匹配的认证码
4. 若检测通过，订阅源认证即完成 ✅

## 认证后的注意事项

- 认证成功后，你可以选择保留或删除含认证码的文章
- 建议保留认证文章，作为认证记录
- 认证可以防止他人恶意认领你的内容

## 常见问题

### Q: 认证码检测失败怎么办？
- 确保认证码文章已发布且可公开访问
- 确保文章内容完全匹配（包括标点符号和空格）
- 等待几分钟后重试（RSS 更新可能需要时间）

### Q: 如何更新 RSS 文件以包含认证文章？
- 运行 `scripts/update_blogs_pages.py` 脚本更新博客列表
- 或者手动编辑 `rss.xml` 文件，添加新的认证文章条目

### Q: 认证后可以删除认证文章吗？
- 可以，但建议保留作为认证记录
- 如果删除，认证状态不会受影响

## 参考链接

- Folo 官网：https://follow.is
- RSS 源地址：https://thinkingleaf.space/rss.xml

