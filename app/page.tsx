"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Algorithm } from "@/db/schema";

const categories = ["すべて", "探索", "データ構造", "グラフ", "動的計画法", "数学", "文字列"];
const languages = ["すべて", "C++", "Python", "Rust"];
type SyncState = "loading" | "idle" | "saving" | "saved" | "error";

export default function Home() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [category, setCategory] = useState("すべて");
  const [language, setLanguage] = useState("すべて");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [tab, setTab] = useState<"code" | "note">("code");
  const [showNew, setShowNew] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const searchRef = useRef<HTMLInputElement>(null);
  const saveTimers = useRef(new Map<number, number>());

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch("/api/algorithms", { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const items = (await response.json()) as Algorithm[];
        setAlgorithms(items);
        setSelectedId(items[0]?.id ?? null);
        setSyncState("idle");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setSyncState("error");
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const persistAlgorithm = useCallback(async (item: Algorithm) => {
    setSyncState("saving");
    try {
      const response = await fetch("/api/algorithms", {
        method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setSyncState("saved");
      window.setTimeout(() => setSyncState((current) => current === "saved" ? "idle" : current), 1400);
    } catch { setSyncState("error"); }
  }, []);

  const queueSave = useCallback((item: Algorithm) => {
    const previous = saveTimers.current.get(item.id);
    if (previous) window.clearTimeout(previous);
    setSyncState("saving");
    const timer = window.setTimeout(() => {
      saveTimers.current.delete(item.id);
      void persistAlgorithm(item);
    }, 500);
    saveTimers.current.set(item.id, timer);
  }, [persistAlgorithm]);

  useEffect(() => () => saveTimers.current.forEach((timer) => window.clearTimeout(timer)), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) {
        event.preventDefault(); searchRef.current?.focus();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        const item = algorithms.find((algorithm) => algorithm.id === selectedId);
        if (item) void persistAlgorithm(item);
      }
      if (event.key === "Escape") setShowNew(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [algorithms, persistAlgorithm, selectedId]);

  const counts = useMemo(() => Object.fromEntries(categories.map((cat) => [cat, cat === "すべて" ? algorithms.length : algorithms.filter((a) => a.category === cat).length])), [algorithms]);
  const filtered = useMemo(() => algorithms.filter((algo) => {
    const text = `${algo.title} ${algo.description} ${algo.tags.join(" ")}`.toLowerCase();
    return (category === "すべて" || algo.category === category) && (language === "すべて" || algo.language === language) && (!favoritesOnly || algo.favorite) && text.includes(query.toLowerCase());
  }), [algorithms, category, language, favoritesOnly, query]);
  const selected = algorithms.find((a) => a.id === selectedId) ?? filtered[0] ?? algorithms[0];

  const updateAlgorithm = (item: Algorithm, patch: Partial<Algorithm>) => {
    const updated = { ...item, ...patch, updatedAt: "たった今" };
    setAlgorithms((items) => items.map((candidate) => candidate.id === item.id ? updated : candidate));
    queueSave(updated);
  };
  const updateSelected = (patch: Partial<Algorithm>) => { if (selected) updateAlgorithm(selected, patch); };
  const addAlgorithm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const item = {
      title: String(data.get("title") || "無題のアルゴリズム"), category: String(data.get("category") || "探索"),
      language: String(data.get("language") || "C++"), complexity: String(data.get("complexity") || "O(?)"),
      description: "用途や注意点をここに記録しましょう。", code: "// Write your code here\n", tags: ["新規"], favorite: false, updatedAt: "たった今",
    };
    setSyncState("saving");
    try {
      const response = await fetch("/api/algorithms", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(item) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const created = (await response.json()) as Algorithm;
      setAlgorithms((items) => [created, ...items]); setSelectedId(created.id); setCategory("すべて"); setShowNew(false); setSyncState("saved");
    } catch { setSyncState("error"); }
  };
  const copyCode = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.code); setCopied(true); window.setTimeout(() => setCopied(false), 1400);
  };
  const syncLabel = syncState === "loading" ? "Cloudflare D1 から読込中…" : syncState === "saving" ? "Cloudflare D1 に保存中…" : syncState === "saved" ? "D1 に保存しました" : syncState === "error" ? "D1 との同期に失敗しました" : "";

  return <main className="app-shell">
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Algo Vault ホーム"><span className="brand-mark">A.</span><span>ALGO VAULT</span></Link>
      <div className="search-wrap"><span className="search-icon">⌕</span><input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="アルゴリズム、タグ、メモを検索..." aria-label="アルゴリズムを検索" /><kbd>/</kbd></div>
      <button className="new-button" onClick={() => setShowNew(true)}><span>＋</span> 新規追加</button>
    </header>
    <div className="workspace">
      <aside className="sidebar">
        <div className="side-label">LIBRARY</div>
        <nav aria-label="ライブラリ">
          <button className={category === "すべて" && !favoritesOnly ? "active" : ""} onClick={() => { setCategory("すべて"); setFavoritesOnly(false); }}><span><i className="nav-glyph">▦</i>すべて</span><b>{algorithms.length}</b></button>
          <button className={favoritesOnly ? "active" : ""} onClick={() => setFavoritesOnly(!favoritesOnly)}><span><i className="nav-glyph star">★</i>お気に入り</span><b>{algorithms.filter((a) => a.favorite).length}</b></button>
        </nav>
        <div className="side-label category-label">CATEGORY</div>
        <nav aria-label="カテゴリ">{categories.slice(1).map((cat, i) => <button key={cat} className={category === cat && !favoritesOnly ? "active" : ""} onClick={() => { setCategory(cat); setFavoritesOnly(false); }}><span><i className={`dot dot-${i}`} />{cat}</span><b>{counts[cat]}</b></button>)}</nav>
        <div className="shortcut-card"><span className="bolt">↯</span><div><strong>QUICK TIP</strong><p><kbd>⌘</kbd> + <kbd>S</kbd> ですばやく保存</p></div></div>
      </aside>
      <section className="library-panel">
        <div className="panel-head"><div><p className="eyebrow">YOUR LIBRARY</p><h1>{favoritesOnly ? "お気に入り" : category === "すべて" ? "すべてのアルゴリズム" : category}</h1></div><select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="言語で絞り込み">{languages.map((lang) => <option key={lang}>{lang}</option>)}</select></div>
        <div className="result-meta"><span>{filtered.length} ITEMS</span><span className="line" /><span>{syncLabel || "UPDATED RECENTLY"}</span></div>
        <div className="algorithm-list">
          {filtered.map((algo) => <button className={`algorithm-card ${selected?.id === algo.id ? "selected" : ""}`} key={algo.id} onClick={() => setSelectedId(algo.id)}>
            <span className="card-top"><span className="category-chip">{algo.category}</span><span className={`favorite ${algo.favorite ? "on" : ""}`}>★</span></span>
            <strong>{algo.title}</strong><span className="description">{algo.description}</span>
            <span className="card-bottom"><span className="language-dot"><i />{algo.language}</span><code>{algo.complexity}</code><time>{algo.updatedAt}</time></span>
          </button>)}
          {syncState === "loading" && <div className="empty"><span>↻</span><strong>Cloudflare D1 から読み込んでいます</strong></div>}
          {syncState !== "loading" && filtered.length === 0 && <div className="empty"><span>∅</span><strong>見つかりませんでした</strong><p>検索条件を変えてみてください。</p></div>}
        </div>
      </section>
      <section className="detail-panel">{selected && <>
        <div className="detail-head"><div className="breadcrumb"><span>{selected.category}</span><b>/</b><span>{selected.title}</span></div><button className={`detail-star ${selected.favorite ? "on" : ""}`} onClick={() => updateSelected({ favorite: !selected.favorite })} aria-label="お気に入りを切り替え">★</button><input className="title-input" value={selected.title} onChange={(e) => updateSelected({ title: e.target.value })} aria-label="タイトル" /><textarea className="desc-input" value={selected.description} onChange={(e) => updateSelected({ description: e.target.value })} aria-label="説明" /><div className="meta-row"><span>LANGUAGE <b>{selected.language}</b></span><span>COMPLEXITY <b>{selected.complexity}</b></span><span>UPDATED <b>{selected.updatedAt}</b></span></div></div>
        <div className="tabs"><button className={tab === "code" ? "active" : ""} onClick={() => setTab("code")}>コード</button><button className={tab === "note" ? "active" : ""} onClick={() => setTab("note")}>メモ</button><div className="tab-actions"><span className={syncState === "saved" || syncState === "error" ? "save-status show" : "save-status"}>{syncLabel}</span><button onClick={copyCode}>{copied ? "コピー済み ✓" : "コピー"}</button></div></div>
        {tab === "code" ? <div className="editor-wrap"><div className="editor-bar"><span>{selected.title.replace(/[（）\s]/g, "-").toLowerCase()}.cpp</span><span className="traffic"><i /><i /><i /></span></div><textarea className="code-editor" spellCheck={false} value={selected.code} onChange={(e) => updateSelected({ code: e.target.value })} aria-label="コードエディタ" /></div> : <div className="notes"><label htmlFor="algorithm-notes">使いどころ・注意点</label><textarea id="algorithm-notes" value={selected.description} onChange={(e) => updateSelected({ description: e.target.value })} /><label htmlFor="algorithm-tags">タグ</label><input id="algorithm-tags" value={selected.tags.join(", ")} onChange={(e) => updateSelected({ tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></div>}
        <div className="tags">{selected.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
      </>}</section>
    </div>
    {showNew && <div className="modal-backdrop"><form className="modal" onSubmit={(event) => void addAlgorithm(event)}><div className="modal-kicker">NEW SNIPPET</div><h2>アルゴリズムを追加</h2><label>名前<input name="title" placeholder="例：最大流 Dinic" required /></label><div className="form-grid"><label>カテゴリ<select name="category">{categories.slice(1).map((cat) => <option key={cat}>{cat}</option>)}</select></label><label>言語<select name="language">{languages.slice(1).map((lang) => <option key={lang}>{lang}</option>)}</select></label></div><label>計算量<input name="complexity" placeholder="O(N log N)" /></label><div className="modal-actions"><button type="button" onClick={() => setShowNew(false)}>キャンセル</button><button className="create" type="submit">追加する →</button></div></form></div>}
    <div className={syncState === "saved" || syncState === "error" ? "toast show" : "toast"}>{syncLabel}</div>
  </main>;
}
