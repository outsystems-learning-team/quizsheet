# プロジェクト README

このドキュメントでは、プロジェクトのファイル構成と各フォルダ／ファイルの役割をまとめています。

---

## プロジェクト全体

```
C:.
│  .gitignore
│  package.json
│
├─backend
│  │  .clasp.json
│  │  appsscript.json
│  │  package-lock.json
│  │  package.json
│  │  tsconfig.json
│  │
│  └─src
│          index.ts
│
├─frontend
│  │  .gitignore
│  │  eslint.config.mjs
│  │  middleware.ts
│  │  next.config.ts
│  │  package-lock.json
│  │  package.json
│  │  postcss.config.mjs
│  │  README.md
│  │  tailwind.config.ts
│  │  tsconfig.json
│  │
│  ├─public
│  │      file.svg
│  │      globe.svg
│  │      next.svg
│  │      vercel.svg
│  │      window.svg
│  │
│  └─src
│      ├─app
│      │  │  favicon.ico
│      │  │  globals.css
│      │  │  layout.tsx
│      │  │  page.tsx
│      │  │
│      │  ├─api
│      │  │  └─quiz
│      │  │          route.ts
│      │  │
│      │  ├─quiz
│      │  │      page.tsx
│      │  │      QuizClient.tsx
│      │  │
│      │  └─start
│      │          page.tsx
│      │
│      ├─components
│      │      CategorySelector.tsx
│      │      QuestionCard.tsx
│      │      QuestionFooter.tsx
│      │
│      ├─context
│      │      QuizContext.tsx
│      │
│      ├─hooks
│      │      useQuizClient.ts
│      │      useQuizSetup.ts
│      │
│      └─lib
│              api.ts
│
└─shared
        types.d.ts
```

### ルート直下

* **.gitignore**
  Git管理から除外するファイル・フォルダを定義します。

* **package.json**
  プロジェクト全体の依存関係およびスクリプトを管理する設定ファイルです。

---

## backend ディレクトリ

Google Apps Script（GAS）を用いたバックエンド処理を管理します。

* **.clasp.json**
  clasp（GAS開発ツール）の設定ファイル。プロジェクトIDや認証情報を指定します。

* **appsscript.json**
  GASプロジェクトのメタ情報（スクリプトID、実行権限など）を記述します。

* **package-lock.json**, **package.json**
  Node.js依存関係のバージョン固定および管理。

* **tsconfig.json**
  TypeScriptコンパイラのオプションを定義します。

* **src/index.ts**
  バックエンドのエントリポイント。GAS上で動作する関数やAPIハンドラを実装します。

---

## frontend ディレクトリ

Next.js／TypeScript／TailwindCSSを用いたフロントエンドアプリケーションです。

### 設定ファイル

* **.gitignore**
  フロントエンド側のGit除外設定。

* **eslint.config.mjs**
  ESLintの設定ファイル。

* **postcss.config.mjs**
  PostCSSの設定。

* **tailwind.config.ts**
  Tailwind CSSのカスタマイズ設定。

* **tsconfig.json**
  TypeScriptコンパイラのオプション。

* **next.config.ts**
  Next.js固有のビルド・設定オプション。

* **middleware.ts**
  Next.jsのEdge Middlewareを実装するためのファイル。

### 公開リソース (`public`)

SVGなどの静的ファイルを配置します。アプリケーションから直接参照可能です。

* **file.svg, globe.svg, next.svg, vercel.svg, window\.svg**

### ソースコード (`src`)

#### app フォルダ

Next.jsのApp Routerに対応したルートおよびレイアウトを配置。

* **favicon.ico**
  ブラウザタブに表示されるアイコン。

* **globals.css**
  全体適用するグローバルCSS。

* **layout.tsx**
  ページ共通レイアウト（ヘッダー、フッター、メタ情報など）を定義。

* **page.tsx**
  ルートパス(`/`)用のページコンポーネント。

##### API ルート

* **api/quiz/route.ts**
  クイズデータを提供するAPIエンドポイント。

##### その他のページ

* **quiz/page.tsx**, **QuizClient.tsx**
  クイズ問題の表示およびクライアントロジックを実装。

* **start/page.tsx**
  クイズ開始前のスタート画面を実装。

#### components フォルダ

再利用可能なUIコンポーネントを配置。

* **CategorySelector.tsx**
  クイズカテゴリ選択用ドロップダウン。

* **QuestionCard.tsx**
  問題文および選択肢を表示するカードコンポーネント。

* **QuestionFooter.tsx**
  次へ進むボタンやタイマーなどのフッターUI。

#### context フォルダ

React Contextによる状態管理を実装。

* **QuizContext.tsx**
  現在の問題番号やスコアなどをグローバルに管理。

#### hooks フォルダ

カスタムフックを配置。

* **useQuizClient.ts**
  APIからクイズを取得し、コンテキストに反映するロジック。

* **useQuizSetup.ts**
  クイズの初期化処理（カテゴリ設定やタイマーセットアップ）を実装。

#### lib フォルダ

共通ユーティリティやAPIクライアントを配置。

* **api.ts**
  HTTPリクエストを行うラッパー関数を実装。

---

## shared ディレクトリ

* **types.d.ts**
  TypeScriptの共有型定義をまとめたファイル。フロント／バックエンド両方で利用。
