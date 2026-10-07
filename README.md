# new-Test

`UDTdragon/new-Test` 저장소 안의 **모아** 프로젝트입니다. 반응형 화면, 선택형 다중 링크, 카테고리 관리와 5종 썸네일은 모두 `moa` 폴더에 있습니다.

```text
new-Test/                  GitHub 저장소
├── .gitignore
├── README.md
└── moa/                   모아 앱 프로젝트
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── README.md
    ├── public/
    └── src/
```

## VS Code에서 실행

Node.js LTS를 설치한 뒤 **파일 → 폴더 열기**에서 `package.json`이 들어 있는 **`moa` 폴더**를 선택하세요. **터미널 → 새 터미널**에서 실행합니다.

```sh
npm ci
npm run dev
```

`new-Test` 저장소 폴더를 열었다면 먼저 프로젝트 폴더로 이동합니다.

```sh
cd moa
npm ci
npm run dev
```

터미널의 `Local` 주소를 브라우저에서 열면 됩니다. 실행 중에는 터미널을 유지하고, 종료하려면 `Ctrl+C`를 누르세요.

기능·데이터 저장 방식·썸네일 안내는 [moa/README.md](moa/README.md)를 참고하세요.
