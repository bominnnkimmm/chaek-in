# 📚 책크인 (Chaek-in)

> 온라인 교환독서 플랫폼 

## 서비스 소개

책크인은 2~5명이 한 권의 책을 함께 읽으며 페이지에 코멘트, 이모지, 포스트잇으로 흔적을 남기는 교환독서 플랫폼입니다.

🔗 **배포 주소**: https://chaek-in-abd48.web.app

---

## 주요 기능

- 📖 카카오 책 검색 API를 통한 책 검색 및 책방 개설
- 🔑 초대코드로 친구 초대
- 🔖 참여자별 독서 현황 북마크
- ✍️ 구절 기록 및 코멘트 / 포스트잇 / 밑줄 흔적 남기기
- 📷 구절 페이지 이미지 저장
- ✅ 완독 처리 및 서재 보관

---

## 기술 스택


| Frontend | React + Vite |
| Styling | Tailwind CSS |
| 인증 | Firebase Auth (이메일 + Google) |
| DB | Firebase Firestore |
| 외부 API | 카카오 책 검색 API |
| 배포 | Firebase Hosting |

## 폴더 구조

```
책크인/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── SetProfile.jsx
│   │   ├── Home.jsx
│   │   ├── CreateRoom.jsx
│   │   ├── JoinRoom.jsx
│   │   ├── RoomHome.jsx
│   │   ├── AddPassage.jsx
│   │   ├── RecordDetail.jsx
│   │   └── MyPage.jsx
│   ├── components/
│   │   └── Footer.jsx
│   ├── api/
│   │   └── kakao.js
│   ├── firebase.js
│   ├── App.jsx
│   └── PrivateRoute.jsx
├── .env
└── vite.config.js
```

---

## 실행 방법

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

### 환경변수 설정

루트 폴더에 `.env` 파일 생성 후

VITE_KAKAO_API_KEY=카카오_REST_API_키

입력

Firebase 설정은 `src/firebase.js` 에 직접 입력

---

## DB 구조

```
rooms (컬렉션)
  └ roomId
      ├ bookTitle, bookThumbnail, bookAuthor
      ├ maxMembers, inviteCode, dueDate
      ├ isCompleted
      ├ createdBy, createdAt
      ├ members: [uid배열]
      ├ nicknames: { uid: 닉네임 }
      ├ colors: { uid: 색상 }
      ├ bookmarks: { uid: 페이지번호 }
      └ passages (서브컬렉션)
            └ passageId
                ├ text, page, color
                ├ createdBy, createdAt
                └ comments (서브컬렉션)
                      └ commentId
                          ├ type (text/postit/underline)
                          ├ text, x, y, color
                          └ createdBy, createdAt
```

---