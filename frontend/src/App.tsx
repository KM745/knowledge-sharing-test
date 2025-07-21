import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

type Page = 'list' | 'detail' | 'create' | 'edit' | 'chat';
type Knowledge = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  date: string;
  author: string;
};

function App() {
  const [page, setPage] = useState<Page>('list');
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Knowledge | null>(null);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  // 新規・編集用の状態
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  // AIチャット用の状態
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detail, setDetail] = useState<Knowledge | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const editorRef = useRef<Editor>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const editEditorRef = useRef<Editor>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [editFormTags, setEditFormTags] = useState<string[]>([]);

  const tagOptions = ['業務', 'システム', 'トラブル', 'FAQ', '用語', '教育'];

  // APIからナレッジ一覧を取得
  useEffect(() => {
    if (page !== 'list') return;
    setLoading(true);
    setError('');
    fetch('http://localhost:8000/knowledges')
      .then(res => {
        if (!res.ok) throw new Error('APIエラー');
        return res.json();
      })
      .then(data => setKnowledges(data))
      .catch(() => setError('ナレッジ一覧の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [page]);

  // 詳細データ取得（page, selectedが変わったとき）
  useEffect(() => {
    if (page === 'detail' && selected) {
      setDetailLoading(true);
      setDetailError('');
      fetch(`http://localhost:8000/knowledges/${selected.id}`)
        .then(res => {
          if (!res.ok) throw new Error('APIエラー');
          return res.json();
        })
        .then(data => setDetail(data))
        .catch(() => setDetailError('詳細の取得に失敗しました'))
        .finally(() => setDetailLoading(false));
    } else {
      setDetail(null);
      setDetailLoading(false);
      setDetailError('');
    }
  }, [page, selected]);

  // 新規登録画面へ
  const goCreate = () => {
    setFormTitle('');
    setFormContent('');
    setFormTag('');
    setPage('create');
  };

  // 編集画面へ
  const goEdit = (k: Knowledge) => {
    setFormTitle(k.title);
    setFormContent(k.content);
    setFormTag(k.tags[0] || '');
    setSelected(k);
    setPage('edit');
  };

  // 登録処理
  const handleCreate = () => {
    if (!formTitle.trim()) return alert('タイトルは必須です');
    const newKnowledge = {
      id: knowledges.length ? Math.max(...knowledges.map(k => k.id)) + 1 : 1,
      title: formTitle,
      content: formContent,
      tags: formTag ? [formTag] : [],
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      author: 'テストユーザー',
    };
    setKnowledges([newKnowledge, ...knowledges]);
    setPage('list');
  };

  // 編集処理
  const handleEdit = () => {
    if (!selected) return;
    setKnowledges(knowledges.map(k => k.id === selected.id ? {
      ...k,
      title: formTitle,
      content: formContent,
      tags: formTag ? [formTag] : [],
    } : k));
    setPage('list');
  };

  // 削除処理
  const handleDelete = () => {
    if (!selected) return;
    const confirm1 = window.confirm('本当に削除しますか？');
    if (!confirm1) return;
    const confirm2 = window.prompt('削除する場合はタイトルを入力してください');
    if (confirm2 !== selected.title) {
      alert('タイトルが一致しません。削除を中止しました。');
      return;
    }
    setKnowledges(knowledges.filter(k => k.id !== selected.id));
    setPage('list');
  };

  // 一覧画面
  if (page === 'list') {
    return (
      <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />
          <select value={tag} onChange={e => setTag(e.target.value)} style={{ padding: 8 }}>
            <option value="">タグ選択</option>
            <option value="業務">業務</option>
            <option value="システム">システム</option>
            <option value="トラブル">トラブル</option>
            <option value="FAQ">FAQ</option>
            <option value="用語">用語</option>
            <option value="教育">教育</option>
          </select>
          <button style={{ padding: 8 }} onClick={() => setPage('create')}>新規登録</button>
          <button style={{ padding: 8 }} onClick={() => setPage('chat')}>AIチャット</button>
        </div>
        {loading ? (
          <div>読み込み中...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>タイトル</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>タグ</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>日付</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>作成者</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              {knowledges
                .filter(k =>
                  (!search || k.title.includes(search)) &&
                  (!tag || k.tags.includes(tag))
                )
                .map(k => (
                  <tr key={k.id}>
                    <td style={{ padding: 8 }}>{k.title}</td>
                    <td style={{ padding: 8 }}>{k.tags.map(t => <span key={t} className="tag-badge">{t}</span>)}</td>
                    <td style={{ padding: 8 }}>{k.date}</td>
                    <td style={{ padding: 8 }}>{k.author}</td>
                    <td style={{ padding: 8 }}><button onClick={() => { setSelected(k); setPage('detail'); }}>詳細</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // 詳細画面
  if (page === 'detail' && selected) {
    if (detailLoading) return <div style={{ maxWidth: 600, margin: '2rem auto' }}>読み込み中...</div>;
    if (detailError) return <div style={{ maxWidth: 600, margin: '2rem auto', color: 'red' }}>{detailError}</div>;
    if (!detail) return null;
    const html = DOMPurify.sanitize(marked.parse(detail.content || '', { async: false }));
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
        <h2>{detail.title}</h2>
        <div style={{ marginBottom: 8 }}>{detail.tags.map(t => <span key={t} className="tag-badge">{t}</span>)}</div>
        <div style={{ color: '#888', marginBottom: 8 }}>{detail.date} 作成者: {detail.author}</div>
        <div style={{ marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: html }} />
        <button style={{ marginRight: 8 }} onClick={() => {
          setFormTitle(detail.title);
          setEditFormTags(detail.tags);
          setPage('edit');
          setSelected(detail);
        }}>編集</button>
        <button style={{ marginRight: 8 }} onClick={async () => {
          if (!detail) return;
          setDeleteError('');
          const confirm1 = window.confirm('本当に削除しますか？');
          if (!confirm1) return;
          const confirm2 = window.prompt('削除する場合はタイトルを入力してください');
          if (confirm2 !== detail.title) {
            alert('タイトルが一致しません。削除を中止しました。');
            return;
          }
          setDeleteLoading(true);
          try {
            const res = await fetch(`http://localhost:8000/knowledges/${detail.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('APIエラー');
            setPage('list');
          } catch {
            setDeleteError('削除に失敗しました');
          } finally {
            setDeleteLoading(false);
          }
        }} disabled={deleteLoading}>削除</button>
        {deleteError && <div style={{ color: 'red', marginBottom: 8 }}>{deleteError}</div>}
        <button onClick={() => setPage('list')}>一覧に戻る</button>
      </div>
    );
  }

  // 新規登録画面
  if (page === 'create') {
    const handleTagChange = (tag: string) => {
      setFormTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    const handleCreate = async () => {
      if (!formTitle.trim()) {
        setCreateError('タイトルは必須です');
        return;
      }
      const content = editorRef.current?.getInstance().getMarkdown() || '';
      setCreateLoading(true);
      setCreateError('');
      try {
        const res = await fetch('http://localhost:8000/knowledges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            content,
            tags: formTags,
            date: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
            author: 'テストユーザー',
          }),
        });
        if (!res.ok) throw new Error('APIエラー');
        setPage('list'); // 一覧に戻る（一覧はuseEffectで再取得）
      } catch {
        setCreateError('登録に失敗しました');
      } finally {
        setCreateLoading(false);
      }
    };
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
        <h2>ナレッジ新規登録</h2>
        <div style={{ marginBottom: 8 }}>
          <input
            type="text"
            placeholder="タイトル"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <Editor
            ref={editorRef}
            initialValue=""
            previewStyle="vertical"
            height="300px"
            initialEditType="wysiwyg"
            useCommandShortcut={true}
            placeholder="本文（Markdown形式可）"
          />
          <div style={{ margin: '8px 0' }}>
            <span>タグ:</span>
            {tagOptions.map(tag => (
              <label key={tag} style={{ marginRight: 8 }}>
                <input
                  type="checkbox"
                  checked={formTags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>
        {createError && <div style={{ color: 'red', marginBottom: 8 }}>{createError}</div>}
        <button style={{ marginRight: 8 }} onClick={handleCreate} disabled={createLoading}>{createLoading ? '登録中...' : '登録'}</button>
        <button onClick={() => setPage('list')} disabled={createLoading}>キャンセル</button>
      </div>
    );
  }

  // 編集画面
  if (page === 'edit' && selected) {
    const handleEditTagChange = (tag: string) => {
      setEditFormTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    const handleEdit = async () => {
      if (!formTitle.trim()) {
        setEditError('タイトルは必須です');
        return;
      }
      const content = editEditorRef.current?.getInstance().getMarkdown() || '';
      setEditLoading(true);
      setEditError('');
      try {
        const res = await fetch(`http://localhost:8000/knowledges/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            content,
            tags: editFormTags,
            date: selected.date,
            author: selected.author,
          }),
        });
        if (!res.ok) throw new Error('APIエラー');
        setPage('list');
      } catch {
        setEditError('更新に失敗しました');
      } finally {
        setEditLoading(false);
      }
    };
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
        <h2>ナレッジ編集</h2>
        <div style={{ marginBottom: 8 }}>
          <input
            type="text"
            placeholder="タイトル"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <Editor
            ref={editEditorRef}
            initialValue={selected.content}
            previewStyle="vertical"
            height="300px"
            initialEditType="wysiwyg"
            useCommandShortcut={true}
            placeholder="本文（Markdown形式可）"
          />
          <div style={{ margin: '8px 0' }}>
            <span>タグ:</span>
            {tagOptions.map(tag => (
              <label key={tag} style={{ marginRight: 8 }}>
                <input
                  type="checkbox"
                  checked={editFormTags.includes(tag)}
                  onChange={() => handleEditTagChange(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>
        {editError && <div style={{ color: 'red', marginBottom: 8 }}>{editError}</div>}
        <button style={{ marginRight: 8 }} onClick={handleEdit} disabled={editLoading}>{editLoading ? '更新中...' : '更新'}</button>
        <button onClick={() => setPage('list')} disabled={editLoading}>キャンセル</button>
      </div>
    );
  }

  // AIチャット画面
  if (page === 'chat') {
    const handleSend = () => {
      if (!chatQuestion.trim()) return;
      setChatAnswer('ご質問ありがとうございます。AI回答のサンプルです。\n（本番ではナレッジをもとにAIが回答します）');
    };
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
        <h2>AIチャット</h2>
        <div style={{ marginBottom: 8 }}>
          <textarea
            placeholder="質問を入力してください"
            value={chatQuestion}
            onChange={e => setChatQuestion(e.target.value)}
            style={{ width: '100%', height: 60, padding: 8, marginBottom: 8 }}
          />
        </div>
        <button style={{ marginRight: 8 }} onClick={handleSend}>送信</button>
        <button onClick={() => setPage('list')}>一覧に戻る</button>
        {chatAnswer && (
          <div style={{ marginTop: 24, background: '#f6f6f6', padding: 16, borderRadius: 8 }}>
            <strong>AIの回答:</strong>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{chatAnswer}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default App;
