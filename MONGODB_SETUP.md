# 🗄️ MongoDB Atlas 永久存储设置指南

---

## 🎯 问题说明

**问题:** 部署到 Render 后，每次刷新页面进度都丢失  
**原因:** Render 的文件系统是临时的，重启后数据清空  
**解决:** 使用 MongoDB Atlas 免费云数据库永久保存学习进度

---

## ✅ 解决方案优势

| 特性 | 本地文件 | MongoDB Atlas |
|------|---------|---------------|
| **持久性** | ❌ 重启丢失 | ✅ 永久保存 |
| **多设备同步** | ❌ 只能一台设备 | ✅ 任意设备访问 |
| **可靠性** | ❌ 可能损坏 | ✅ 99.99% 可用性 |
| **成本** | ✅ 免费 | ✅ 免费 (M0 层) |
| **易用性** | ✅ 简单 | ⭐⭐⭐⭐ 稍复杂但值得 |

---

## 🚀 快速设置（10 分钟）

### 步骤 1: 注册 MongoDB Atlas

1. 访问 [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. 点击 **"Get Started for Free"** 或 **"Sign Up"**
3. 使用邮箱注册（或 GitHub/Google 登录）
4. 验证邮箱

---

### 步骤 2: 创建免费集群

1. 登录后点击 **"Build a Database"**
2. 选择 **M0 FREE** 层级（永久免费）
3. 配置:
   - **Project Name**: `JapaneseWordMemory` (可自定义)
   - **Cluster Name**: `Cluster0` (默认即可)
   - **Region**: 选最近的（如 Tokyo, Singapore）
   - **Storage**: 512 MB (默认)
4. 点击 **"Create Cluster"**

---

### 步骤 3: 设置访问权限

#### A) 创建数据库用户

1. 点击左侧 **"Database Access"**
2. 点击 **"Add New Database User"**
3. 填写:
   ```
   Authentication Method: Password
   Username: wordmemory_user
   Password: (自动生成或自定义强密码)
   Database User Privileges: Read and write to any database
   ```
4. 点击 **"Add User"**

#### B) 添加 IP 地址

1. 点击左侧 **"Network Access"**
2. 点击 **"Add IP Address"**
3. 选择 **"Allow Access from Anywhere"**:
   ```
   0.0.0.0/0
   ```
4. 点击 **"Confirm"**

---

### 步骤 4: 获取连接字符串

1. 点击左侧 **"Database"**
2. 点击你的集群旁边的 **"Connect"**
3. 选择 **"Connect your application"**
4. 复制连接字符串，格式如下:
   ```
   mongodb+srv://wordmemory_user:<password>@cluster0.xxxxx.mongodb.net/japanese-word-memory?retryWrites=true&w=majority
   ```
5. **替换 `<password>` 为实际密码**
6. **保存这个字符串！**

---

### 步骤 5: 配置 Render 环境变量

1. 回到 Render.com
2. 进入你的服务页面
3. 点击 **"Environment"** 标签
4. 添加环境变量:
   ```
   Key: MONGODB_URI
   Value: mongodb+srv://wordmemory_user:your_password@cluster0.xxxxx.mongodb.net/japanese-word-memory?retryWrites=true&w=majority
   ```
5. 点击 **"Save Changes"**
6. Render 会自动重启应用

---

### 步骤 6: 验证部署

1. 访问你的应用 URL
2. 开始学习单词
3. 标记几个单词为已掌握
4. **刷新页面** → 进度应该保留！✅
5. **关闭浏览器再打开** → 进度还在！✅

---

## 🔧 测试清单

- [ ] 创建 MongoDB Atlas 账号
- [ ] 创建免费集群 (M0)
- [ ] 设置数据库用户和密码
- [ ] 允许所有 IP 访问 (0.0.0.0/0)
- [ ] 复制连接字符串
- [ ] 在 Render 添加环境变量
- [ ] 重启应用
- [ ] 测试进度保存
- [ ] 测试跨设备访问

---

## 💡 常见问题

### Q1: MongoDB 免费版够用吗？

**答案:** 完全够用！

- **存储空间:** 512 MB
- **你的数据:** 8074 个单词 + 进度 = < 1 MB
- **性能:** 足够个人使用

### Q2: 如果忘记密码怎么办？

**解决方法:**
1. 登录 MongoDB Atlas
2. Database Access → Edit User
3. 重置密码
4. 更新 Render 环境变量

### Q3: 如何导出数据备份？

**方法 1: 应用内下载**
```
访问：https://your-app.onrender.com/download-progress
```

**方法 2: MongoDB 导出**
```bash
mongodump --uri="mongodb+srv://..." --out=/backup
```

### Q4: 可以换到其他数据库吗？

**当然!** 修改 `server.js` 第 8 行的 `MONGODB_URI` 即可。

---

## 📊 监控和扩展

### 查看使用情况

1. MongoDB Atlas Dashboard
2. Metrics → Storage / Operations
3. 免费版不会超额收费

### 需要更多资源？

升级到 M10 层 ($9/月):
- 2 GB 存储
- 更高性能
- 支持更多并发

---

## 🎉 完成！

配置成功后，你将拥有：

✅ **永久保存的学习进度**  
✅ **多设备同步访问**  
✅ **99.99% 数据可靠性**  
✅ **完全免费的成本**  

---

<div align="center">

# 🗄️ MongoDB Atlas 设置完成！

━━━━━━━━━━━━━━━━━━━━━━━

**你的日语学习进度现在永久保存了！**

🔐 安全加密  
☁️ 云端存储  
📱 随时随地访问

</div>
