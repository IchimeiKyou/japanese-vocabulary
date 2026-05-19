# 🚀 Render.com 部署完整指南

---

## 📋 目录

1. [前置准备](#前置准备)
2. [GitHub 仓库设置](#github-仓库设置)
3. [Render 部署步骤](#render-部署步骤)
4. [MongoDB Atlas 配置](#mongodb-atlas-配置)
5. [环境变量配置](#环境变量配置)
6. [测试验证](#测试验证)

---

## ✅ 前置准备

### 必需账号
- [ ] GitHub 账号
- [ ] Render 账号 ([https://render.com](https://render.com))
- [ ] MongoDB Atlas 账号

### 项目文件清单
确保以下文件已上传到 GitHub:
```
/workspace/
├── index.html              ✅ 主页面
├── server.js               ✅ Node.js 服务器 (含 MongoDB)
├── package.json            ✅ npm 配置
├── word_data.json          ✅ 8,074 个单词数据
├── .gitignore              ✅ Git 忽略规则
└── README.md               ✅ 说明文档
```

---

## 1️⃣ GitHub 仓库设置

### 步骤 1: 初始化 Git 仓库

```bash
cd /Users/kyou/code/AgentConstruction_v2/workspace

# 检查是否已有 git
git status

# 如果是新项目，初始化
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit - Japanese Word Memory App"

# 创建远程仓库（在 GitHub 上）
# 访问 https://github.com/new
# Repository name: japanese-word-memory
# Visibility: Private (可选)
# Do NOT initialize with README
```

### 步骤 2: 关联远程仓库

```bash
# 替换为你的用户名和仓库名
git remote add origin https://github.com/YOUR_USERNAME/japanese-word-memory.git

# 推送代码
git branch -M main
git push -u origin main
```

### 步骤 3: 验证推送

访问 `https://github.com/YOUR_USERNAME/japanese-word-memory`  
应该看到所有文件已上传！✅

---

## 2️⃣ Render 部署步骤

### 步骤 1: 登录 Render

1. 访问 [https://render.com](https://render.com)
2. 使用 GitHub 账号登录
3. 完成邮箱验证

### 步骤 2: 创建 Web Service

1. 点击 **"New"** → **"Web Service"**
2. 选择你的 GitHub 仓库
3. 配置选项:

| 配置项 | 值 |
|--------|-----|
| **Name** | `japanese-word-memory` |
| **Region** | Singapore (最近) |
| **Branch** | `main` |
| **Root Directory** | (留空) |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

4. 点击 **"Advanced"** → **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority
   PORT=9999
   ```
5. 点击 **"Create Web Service"**

### 步骤 3: 等待部署

- Build time: ~2-5 分钟
- 进度条显示构建状态
- 完成后显示 URL: `https://japanese-word-memory.onrender.com`

---

## 3️⃣ MongoDB Atlas 配置

### 快速设置（参考 MONGODB_SETUP.md）

#### A) 创建集群

1. 访问 [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign Up → Create Cluster (M0 FREE)
3. 等待 3-5 分钟创建

#### B) 设置用户

1. Database Access → Add New User
2. Username: `wordmemory_user`
3. Password: (自动生成并保存)
4. Privileges: Read and write to any database

#### C) 允许 IP

1. Network Access → Add IP Address
2. Allow from anywhere: `0.0.0.0/0`

#### D) 获取连接字符串

1. Database → Connect → Connect your application
2. 复制连接字符串
3. 替换 `<password>` 为实际密码

**格式:**
```
mongodb+srv://wordmemory_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/japanese-word-memory?retryWrites=true&w=majority
```

---

## 4️⃣ 环境变量配置

### 在 Render Dashboard 添加

1. 进入服务页面
2. 点击 **"Environment"** 标签
3. 点击 **"Add Environment Variable"**

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://...` (完整连接串) |
| `PORT` | `9999` |

4. 点击 **"Save Changes"**
5. Render 会自动重启应用

---

## 5️⃣ 测试验证

### 本地测试（部署前）

```bash
# 确保安装了 mongodb 依赖
cd /Users/kyou/code/AgentConstruction_v2/workspace
npm install

# 启动本地服务器
node server.js
# 访问 http://localhost:9999
```

### 部署后测试

1. 访问你的 Render URL
2. 学习几个单词
3. 标记为已掌握
4. **刷新页面** → 进度保留？✅
5. **关闭浏览器再打开** → 进度还在？✅

---

## 🔧 故障排除

### 问题 1: Build Failed

**症状:** Build 失败，错误信息

**解决:**
```bash
# 检查 package.json 是否正确
cat package.json

# 查看 Render logs
Dashboard → Logs
```

### 问题 2: MongoDB 连接失败

**症状:** 日志显示 "MongoDB 连接失败"

**解决:**
1. 检查 `MONGODB_URI` 是否正确
2. 确认 MongoDB Atlas 的 IP 白名单包含 `0.0.0.0/0`
3. 尝试在本地测试连接

### 问题 3: 404 Not Found

**症状:** 访问首页显示 404

**解决:**
1. 检查 `index.html` 是否存在于仓库根目录
2. 检查 Root Directory 配置
3. 查看 Build logs 确认文件已上传

---

## 📊 性能监控

### Render Dashboard

- **Usage:** CPU / Memory / Bandwidth
- **Logs:** 实时日志输出
- **Settings:** 修改配置

### MongoDB Atlas Dashboard

- **Metrics:** Operations / Storage
- **Database:** Collections / Documents
- **Network Access:** IP 白名单管理

---

## 💰 成本估算

| 项目 | 费用 | 说明 |
|------|------|------|
| Render Web Service | $0 | 免费层 (750 小时/月) |
| MongoDB Atlas M0 | $0 | 永久免费 (512MB) |
| **总计** | **$0/月** | 个人完全够用！ |

---

## 🎉 完成！

恭喜！你现在拥有：

✅ **云端部署的应用**  
✅ **永久保存的学习进度**  
✅ **多设备同步访问**  
✅ **完全免费的成本**  

---

<div align="center">

# 🌸 日语单词记忆大师 - 正式上线！

━━━━━━━━━━━━━━━━━━━━━━━

**🚀 立即访问:** https://your-app.onrender.com  
**📱 支持手机、平板、电脑**  
**🔐 数据安全加密存储**

</div>
