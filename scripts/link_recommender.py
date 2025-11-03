#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
语义内链推荐（本地无依赖版）

功能：
- 构建 blogs 目录下文章的简易 TF‑IDF 语义索引（标题 + 前200字）
- 对输入文章（.md 或 .html）提取候选关键词，并检索相似文章
- 生成 Markdown 表格报告，不直接改动原文

使用：
  1) 构建索引：
     python3 scripts/link_recommender.py build-index \
       --root "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com" \
       --blogs_dir "blogs" \
       --out "scripts/link_index.json"

  2) 推荐：
     python3 scripts/link_recommender.py suggest \
       --index "scripts/link_index.json" \
       --input "/absolute/path/to/your_draft.md" \
       --report "scripts/link_suggestions_REPORT.md"
"""

import argparse
import json
import math
import os
import re
from collections import Counter, defaultdict
from html import unescape


CH_STOP = set("的一是在不了有和就都而及与为之于亦也又还很及及其并并且或如果那么则被把向给等这那那些这些因为所以通过可能可以与及".split())
EN_STOP = set("the a an and or but if then else when while of for to in on at by with as is are was were be been being this that these those from into over under about can could should would may might not no yes just very more most less least same different other another which who whom whose where why how".split())


def read_file_text(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()


def strip_html(html: str) -> str:
    text = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def extract_title(html: str) -> str:
    m = re.search(r"<title>([\s\S]*?)</title>", html, flags=re.I)
    if m:
        return re.sub(r"\s+", " ", unescape(m.group(1))).strip()
    m = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", html, flags=re.I)
    if m:
        return re.sub(r"\s+", " ", strip_html(m.group(1))).strip()
    return ""


def extract_description(html: str) -> str:
    m = re.search(r"<meta[^>]+name=\"description\"[^>]+content=\"([^"]*)\"", html, flags=re.I)
    if m:
        return m.group(1).strip()
    text = strip_html(html)
    return text[:150]


def tokenize(text: str):
    # 英文单词
    en = re.findall(r"[A-Za-z][A-Za-z\-]{2,}", text)
    # 连续中文字符（2~6长度）作为词干
    zh_stream = re.findall(r"[\u4e00-\u9fff]+", text)
    zh_terms = []
    for seg in zh_stream:
        if len(seg) < 2:
            continue
        # 取滑动窗口 n-gram（2~4）
        max_n = 4 if len(seg) >= 4 else len(seg)
        for n in range(2, max_n + 1):
            for i in range(0, len(seg) - n + 1):
                zh_terms.append(seg[i:i+n])
    tokens = [t.lower() for t in en] + zh_terms
    # 去停用词
    filtered = []
    for t in tokens:
        if re.match(r"^[a-z\-]+$", t) and t in EN_STOP:
            continue
        if re.search(r"[\u4e00-\u9fff]", t) and t in CH_STOP:
            continue
        filtered.append(t)
    return filtered


def tf_idf_vectors(docs_tokens):
    N = len(docs_tokens)
    df = Counter()
    for tokens in docs_tokens:
        df.update(set(tokens))

    vectors = []
    for tokens in docs_tokens:
        tf = Counter(tokens)
        vec = {}
        for term, f in tf.items():
            idf = math.log((N + 1) / (df[term] + 1)) + 1.0
            vec[term] = (f / len(tokens)) * idf
        # 归一化
        norm = math.sqrt(sum(v*v for v in vec.values())) or 1.0
        for k in list(vec.keys()):
            vec[k] /= norm
        vectors.append(vec)
    return vectors, df, N


def cosine_sim(vec_a, vec_b):
    if not vec_a or not vec_b:
        return 0.0
    # 迭代较短的那个
    if len(vec_a) > len(vec_b):
        vec_a, vec_b = vec_b, vec_a
    s = 0.0
    for k, v in vec_a.items():
        if k in vec_b:
            s += v * vec_b[k]
    return s


def build_index(root_dir: str, blogs_dir: str, out_path: str):
    base = os.path.abspath(root_dir)
    blog_dir = os.path.join(base, blogs_dir)
    entries = []

    for name in os.listdir(blog_dir):
        if not name.lower().endswith('.html'):
            continue
        fpath = os.path.join(blog_dir, name)
        html = read_file_text(fpath)
        title = extract_title(html)
        text = strip_html(html)
        snippet = text[:200]
        tokens = tokenize((title + ' ' + snippet).strip())
        rel = os.path.relpath(fpath, base).replace(os.sep, '/')
        slug = '/' + rel
        desc = extract_description(html)
        entries.append({
            'path': rel,
            'slug': slug,
            'title': title,
            'desc': desc,
            'tokens': tokens
        })

    vectors, df, N = tf_idf_vectors([e['tokens'] for e in entries])
    for e, v in zip(entries, vectors):
        e['vector'] = v
        del e['tokens']

    data = {
        'built_from': blog_dir,
        'doc_count': N,
        'df': df,  # json 不支持 Counter，下面转普通 dict
        'entries': entries
    }
    data['df'] = {k: int(v) for k, v in data['df'].items()}

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Index written: {out_path} ({N} docs)")


def extract_unlinked_text(md_or_html: str) -> str:
    s = md_or_html
    # 去掉 Markdown 链接 [text](url)
    s = re.sub(r"\[[^\]]+\]\([^\)]+\)", " ", s)
    # 去掉 HTML 链接 <a ...>text</a>
    s = re.sub(r"<a[\s\S]*?>[\s\S]*?</a>", " ", s, flags=re.I)
    return s


def vectorize_query_terms(terms, df, N):
    tokens = list(terms)
    tf = Counter(tokens)
    vec = {}
    for term, f in tf.items():
        idf = math.log((N + 1) / (df.get(term, 0) + 1)) + 1.0
        vec[term] = (f / len(tokens)) * idf
    norm = math.sqrt(sum(v*v for v in vec.values())) or 1.0
    for k in list(vec.keys()):
        vec[k] /= norm
    return vec


def suggest(index_path: str, input_path: str, report_path: str, topk_per_term=3, threshold=0.7):
    with open(index_path, 'r', encoding='utf-8') as f:
        idx = json.load(f)
    df = idx['df']
    N = idx['doc_count']
    entries = idx['entries']

    content = read_file_text(input_path)
    # 提取候选关键词：使用未加链接的文本，tf-idf TopN
    source_text = content
    if input_path.lower().endswith('.html'):
        text_for_terms = strip_html(extract_unlinked_text(source_text))
    else:
        text_for_terms = re.sub(r"\s+", " ", extract_unlinked_text(source_text)).strip()

    tokens = tokenize(text_for_terms)
    if not tokens:
        print("No tokens in input.")
        return
    tf = Counter(tokens)
    # 根据 tf * idf 排序，取前 12 个作为候选“概念词”
    scored_terms = []
    for term, f in tf.items():
        idf = math.log((N + 1) / (df.get(term, 0) + 1)) + 1.0
        scored_terms.append((term, (f / len(tokens)) * idf))
    scored_terms.sort(key=lambda x: x[1], reverse=True)
    candidate_terms = [t for t, _ in scored_terms[:12]]

    # 各候选词向量检索
    entry_vectors = [e['vector'] for e in entries]

    def best_for(term):
        qv = vectorize_query_terms([term], df, N)
        sims = [(i, cosine_sim(qv, entry_vectors[i])) for i in range(len(entries))]
        sims.sort(key=lambda x: x[1], reverse=True)
        # 过滤阈值
        top = [(entries[i]['slug'], entries[i]['title'], entries[i]['desc'], s) for i, s in sims[:topk_per_term] if s >= threshold]
        return top

    rows = []
    for term in candidate_terms:
        recs = best_for(term)
        if not recs:
            continue
        for slug, title, desc, score in recs:
            tip = (desc or title or '').strip()[:24]  # 简短 tip 截断
            rows.append((term, slug, score, tip))

    # 生成 Markdown 报告
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('| 识别到的词语 | 推荐文章 Slug | 相似度得分 | 建议 tip 内容 |\n')
        f.write('| :---: | :---: | :---: | :---: |\n')
        for term, slug, score, tip in rows:
            f.write(f"| **{term}** | `{slug}` | {score:.2f} | {tip} |\n")
    print(f"Report written: {report_path} ({len(rows)} rows)")


def main():
    p = argparse.ArgumentParser(description='语义内链推荐（无依赖版）')
    sub = p.add_subparsers(dest='cmd', required=True)

    p_build = sub.add_parser('build-index', help='构建索引')
    p_build.add_argument('--root', required=True, help='网站根目录')
    p_build.add_argument('--blogs_dir', default='blogs', help='相对根目录的博客目录')
    p_build.add_argument('--out', default='scripts/link_index.json', help='索引输出路径')

    p_suggest = sub.add_parser('suggest', help='生成推荐')
    p_suggest.add_argument('--index', required=True, help='索引文件路径')
    p_suggest.add_argument('--input', required=True, help='输入的 .md 或 .html 文件')
    p_suggest.add_argument('--report', default='scripts/link_suggestions_REPORT.md', help='报告输出路径')
    p_suggest.add_argument('--topk', type=int, default=3)
    p_suggest.add_argument('--threshold', type=float, default=0.7)

    args = p.parse_args()
    if args.cmd == 'build-index':
        build_index(args.root, args.blogs_dir, args.out)
    elif args.cmd == 'suggest':
        suggest(args.index, args.input, args.report, args.topk, args.threshold)


if __name__ == '__main__':
    main()


