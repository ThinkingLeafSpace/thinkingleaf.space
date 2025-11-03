#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
根据 Obsidian 中的笔记（中文标题、英文文件名）批量将站点 blogs/*.html 重命名为英文链接，
并同步更新站内所有引用（.html、.xml）

规则：
- 以现有 HTML 的日期前缀为准（若有），仅替换标题段为英文 slug
- 英文 slug 来源：Obsidian 笔记的文件名（去扩展名，标准化为小写连字符）
- 显示标题保持不变（不改 HTML 内文的中文 <h1>）
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, Tuple, List

SITE_ROOT = Path(__file__).parent.parent
BLOGS_DIR = SITE_ROOT / 'blogs'
CONFIG_FILE = SITE_ROOT / 'blog_config.json'
MAPPING_FILE = Path(__file__).parent / 'title_slug_mapping.json'


def load_config() -> dict:
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def load_title_mapping() -> Dict[str, str]:
    """加载预定义的标题映射"""
    if MAPPING_FILE.exists():
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def slugify(name: str) -> str:
    # 仅用于稳妥处理：将任意名称转为小写、连字符
    name = re.sub(r'[\s_]+', '-', name.strip())
    name = re.sub(r'[^a-zA-Z0-9\-]+', '-', name)
    name = re.sub(r'-{2,}', '-', name)
    return name.strip('-').lower()


def build_title_to_slug_from_obsidian(vault_dir: Path, manual_mapping: Dict[str, str]) -> Dict[str, str]:
    """扫描 Obsidian 目录下的 .md：使用 front matter 的 title 或首个 Markdown 标题作为文章标题，
    并使用该英文标题生成 slug（不再使用文件名）。
    
    Args:
        vault_dir: Obsidian vault 目录
        manual_mapping: 预定义的标题映射，优先级最高
    """
    mapping: Dict[str, str] = {}
    # 先加载手动映射
    mapping.update(manual_mapping)
    
    for md in sorted(vault_dir.glob('*.md')):
        try:
            with open(md, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception:
            continue

        # front matter 提取 title
        title = None
        if content.startswith('---'):
            parts = content.split('\n')
            # 查找 front matter 结束行
            try:
                end_idx = 1
                while end_idx < len(parts) and parts[end_idx].strip() != '---':
                    end_idx += 1
                fm = '\n'.join(parts[1:end_idx])
                m = re.search(r'^title:\s*(.*)$', fm, flags=re.MULTILINE)
                if m:
                    title = m.group(1).strip().strip('"').strip("'")
            except Exception:
                pass

        if not title:
            # 回退：使用首个 Markdown 一级或二级标题
            m1 = re.search(r'^#\s+(.+)$', content, flags=re.MULTILINE)
            m2 = re.search(r'^##\s+(.+)$', content, flags=re.MULTILINE)
            if m1:
                title = m1.group(1).strip()
            elif m2:
                title = m2.group(1).strip()
            else:
                # 最后回退：使用文件名
                title = md.stem

        # 如果手动映射中没有，则自动生成slug
        if title and title not in mapping:
            slug = slugify(title)
            mapping[title] = slug
    return mapping


def extract_html_title(html_path: Path) -> str:
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html = f.read()
    except Exception:
        return ''

    # 优先从文章内 h1 提取
    m = re.search(r'<h1 class="post-title">(.*?)</h1>', html, flags=re.DOTALL)
    if m:
        return re.sub(r'\s+', ' ', m.group(1)).strip()

    # 回退：<title>xxxxx - 筑居思</title>
    m = re.search(r'<title>([^<]+)</title>', html)
    if m:
        return m.group(1).replace(' - 筑居思', '').strip()
    return ''


def extract_date_from_filename(filename: str) -> str:
    stem = Path(filename).stem
    m = re.match(r'^(\d{4}-\d{2}-\d{2})', stem)
    return m.group(1) if m else ''


def plan_renames(title_to_slug: Dict[str, str]) -> List[Tuple[Path, Path]]:
    plans: List[Tuple[Path, Path]] = []
    for html in sorted(BLOGS_DIR.glob('*.html')):
        title = extract_html_title(html)
        if not title:
            continue
        slug = title_to_slug.get(title)
        if not slug:
            continue

        date_prefix = extract_date_from_filename(html.name)
        if date_prefix:
            new_name = f"{date_prefix}-{slug}.html"
        else:
            # 没有日期，则仅替换主体
            new_name = f"{slug}.html"

        if new_name != html.name:
            plans.append((html, html.with_name(new_name)))
    return plans


def update_references(renames: List[Tuple[Path, Path]]):
    if not renames:
        return
    # 构建替换对
    pairs = [(f"blogs/{old.name}", f"blogs/{new.name}") for old, new in renames]

    # 遍历站点下所有 .html/.xml 文件进行替换
    for path in SITE_ROOT.rglob('*'):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {'.html', '.xml'}:
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


def main():
    config = load_config()
    vault_path = config.get('obsidian_vault')
    if not vault_path:
        print('❌ blog_config.json 未配置 obsidian_vault')
        return 1

    vault_dir = Path(vault_path)
    if not vault_dir.exists():
        print(f'❌ Obsidian 路径不存在: {vault_dir}')
        return 1

    # 加载手动映射
    manual_mapping = load_title_mapping()
    print(f'📋 已加载 {len(manual_mapping)} 个手动标题映射')
    
    title_to_slug = build_title_to_slug_from_obsidian(vault_dir, manual_mapping)
    if not title_to_slug:
        print('❌ 未从 Obsidian 提取到任何标题与 slug')
        return 1

    renames = plan_renames(title_to_slug)
    if not renames:
        print('ℹ️ 没有需要重命名的文件')
        return 0

    print('即将重命名以下文件：')
    for old, new in renames:
        print(f' - {old.name} -> {new.name}')

    # 执行重命名
    for old, new in renames:
        old.rename(new)

    # 更新全站引用
    update_references(renames)

    print(f'✅ 已完成重命名与引用更新，共 {len(renames)} 个文件')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())


