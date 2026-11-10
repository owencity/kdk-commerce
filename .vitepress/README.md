# 문서 읽기 화면

저장소의 Markdown을 브라우저에서 읽는 화면이다. 화면용으로 문서 본문을 복사하지 않는다.

## 실행

Node.js와 npm이 설치된 환경에서 프로젝트 루트의 `open-docs.cmd`를 실행한다. 처음에는 필요한 패키지를 설치하고, 이후에는 문서 서버와 브라우저를 연다. 실행 창을 닫으면 서버도 종료된다.

직접 실행하려면 프로젝트 루트에서 다음 명령을 사용한다.

```sh
npm ci
npm run docs:open
```

주소는 `http://127.0.0.1:4173/docs/02-requirements`다. 이미 실행 중이면 주소를 열면 된다. 같은 서버를 다시 실행하면 포트가 사용 중이라는 오류가 난다.

## 문서를 고칠 때

- `README.md`와 `docs/*.md` 원본을 수정한다. 서버가 실행 중이면 저장한 본문과 목차가 화면에 반영된다.
- 프로젝트 지침은 `AGENTS.MD`를 수정한다. `viewer/project-guide.md`는 이 파일을 불러오는 한 줄만 가진다.
- Mermaid 코드 블록은 다이어그램으로 표시한다. 문법 오류가 있으면 오류 내용과 원문을 보여준다.
- 새 문서를 왼쪽 목록에 넣으려면 `theme/ReaderLayout.vue`의 `documents`에 추가한다. 각 문서 안의 목차는 제목으로 자동 생성한다.

이 화면은 현재 저장소의 파일을 읽는다. GitHub에 푸시하거나 Obsidian 보관함과 파일을 동기화하지 않는다.

## 빌드와 패키지 관리

`npm run docs:build`는 그 시점의 HTML을 `.vitepress/dist`에 만든다. 이 결과물은 원본을 고쳐도 자동 변경되지 않으므로 다시 빌드해야 한다. 평소 검토에는 위의 문서 서버를 사용한다.

VitePress는 안정 버전 1.6.4를 사용한다. 2026-11-10 설치 당시 의존성 보안 경고를 해소하기 위해 Mermaid를 11.17.2로 올리고, Vite 6.4.6과 KaTeX 0.18.2를 `package.json`의 `overrides`로 고정했다. 두 override는 상위 패키지가 선언한 버전 범위를 벗어나므로 이후 패키지를 갱신할 때 필요 여부와 호환성을 다시 확인한다. 보안 점검 결과만으로 호환성을 보장하지 않는다.

검증 명령은 `npm run docs:build`와 `npm audit`다. 화면에서는 문서 이동, 원본 저장 후 본문·목차 변경, Mermaid 표시를 확인한다. 실행 결과는 해당 변경의 리뷰 기록에 남긴다.

참고: [VitePress 1.x 실행 방법](https://vuejs.github.io/vitepress/v1/guide/getting-started), [Markdown 파일 포함](https://vuejs.github.io/vitepress/v1/guide/markdown#markdown-file-inclusion). 발행일 미표기, 2026-11-10 확인. 원본 문서 읽기와 개발 서버 동작의 근거다.
