const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { MongoClient, ObjectId } = require('mongodb');

// 配置
const PORT = process.env.PORT || 9998;
const WORDS_FILE = path.join(__dirname, 'word_data.json');

// MongoDB 配置 ⭐ 替换本地文件
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/japanese-word-memory?retryWrites=true&w=majority';
const DB_NAME = 'japanese-word-memory';
const COLLECTION_NAME = 'user-progress';

let db = null;
let progressCollection = null;

// 连接 MongoDB
async function connectMongoDB() {
    try {
        console.log('🔄 正在连接 MongoDB...');
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ MongoDB 连接成功！');
        db = client.db(DB_NAME);
        progressCollection = db.collection(COLLECTION_NAME);
        
        // 创建索引
        await progressCollection.createIndex({ userId: 1 }, { unique: true });
        console.log('📑 索引已创建');
        
        return true;
    } catch (error) {
        console.error('❌ MongoDB 连接失败:', error.message);
        console.log('⚠️  将使用本地文件存储（数据不会持久化）');
        return false;
    }
}

// 移除限流控制（API 余额充足）
// const rateLimit = new Map();
// function checkRateLimit(ip) {
//     const now = Date.now();
//     const clientCalls = rateLimit.get(ip) || [];
//     const recentCalls = clientCalls.filter(t => now - t < 3600000);
//     
//     if (recentCalls.length >= 10) {
//         return false;
//     }
//     
//     recentCalls.push(now);
//     rateLimit.set(ip, recentCalls);
//     return true;
// }

// 加载用户进度 - 从 MongoDB 读取
function loadProgress() {
    if (progressCollection) {
        // 使用默认用户 ID "default"
        return new Promise((resolve) => {
            progressCollection.findOne({ userId: 'default' })
                .then(doc => {
                    if (doc) {
                        resolve({
                            mastered: doc.mastered || [],
                            unmastered: doc.unmastered || [],
                            reviewQueue: doc.reviewQueue || [],
                            totalLearned: doc.totalLearned || 0,
                            lastUpdated: doc.lastUpdated
                        });
                    } else {
                        resolve(getEmptyProgress());
                    }
                })
                .catch(err => {
                    console.error('❌ 读取进度失败:', err.message);
                    resolve(getEmptyProgress());
                });
        });
    } else {
        // Fallback to local file
        return loadProgressFromFile();
    }
}

// 保存用户进度 - 写入 MongoDB
function saveProgress(progress) {
    if (progressCollection) {
        return new Promise((resolve) => {
            progress.lastUpdated = new Date().toISOString();
            
            progressCollection.updateOne(
                { userId: 'default' },
                { 
                    $set: {
                        userId: 'default',
                        mastered: progress.mastered || [],
                        unmastered: progress.unmastered || [],
                        reviewQueue: progress.reviewQueue || [],
                        totalLearned: progress.totalLearned || 0,
                        lastUpdated: progress.lastUpdated
                    }
                },
                { upsert: true }
            )
            .then(result => {
                console.log(`✅ 进度已保存到 MongoDB (${result.modifiedCount} 个文档)`);
                resolve(true);
            })
            .catch(error => {
                console.error('❌ 保存进度失败:', error.message);
                resolve(false);
            });
        });
    } else {
        // Fallback to local file
        return saveProgressToFile(progress);
    }
}

// 本地文件备份（降级方案）
function loadProgressFromFile() {
    try {
        const DATA_FILE = path.join(__dirname, 'user_progress.json');
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('❌ 读取进度文件失败:', error.message);
    }
    return getEmptyProgress();
}

function saveProgressToFile(progress) {
    try {
        progress.lastUpdated = new Date().toISOString();
        const DATA_FILE = path.join(__dirname, 'user_progress.json');
        fs.writeFileSync(DATA_FILE, JSON.stringify(progress, null, 2), 'utf8');
        console.log(`⚠️  进度已保存到本地文件 ${DATA_FILE} (临时存储)`);
        return true;
    } catch (error) {
        console.error('❌ 保存进度文件失败:', error.message);
        return false;
    }
}

