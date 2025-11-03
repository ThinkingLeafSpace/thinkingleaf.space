#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复博客文件名为正确的英文slug格式
将"日期-日期.html"改为"日期-英文标题.html"
"""

import re
import json
from pathlib import Path
from typing import Dict, Tuple, List

SITE_ROOT = Path(__file__).parent.parent
BLOGS_DIR = SITE_ROOT / 'blogs'
MAPPING_FILE = Path(__file__).parent / 'title_slug_mapping.json'


def slugify(text: str) -> str:
    """将中文标题转换为英文slug"""
    # 如果已经是英文，简单处理
    text = re.sub(r'[^\w\s-]', '', text)  # 移除特殊字符
    text = re.sub(r'[\s_]+', '-', text)  # 空格和下划线转短横线
    text = re.sub(r'-{2,}', '-', text)  # 多个短横线变成一个
    return text.strip('-').lower()


def load_title_mapping() -> Dict[str, str]:
    """加载标题到slug的映射"""
    if MAPPING_FILE.exists():
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def extract_html_title(html_path: Path) -> str:
    """从HTML中提取标题"""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html = f.read()
    except Exception as e:
        print(f"  ⚠ 无法读取文件: {e}")
        return ''
    
    # 优先从h1提取
    m = re.search(r'<h1 class="post-title">(.*?)</h1>', html, flags=re.DOTALL)
    if m:
        return re.sub(r'\s+', ' ', m.group(1)).strip()
    
    # 回退：从title标签提取
    m = re.search(r'<title>([^<]+)</title>', html)
    if m:
        title = m.group(1).replace(' - 筑居思', '').strip()
        return title
    
    return ''


def extract_date_from_filename(filename: str) -> str:
    """从文件名提取日期"""
    stem = Path(filename).stem
    m = re.match(r'^(\d{4}-\d{2}-\d{2})', stem)
    return m.group(1) if m else ''


def check_duplicate_date(filename: str) -> bool:
    """检查文件名是否有重复日期（日期-日期格式）"""
    stem = Path(filename).stem
    # 检查是否匹配 日期-日期 格式
    match = re.match(r'^(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})', stem)
    return match is not None and match.group(1) == match.group(2)


def get_english_slug(title: str, mapping: Dict[str, str]) -> str:
    """获取英文slug，优先使用映射表，否则自动生成"""
    if title in mapping:
        return mapping[title]
    
    # 如果没有映射，使用slugify自动生成
    # 但会输出警告
    slug = slugify(title)
    print(f"  ⚠ 使用自动生成slug: {slug}")
    return slug


def plan_renames(title_mapping: Dict[str, str]) -> List[Tuple[Path, Path]]:
    """规划需要重命名的文件"""
    plans: List[Tuple[Path, Path]] = []
    
    for html in sorted(BLOGS_DIR.glob('*.html')):
        if not check_duplicate_date(html.name):
            continue
        
        title = extract_html_title(html)
        if not title:
            print(f"⚠ {html.name} - 无法提取标题，跳过")
            continue
        
        date_prefix = extract_date_from_filename(html.name)
        if not date_prefix:
            print(f"⚠ {html.name} - 无法提取日期，跳过")
            continue
        
        english_slug = get_english_slug(title, title_mapping)
        new_name = f"{date_prefix}-{english_slug}.html"
        
        if new_name != html.name:
            plans.append((html, html.with_name(new_name)))
    
    return plans


def update_references(renames: List[Tuple[Path, Path]]):
    """更新所有文件中的引用链接"""
    if not renames:
        return
    
    print("\n更新文件引用...")
    pairs = [(f"blogs/{old.name}", f"blogs/{new.name}") for old, new in renames]
    
    updated_files = []
    for path in SITE_ROOT.rglob('*'):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {'.html', '.xml', '.json'}:
            continue
        if path in [old for old, _ in renames]:
            continue
        
        try:
            text = path.read_text(encoding='utf-8')
        except Exception:
            continue
        
        orig = text
        for old_ref, new_ref in pairs:
            text = text.replace(old_ref, new_ref)
        
        if text != orig:
            path.write_text(text, encoding='utf-8')
            updated_files.append(path.relative_to(SITE_ROOT))
    
    if updated_files:
        print(f"  ✓ 已更新 {len(updated_files)} 个文件的引用")
        for f in updated_files[:10]:
            print(f"    - {f}")
        if len(updated_files) > 10:
            print(f"    ... 还有 {len(updated_files) - 10} 个文件")


def main():
    """主函数"""
    print("=" * 60)
    print("博客文件名修复工具")
    print("=" * 60)
    print()
    
    # 加载映射
    title_mapping = load_title_mapping()
    print(f"已加载 {len(title_mapping)} 个标题映射")
    
    # 规划重命名
    renames = plan_renames(title_mapping)
    
    if not renames:
        print("\n✓ 没有需要修复的文件！")
        return 0
    
    print(f"\n找到 {len(renames)} 个需要修复的文件：\n")
    for old, new in renames:
        print(f"  {old.name}")
        print(f"  -> {new.name}\n")
    
    # 执行重命名
    print("开始修复...\n")
    success_count = 0
    for old, new in renames:
        if new.exists():
            print(f"  ✗ {old.name} -> 目标文件已存在，跳过")
            continue
        
        try:
            old.rename(new)
            print(f"  ✓ {old.name} -> {new.name}")
            success_count += 1
        except Exception as e:
            print(f"  ✗ {old.name} - 修复失败: {e}")
    
    print(f"\n✓ 完成！成功修复 {success_count}/{len(renames)} 个文件")
    
    # 更新引用
    if success_count > 0:
        update_references(renames)
    
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

