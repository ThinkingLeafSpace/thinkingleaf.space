/**
 * 相关内容推荐系统 - 页面更新器
 * 此脚本用于自动将所有博客和newsletter页面更新为使用新的模块化结构
 * 
 * 使用方法：
 * 1. 确保已安装Node.js
 * 2. 通过命令行运行：node modules/related-content/updater.js
 */

const fs = require('fs');
const path = require('path');

// 博客和newsletter目录
const BLOG_DIR = path.join(__dirname, '..', '..', 'blogs');
const NEWSLETTER_DIR = path.join(__dirname, '..', '..', 'newsletters');

// 要替换的旧脚本标签
const OLD_SCRIPT_TAG = '<script src="../js/related-content.js"></script>';
// 新的模块化脚本标签
const NEW_SCRIPT_TAG = '<script type="module" src="../modules/related-content/loader.js"></script>';

// 处理单个HTML文件
function processHtmlFile(filePath) {
    try {
        // 读取文件内容
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查文件是否已经包含新的模块化脚本
        if (content.includes('modules/related-content/loader.js')) {
            console.log(`✓ 文件已更新为使用模块化结构: ${filePath}`);
            return;
        }
        
        // 替换旧的脚本标签为新的
        let updatedContent = content.replace(OLD_SCRIPT_TAG, NEW_SCRIPT_TAG);
        
        // 如果文件中没有旧的脚本标签，但需要添加新的
        if (updatedContent === content && !content.includes(OLD_SCRIPT_TAG)) {
            // 在main.js后添加
            updatedContent = content.replace(
                /<script src="\.\.\/js\/main\.js"><\/script>/,
                '<script src="../js/main.js"></script>\n    ' + NEW_SCRIPT_TAG
            );
            
            // 如果没有找到main.js，尝试在</body>标签前添加
            if (updatedContent === content) {
                updatedContent = content.replace(
                    /<\/body>/,
                    '    ' + NEW_SCRIPT_TAG + '\n</body>'
                );
            }
        }
        
        // 如果内容有变化，写入更新后的内容
        if (updatedContent !== content) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`✅ 已更新文件使用模块化结构: ${filePath}`);
        } else {
            console.log(`⚠️ 无法更新文件: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ 处理文件时出错: ${filePath}`);
        console.error(error);
    }
}

// 处理目录中的所有HTML文件
function processDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            console.log(`⚠️ 目录不存在: ${dirPath}`);
            return;
        }

        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            if (file.endsWith('.html')) {
                const filePath = path.join(dirPath, file);
                processHtmlFile(filePath);
            }
        }
        
        console.log(`✅ 已处理目录: ${dirPath}`);
    } catch (error) {
        console.error(`❌ 处理目录时出错: ${dirPath}`);
        console.error(error);
    }
}

// 清理旧文件
function cleanupOldFiles() {
    const oldFiles = [
        path.join(__dirname, '..', '..', 'js', 'related-content.js'),
        path.join(__dirname, '..', '..', 'js', 'related-content-updater.js')
    ];
    
    oldFiles.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                fs.unlinkSync(file);
                console.log(`✅ 已删除旧文件: ${file}`);
            } catch (error) {
                console.error(`❌ 删除旧文件失败: ${file}`);
                console.error(error);
            }
        }
    });
}

// 主函数
function main() {
    console.log('开始更新博客和newsletter页面为使用模块化结构...');
    
    // 处理博客目录
    processDirectory(BLOG_DIR);
    
    // 处理newsletter目录
    processDirectory(NEWSLETTER_DIR);
    
    // 清理旧文件
    cleanupOldFiles();
    
    console.log('所有页面已更新完成！');
}

// 运行主函数
main(); 