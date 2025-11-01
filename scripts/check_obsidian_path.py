#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查Obsidian路径配置是否正确
"""

import os
import json
from pathlib import Path

SITE_ROOT = Path(__file__).parent.parent
CONFIG_FILE = SITE_ROOT / 'blog_config.json'

def check_obsidian_config():
    """检查Obsidian配置"""
    print("检查Obsidian路径配置...")
    print("=" * 60)
    
    if not os.path.exists(CONFIG_FILE):
        print("❌ 配置文件不存在: blog_config.json")
        return False
    
    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)
    except Exception as e:
        print(f"❌ 配置文件读取失败: {e}")
        return False
    
    # 检查Obsidian库路径
    obsidian_vault = config.get('obsidian_vault', '')
    if obsidian_vault:
        print(f"\n📍 Obsidian库路径: {obsidian_vault}")
        if os.path.exists(obsidian_vault):
            print("✅ 路径存在")
            
            # 列出目录内容
            try:
                files = os.listdir(obsidian_vault)
                md_files = [f for f in files if f.endswith('.md')]
                print(f"   - 找到 {len(md_files)} 个Markdown文件")
                if md_files[:5]:  # 显示前5个
                    print("   - 示例文件:")
                    for f in md_files[:5]:
                        print(f"     • {f}")
            except:
                pass
        else:
            print("❌ 路径不存在！")
            print("   请更新 blog_config.json 中的 'obsidian_vault' 配置")
            print("   参考: OBSIDIAN路径配置.md")
            return False
    else:
        print("⚠️  未配置Obsidian库路径")
    
    # 检查附件目录
    print("\n📎 附件目录:")
    attachments = config.get('obsidian_attachments', [])
    if attachments:
        for attach_dir in attachments:
            if attach_dir and attach_dir.strip():
                if os.path.exists(attach_dir):
                    print(f"✅ {attach_dir}")
                else:
                    print(f"⚠️  {attach_dir} (不存在，可选)")
    else:
        print("⚠️  未配置附件目录（可选）")
    
    print("\n" + "=" * 60)
    print("✅ 配置检查完成")
    return True

if __name__ == '__main__':
    check_obsidian_config()

