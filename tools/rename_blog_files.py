#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
博客文件重命名工具
将博客文件名从原格式重命名为"年-月-日-原文件名"格式
"""

import os
import re
import sys
from bs4 import BeautifulSoup
from datetime import datetime

# 博客文件目录
BLOGS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'blogs')

# 日期格式转换：从中文日期（如"2022年9月1日"）到"2022-09-01"
def format_date(date_str):
    # 使用正则表达式提取年、月、日
    match = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', date_str)
    if match:
        year, month, day = match.groups()
        # 确保月和日是两位数
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    return None

# 从HTML文件中提取日期
def extract_date_from_html(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            soup = BeautifulSoup(content, 'html.parser')
            
            # 尝试从 blog-date span 中提取日期
            date_span = soup.select_one('span.blog-date')
            if date_span and date_span.text:
                return format_date(date_span.text)
            
            # 尝试从文章底部的"写于"段落中提取日期
            footer_date = soup.select_one('div.blog-footer p')
            if footer_date and '写于' in footer_date.text:
                return format_date(footer_date.text.replace('写于', '').strip())
            
            # 如果以上方法都失败，返回None
            return None
    except Exception as e:
        print(f"处理文件 {file_path} 时出错: {e}")
        return None

# 重命名文件
def rename_blog_files():
    # 确保博客目录存在
    if not os.path.exists(BLOGS_DIR):
        print(f"错误: 博客目录 {BLOGS_DIR} 不存在")
        return

    # 获取所有HTML文件
    html_files = [f for f in os.listdir(BLOGS_DIR) if f.endswith('.html')]
    renamed_count = 0
    
    for filename in html_files:
        file_path = os.path.join(BLOGS_DIR, filename)
        
        # 从文件中提取日期
        date_str = extract_date_from_html(file_path)
        
        if date_str:
            # 如果文件名已经是日期格式，跳过
            if re.match(r'\d{4}-\d{2}-\d{2}-', filename):
                print(f"跳过已重命名的文件: {filename}")
                continue
                
            # 创建新文件名
            new_filename = f"{date_str}-{filename}"
            new_file_path = os.path.join(BLOGS_DIR, new_filename)
            
            # 重命名文件
            try:
                os.rename(file_path, new_file_path)
                print(f"重命名: {filename} -> {new_filename}")
                renamed_count += 1
            except Exception as e:
                print(f"重命名文件 {filename} 时出错: {e}")
        else:
            print(f"无法从文件 {filename} 中提取日期")
    
    print(f"\n完成! 共重命名 {renamed_count} 个文件")

if __name__ == "__main__":
    print("开始重命名博客文件...")
    rename_blog_files() 