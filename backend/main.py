from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発中は * でOK
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sample_knowledges = [
    {
        "id": 1,
        "title": "社内システムの使い方",
        "content": "# 社内システムの使い方\n\n1. 【ログイン】\n   - 社内ポータルのURLにアクセス\n   - 社員番号と初期パスワードでログイン\n2. 【パスワード変更】\n   - 初回ログイン時はパスワード変更を求められる\n   - 新しいパスワードを設定\n3. 【メニュー操作】\n   - 『勤怠管理』『経費精算』『社内掲示板』などのメニューを利用\n4. 【勤怠入力】\n   - 毎日出退勤時刻を入力\n   - 月末に申請ボタンを押す\n5. 【FAQ】\n   - よくある質問は『ヘルプ』メニュー参照\n\n## 注意\n- パスワードは定期的に変更\n- 不明点はシステム管理者まで\n",
        "tags": ["業務", "システム"],
        "date": "2024/07/21",
        "author": "山田",
    },
    {
        "id": 2,
        "title": "トラブルシューティング集",
        "content": "# トラブルシューティング集\n\n1. 【PCが起動しない】\n   - 電源ケーブル・バッテリーを確認\n   - 長押しで強制再起動\n   - それでもダメならIT担当へ連絡\n2. 【メールが送信できない】\n   - ネットワーク接続を確認\n   - Outlook再起動\n   - 送信容量制限に注意\n3. 【印刷できない】\n   - プリンタの電源・用紙・トナー確認\n   - ドライバ再インストール\n   - 共有プリンタの場合は他部署にも確認\n\n## 連絡先\n- ITヘルプデスク: it-help@example.com\n- 緊急時は内線1234\n",
        "tags": ["トラブル", "FAQ"],
        "date": "2024/07/20",
        "author": "佐藤",
    },
    {
        "id": 3,
        "title": "新入社員向け業務フロー",
        "content": "# 新入社員向け 業務フロー\n\n1. 【出社】\n   - 9:00までに出社し、タイムカードを打刻\n2. 【朝会】\n   - 9:10からチーム朝会に参加\n   - 進捗・連絡事項を共有\n3. 【メール確認】\n   - 社内メール・Teamsを確認\n4. 【日次業務】\n   - 前日のタスク整理\n   - 担当案件の進捗入力\n5. 【昼休憩】\n   - 12:00～13:00\n6. 【午後業務】\n   - 会議参加、資料作成、顧客対応など\n7. 【退社】\n   - 18:00以降、日報を記入し退社\n\n## 補足\n- 困ったときは必ず先輩・上司に相談\n- 詳細な手順は『社内マニュアル』参照\n",
        "tags": ["業務", "教育"],
        "date": "2024/07/19",
        "author": "鈴木",
    },
    {
        "id": 4,
        "title": "パスワードリセット手順",
        "content": "# パスワードリセット手順\n\n1. 【パスワードを忘れた場合】\n   - ログイン画面の『パスワードを忘れた方はこちら』をクリック\n   - 登録済みメールアドレスを入力\n   - 届いたメールのリンクから新しいパスワードを設定\n2. 【システム管理者に依頼】\n   - 自力でリセットできない場合はIT担当に依頼\n   - 本人確認のため社員証を提示\n3. 【再ログイン】\n   - 新しいパスワードで再度ログイン\n   - 問題があればIT担当まで\n\n## 注意\n- パスワードは他人に教えない\n- 使い回しは避ける\n",
        "tags": ["システム", "トラブル"],
        "date": "2024/07/18",
        "author": "田中",
    },
    {
        "id": 5,
        "title": "MTG（ミーティング）",
        "content": "# MTG（ミーティング）\n\n- 意味：会議、打ち合わせの略称\n- 使い方例：「明日のMTGは10時からです」\n- 補足：社内外問わずよく使われる\n",
        "tags": ["用語", "FAQ"],
        "date": "2024/07/17",
        "author": "高橋",
    },
    {
        "id": 6,
        "title": "PJ（プロジェクト）",
        "content": "# PJ（プロジェクト）\n\n- 意味：プロジェクトの略称\n- 使い方例：「このPJのKPIを設定しましょう」\n- 補足：案件やチーム単位で使われる\n",
        "tags": ["用語", "FAQ"],
        "date": "2024/07/17",
        "author": "高橋",
    },
    {
        "id": 7,
        "title": "KPI（重要業績評価指標）",
        "content": "# KPI（重要業績評価指標）\n\n- 意味：Key Performance Indicatorの略\n- 使い方例：「今月のKPIを達成しましょう」\n- 補足：目標管理や評価で使われる\n",
        "tags": ["用語", "FAQ"],
        "date": "2024/07/17",
        "author": "高橋",
    },
    {
        "id": 8,
        "title": "リスケ（スケジュール再調整）",
        "content": "# リスケ（スケジュール再調整）\n\n- 意味：Rescheduleの略。予定変更のこと\n- 使い方例：「会議をリスケします」\n- 補足：日程調整時によく使う\n",
        "tags": ["用語", "FAQ"],
        "date": "2024/07/17",
        "author": "高橋",
    },
    {
        "id": 9,
        "title": "アサイン（担当割り当て）",
        "content": "# アサイン（担当割り当て）\n\n- 意味：Assignのカタカナ語。担当を割り当てること\n- 使い方例：「このタスクを田中さんにアサインします」\n- 補足：プロジェクト管理で頻出\n",
        "tags": ["用語", "FAQ"],
        "date": "2024/07/17",
        "author": "高橋",
    },
    {
        "id": 10,
        "title": "エスカレーション",
        "content": "# エスカレーション\n\n- 意味：上位者への報告・相談\n- 使い方例：「トラブルはすぐエスカレーションしてください」\n- 補足：判断に迷う場合や緊急時に使う\n",
        "tags": ["用語", "FAQ"],
        "date": "2024/07/17",
        "author": "高橋",
    },
    {
        "id": 11,
        "title": "フィードバック",
        "content": "# フィードバック\n\n- 意味：意見・評価の伝達\n- 使い方例：「上司からフィードバックをもらう」\n- 補足：1on1や評価面談でよく使う\n",
        "tags": ["用語", "FAQ"],
        "date": "2024/07/17",
        "author": "高橋",
    },
]

