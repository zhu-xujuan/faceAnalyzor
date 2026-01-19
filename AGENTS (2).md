# プロジェクト開発規範

## プロジェクト構造

### Next.js プロジェクトのフォルダ構造（ベストプラクティス）

```
project-root/
├── src/
│   ├── app/                          # App Router (Next.js 13+)
│   │   ├── (auth)/                   # Route Group（認証関連）
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (main)/                   # Route Group（メイン機能）
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── api/                      # API Routes
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   ├── layout.tsx                # Root Layout
│   │   ├── page.tsx                  # Home Page
│   │   ├── error.tsx                 # Error Page
│   │   ├── not-found.tsx             # 404 Page
│   │   └── loading.tsx               # Loading Page
│   │
│   ├── components/                   # React Components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── input.tsx
│   │   ├── features/                 # Feature-specific components
│   │   │   ├── auth/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── register-form.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── stats-card.tsx
│   │   │   │   └── recent-activity.tsx
│   │   │   └── profile/
│   │   │       └── profile-editor.tsx
│   │   ├── layouts/                  # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── sidebar.tsx
│   │   └── shared/                   # Shared components
│   │       ├── loading-spinner.tsx
│   │       └── error-boundary.tsx
│   │
│   ├── lib/                          # Utility functions & configurations
│   │   ├── utils/                    # Utility functions
│   │   │   ├── cn.ts                 # className utility
│   │   │   ├── date.ts               # Date utilities (dayjs)
│   │   │   ├── format.ts             # Format utilities
│   │   │   └── validation.ts         # Validation utilities
│   │   ├── api/                      # API client
│   │   │   ├── client.ts             # API client setup
│   │   │   └── endpoints.ts          # API endpoints
│   │   ├── db/                       # Database (if needed)
│   │   │   └── client.ts
│   │   └── constants.ts              # Constants
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── use-auth-store.ts
│   │   ├── use-ui-store.ts
│   │   └── use-cart-store.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-media-query.ts
│   │   ├── use-debounce.ts
│   │   └── use-local-storage.ts
│   │
│   ├── actions/                      # Server Actions (Next.js)
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── post.ts
│   │
│   └── middleware.ts                 # Next.js Middleware
│
├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local                        # Environment variables
├── .env.example                      # Environment variables example
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json
├── pnpm-lock.yaml
├── CLAUDE.md                         # Claude Code instructions
└── AGENTS.md                         # Codex CLI instructions
```

### React.js (Vite) プロジェクトのフォルダ構造（ベストプラクティス）

```
project-root/
├── src/
│   ├── pages/                        # Page components (React Router)
│   │   ├── home/
│   │   │   ├── index.tsx
│   │   │   └── components/          # Page-specific components
│   │   │       └── hero-section.tsx
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── dashboard/
│   │   │   └── index.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/                   # React Components
│   │   ├── ui/                       # UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── input.tsx
│   │   ├── features/                 # Feature-specific components
│   │   │   ├── auth/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── register-form.tsx
│   │   │   └── dashboard/
│   │   │       └── stats-card.tsx
│   │   ├── layouts/                  # Layout components
│   │   │   ├── main-layout.tsx
│   │   │   ├── auth-layout.tsx
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   └── shared/                   # Shared components
│   │       ├── loading-spinner.tsx
│   │       └── error-boundary.tsx
│   │
│   ├── lib/                          # Utility functions & configurations
│   │   ├── utils/                    # Utility functions
│   │   │   ├── cn.ts
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   └── validation.ts
│   │   ├── api/                      # API client
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── interceptors.ts
│   │   └── constants.ts
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── use-auth-store.ts
│   │   ├── use-ui-store.ts
│   │   └── use-cart-store.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-media-query.ts
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   └── use-auth.ts
│   │
│   ├── router/                       # React Router configuration
│   │   ├── index.tsx
│   │   ├── routes.tsx
│   │   └── protected-route.tsx
│   │
│   ├── App.tsx                       # Main App component
│   ├── main.tsx                      # Entry point
│   └── vite-env.d.ts
│
├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── index.html                        # HTML entry point
├── .env                              # Environment variables
├── .env.example                      # Environment variables example
├── vite.config.ts                    # Vite configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json
├── pnpm-lock.yaml
├── CLAUDE.md                         # Claude Code instructions
└── AGENTS.md                         # Codex CLI instructions
```

