#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
博客网站综合维护工具 - Python实用工具模块
提供高级功能，可被blog-tools.sh和blog-tools.bat调用
"""

import os
import re
import sys
import shutil
from datetime import datetime
from pathlib import Path

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

# 日志输出颜色
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'

    @staticmethod
    def green(text):
        return Colors.GREEN + text + Colors.RESET

    @staticmethod
    def yellow(text):
        return Colors.YELLOW + text + Colors.RESET

    @staticmethod
    def red(text):
        return Colors.RED + text + Colors.RESET

# 文件路径处理
class PathManager:
    def __init__(self):
        self.script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        self.blogs_dir = self.script_dir / 'blogs'
        
    def check_blogs_dir(self):
        """检查博客目录是否存在"""
        if not self.blogs_dir.exists():
            print(Colors.red(f"错误: 博客目录 {self.blogs_dir} 不存在"))
            return False
        return True
        
    def get_blog_files(self):
        """获取所有博客HTML文件的路径"""
        if not self.check_blogs_dir():
            return []
        return list(self.blogs_dir.glob('*.html'))

# 日期处理工具
class DateProcessor:
    @staticmethod
    def format_date(date_str):
        """将中文日期（如"2022年9月1日"）转换为"2022-09-01"格式"""
        match = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', date_str)
        if match:
            year, month, day = match.groups()
            # 确保月和日是两位数
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        return None
        
    @staticmethod
    def extract_date_from_html(file_path):
        """从HTML文件中提取日期，返回标准格式的日期字符串"""
        if not BS4_AVAILABLE:
            print(Colors.yellow("警告: 未安装 BeautifulSoup4，无法解析 HTML 提取日期"))
            return None
            
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                soup = BeautifulSoup(content, 'html.parser')
                
                # 尝试从 blog-date span 中提取日期
                date_span = soup.select_one('span.blog-date')
                if date_span and date_span.text:
                    return DateProcessor.format_date(date_span.text)
                
                # 尝试从文章底部的"写于"段落中提取日期
                footer_date = soup.select_one('div.blog-footer p')
                if footer_date and '写于' in footer_date.text:
                    return DateProcessor.format_date(footer_date.text.replace('写于', '').strip())
                
                # 尝试从任何包含日期格式的文本中提取
                date_pattern = re.compile(r'\d{4}年\d{1,2}月\d{1,2}日')
                for element in soup.find_all(text=date_pattern):
                    match = date_pattern.search(element)
                    if match:
                        return DateProcessor.format_date(match.group(0))
                
                # 尝试从文件名中提取日期
                filename = os.path.basename(file_path)
                if re.match(r'^(\d{2})-', filename):
                    year_suffix = filename.split('-')[0]
                    return f"20{year_suffix}-01-01"  # 默认使用该年的1月1日
                
                return None
        except Exception as e:
            print(Colors.red(f"处理文件 {file_path} 时出错: {e}"))
            return None

# 博客文件重命名工具
class BlogRenamer:
    def __init__(self):
        self.path_manager = PathManager()
        
    def rename_blog_files(self):
        """重命名博客文件，添加日期前缀"""
        print(Colors.green("开始重命名博客文件..."))
        
        if not self.path_manager.check_blogs_dir():
            return
            
        renamed_count = 0
        skipped_count = 0
        error_count = 0
        
        for file_path in self.path_manager.get_blog_files():
            filename = file_path.name
            
            # 如果文件名已经是日期格式，跳过
            if re.match(r'\d{4}-\d{2}-\d{2}-', filename):
                print(Colors.yellow(f"跳过已重命名的文件: {filename}"))
                skipped_count += 1
                continue
                
            # 从文件中提取日期
            date_str = DateProcessor.extract_date_from_html(file_path)
            
            if date_str:
                # 创建新文件名
                new_filename = f"{date_str}-{filename}"
                new_file_path = file_path.parent / new_filename
                
                # 重命名文件
                try:
                    os.rename(file_path, new_file_path)
                    print(Colors.green(f"重命名: {filename} -> {new_filename}"))
                    renamed_count += 1
                except Exception as e:
                    print(Colors.red(f"重命名文件 {filename} 时出错: {e}"))
                    error_count += 1
            else:
                # 使用当前日期
                today = datetime.now().strftime("%Y-%m-%d")
                new_filename = f"{today}-{filename}"
                new_file_path = file_path.parent / new_filename
                
                print(Colors.yellow(f"无法从文件 {filename} 中提取日期，使用当前日期: {today}"))
                
                # 重命名文件
                try:
                    os.rename(file_path, new_file_path)
                    print(Colors.green(f"重命名(使用当前日期): {filename} -> {new_filename}"))
                    renamed_count += 1
                except Exception as e:
                    print(Colors.red(f"重命名文件 {filename} 时出错: {e}"))
                    error_count += 1
        
        # 打印统计信息
        print("\n" + Colors.green("完成! 统计信息:"))
        print(f"- 重命名文件数: {renamed_count}")
        print(f"- 已跳过文件数: {skipped_count}")
        print(f"- 处理失败文件数: {error_count}")

# 博客日期格式修复工具
class DateFixer:
    def __init__(self):
        self.path_manager = PathManager()
        
    def fix_date_in_file(self, file_path, date_str):
        """向HTML文件添加或修复日期信息"""
        if not BS4_AVAILABLE:
            print(Colors.yellow(f"警告: 未安装 BeautifulSoup4，将使用简单文本替换"))
            self._fix_date_with_regex(file_path, date_str)
            return
            
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                soup = BeautifulSoup(content, 'html.parser')
                
                # 检查是否有blog-date元素
                date_span = soup.select_one('span.blog-date')
                if date_span:
                    date_span.string = date_str
                else:
                    # 在blog-meta div中添加日期span
                    blog_meta = soup.select_one('div.blog-meta')
                    if blog_meta:
                        new_span = soup.new_tag('span', attrs={'class': 'blog-date'})
                        new_span.string = date_str
                        blog_meta.append(new_span)
                
                # 检查文件中是否有"写于"段落
                wrote_at_p = None
                for p in soup.find_all('p'):
                    if p.text and p.text.startswith('写于'):
                        wrote_at_p = p
                        break
                        
                if wrote_at_p:
                    wrote_at_p.string = f"写于 {date_str}"
                else:
                    # 在blog-footer中添加"写于"段落
                    blog_footer = soup.select_one('div.blog-footer')
                    if blog_footer:
                        new_p = soup.new_tag('p')
                        new_p.string = f"写于 {date_str}"
                        blog_footer.append(new_p)
                
                # 写回文件
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(str(soup))
                    
                return True
        except Exception as e:
            print(Colors.red(f"处理文件 {file_path} 时出错: {e}"))
            return False
            
    def _fix_date_with_regex(self, file_path, date_str):
        """使用正则表达式添加或修复日期信息（备用方法）"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # 替换或添加blog-date
            date_span_pattern = re.compile(r'<span class="blog-date">.*?</span>')
            if date_span_pattern.search(content):
                content = date_span_pattern.sub(f'<span class="blog-date">{date_str}</span>', content)
            else:
                blog_meta_pattern = re.compile(r'<div class="blog-meta">')
                content = blog_meta_pattern.sub(f'<div class="blog-meta">\n            <span class="blog-date">{date_str}</span>', content)
            
            # 替换或添加"写于"段落
            wrote_at_pattern = re.compile(r'<p>写于.*?</p>')
            if wrote_at_pattern.search(content):
                content = wrote_at_pattern.sub(f'<p>写于 {date_str}</p>', content)
            else:
                blog_footer_pattern = re.compile(r'<div class="blog-footer">')
                content = blog_footer_pattern.sub(f'<div class="blog-footer">\n                        <p>写于 {date_str}</p>', content)
            
            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
                
            return True
        except Exception as e:
            print(Colors.red(f"使用正则表达式修复文件 {file_path} 时出错: {e}"))
            return False
    
    def fix_blog_dates(self):
        """修复所有博客文件中的日期格式问题"""
        print(Colors.green("开始修复博客文章中的日期格式问题..."))
        
        if not self.path_manager.check_blogs_dir():
            return
            
        fixed_count = 0
        skipped_count = 0
        error_count = 0
        
        for file_path in self.path_manager.get_blog_files():
            filename = file_path.name
            print(Colors.yellow(f"处理文件: {filename}"))
            
            # 尝试从文件名提取日期
            date_match = re.match(r'^(\d{4})-(\d{2})-(\d{2})-', filename)
            if date_match:
                year, month, day = date_match.groups()
                
                # 移除前导零
                month = month.lstrip('0')
                day = day.lstrip('0')
                
                # 创建中文格式的日期
                date_str = f"{year}年{month}月{day}日"
                
                # 检查文件中是否已有日期信息
                has_date = False
                
                if BS4_AVAILABLE:
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            soup = BeautifulSoup(f.read(), 'html.parser')
                            date_span = soup.select_one('span.blog-date')
                            if date_span and re.search(r'\d{4}年\d{1,2}月\d{1,2}日', date_span.text):
                                has_date = True
                    except:
                        pass
                else:
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if re.search(r'<span class="blog-date">[^<]*\d{4}年\d{1,2}月\d{1,2}日[^<]*</span>', content):
                                has_date = True
                    except:
                        pass
                
                if not has_date:
                    # 添加缺失的日期
                    if self.fix_date_in_file(file_path, date_str):
                        print(Colors.green(f"添加缺失的日期: {date_str} (文件: {filename})"))
                        fixed_count += 1
                    else:
                        print(Colors.red(f"无法修复日期问题: {filename}"))
                        error_count += 1
                else:
                    print(Colors.yellow(f"文件已有有效日期，跳过: {filename}"))
                    skipped_count += 1
            else:
                print(Colors.yellow(f"文件名 {filename} 不包含有效的日期格式"))
                error_count += 1
                
        # 打印统计信息
        print("\n" + Colors.green("完成! 统计信息:"))
        print(f"- 修复的文件数: {fixed_count}")
        print(f"- 已跳过文件数: {skipped_count}")
        print(f"- 处理失败文件数: {error_count}")

