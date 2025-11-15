# 🔧 启用 GitHub Actions 步骤

## 📋 问题

看到错误信息：
- "Actions is currently unavailable for your repository"
- "GitHub Actions is disabled for this repo"

## ✅ 解决方案：启用 GitHub Actions

### 步骤1：访问 Actions 设置页面

访问：https://github.com/ThinkingLeafSpace/thinkingleaf.space/settings/actions

### 步骤2：启用 Actions

在 "Actions permissions" 部分，选择以下选项之一：

#### 选项A：允许所有 Actions（推荐）
- 选择：`Allow all actions and reusable workflows`
- 这会启用所有 Actions

#### 选项B：仅允许本地 Actions
- 选择：`Allow local actions and reusable workflows`
- 只允许仓库内的 Actions

### 步骤3：保存设置

- 滚动到页面底部
- 点击 `Save` 按钮

### 步骤4：返回 Pages 设置

1. 访问：https://github.com/ThinkingLeafSpace/thinkingleaf.space/settings/pages
2. 刷新页面
3. Source 下拉菜单应该可以选择了
4. 选择 "GitHub Actions"
5. 点击 `Save`

---

## 🔍 详细操作步骤

### 方法1：通过仓库设置启用

1. **访问仓库设置**
   ```
   https://github.com/ThinkingLeafSpace/thinkingleaf.space/settings
   ```

2. **点击左侧 "Actions"**
   - 在 "Code and automation" 部分下

3. **找到 "Actions permissions" 部分**

4. **选择权限**
   - `Allow all actions and reusable workflows`（推荐）
   - 或 `Allow local actions and reusable workflows`

5. **点击 Save**

### 方法2：直接访问 Actions 设置

访问：https://github.com/ThinkingLeafSpace/thinkingleaf.space/settings/actions

**操作：**
- 选择 "Allow all actions and reusable workflows"
- 点击 Save

---

## 📝 操作步骤总结

1. ✅ **访问 Actions 设置页面**
   ```
   https://github.com/ThinkingLeafSpace/thinkingleaf.space/settings/actions
   ```

2. ✅ **选择 "Allow all actions and reusable workflows"**

3. ✅ **点击 Save**

4. ✅ **返回 Pages 设置页面**
   ```
   https://github.com/ThinkingLeafSpace/thinkingleaf.space/settings/pages
   ```

5. ✅ **将 Source 改为 "GitHub Actions"**

6. ✅ **点击 Save**

7. ✅ **访问 Actions 页面查看运行状态**
   ```
   https://github.com/ThinkingLeafSpace/thinkingleaf.space/actions
   ```

---

## 🎯 当前状态

- ✅ 工作流文件已创建（`.github/workflows/pages.yml`）
- ⏳ 需要启用 Actions 权限
- ⏳ 然后在 Pages 设置中选择 "GitHub Actions"

---

## 💡 重要提示

**启用 Actions 后：**
- 每次推送到 `master` 分支会自动触发部署
- 可以在 Actions 页面查看部署状态
- 部署速度通常更快

**请按照步骤操作，启用 Actions 后告诉我结果！** 🚀

