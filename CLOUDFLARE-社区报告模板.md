# 🚨 Cloudflare Pages 社区问题报告模板

## 📋 如何获取所需信息

### 1. 获取 Deployment ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入你的 Pages 项目
3. 点击 **Deployments** 标签页
4. 找到失败的部署（commit 80bb4b6）
5. 点击该部署进入详情页
6. 查看浏览器地址栏，URL 格式类似：
   ```
   https://dash.cloudflare.com/.../pages/view/your-project/deployments/3efaa1e7-f579-43dd-a8fa-629b9d472ba6
   ```
7. 复制 URL 中的 UUID 部分（`3efaa1e7-f579-43dd-a8fa-629b9d472ba6`）

### 2. 获取完整部署日志

1. 在失败的部署详情页中
2. 找到 **Build logs** 或 **Deployment logs** 部分
3. 点击 **"Show full logs"** 或 **"Expand all"** 按钮
4. 复制从 `Cloning...` 开始到 `Failed` 结束的所有日志内容
5. 确保包含所有步骤：
   - Cloning repository...
   - Installing dependencies (如果有)
   - Building...
   - Validating asset output directory...
   - 错误信息

---

## 📝 完整问题报告（复制以下内容到 Cloudflare 社区）

```
🚨 Urgent: Pure static HTML site failing at Validating asset output directory with internal error (2025-11-21)

Hey Pages team! My pure static site (no build, no functions) deploys fine locally but fails consistently on Cloudflare. Repo: https://github.com/ThinkingLeafSpace/thinkingleaf.space (public if needed).

Config: Framework None, Build cmd empty, Output '.', Root '/'.

Tried: Multiple retries, output dir switches (/ vs .), new commits, revert images (still shows M images/exhibit-*.jpg in logs), no wrangler.toml/functions.

Latest log (commit 80bb4b6):

[paste full log here: from Cloning... to Failed]

Deployment ID: [从 Deployments 页 URL 抓 UUID, e.g. 3efaa1e7-f579-43dd-a8fa-629b9d472ba6 – 点失败部署，浏览器地址栏看]

Similar to these threads: https://community.cloudflare.com/t/failing-deploying-to-cloudflares-global-network-step/648465 & https://community.cloudflare.com/t/cloudflare-pages-failed-an-internal-error-occurred/334596

Any backend hiccup or quick fix (e.g. cache purge, legacy build)? Thanks! @WalshyMVP or mods?
```

---

## 📝 格式化后的报告（推荐使用这个版本）

```
🚨 Urgent: Pure static HTML site failing at "Validating asset output directory" with internal error (2025-11-21)

Hey Pages team! 

My pure static site (no build, no functions) deploys fine locally but fails consistently on Cloudflare. 

**Repo:** https://github.com/ThinkingLeafSpace/thinkingleaf.space (public if needed)

**Config:**
- Framework preset: None
- Build command: (empty)
- Build output directory: `.`
- Root directory: `/`

**What I've tried:**
- Multiple retries
- Output directory switches (`/` vs `.`)
- New commits
- Reverted images (still shows `M images/exhibit-*.jpg` in logs)
- No `wrangler.toml` or `functions/` directory

**Latest log (commit 80bb4b6):**

```
[在这里粘贴完整的部署日志，从 Cloning... 开始到 Failed 结束]
```

**Deployment ID:** `[在这里粘贴 Deployment ID，例如：3efaa1e7-f579-43dd-a8fa-629b9d472ba6]`

**Similar issues:**
- https://community.cloudflare.com/t/failing-deploying-to-cloudflares-global-network-step/648465
- https://community.cloudflare.com/t/cloudflare-pages-failed-an-internal-error-occurred/334596

Any backend hiccup or quick fix (e.g. cache purge, legacy build)? Thanks! @WalshyMVP or mods?
```

---

## 💡 提示

1. **日志格式**：粘贴日志时使用代码块格式（三个反引号），保持原始格式
2. **Deployment ID**：确保复制完整的 UUID（36 个字符，包含连字符）
3. **时间戳**：如果日志中有时间戳，一并包含
4. **错误信息**：特别关注 "Internal error" 前后的上下文信息

## 🔗 相关链接

- [Cloudflare Pages 社区论坛](https://community.cloudflare.com/c/developers/pages/60)
- [Cloudflare Discord #pages 频道](https://discord.gg/cloudflaredev)
- [Cloudflare Support](https://dash.cloudflare.com/?to=/:account/support)