# 新增：标签系统和版权声明工具
class BlogTemplateUpdater:
    def __init__(self):
        self.path_manager = PathManager()
        
    def update_date_tag_class(self, file_path):
        """将blog-date类替换为date-tag类"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # 替换类名
            updated_content = content.replace('class="blog-date"', 'class="date-tag"')
            
            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)
                
            return True
        except Exception as e:
            print(Colors.red(f"更新日期标签类名时出错: {e}"))
            return False
    
    def add_copyright_notice(self, file_path):
        """添加版权声明（如果不存在）"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # 检查是否已有版权声明
            if "copyright-notice" in content:
                return False  # 已存在，不需要添加
                
            # 添加版权声明
            if BS4_AVAILABLE:
                soup = BeautifulSoup(content, 'html.parser')
                article = soup.select_one('article.blog-content')
                
                if article:
                    copyright_div = soup.new_tag('div', attrs={'class': 'copyright-notice'})
                    copyright_p = soup.new_tag('p')
                    copyright_p.string = "欢迎引用本文观点或图片，但请注明出处并附上本文链接。"
                    copyright_div.append(copyright_p)
                    article.append(copyright_div)
                    
                    # 写回文件
                    with open(file_path, 'w', encoding='utf-8') as file:
                        file.write(str(soup))
                    return True
            
            # 如果BeautifulSoup不可用或处理失败，使用正则表达式
            article_end_pattern = re.compile(r'</article>')
            copyright_html = '''                    <div class="copyright-notice">
                        <p>欢迎引用本文观点或图片，但请注明出处并附上本文链接。</p>
                    </div>
                </article>'''
            updated_content = article_end_pattern.sub(copyright_html, content)
            
            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)
                
            return True
        except Exception as e:
            print(Colors.red(f"添加版权声明时出错: {e}"))
            return False
    
    def add_tag_system_scripts(self, file_path):
        """添加标签系统脚本（如果不存在）"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # 检查是否已有标签系统脚本
            if "tag-system.js" in content:
                return False  # 已存在，不需要添加
                
            # 添加标签系统脚本
            if BS4_AVAILABLE:
                soup = BeautifulSoup(content, 'html.parser')
                main_script = soup.select_one('script[src="../js/main.js"]')
                
                if main_script:
                    # 添加related-content.js脚本
                    related_script = soup.new_tag('script', src="../js/related-content.js")
                    main_script.insert_after(related_script)
                    
                    # 添加tag-system.js脚本
                    tag_script = soup.new_tag('script', src="../js/tag-system.js")
                    related_script.insert_after(tag_script)
                    
                    # 写回文件
                    with open(file_path, 'w', encoding='utf-8') as file:
                        file.write(str(soup))
                    return True
            
            # 如果BeautifulSoup不可用或处理失败，使用正则表达式
            main_script_pattern = re.compile(r'<script src="../js/main.js"></script>')
            script_html = '''<script src="../js/main.js"></script>
    <script src="../js/related-content.js"></script>
    <script src="../js/tag-system.js"></script>'''
            updated_content = main_script_pattern.sub(script_html, content)
            
            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)
                
            return True
        except Exception as e:
            print(Colors.red(f"添加标签系统脚本时出错: {e}"))
            return False
    
    def update_blog_templates(self):
        """更新所有博客页面的模板，添加标签系统和版权声明"""
        print(Colors.green("开始更新所有博客页面..."))
        
        if not self.path_manager.check_blogs_dir():
            return
            
        updated_date_count = 0
        added_copyright_count = 0
        added_scripts_count = 0
        error_count = 0
        
        for file_path in self.path_manager.get_blog_files():
            filename = file_path.name
            print(Colors.yellow(f"处理文件: {filename}"))
            
            # 1. 将blog-date类替换为date-tag类
            if self.update_date_tag_class(file_path):
                updated_date_count += 1
                
            # 2. 添加版权声明（如果不存在）
            if self.add_copyright_notice(file_path):
                added_copyright_count += 1
                
            # 3. 添加标签系统脚本（如果不存在）
            if self.add_tag_system_scripts(file_path):
                added_scripts_count += 1
                
        # 打印统计信息
        print("\n" + Colors.green("完成! 统计信息:"))
        print(f"- 更新日期标签类名的文件数: {updated_date_count}")
        print(f"- 添加版权声明的文件数: {added_copyright_count}")
        print(f"- 添加标签系统脚本的文件数: {added_scripts_count}")
        print(f"- 处理失败文件数: {error_count}")

# 命令行接口
def main():
    if len(sys.argv) < 2:
        print("用法: python blog_utils.py [命令]")
        print("命令:")
        print("  rename    - 重命名博客文件（添加日期前缀）")
        print("  fix-dates - 修复博客日期格式")
        print("  update-templates - 更新博客模板（添加标签系统和版权声明）")
        return
        
    command = sys.argv[1]
    
    if command == "rename":
        renamer = BlogRenamer()
        renamer.rename_blog_files()
    elif command == "fix-dates":
        fixer = DateFixer()
        fixer.fix_blog_dates()
    elif command == "update-templates":
        updater = BlogTemplateUpdater()
        updater.update_blog_templates()
    else:
        print(Colors.red(f"未知命令: {command}"))
        print("可用命令: rename, fix-dates, update-templates")

if __name__ == "__main__":
    main() 