# new-Test

`UDTdragon/new-Test` 저장소 안의 **모아** 프로젝트입니다. 반응형 화면, 선택형 다중 링크, 카테고리 관리와 5종 썸네일은 모두 `moa` 폴더에 있습니다.

```text
new-Test/                  GitHub 저장소
├── .github/workflows/     GitHub Pages 자동 배포
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

## 웹사이트로 접속

GitHub Pages를 한 번 활성화하면 아래 주소로 PC·모바일에서 접속할 수 있습니다.

**https://udtdragon.github.io/new-Test/**

1. 저장소의 [Settings → Pages](https://github.com/UDTdragon/new-Test/settings/pages)를 엽니다.
2. **Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
3. [자동 배포 화면](https://github.com/UDTdragon/new-Test/actions/workflows/deploy-pages.yml)에서 **Run workflow → Run workflow**를 누릅니다. `main` 브랜치를 사용하세요.
4. 작업이 초록색 체크로 완료되면 위 웹사이트 주소를 엽니다. 첫 반영에는 몇 분 걸릴 수 있습니다.

이후 `main`에 수정 사항을 올리면 자동으로 빌드하고 배포합니다. 저장소가 비공개라면 계정의 GitHub Pages 지원 여부를 먼저 확인하세요. 무료 개인 계정에서는 공개 저장소에 사용할 수 있습니다.

배포되는 것은 화면과 샘플 자료입니다. 개인적으로 저장한 메모와 링크는 브라우저에 남아 있으며 GitHub에 업로드되지 않습니다. VS Code에서 사용한 개발 서버와 웹사이트는 주소가 달라 보관함이 각각 저장됩니다.
