# 테트리스

HTML, CSS, JavaScript만 사용하는 브라우저 테트리스 게임입니다.  
프론트엔드 입문 학습용으로 제작했으며, 빌드 도구와 외부 라이브러리 없이 동작합니다.

## 실행 방법

### 로컬에서 실행

1. 이 프로젝트 폴더를 연다.
2. `index.html` 파일을 더블클릭하거나 브라우저로 드래그한다.
3. **시작** 또는 **재시작** 버튼을 누른 뒤 키보드로 플레이한다.

### VS Code Live Server (선택)

1. VS Code에서 **Live Server** 확장을 설치한다.
2. `index.html`에서 우클릭 후 **Open with Live Server**를 선택한다.

### 온라인에서 실행

GitHub Pages 배포 후 아래 주소에서 플레이할 수 있습니다.

**https://olleholleh.github.io/tetris-cursor/**

## 조작법

| 키 | 동작 |
|---|---|
| ← (ArrowLeft) | 왼쪽 이동 |
| → (ArrowRight) | 오른쪽 이동 |
| ↑ (ArrowUp) | 회전 |
| ↓ (ArrowDown) | 한 칸 빠르게 내리기 (soft drop) |
| Space | 즉시 내리기 (hard drop) |

충돌이 발생하는 이동·회전은 적용되지 않습니다.

## 구현 기능

- 10 × 20 CSS Grid 게임 보드
- 7가지 테트로미노 (I, O, T, S, Z, J, L)
- 블록 자동 낙하 (약 0.8초 간격)
- 키보드 이동, 회전, soft drop, hard drop
- 충돌 판정 (`canMove`) 및 블록 고정
- 가로 한 줄 완성 시 라인 삭제
- 라인 삭제 점수 (1줄 100 / 2줄 300 / 3줄 500 / 4줄 800)
- 새 블록 생성 불가 시 게임 오버
- **재시작** 버튼으로 보드·점수·타이머·상태 초기화

## 점수 규칙

| 한 번에 삭제한 줄 수 | 획득 점수 |
|---|---|
| 1줄 | 100 |
| 2줄 | 300 |
| 3줄 | 500 |
| 4줄 | 800 |

## 품질 점검 방법

1. 브라우저에서 게임을 연다.
2. F12 → **Console** 탭에서 에러가 없는지 확인한다.
3. 아래 항목을 수동으로 테스트한다.

| 확인 항목 | 기대 결과 |
|---|---|
| 자동 낙하 | 블록이 주기적으로 아래로 이동 |
| 좌우 이동 / 회전 | 벽·블록과 충돌 시 멈춤 |
| soft drop / hard drop | ↓ 1칸 하강 / Space 즉시 착지 |
| 라인 클리어 | 가득 찬 줄 삭제, 점수 증가 |
| 게임 오버 | 보드가 가득 차면 "게임 오버" 표시, 조작 중단 |
| 재시작 | 보드·점수 초기화, 플레이 재개 |

## GitHub Pages 배포 방법

### 1. GitHub 저장소 생성

1. GitHub에서 `tetris-cursor` 이름의 새 저장소를 만든다.
2. 로컬 프로젝트를 연결하고 push한다.

```bash
git init
git add index.html style.css script.js README.md .gitignore
git commit -m "Add browser Tetris game"
git branch -M main
git remote add origin https://github.com/olleholleh/tetris-cursor.git
git push -u origin main
```

### 2. GitHub Pages 활성화

1. 저장소 **Settings** → **Pages**로 이동한다.
2. **Source**를 `Deploy from a branch`로 선택한다.
3. **Branch**를 `main`, 폴더를 `/ (root)`로 설정하고 **Save**한다.
4. 1~2분 후 아래 URL에서 확인한다.

**배포 URL:** https://olleholleh.github.io/tetris-cursor/

> 저장소 이름을 바꾸면 URL의 `tetris-cursor` 부분도 함께 바뀝니다.

## 파일 구조

```
tetris-cursor/
├── index.html   # 화면 구조
├── style.css    # 스타일
├── script.js    # 게임 로직
├── README.md    # 프로젝트 안내
└── .gitignore   # Git 제외 목록
```