### フォルダ構造の原則

#### コンポーネントの配置
- **ui/**: shadcn/ui などの再利用可能な基本 UI コンポーネント
- **features/**: 特定の機能に関連するコンポーネント（feature フォルダ内でさらに分割）
- **layouts/**: レイアウト関連のコンポーネント（ヘッダー、サイドバーなど）
- **shared/**: 複数の機能で共有される汎用コンポーネント

#### ファイルの配置原則
- **コロケーション**: 関連するファイルは近くに配置する
- **機能別グルーピング**: features/ 配下で機能ごとにフォルダを作成
- **共通化の判断**: 2箇所以上で使用される場合のみ shared/ に移動

#### lib/ ディレクトリの使用
- **utils/**: 純粋関数のユーティリティ（機能別にファイルを分割）
- **api/**: API クライアントとエンドポイント定義
- **constants.ts**: アプリケーション全体の定数

#### types/ ディレクトリの使用
- ドメインモデルごとにファイルを分割
- 複数のファイルで使用される型定義のみ配置
- コンポーネント固有の型は、そのコンポーネントファイル内に定義

#### stores/ ディレクトリの使用
- 機能ごとに store を分割（例: use-auth-store.ts、use-ui-store.ts）
- 一つの巨大な store は作成しない
- ファイル名は `use-{feature}-store.ts` の形式

#### Route Groups の活用（Next.js App Router）
- `(auth)/`, `(main)/` などの Route Groups を使用してルートを論理的にグループ化
- URL に影響を与えずにフォルダを整理できる
- 異なるレイアウトを適用する際に便利

## 環境関連

### WSL環境での実行制限
- **pnpm、npm、npx コマンドを直接実行しないこと**
- パッケージのインストールや実行が必要な場合は、必ずユーザーに通知してコマンドを提示すること
- 例：「以下のコマンドを実行してください：`pnpm install dayjs`」

## 状態管理とコンポーネント設計

### Props Drillingの禁止
- Props を何層も渡す実装は禁止
- **zustand** を使用して状態を管理すること
- zustand は **selector 記法** を使用すること
- コンポーネントは **低結合・高凝集** を保つこと

```typescript
// ❌ 悪い例
const value = useStore(state => state)

// ✅ 良い例
const value = useStore(state => state.specificValue)
```

### コンポーネントサイズと再レンダリング
- 各コンポーネントは大きくなりすぎないこと
- 各コンポーネントが使用する state は、**無関係なコンポーネントの再レンダリングを引き起こさない**こと
- zustand の selector を適切に使用して、必要な state のみを購読すること

### コンポーネント内の関数配置
- **コンポーネントの内部状態に関係ない機能型関数は、コンポーネント外部に配置すること**
- 例：`formatDate`、`calculateTotal`、`validateEmail` などのユーティリティ関数
- これらは `lib/utils/` ディレクトリに分類して配置すること

### 重複JSXの処理
- コンポーネント内部でレンダリングする重複的な JSX は、**renderXXX の記法を使用しないこと**
- 必ず **独立したコンポーネント** として切り出すこと

```typescript
// ❌ 悪い例
const renderItem = (item: Item) => <div>{item.name}</div>

// ✅ 良い例
const Item = ({ item }: { item: Item }) => <div>{item.name}</div>
```

### コンポーネント記法の統一
- **すべてのコンポーネントはアロー関数で記述すること**
- `function Component()` ではなく `const Component = () => {}` を使用

```typescript
// ❌ 悪い例
function UserProfile() {
  return <div>Profile</div>
}

// ✅ 良い例
const UserProfile = () => {
  return <div>Profile</div>
}
```

## TypeScript規範

### anyの絶対禁止
- **絶対に `any` 型を使用しないこと**
- 型が不明な場合は `unknown` を使用し、適切な型ガードを実装すること
- 外部ライブラリの型定義が不完全な場合は、型定義ファイルを作成すること

### 型定義の優先順位
- 型定義は **type を優先** して使用すること（一貫性のため）
- 複雑な型定義は `types/` ディレクトリに独立して配置すること
- コンポーネントファイル内に型定義を全て書かないこと

### データ検証
- **Zod を使用してデータ検証**を行うこと
- **適用範囲**：
  - API レスポンス（外部データ）
  - フォームデータ（ユーザー入力）
  - 環境変数（設定ファイル）
- **適用しない範囲**：
  - 内部の型定義（type、interface）
  - コンポーネントの Props 型定義
  - 純粋な TypeScript の型チェック
- 手動で型ガードを書かないこと（外部データに対して）

```typescript
// ✅ 良い例：API レスポンスの検証
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
})

type User = z.infer<typeof UserSchema>

const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`)
  const data = await response.json()
  return UserSchema.parse(data)  // 外部データを検証
}

// ✅ 良い例：内部の型定義（Zod不要）
type ButtonProps = {
  variant: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

const Button = ({ variant, onClick, children }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>
}
```

## React Hooks規範

### useEffectの使用制限
- **useEffect の使用は極力避けること**
- useEffect が必要だと思った場合は、本当に必要か再考すること
- どうしても必要な場合は、**必ずユーザーに理由を説明すること**

### 非同期処理の Pending 状態管理
- **React Query、useFormStatus など専用ツールがある場合はそれを使用**
- **自分で書く非同期関数の pending 状態には useTransition を使用すること**
- React 19 の useTransition で非同期処理をラップする

```typescript
import { useTransition } from 'react'

const Component = () => {
  const [isPending, startTransition] = useTransition()
  
  const handleClick = async () => {
    await fetch('/api/data')
    // 何らかの処理
  }
  
  return (
    <button 
      onClick={() => startTransition(handleClick)}
      disabled={isPending}
    >
      {isPending ? '処理中...' : 'クリック'}
    </button>
  )
}
```

```typescript
// ✅ 良い例：useTransition を使用
const [isPending, startTransition] = useTransition()

const handleSubmit = async () => {
  const result = await submitData(formData)
  showNotification(result)
}

<button onClick={() => startTransition(handleSubmit)}>
  {isPending ? '送信中...' : '送信'}
</button>

// ❌ 悪い例：useState で手動管理
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    const result = await submitData(formData)
    showNotification(result)
  } finally {
    setIsLoading(false)
  }
}
```

### Pending 状態管理の優先順位
1. **React Query / TanStack Query**: データフェッチングには React Query を使用
2. **useFormStatus**: フォーム送信には useFormStatus を使用（React 19 form action と組み合わせ）
3. **useTransition**: 上記以外の自作非同期処理には useTransition を使用
4. **useState での手動管理は避けること**

## フォーム処理

### React 19 のフォーム機能の使用（Next.js を使用しない場合）
- **Next.js を使用せず、React のみを使用している場合**
- **react-hook-form と Zod を使用していない場合**
- React 19 の **form action と useFormStatus** を使用してフォームを処理すること

```typescript
import { useFormStatus } from 'react-dom'

const SubmitButton = () => {
  const { pending } = useFormStatus()
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '送信中...' : '送信'}
    </button>
  )
}

const Form = () => {
  const handleSubmit = async (formData: FormData) => {
    // フォーム処理
    const name = formData.get('name')
    await submitToAPI(name)
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" />
      <SubmitButton />
    </form>
  )
}
```

### React 19 の新しいフックの検討
- **useActionState** と **useOptimistic** の使用が適切か検討すること

#### useActionState の使用
- フォーム送信後の状態管理（エラー表示、成功メッセージなど）に適している

```typescript
import { useActionState } from 'react'

type State = {
  error?: string
  success?: boolean
}

const submitAction = async (prevState: State, formData: FormData) => {
  try {
    const name = formData.get('name') as string
    await submitToAPI(name)
    return { success: true }
  } catch (error) {
    return { error: 'エラーが発生しました' }
  }
}

const Form = () => {
  const [state, formAction] = useActionState(submitAction, { success: false })
  
  return (
    <form action={formAction}>
      <input name="name" />
      <button type="submit">送信</button>
      {state.error && <p className="text-red-500">{state.error}</p>}
      {state.success && <p className="text-green-500">送信成功！</p>}
    </form>
  )
}
```

#### useOptimistic の使用
- UI の楽観的更新（いいね、コメント追加など）に適している
- サーバーレスポンス前に UI を即座に更新したい場合に使用

```typescript
import { useOptimistic } from 'react'

type Comment = {
  id: string
  text: string
  pending?: boolean
}

const Comments = ({ comments }: { comments: Comment[] }) => {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: string) => [
      ...state,
      { id: 'temp', text: newComment, pending: true }
    ]
  )
  
  const submitComment = async (formData: FormData) => {
    const text = formData.get('comment') as string
    addOptimisticComment(text)
    await addCommentToAPI(text)
  }
  
  return (
    <div>
      {optimisticComments.map(comment => (
        <div key={comment.id} className={cn(comment.pending && 'opacity-50')}>
          {comment.text}
        </div>
      ))}
      <form action={submitComment}>
        <input name="comment" />
        <button type="submit">コメント追加</button>
      </form>
    </div>
  )
}
```

### フォーム処理の優先順位
1. **Next.js を使用している場合**: Server Actions を使用
2. **React のみ + react-hook-form/Zod を使用**: それらを使用
3. **React のみ + react-hook-form/Zod を使用しない**: React 19 の form action + useFormStatus/useActionState/useOptimistic を使用

## スタイリング

### Tailwind CSS
- CSS は **Tailwind CSS** を使用すること
- shadcn/ui を使用するため、条件付きでクラスを表示する場合は **cn 関数**を使用すること

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class"
)} />
```

## パッケージ管理

### バージョン指定
- すべてのライブラリは **最新版を使用**すること
- package.json に具体的なバージョンを書かず、pnpm で最新版をインストール
- 例：`pnpm add library-name@latest`

### 時間ライブラリ
- 時間ライブラリは **dayjs のみ使用を許可**
- moment.js、date-fns などは使用禁止

## 開発プロセス

### 大規模タスクの実施前
- **大規模なタスクを実施する前に、必ずベストプラクティスを調査すること**
- 調査結果をユーザーに報告すること
- ユーザーの承認を得てから実装を開始すること

## 認知負荷の原則

### 過度な抽象化の回避
- **5行未満の単純なロジックは独立した関数に分割しないこと**
- 3行の重複コードは、抽象関数にジャンプするより直接理解する方が容易
- 抽象化の目的は理解の難易度を下げることであり、すべての重複を排除することではない

### 作業記憶の限界の尊重
- 単一の関数は **50行を超えないこと**（複雑なロジックは30行以内）
- 関数の引数は **5個を超えないこと**
- ネストレベルは **3層を超えないこと**
- 単一関数内で同時に活動する変数は **7個を超えないこと**

### DRYは手段であって目的ではない
- 3行の重複を見てもすぐに関数を抽出しないこと
- "将来の拡張性"のためにデザインパターンを導入しないこと
- **単純な重複 ≤5回 は抽象化より理解しやすい**

## コード組織の原則

### 変数宣言の配置
- 変数宣言は **使用箇所の近くに配置**すること
- 変数のスコープを最小化すること
- 相互に依存する関数は一緒に配置すること
- 関連するコードはグループ化し、空行で区切ること

### 早期リターンの使用
- **早期リターンを使用してネストを減らすこと**
- 深いネストは心理的な"スタックオーバーフロー"を引き起こすため避ける

```typescript
// ❌ 悪い例
const processData = (data: Data) => {
  if (data) {
    if (data.isValid) {
      if (data.items.length > 0) {
        // 処理
      }
    }
  }
}

// ✅ 良い例
const processData = (data: Data) => {
  if (!data) return
  if (!data.isValid) return
  if (data.items.length === 0) return
  
  // 処理
}
```

## 命名と一貫性の原則

### 明確で正確な命名
- 関数名は **動作と副作用を正確に反映**すること
- `get` で始まる関数は **純粋な読み取り操作でなければならない**
- 類似した名前は類似した動作に対応すること

### 一貫性の維持
- 命名スタイルを統一すること
- 類似した操作には類似したコード構造を使用すること
- フォーマットを統一すること

## 重複コードの評価原則

### 許容される重複
- 単純で明確なパターン
- 重複回数 ≤5回
- 各箇所が一目瞭然

### 必ず排除すべき重複
- 複雑なロジックの重複
- 重複 10回以上
- 一貫性のない重複（細かい差異の確認が必要）

### 抽象化前の自問
- 抽象化後のバージョンは重複コードより理解しやすいか？
- ジャンプや理解のコストが増加していないか？

## Next.js 特有の規範

### Server Component 優先
- **デフォルトで Server Component を使用**すること
- インタラクション（onClick、useState、useEffect）が必要な場合のみ `'use client'` を追加
- ページ全体を client component にマークしないこと

### 非同期パラメータの処理
- **searchParams と params は Promise** であり、必ず await すること
- 同期的な方法でアクセスしないこと

```typescript
// ✅ 正しい例
const Page = async ({ params, searchParams }: PageProps) => {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  return <div>{resolvedParams.id}</div>
}
```

### Server Actions の使用
- フォーム送信には **Server Actions を使用**すること
- API routes + fetch を使用しないこと
- ファイルは `actions/` ディレクトリに配置すること

### 画像最適化の強制規範
- **next/image は width/height または fill を必ず指定**すること
- 適切な sizes プロパティを設定すること
- `<img>` タグを使用しないこと

```typescript
// ✅ 正しい例
<Image
  src="/image.jpg"
  alt="説明"
  width={500}
  height={300}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

## パフォーマンスと最適化

### "use client" 汚染の回避
- ページの大部分が静的コンテンツで、一部だけがインタラクティブな場合
- インタラクティブな部分を **独立した client component** に分割すること

### 重いコンポーネントの遅延読み込み
- モーダル、グラフ、エディタなどは **next/dynamic で遅延読み込み**すること

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
})
```

### React.memo の慎重な使用
- **実測でパフォーマンス問題がある場合のみ使用**すること
- 事前最適化しないこと
- memo 自体にもコストがあることを理解すること

## データ取得

### React 19 の use 関数の検討
- 単一リクエストの場合、**React 19 の use() 関数**の使用を検討すること
- 単純な Promise 処理には use() でコードを簡潔化できる

## コード組織の補足

### ファイル命名の一貫性
- コンポーネントファイル：**kebab-case**（user-profile.tsx）
- ユーティリティ関数：**camelCase**（formatDate.ts）
- 定数：**UPPER_SNAKE_CASE**

### barrel exports の慎重な使用
- 本当に統一エクスポートが必要な場合のみ index.ts を使用
- 循環依存と tree-shaking の問題を避けること

### utility 関数の分類
- `lib/utils/` 配下で機能別にファイルを分割すること
- 例：date.ts、string.ts、format.ts
- すべてを utils.ts に詰め込まないこと

## 状態管理の補足

### zustand slice の機能別分割
- **一つの大きな store を作らないこと**
- feature ごとに slice を分割すること
- 例：useAuthStore、useUIStore、useCartStore

### zustand の作用域制限（Scoped Store）
- **グローバル store が不要な場合、作用域を制限した store を使用すること**
- `createStore` + React Context + `useStore` の組み合わせを使用
- コンポーネントの複数インスタンス、テスト分離、props による初期化が必要な場合に適している
- **store の初期化には useState の惰性初始化を使用すること**（useRef ではなく）
  - `useState(() => createStore(...))` の形式
  - 初期化時の計算が可能で、より簡潔
- **カスタム Hook は selector を必須パラメータとすること**
  - 全体の state を返す使い方はサポートしない
  - 常に必要な値のみを selector で取得することで最適な再レンダリングを実現

```typescript
// stores/use-bear-store.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import { createStore, useStore } from 'zustand'

type BearState = {
  bears: number
  increasePopulation: () => void
  removeAllBears: () => void
}

type BearStore = ReturnType<typeof createBearStore>

// Store 作成関数
const createBearStore = (initialBears: number = 0) => {
  return createStore<BearState>()((set) => ({
    bears: initialBears,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 })
  }))
}

// Context 作成
const BearStoreContext = createContext<BearStore | null>(null)

// Provider コンポーネント
export const BearStoreProvider = ({ 
  children,
  initialBears = 0 
}: { 
  children: ReactNode
  initialBears?: number 
}) => {
  // useState の惰性初始化を使用して store を一度だけ作成
  const [store] = useState(() => createBearStore(initialBears))
  
  return (
    <BearStoreContext.Provider value={store}>
      {children}
    </BearStoreContext.Provider>
  )
}

// カスタム Hook（selector 必須）
export function useBearStore<T>(selector: (state: BearState) => T): T {
  const store = useContext(BearStoreContext)
  
  if (!store) {
    throw new Error('useBearStore must be used within BearStoreProvider')
  }
  
  return useStore(store, selector)
}
```

```typescript
// 使用例
const App = () => {
  return (
    <>
      <BearStoreProvider initialBears={5}>
        <BearCounter />
        <BearControls />
      </BearStoreProvider>
      
      {/* 別のインスタンス */}
      <BearStoreProvider initialBears={10}>
        <BearCounter />
        <BearControls />
      </BearStoreProvider>
    </>
  )
}

