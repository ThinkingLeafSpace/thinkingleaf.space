/**
 * 相关内容更新工具
 * 此脚本用于自动将相关内容功能添加到所有博客和newsletter页面
 * 
 * 使用方法：
 * 1. 将此文件放在项目根目录
 * 2. 通过命令行运行：node related-content-updater.js
 */

const fs = require('fs');
const path = require('path');

// 博客和newsletter目录
const BLOG_DIR = path.join(__dirname, '..', 'blogs');
const NEWSLETTER_DIR = path.join(__dirname, '..', 'newsletters');

// 要添加的脚本标签
const SCRIPT_TAG = '<script src="../js/related-content.js"></script>';

// 处理单个HTML文件
function processHtmlFile(filePath) {
    try {
        // 读取文件内容
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查文件是否已经包含相关内容脚本
        if (content.includes('related-content.js')) {
            console.log(`✓ 文件已包含相关内容脚本: ${filePath}`);
            return;
        }
        
        // 在main.js脚本后添加相关内容脚本
        let updatedContent = content.replace(
            /<script src="\.\.\/js\/main\.js"><\/script>/,
            '<script src="../js/main.js"></script>\n    ' + SCRIPT_TAG
        );
        
        // 如果没有找到main.js，尝试在</body>标签前添加
        if (updatedContent === content) {
            updatedContent = content.replace(
                /<\/body>/,
                '    ' + SCRIPT_TAG + '\n</body>'
            );
        }
        
        // 写入更新后的内容
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ 已更新文件: ${filePath}`);
    } catch (error) {
        console.error(`❌ 处理文件时出错: ${filePath}`);
        console.error(error);
    }
}

// 处理目录中的所有HTML文件
function processDirectory(dirPath) {
    try {
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

// 主函数
function main() {
    console.log('开始更新博客和newsletter页面...');
    
    // 处理博客目录
    processDirectory(BLOG_DIR);
    
    // 处理newsletter目录
    processDirectory(NEWSLETTER_DIR);
    
    console.log('所有页面已更新完成！');
}

// 运行主函数
main(); 