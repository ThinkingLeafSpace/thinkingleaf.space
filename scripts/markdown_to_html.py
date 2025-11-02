#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown到HTML转换脚本
将Obsidian中的Markdown文件转换为网站HTML格式
"""

import os
import re
import sys
import yaml
from pathlib import Path
from datetime import datetime
from markdown import Markdown
from markdown.extensions import codehilite, fenced_code, tables, toc
import json

# 默认配置
CONFIG_FILE = 'blog_config.json'
SITE_ROOT = Path(__file__).parent.parent
BLOGS_DIR = SITE_ROOT / 'blogs'
OBSIDIAN_ATTACHMENTS = []  # 将从配置文件读取
SITE_IMAGES_DIR = SITE_ROOT / 'images'

class MarkdownConverter:
    def __init__(self, config_file=None):
        """初始化转换器，加载配置"""
        self.config = self.load_config(config_file)
        self.md = Markdown(
            extensions=[
                'codehilite',
                'fenced_code',
                'tables',
                'toc',
                'nl2br',
                'sane_lists'
            ],
            extension_configs={
                'codehilite': {
                    'css_class': 'highlight',
                    'use_pygments': False
                }
            }
        )
        
    def load_config(self, config_file=None):
        """加载配置文件"""
        if config_file is None:
            config_file = SITE_ROOT / CONFIG_FILE
        
        default_config = {
            'obsidian_vault': '',
            'obsidian_attachments': [],
            'site_images_dir': 'images',
            'blog_template': 'standard'  # standard or simple
        }
        
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                default_config.update(user_config)
        
        # 检查Obsidian库路径是否存在
        obsidian_vault = default_config.get('obsidian_vault', '')
        if obsidian_vault and not os.path.exists(obsidian_vault):
            print(f"\n⚠️  警告: Obsidian库路径不存在: {obsidian_vault}")
            print("请检查 blog_config.json 中的 'obsidian_vault' 配置是否正确")
            print("如果路径已改变，请更新配置文件")
        
        # 检查附件目录
        for attach_dir in default_config.get('obsidian_attachments', []):
            if attach_dir and not os.path.exists(attach_dir):
                print(f"⚠️  提示: 附件目录不存在（可选）: {attach_dir}")
        
        return default_config
    
    def extract_front_matter(self, content):
        """提取YAML front matter"""
        front_matter = {}
        content_lines = content.split('\n')
        
        if content_lines[0].strip() == '---':
            yaml_lines = []
            i = 1
            while i < len(content_lines) and content_lines[i].strip() != '---':
                yaml_lines.append(content_lines[i])
                i += 1
            
            if i < len(content_lines):
                yaml_content = '\n'.join(yaml_lines)
                try:
                    front_matter = yaml.safe_load(yaml_content) or {}
                except:
                    pass
                # 返回front matter和剩余内容
                remaining_content = '\n'.join(content_lines[i+1:])
                return front_matter, remaining_content
        
        return front_matter, content
    
    def convert_image_path(self, markdown_path):
        """
        转换图片路径
        将Obsidian的相对路径转换为网站相对路径
        """
        def replace_image(match):
            alt_text = match.group(1)
            img_path = match.group(2)
            
            # 处理Obsidian格式的图片路径
            # 例如: ![[image.png]] 或 ![alt](image.png) 或 ![alt](attachments/image.png)
            
            # 如果是Obsidian的wiki链接格式 ![[...]]
            if img_path.startswith('[[') and img_path.endswith(']]'):
                img_path = img_path[2:-2]
            
            # 移除开头的 ./
            if img_path.startswith('./'):
                img_path = img_path[2:]
            
            # 分离文件名和可能存在的路径
            img_filename = Path(img_path).name
            img_dir_part = str(Path(img_path).parent) if Path(img_path).parent != Path('.') else ''
            
            # 查找图片文件
            md_dir = Path(markdown_path).parent
            possible_paths = []
            
            # 1. 如果路径包含目录信息，先尝试完整路径
            if img_dir_part:
                possible_paths.extend([
                    md_dir / img_path,
                    md_dir / img_dir_part / img_filename,
                ])
            
            # 2. 在Markdown文件同目录及其子目录查找
            possible_paths.extend([
                md_dir / img_filename,
                md_dir / img_path,
                md_dir / 'attachments' / img_filename,
                md_dir / 'attachments' / img_path,
                md_dir / 'assets' / img_filename,
                md_dir / 'assets' / img_path,
                md_dir.parent / 'attachments' / img_filename,
            ])
            
            # 3. 在配置的Obsidian附件目录中查找
            if self.config.get('obsidian_attachments'):
                for attach_dir in self.config['obsidian_attachments']:
                    if attach_dir and attach_dir.strip():
                        attach_path = Path(attach_dir)
                        possible_paths.extend([
                            attach_path / img_filename,
                            attach_path / img_path,
                        ])
            
            # 查找存在的图片文件
            found_path = None
            for path in possible_paths:
                try:
                    if path.exists() and path.is_file():
                        found_path = path.resolve()  # 获取绝对路径
                        break
                except:
                    continue
            
            if found_path:
                # 复制图片到网站images目录
                target_dir = SITE_ROOT / self.config['site_images_dir'] / 'blog'
                target_dir.mkdir(parents=True, exist_ok=True)
                
                # 使用原文件名，避免冲突时可以添加哈希
                safe_filename = img_filename
                # 处理文件名中的特殊字符和空格
                safe_filename = safe_filename.replace(' ', '-')
                
                # 创建相对路径（从博客HTML文件的角度）
                relative_path = f"../images/blog/{safe_filename}"
                target_path = target_dir / safe_filename
                
                # 复制图片（如果不存在或源文件更新）
                import shutil
                copy_needed = False
                if not target_path.exists():
                    copy_needed = True
                elif found_path.stat().st_mtime > target_path.stat().st_mtime:
                    copy_needed = True
                elif found_path.stat().st_size != target_path.stat().st_size:
                    copy_needed = True
                
                if copy_needed:
                    shutil.copy2(found_path, target_path)
                    print(f"  ✓ 已复制图片: {found_path.name} -> {relative_path}")
                    
                    # 检查是否需要重命名（包含中文或特殊字符）
                    if self._needs_rename(safe_filename):
                        # 导入重命名模块（延迟导入避免循环依赖）
                        try:
                            import sys
                            rename_script_dir = Path(__file__).parent
                            if str(rename_script_dir) not in sys.path:
                                sys.path.insert(0, str(rename_script_dir))
                            from rename_images import generate_english_filename, load_mapping, save_mapping
                            
                            mapping = load_mapping()
                            new_filename = generate_english_filename(safe_filename, mapping)
                            
                            # 如果生成的新文件名不同，进行重命名
                            if new_filename != safe_filename:
                                new_target = target_dir / new_filename
                                if not new_target.exists():
                                    target_path.rename(new_target)
                                    # 保存映射
                                    mapping[safe_filename] = new_filename
                                    save_mapping(mapping, silent=True)
                                    safe_filename = new_filename
                                    relative_path = f"../images/blog/{safe_filename}"
                                    print(f"  ✓ 已重命名图片: {target_path.name} -> {new_filename}")
                        except Exception as e:
                            # 如果重命名失败，继续使用原文件名
                            print(f"  ⚠️  重命名失败（继续使用原文件名）: {e}")
                
                return f'![{alt_text}]({relative_path})'
            else:
                # 如果找不到，尝试直接使用相对路径（可能已经是网站路径）
                # 检查是否是网站images目录的路径
                if 'images' in img_path:
                    return match.group(0)  # 保持原样
                else:
                    # 假设图片在images/blog目录
                    return f'![{alt_text}](../images/blog/{img_path})'
        
        return replace_image
    
    def _needs_rename(self, filename):
        """检查文件名是否需要重命名"""
        import re
        from urllib.parse import unquote
        
        # 检查是否有中文或特殊字符
        if re.search(r'[^\x00-\x7F]', filename):
            return True
        # 检查是否有空格、括号等
        if re.search(r'[\s()（）%]', filename):
            return True
        return False
    
    def process_images(self, content, markdown_path):
        """处理Markdown中的图片链接"""
        # 先处理Obsidian的wiki链接格式 ![[image.png|alt]]，转换为标准格式
        wiki_pattern = r'!\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]'
        
        def replace_wiki_image(match):
            img_path = match.group(1)
            alt_text = match.group(2) if match.group(2) else ''
            # 转换为标准Markdown格式
            return f'![{alt_text}]({img_path})'
        
        content = re.sub(wiki_pattern, replace_wiki_image, content)
        
        # 然后处理所有标准格式的图片 ![alt](path)
        pattern = r'!\[([^\]]*)\]\(([^\)]+)\)'
        converter = self.convert_image_path(markdown_path)
        content = re.sub(pattern, converter, content)
        
        return content
    
    def convert(self, markdown_file, output_file=None):
        """转换Markdown文件为HTML"""
        markdown_path = Path(markdown_file)
        
        if not markdown_path.exists():
            print(f"错误: 文件不存在 {markdown_file}")
            return False
        
        # 确保输出目录存在
        BLOGS_DIR.mkdir(parents=True, exist_ok=True)
        
        # 确保图片目录存在
        image_dir = SITE_ROOT / self.config['site_images_dir'] / 'blog'
        image_dir.mkdir(parents=True, exist_ok=True)
        
        # 读取Markdown内容
        with open(markdown_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取front matter
        front_matter, content = self.extract_front_matter(content)
        
        # 获取元数据
        title = front_matter.get('title', markdown_path.stem)
        
        # 处理日期字段：支持 Obsidian 模板变量和实际日期
        date_value = front_matter.get('date', '')
        date_str = None
        
        if not date_value:
            # 如果日期为空，使用当前日期
            date_str = datetime.now().strftime('%Y-%m-%d')
        elif isinstance(date_value, dict):
            # 如果解析成了字典（YAML 格式错误），使用当前日期
            date_str = datetime.now().strftime('%Y-%m-%d')
        else:
            # 转换为字符串并去除引号
            date_str = str(date_value).strip().strip('"').strip("'")
            # 检查是否是 Obsidian 模板变量
            if '{{date' in date_str or date_str == '':
                # 如果是模板变量或空字符串，使用当前日期
                date_str = datetime.now().strftime('%Y-%m-%d')
            else:
                # 验证日期格式
                try:
                    datetime.strptime(date_str, '%Y-%m-%d')
                except ValueError:
                    # 如果格式不正确，使用当前日期
                    date_str = datetime.now().strftime('%Y-%m-%d')
        
        description = front_matter.get('description', front_matter.get('excerpt', ''))
        if description is None or isinstance(description, dict) or (isinstance(description, str) and description.strip() == ''):
            description = ''
        else:
            description = str(description).strip()
        
        category = front_matter.get('category', front_matter.get('categories', '博客'))
        # 将category转换为列表格式
        if isinstance(category, list):
            categories = [str(c).strip() for c in category if c] if category else ['博客']
        elif isinstance(category, dict):
            categories = ['博客']
        elif category:
            categories = [str(category).strip()]
        else:
            categories = ['博客']
        
        # 处理图片路径
        content = self.process_images(content, markdown_path)
        
        # 转换Markdown为HTML
        html_content = self.md.convert(content)
        
        # 重置Markdown实例（因为Markdown对象会保存状态）
        self.md.reset()
        
        # 生成HTML文件
        if output_file is None:
            # 标准格式：YYYY-MM-DD-标题.html（日期在文件名最前面）
            safe_title = re.sub(r'[^\w\s-]', '', title).strip()
            safe_title = re.sub(r'[-\s]+', '-', safe_title)
            output_file = BLOGS_DIR / f"{date_str}-{safe_title}.html"
        else:
            output_file = Path(output_file)
            # 如果输出文件名已提供但没有日期前缀，自动添加
            if output_file.name and not re.match(r'^\d{4}-\d{2}-\d{2}', output_file.stem):
                safe_title = re.sub(r'[^\w\s-]', '', title).strip()
                safe_title = re.sub(r'[-\s]+', '-', safe_title)
                output_file = BLOGS_DIR / f"{date_str}-{safe_title}.html"
        
        # 使用标准模板生成完整HTML
        html_output = self.generate_html_template(
            title, date_str, description, html_content, categories
        )
        
        # 写入文件
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_output)
        
        print(f"✓ 已转换: {markdown_path.name} -> {output_file.name}")
        print(f"  标题: {title}")
        print(f"  日期: {date_str}")
        print(f"  标签: {', '.join(categories)}")
        
        return {
            'title': title,
            'date': date_str,
            'description': description,
            'filename': output_file.name,
            'category': categories
        }
    
    def generate_html_template(self, title, date, description, content, categories=None):
        """生成HTML模板"""
        # 格式化日期
        try:
            date_obj = datetime.strptime(date, '%Y-%m-%d')
            date_formatted = f"{date_obj.year}年{date_obj.month}月{date_obj.day}日"
        except:
            date_formatted = date
        
        # 生成标签HTML
        if categories:
            tags_html = '<div class="blog-tags">\n'
            for cat in categories:
                tags_html += f'                        <span class="tag">{cat}</span>\n'
            tags_html += '                    </div>'
        else:
            tags_html = ''
        
        template = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - 筑居思</title>
    <meta name="description" content="{description}">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/blog-post.css">
    <link rel="icon" href="../images/putiye心形菩提叶.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- 左侧固定导航栏 -->
    <div class="sidebar">
        <div class="sidebar-logo">
            <h1>筑居<span>思</span></h1>
        </div>
        <ul class="sidebar-nav">
            <li><a href="../index.html">首页</a></li>
            <li><a href="../blogs.html">个人博客</a></li>
            <li><a href="../newsletter.html">Newsletter 导航</a></li>
            <li><a href="../portfolio.html">个人作品集</a></li>
        </ul>
        <div class="theme-toggle">
            <button id="theme-toggle-btn" aria-label="切换主题">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sun-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="moon-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
        </div>
    </div>

    <!-- 移动端菜单按钮 -->
    <button class="mobile-menu-toggle" aria-label="打开导航菜单">
        <span></span>
        <span></span>
        <span></span>
    </button>

    <!-- 主要内容区域 -->
    <div class="main-content">
        <div class="container blog-post">
            <main>
                <article>
                    <header class="post-header">
                        <h1 class="post-title">{title}</h1>
                        <div class="post-meta">
                            <time datetime="{date}">{date_formatted}</time>
                        </div>
{tags_html}
                    </header>

                    <div class="post-content">
{content}
                    </div>
                </article>
            </main>

            <footer>
                <div class="footer-content">
                    <p>© 2025 筑居思. 保留所有权利.</p>
                    <div class="social-links">
                        <a href="https://github.com/ArchQian" aria-label="GitHub" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                        </a>
                        <a href="https://web.okjike.com/u/badeec5b-6ff4-4286-8622-3658365472fa" aria-label="即刻" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                        </a>
                        <a href="https://www.zcool.com.cn/u/27619561" aria-label="站酷" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                        <a href="../rss.xml" aria-label="RSS订阅" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    </div>

    <script src="../js/theme-switcher.js"></script>
    <script src="../js/lazy-loading.js"></script>
    <script src="../js/main.js"></script>
</body>
</html>'''
        
        return template


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: markdown_to_html.py <markdown文件> [输出文件]")
        print("示例: markdown_to_html.py /path/to/obsidian/note.md")
        sys.exit(1)
    
    markdown_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    converter = MarkdownConverter()
    result = converter.convert(markdown_file, output_file)
    
    if result:
        print(f"\n✓ 转换完成！")
        print(f"  输出文件: {result['filename']}")
        return result
    else:
        print("\n✗ 转换失败")
        sys.exit(1)


if __name__ == '__main__':
    main()

