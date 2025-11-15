#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量为所有博客文章添加统一的"🌱 灵感私语"尾注部分
"""

import os
import re
from pathlib import Path

# 目标目录
BLOGS_DIR = Path(__file__).parent.parent / "blogs"

# 统一的"灵感私语"部分（卡片样式）
WHISPER_INTRO = """                        <hr />
                        
                        <div class="whisper-intro-section">
                            <div class="whisper-intro-card">
                                <h3 id="_1">🌱 灵感私语</h3>
                                <p class="whisper-intro">叶芽之下，别有根系。</p>
                            </div>
                        </div>"""

def has_whisper_intro(content):
    """检查是否已经有"灵感私语"部分"""
    return "🌱 灵感私语" in content or "灵感私语" in content

def add_whisper_intro(file_path):
    """为单个文件添加"灵感私语"部分"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 如果已经有"灵感私语"部分，检查格式是否正确
        if has_whisper_intro(content):
            # 检查是否格式正确（包含"叶芽之下，别有根系"）
            if "叶芽之下，别有根系" in content and "whisper-intro-card" in content:
                print(f"✓ {file_path.name} 已有正确的灵感私语部分，跳过")
                return False
            
            # 如果有但格式不对，需要替换
            # 查找并替换旧的"灵感私语"部分（包括卡片和非卡片格式）
            patterns = [
                r'<hr\s*/>\s*<div[^>]*class="whisper-intro-section"[^>]*>.*?</div>\s*</div>',
                r'<hr\s*/>\s*<h3[^>]*>🌱\s*灵感私语</h3>\s*<p[^>]*>.*?</p>',
                r'<h3[^>]*>🌱\s*灵感私语</h3>\s*<p[^>]*>.*?</p>',
            ]
            
            for pattern in patterns:
                if re.search(pattern, content, re.DOTALL):
                    content = re.sub(pattern, WHISPER_INTRO.strip(), content, flags=re.DOTALL)
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"✓ {file_path.name} 已更新灵感私语格式")
                    return True
        
        # 查找 </div> 之前的位置（在 </article> 之前）
        # 匹配模式：在 </div> 之前，但在 </article> 之前
        pattern = r'(</div>\s*</article>)'
        
        if re.search(pattern, content):
            # 在 </div> 之前添加"灵感私语"部分
            replacement = WHISPER_INTRO + '\n                    ' + r'\1'
            content = re.sub(pattern, replacement, content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ {file_path.name} 已添加灵感私语部分")
            return True
        else:
            print(f"⚠ {file_path.name} 未找到匹配的结构，跳过")
            return False
            
    except Exception as e:
        print(f"✗ {file_path.name} 处理失败: {e}")
        return False

def main():
    """主函数"""
    if not BLOGS_DIR.exists():
        print(f"错误：目录不存在 {BLOGS_DIR}")
        return
    
    html_files = list(BLOGS_DIR.glob("*.html"))
    
    if not html_files:
        print("未找到任何 HTML 文件")
        return
    
    print(f"找到 {len(html_files)} 个博客文件\n")
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for file_path in sorted(html_files):
        result = add_whisper_intro(file_path)
        if result is True:
            success_count += 1
        elif result is False:
            skip_count += 1
        else:
            error_count += 1
    
    print(f"\n处理完成：")
    print(f"  ✓ 成功添加/更新: {success_count}")
    print(f"  ⊙ 跳过（已有正确格式）: {skip_count}")
    print(f"  ✗ 错误: {error_count}")

if __name__ == "__main__":
    main()

