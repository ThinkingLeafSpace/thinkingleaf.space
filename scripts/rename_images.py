#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片文件自动重命名脚本

功能：
1. 自动识别包含中文、特殊字符或URL编码的图片文件名
2. 将文件名重命名为友好的英文名称
3. 更新所有HTML文件中的图片引用路径
4. 保存重命名映射，避免重复处理
5. 支持增量处理，不影响已重命名的文件
"""

import os
import re
import json
import shutil
from pathlib import Path
from datetime import datetime
from urllib.parse import unquote

# 配置
BASE_DIR = Path(__file__).parent.parent
IMAGES_BLOG_DIR = BASE_DIR / "images" / "blog"
BLOGS_DIR = BASE_DIR / "blogs"
MAPPING_FILE = BASE_DIR / "scripts" / "image_rename_mapping.json"

# 预定义的重命名规则（基于之前的重命名）
PREDEFINED_MAPPINGS = {
    "微信图片_20250414225738.jpg": "workshop-notes-20250414.jpg",
    "微信截图_20250415000219.png": "workshop-plan-a-20250415.png",
    "微信截图_20250415000227.png": "workshop-plan-b-20250415.png",
    "微信截图_20250415000236.png": "workshop-plan-c-disappeared-20250415.png",
    "笔记.png": "workshop-lecture-notes-20250415.png",
    "640 (1).jpg": "workshop-lecture-20250415.jpg",
    "IMG-2025-04-17 或许设计实验就是容易失败，对吗？-${date}.png": "design-experiment-poster-2025-04-17.png",
    "创造/存档/半载观想小记：在大理、在内观禅修的路上 e5a46807926c4e7cb754455e185074a6/Untitled.png": "meditation-schedule-20240706.png",
    "创造/存档/盖洛浦优势识别/Untitled 1.png": "gallup-strengths-untitled-1.png",
    "创造/存档/盖洛浦优势识别/Untitled 2.png": "gallup-strengths-fee-info.png",
}


def load_mapping():
    """加载已有的重命名映射"""
    if MAPPING_FILE.exists():
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_mapping(mapping, silent=False):
    """保存重命名映射
    
    Args:
        mapping: 重命名映射字典
        silent: 如果True，不打印保存信息（用于从其他模块调用）
    """
    MAPPING_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    if not silent:
        print(f"✓ 重命名映射已保存到: {MAPPING_FILE}")


def contains_non_ascii_or_special(filename):
    """检查文件名是否包含非ASCII字符或特殊字符"""
    # 检查是否有中文
    if re.search(r'[^\x00-\x7F]', filename):
        return True
    # 检查是否有空格、括号等特殊字符（允许基本标点）
    if re.search(r'[\s()（）]', filename):
        return True
    # 检查是否有URL编码
    if '%' in filename:
        return True
    return False


def extract_date_from_filename(filename):
    """从文件名中提取日期"""
    # 匹配常见的日期格式：YYYYMMDD, YYYY-MM-DD, YYYY_MM_DD
    date_patterns = [
        r'(\d{4})(\d{2})(\d{2})',  # YYYYMMDD
        r'(\d{4})-(\d{2})-(\d{2})',  # YYYY-MM-DD
        r'(\d{4})_(\d{2})_(\d{2})',  # YYYY_MM_DD
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, filename)
        if match:
            return match.group(1) + '-' + match.group(2) + '-' + match.group(3)
    return None


def generate_english_filename(original_path, mapping, base_dir=None):
    """生成英文文件名
    
    Args:
        original_path: 原始文件路径
        mapping: 重命名映射字典
        base_dir: 可选的基目录，用于检查文件是否已存在（未使用，保持兼容性）
    """
    # 如果已经在映射表中，直接返回
    if original_path in mapping:
        return mapping[original_path]
    
    # 也检查原始文件名（不带路径）是否在映射中
    original_name = os.path.basename(original_path)
    if original_name in mapping:
        return mapping[original_name]
    
    # 解码URL编码
    decoded = unquote(original_path)
    original_name = os.path.basename(decoded)
    
    # 移除目录结构，只保留文件名
    simple_name = original_name
    
    # 提取文件扩展名
    ext = os.path.splitext(simple_name)[1].lower()
    name_without_ext = os.path.splitext(simple_name)[0]
    
    # 提取日期
    date = extract_date_from_filename(simple_name)
    
    # 根据文件名特征生成新名称
    new_name = None
    
    # 检查预定义映射
    for old, new in PREDEFINED_MAPPINGS.items():
        if old in original_path or simple_name == old:
            new_name = new
            break
    
    # 如果没有预定义，根据内容生成
    if not new_name:
        # 识别文件类型关键词
        keywords = []
        
        if '微信' in simple_name or 'wechat' in simple_name.lower():
            if '截图' in simple_name or 'screenshot' in simple_name.lower():
                keywords.append('wechat-screenshot')
            else:
                keywords.append('wechat-image')
        elif '笔记' in simple_name or 'note' in simple_name.lower() or '笔记' in name_without_ext:
            keywords.append('notes')
        elif 'workshop' in simple_name.lower() or '工作坊' in simple_name:
            keywords.append('workshop')
        elif 'IMG_' in simple_name:
            keywords.append('photo')
        elif 'Untitled' in simple_name:
            keywords.append('image')
        else:
            keywords.append('image')
        
        # 添加日期
        if date:
            keywords.append(date.replace('-', ''))
        else:
            # 尝试从文件名中提取数字作为ID
            numbers = re.findall(r'\d+', name_without_ext)
            if numbers:
                keywords.append(numbers[-1])  # 使用最后一个数字
        
        # 生成新名称
        base_name = '-'.join(keywords)
        new_name = f"{base_name}{ext}"
        
        # 确保文件名唯一
        counter = 1
        original_new_name = new_name
        while (IMAGES_BLOG_DIR / new_name).exists() and new_name not in mapping.values():
            name_part, ext_part = os.path.splitext(original_new_name)
            new_name = f"{name_part}-{counter}{ext_part}"
            counter += 1
    
    return new_name


def rename_files(mapping):
    """重命名文件"""
    renamed_count = 0
    errors = []
    
    print("\n=== 开始重命名文件 ===\n")
    
    # 处理主目录下的文件
    if not IMAGES_BLOG_DIR.exists():
        print(f"✗ 目录不存在: {IMAGES_BLOG_DIR}")
        return renamed_count, errors
    
    # 扫描所有需要重命名的文件
    files_to_rename = []
    
    # 扫描主目录
    for file_path in IMAGES_BLOG_DIR.rglob('*'):
        if file_path.is_file() and file_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']:
            relative_path = file_path.relative_to(IMAGES_BLOG_DIR)
            relative_str = str(relative_path)
            
            # 检查是否需要重命名
            if contains_non_ascii_or_special(str(relative_path)) or relative_str in PREDEFINED_MAPPINGS:
                # 检查是否已经重命名过
                if relative_str not in mapping:
                    files_to_rename.append((relative_path, relative_str))
    
    # 执行重命名
    for relative_path, relative_str in files_to_rename:
        old_file = IMAGES_BLOG_DIR / relative_path
        new_filename = generate_english_filename(relative_str, mapping)
        new_file = IMAGES_BLOG_DIR / new_filename
        
        try:
            # 如果新文件已存在且不同，跳过（说明之前已经重命名过了）
            if new_file.exists() and old_file.samefile(new_file):
                print(f"⊘ {relative_str} - 已经重命名，跳过")
                mapping[relative_str] = new_filename
                continue
            
            # 如果目标文件已存在（但不是同一个文件），添加数字后缀
            if new_file.exists():
                base, ext = os.path.splitext(new_filename)
                counter = 1
                while new_file.exists():
                    new_filename = f"{base}-{counter}{ext}"
                    new_file = IMAGES_BLOG_DIR / new_filename
                    counter += 1
            
            # 如果是嵌套文件，先移动到主目录
            if '/' in str(relative_path) or '\\' in str(relative_path):
                # 创建新文件在主目录
                shutil.move(str(old_file), str(new_file))
                # 尝试删除空目录
                try:
                    old_file.parent.rmdir()
                except:
                    pass
            else:
                old_file.rename(new_file)
            
            mapping[relative_str] = new_filename
            print(f"✓ {relative_str}")
            print(f"  -> {new_filename}")
            renamed_count += 1
            
        except Exception as e:
            error_msg = f"✗ {relative_str} - 错误: {str(e)}"
            print(error_msg)
            errors.append(error_msg)
    
    return renamed_count, errors


def update_html_references(mapping):
    """更新HTML文件中的图片引用"""
    updated_count = 0
    
    print("\n=== 更新HTML引用 ===\n")
    
    if not BLOGS_DIR.exists():
        print(f"✗ 目录不存在: {BLOGS_DIR}")
        return updated_count
    
    # 查找所有HTML文件
    html_files = list(BLOGS_DIR.glob('*.html'))
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            updated = False
            
            # 更新所有图片引用
            for old_path, new_filename in mapping.items():
                # 处理URL编码的路径
                encoded_old = old_path.replace(' ', '%20').replace('(', '%28').replace(')', '%29')
                
                # 匹配各种可能的引用格式
                patterns = [
                    (rf'src="([^"]*){re.escape(old_path)}"', rf'src="\1{new_filename}"'),
                    (rf'src="([^"]*){re.escape(encoded_old)}"', rf'src="\1{new_filename}"'),
                    (rf'src="([^"]*){re.escape(unquote(old_path))}"', rf'src="\1{new_filename}"'),
                    (rf'data-src="([^"]*){re.escape(old_path)}"', rf'data-src="\1{new_filename}"'),
                    (rf'data-src="([^"]*){re.escape(encoded_old)}"', rf'data-src="\1{new_filename}"'),
                ]
                
                for pattern, replacement in patterns:
                    new_content = re.sub(pattern, replacement, content)
                    if new_content != content:
                        content = new_content
                        updated = True
            
            # 如果有更新，写回文件
            if updated and content != original_content:
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✓ {html_file.name}")
                updated_count += 1
                
        except Exception as e:
            print(f"✗ {html_file.name} - 错误: {str(e)}")
    
    return updated_count


def main():
    """主函数"""
    print("=" * 60)
    print("图片文件自动重命名工具")
    print("=" * 60)
    
    # 加载已有映射
    mapping = load_mapping()
    print(f"\n已加载 {len(mapping)} 个重命名映射")
    
    # 加载预定义映射
    for old, new in PREDEFINED_MAPPINGS.items():
        if old not in mapping:
            mapping[old] = new
    
    # 重命名文件
    renamed_count, errors = rename_files(mapping)
    
    # 保存映射
    save_mapping(mapping)
    
    # 更新HTML引用
    updated_count = update_html_references(mapping)
    
    # 总结
    print("\n" + "=" * 60)
    print("重命名完成！")
    print("=" * 60)
    print(f"✓ 重命名文件: {renamed_count} 个")
    print(f"✓ 更新HTML文件: {updated_count} 个")
    print(f"✓ 总映射记录: {len(mapping)} 个")
    
    if errors:
        print(f"\n⚠️  错误: {len(errors)} 个")
        for error in errors:
            print(f"  {error}")
    
    print(f"\n映射文件: {MAPPING_FILE}")
    print("\n提示: 可以重复运行此脚本，已重命名的文件不会重复处理")


if __name__ == "__main__":
    main()