function getEmptyProgress() {
    return {
        mastered: [],
        unmastered: [],
        reviewQueue: [],
        totalLearned: 0,
        lastUpdated: new Date().toISOString()
    };
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // API 端点
    if (req.url === '/api/progress' && req.method === 'GET') {
        const progress = await loadProgress();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(progress));
        return;
    }
    
    if (req.url === '/api/progress' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const progress = JSON.parse(body);
                saveProgress(progress).then(success => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success }));
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }
    
    // 下载进度文件
    if (req.url === '/download-progress') {
        const progress = await loadProgress();
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="my_word_progress.json"'
        });
        res.end(JSON.stringify(progress, null, 2));
        return;
    }
    
    // AI 查询接口
    if (req.url === '/api/ai-query' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { word } = JSON.parse(body);
                
                // IP 获取（简单实现）
                const clientIP = req.socket.remoteAddress || 'unknown';
                
                // 移除限流检查（API 余额充足）
                // if (!checkRateLimit(clientIP)) {
                //     res.writeHead(429, { 'Content-Type': 'application/json' });
                //     res.end(JSON.stringify({ 
                //         success: false, 
                //         error: '请求过于频繁，请稍后再试（每小时最多 10 次）' 
                //     }));
                //     return;
                // }
                
                // 生成简化 Prompt
                const prompt = '请解释日语单词"' + word.japanese + '"' + 
                               (word.reading ? ' (' + word.reading + ')' : '') + 
                               '，中文含义是' + word.chinese + '.';

                // 调用 DeepSeek API
                const aiResponse = await callDeepSeekAPI(prompt);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, answer: aiResponse }));
                
            } catch (error) {
                console.error('AI 查询失败:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: error.message 
                }));
            }
        });
        return;
    }
    
    // 服务静态文件
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    const extname = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    
    const contentType = contentTypes[extname] || 'text/plain';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// DeepSeek API 调用函数
function callDeepSeekAPI(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: 'deepseek-v4-flash',
            messages: [
                {
                    role: 'system',
                    content: '你是一位专业的日语教学助手，擅长用中文讲解日语单词的详细用法。请严格按照指定格式回复。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000  // 增加到 2000，确保内容完整
        });
        
        const options = {
            hostname: 'api.deepseek.com',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer sk-fce56a180a1240e7b2630d468f5beccd`,
                'Content-Length': Buffer.byteLength(data, 'utf8')
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => { responseData += chunk; });
            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) {
                        let errorMessage = `API 请求失败，状态码：${res.statusCode}`;
                        try {
                            const errorData = JSON.parse(responseData);
                            if (errorData.error && errorData.error.message) {
                                errorMessage += ` - ${errorData.error.message}`;
                            }
                        } catch (e) {}
                        reject(new Error(errorMessage));
                        return;
                    }
                    
                    const response = JSON.parse(responseData);
                    if (response.choices && response.choices[0]) {
                        resolve(response.choices[0].message.content);
                    } else {
                        reject(new Error('API 返回数据格式错误'));
                    }
                } catch (error) {
                    reject(new Error(`解析 API 响应失败：${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`网络连接失败：${error.message}`));
        });

        req.write(data);
        req.end();
    });
}

// 启动服务器
async function startServer() {
    // 尝试连接 MongoDB
    const mongoConnected = await connectMongoDB();
    
    server.listen(PORT, () => {
        console.log(`🌸 日语单词记忆大师`);
        console.log(`📁 项目目录：${__dirname}`);
        console.log(`💾 存储方式：${mongoConnected ? 'MongoDB Atlas (永久)' : '本地文件 (临时)'}`);
        console.log(`🤖 AI 接口：http://localhost:${PORT}/api/ai-query`);
        console.log(`🚀 访问地址：http://localhost:${PORT}`);
        console.log(`📥 下载进度：http://localhost:${PORT}/download-progress`);
        console.log(`⏹️  按 Ctrl+C 停止服务器`);
    });
}

startServer();
