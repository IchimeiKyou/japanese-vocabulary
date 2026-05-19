#!/bin/bash

echo "🌸 日语单词记忆大师 - 本地启动"
echo "━━━━━━━━━━━━━━━━━━━━━━━"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+"
    exit 1
fi

echo "✅ Node.js 已安装: $(node --version)"

# 检查 MongoDB 环境变量
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  未设置 MONGODB_URI 环境变量"
    echo "   将使用本地文件存储（重启后数据会丢失）"
    echo ""
    echo "💡 建议配置 MongoDB Atlas 永久保存进度"
    echo "   查看文档：cat MONGODB_SETUP.md"
else
    echo "✅ MongoDB URI 已配置"
    echo "   学习进度将永久保存在云端"
fi

echo ""
echo "🚀 启动服务器..."
echo "━━━━━━━━━━━━━━━━━━━━━━━"

# 启动服务器
node server.js
