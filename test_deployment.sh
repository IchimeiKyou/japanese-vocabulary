#!/bin/bash

echo "🔬 日语单词记忆应用 - 部署前测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_passed=0
test_failed=0

# 测试 1: Node.js 安装检查
echo ""
echo "📌 测试 1: Node.js 环境"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ PASS${NC} - Node.js 已安装: $(node --version)"
    ((test_passed++))
else
    echo -e "${RED}❌ FAIL${NC} - Node.js 未安装，请先安装 Node.js 16+"
    ((test_failed++))
    exit 1
fi

# 测试 2: MongoDB 依赖检查
echo ""
echo "📌 测试 2: npm 依赖"
cd /Users/kyou/code/AgentConstruction_v2/workspace

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ PASS${NC} - package.json 存在"
    ((test_passed++))
    
    # 检查 mongodb 依赖
    if grep -q '"mongodb"' package.json; then
        echo -e "${GREEN}✅ PASS${NC} - mongodb 依赖已配置"
        ((test_passed++))
    else
        echo -e "${RED}❌ FAIL${NC} - package.json 缺少 mongodb 依赖"
        ((test_failed++))
    fi
else
    echo -e "${RED}❌ FAIL${NC} - package.json 不存在"
    ((test_failed++))
fi

# 测试 3: 文件完整性检查
echo ""
echo "📌 测试 3: 核心文件"
files=("index.html" "server.js" "word_data.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        echo -e "${GREEN}✅ PASS${NC} - $file ($size bytes)"
        ((test_passed++))
    else
        echo -e "${RED}❌ FAIL${NC} - $file 不存在"
        ((test_failed++))
    fi
done

# 测试 4: server.js MongoDB 配置
echo ""
echo "📌 测试 4: MongoDB 配置"
if grep -q "MONGODB_URI" server.js; then
    echo -e "${GREEN}✅ PASS${NC} - MongoDB URI 变量已定义"
    ((test_passed++))
else
    echo -e "${YELLOW}⚠️ WARN${NC} - 未发现 MONGODB_URI 配置"
fi

if grep -q "connectMongoDB" server.js; then
    echo -e "${GREEN}✅ PASS${NC} - MongoDB 连接函数已实现"
    ((test_passed++))
else
    echo -e "${RED}❌ FAIL${NC} - connectMongoDB 函数缺失"
    ((test_failed++))
fi

# 测试 5: 环境变量检查
echo ""
echo "📌 测试 5: 环境变量"
if [ -n "$MONGODB_URI" ]; then
    echo -e "${GREEN}✅ PASS${NC} - MONGODB_URI 环境变量已设置"
    echo "   值：${MONGODB_URI:0:30}..."
    ((test_passed++))
else
    echo -e "${YELLOW}⚠️ WARN${NC} - MONGODB_URI 未设置"
    echo "   将使用本地文件存储（重启后数据会丢失）"
fi

# 测试 6: Git 仓库检查
echo ""
echo "📌 测试 6: Git 仓库"
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Git 仓库已初始化"
    ((test_passed++))
    
    # 检查远程仓库
    remote=$(git remote get-url origin 2>/dev/null)
    if [ ! -z "$remote" ]; then
        echo -e "${GREEN}✅ PASS${NC} - 远程仓库已配置"
        echo "   URL: $remote"
        ((test_passed++))
    else
        echo -e "${YELLOW}⚠️ WARN${NC} - 远程仓库未配置"
        echo "   执行：git remote add origin https://github.com/YOUR_USER/japanese-word-memory.git"
    fi
else
    echo -e "${YELLOW}⚠️ INFO${NC} - Git 仓库未初始化"
    echo "   执行：git init && git add . && git commit -m 'Initial commit'"
fi

# 测试 7: start.sh 脚本
echo ""
echo "📌 测试 7: 启动脚本"
if [ -f "start.sh" ]; then
    chmod +x start.sh
    echo -e "${GREEN}✅ PASS${NC} - start.sh 可执行"
    ((test_passed++))
else
    echo -e "${YELLOW}⚠️ INFO${NC} - start.sh 不存在，将使用 node server.js 直接启动"
fi

# 总结
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 测试结果汇总"
echo "━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "✅ 通过：${GREEN}$test_passed${NC}"
echo -e "❌ 失败：${RED}$test_failed${NC}"
echo -e "⚠️ 警告：${YELLOW}$(echo $test_passed + $test_failed | bc)$NC (非阻塞性)"

if [ $test_failed -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 所有关键测试通过！${NC}"
    echo ""
    echo "🚀 下一步:"
    echo "   1. 访问 MONGODB_SETUP.md 配置 MongoDB Atlas"
    echo "   2. 访问 DEPLOYMENT.md 部署到 Render.com"
    echo "   3. 运行：./start.sh"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  存在失败项，请修复后再继续${NC}"
    exit 1
fi