const BearCounter = () => {
  // selector を使用して必要な値のみ購読
  const bears = useBearStore(state => state.bears)
  return <div>Bears: {bears}</div>
}

const BearControls = () => {
  const increasePopulation = useBearStore(state => state.increasePopulation)
  const removeAllBears = useBearStore(state => state.removeAllBears)
  
  return (
    <div>
      <button onClick={increasePopulation}>+1</button>
      <button onClick={removeAllBears}>Reset</button>
    </div>
  )
}
```

### グローバル store vs 作用域制限 store の選択基準
- **グローバル store（create を使用）**：
  - アプリケーション全体で共有される状態（認証、テーマ、言語設定など）
  - 単一インスタンスで十分な場合
  
- **作用域制限 store（createStore + Context を使用）**：
  - コンポーネントの複数インスタンスが必要な場合
  - props で store を初期化する必要がある場合
  - テストで store を分離したい場合
  - 再利用可能なコンポーネントの内部状態管理

### 派生状態の回避
- 計算可能なものは保存しないこと
- **selector で計算**すること

```typescript
// ❌ 悪い例
const store = create((set) => ({
  items: [],
  itemCount: 0,  // 派生状態
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
    itemCount: state.items.length + 1
  }))
}))

// ✅ 良い例
const store = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  }))
}))

// selector で計算
const itemCount = useStore(state => state.items.length)
```

## 禁止事項の補足

### React.FC の使用禁止
- React.FC を使用しないこと
- アロー関数の型を直接記述すること

```typescript
// ❌ 悪い例
const Component: React.FC<Props> = ({ children }) => {
  return <div>{children}</div>
}

// ✅ 良い例
const Component = ({ children }: Props) => {
  return <div>{children}</div>
}
```

### default export の制限
- **page.tsx、layout.tsx、error.tsx など Next.js の規約を除き、default export を使用しないこと**
- すべて named export を使用すること

```typescript
// ❌ 悪い例（一般的なコンポーネント）
export default function Button() {}

// ✅ 良い例
export const Button = () => {}
```

---

## 重要な注意事項

上記のすべての規範は、コード品質と保守性を向上させるためのものです。疑問がある場合や、規範に従うことが困難な状況に遭遇した場合は、必ずユーザーに相談してください。