@app.get("/knowledges")
def get_knowledges() -> List[dict]:
    return sample_knowledges

@app.get("/knowledges/{knowledge_id}")
def get_knowledge(knowledge_id: int) -> dict:
    for k in sample_knowledges:
        if k["id"] == knowledge_id:
            return k
    raise HTTPException(status_code=404, detail="Knowledge not found")

@app.post("/knowledges")
def create_knowledge(req: Request):
    data = req.json() if hasattr(req, 'json') else {}
    import asyncio
    async def get_json():
        return await req.json()
    data = asyncio.run(get_json())
    new_id = max([k["id"] for k in sample_knowledges], default=0) + 1
    new_knowledge = {
        "id": new_id,
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "tags": data.get("tags", []),
        "date": data.get("date", ""),
        "author": data.get("author", ""),
    }
    sample_knowledges.insert(0, new_knowledge)
    return new_knowledge

@app.put("/knowledges/{knowledge_id}")
def update_knowledge(knowledge_id: int, req: Request):
    import asyncio
    async def get_json():
        return await req.json()
    data = asyncio.run(get_json())
    for k in sample_knowledges:
        if k["id"] == knowledge_id:
            k["title"] = data.get("title", k["title"])
            k["content"] = data.get("content", k["content"])
            k["tags"] = data.get("tags", k["tags"])
            k["date"] = data.get("date", k["date"])
            k["author"] = data.get("author", k["author"])
            return k
    raise HTTPException(status_code=404, detail="Knowledge not found")

@app.delete("/knowledges/{knowledge_id}")
def delete_knowledge(knowledge_id: int):
    for i, k in enumerate(sample_knowledges):
        if k["id"] == knowledge_id:
            del sample_knowledges[i]
            return {"result": "deleted"}
    raise HTTPException(status_code=404, detail="Knowledge not found") 