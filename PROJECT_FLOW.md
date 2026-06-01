# Adaptive Video Streaming App Flow

## 1. Project ka goal

Ye project ek video upload aur adaptive streaming system hai jahan:

- Frontend se user video upload karta hai
- Backend us video ko receive karta hai
- MongoDB me metadata save hota hai
- FFmpeg video ko multiple HLS qualities me convert karta hai
- Final stream browser me adaptive playback ke sath chalti hai

Simple words me:

`upload video -> save metadata -> transcode into HLS -> generate playlist -> show in library -> play in browser`

---

## 2. Tech stack

### Frontend

- Next.js App Router
- React
- Axios
- HLS.js

### Backend
- Express
- TypeScript
- Multer
- Fluent FFmpeg + ffmpeg-static
- Prisma ORM
- MongoDB

--

## 3. High-level architecture

System ke 3 main parts hain:

### A. Frontend

Frontend 3 core screens provide karta hai:

- Home / library page
- Upload page
- Stream/player page

### B. Backend API

Backend upload, listing aur single video fetch ke APIs deta hai.
### C. Storage layers

- Raw upload temporary folder: `backend/uploads/`
- Processed HLS output folder: `backend/output/<timestamp>/`
- Metadata database: MongoDB

---

## 4. Data model

Prisma schema me `Video` model hai. Important fields:

- `id`
- `title`
- `description`
- `originalFilename`
- `hlsPath`
- `playlistUrl`
- `processingStatus`
- `createdAt`
- `updatedAt`

Processing status 3 states me kaam karta hai:

- `PROCESSING`
- `COMPLETED`
- `FAILED`

Reference: [schema.prisma](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/prisma/schema.prisma#L13)

---

## 5. Backend startup flow

Backend start hone par:

1. Express app create hota hai
2. CORS enable hota hai
3. JSON and form parsing enable hoti hai
4. Request logging middleware chalta hai
5. `/health` endpoint available hota hai
6. `/output` folder static serve hota hai
7. `/api` ke andar versioned routes mount hote hain

Important baat:

- HLS files static serve hote hain through `/output`
- Isiliye generated `master.m3u8` and `.ts` segments browser se directly accessible hote hain

Reference: [index.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/index.ts#L18)

---

## 6. API routes

Video routes:

- `GET /api/v1/video` -> sari videos fetch karo
- `GET /api/v1/video/:id` -> ek video ki detail fetch karo
- `POST /api/v1/video/upload` -> video upload karo

Upload route pe Multer middleware `upload.single("video")` use ho raha hai, matlab frontend form-data me field name `video` hona chahiye.

Reference: [video.routes.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/routes/v1/video.routes.ts#L8)

---

## 7. End-to-end upload flow

Ye sabse important interview flow hai.

### Step 1. User upload page open karta hai

Upload page par user:

- title fill karta hai
- description fill karta hai
- video file choose ya drag-drop karta hai

Frontend `FormData` banata hai aur fields append karta hai:

- `video`
- `title`
- `description`

Reference: [page.tsx](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/frontend/src/app/upload/page.tsx#L83)

### Step 2. Frontend backend ko request bhejta hai

Frontend `uploadVideo(formData)` call karta hai.

Ye Axios client ke through request bhejta hai:

- base URL: `NEXT_PUBLIC_API_BASE_URL`
- final endpoint: `/api/v1/video/upload`

Reference: [api.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/frontend/src/lib/api.ts#L24)

### Step 3. Multer raw file ko temporary folder me save karta hai

Backend me Multer middleware file ko `uploads/` folder me store karta hai.

Yahan file temporary hoti hai. Final streaming yahan se nahi hoti.

Reference: [multer.middleware.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/middlewares/multer.middleware.ts#L4)

### Step 4. Controller metadata extract karta hai

`uploadVideoController` ye kaam karta hai:

- uploaded file path nikalta hai
- title decide karta hai
- description read karta hai
- original filename save karta hai
- ek unique `outputId` generate karta hai using `Date.now()`
- final HLS output path decide karta hai like `output/<timestamp>`

Reference: [video.controller.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/controllers/video.controller.ts#L26)

### Step 5. DB me initial record banta hai

Processing start hone se pehle MongoDB me `Video` record create hota hai.

Is stage par:

- `processingStatus = PROCESSING`
- `playlistUrl = ""`
- metadata already save ho jata hai

Ye design acha hai kyunki:

- frontend library me processing item immediately dikha sakta hai
- user ko upload ka record mil jata hai even before transcoding finishes

Reference: [video.repository.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/repository/video.repository.ts#L3)

### Step 6. FFmpeg HLS processing start hoti hai

Controller `processVideoForHls(...)` call karta hai.

Service multiple output qualities banati hai:

- 1080p
- 720p
- 480p
- 360p
- 240p
- 180p

Har resolution ke liye:

- ek variant folder banta hai
- ek `playlist.m3u8` banti hai
- multiple `.ts` segments bante hain

Reference: [video.service.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/services/video.service.ts#L67)

### Step 7. Master playlist generate hoti hai

Saare variant playlists ke baad ek master playlist `master.m3u8` banti hai.

Is file me har quality ka entry hota hai:

- bandwidth
- resolution
- variant playlist path

Ye hi adaptive streaming ka core hai.

Player isi master playlist ko load karta hai aur network condition ke according proper quality choose kar sakta hai.

Reference: [video.service.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/services/video.service.ts#L113)

### Step 8. Success ya failure ke basis par DB update hota hai

#### Agar processing successful ho:

- temporary uploaded file delete hoti hai
- `playlistUrl` update hota hai
- `processingStatus = COMPLETED`

#### Agar processing fail ho:

- `processingStatus = FAILED`
- error response return hota hai

Reference: [video.controller.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/controllers/video.controller.ts#L62)

---

## 8. Library page ka flow

Home page ka kaam sirf list dikhana nahi hai, balki processing state track karna bhi hai.

### Load behavior

Page mount hone par frontend `fetchVideos()` call karta hai aur backend se sari videos laata hai.

Reference: [page.tsx](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/frontend/src/app/page.tsx#L32)

### Filtering behavior

User filter kar sakta hai:

- ALL
- COMPLETED
- PROCESSING
- FAILED

User search bhi kar sakta hai by:

- title
- original filename
- description

Reference: [page.tsx](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/frontend/src/app/page.tsx#L8)

### Auto-refresh behavior

Agar koi bhi video `PROCESSING` state me hai, to home page har 7 second me API dobara call karta hai.

Isse user ko manual refresh karne ki zarurat nahi padti.

Reference: [page.tsx](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/frontend/src/app/page.tsx#L83)

---

## 9. Single stream page ka flow

User jab kisi video card par click karta hai, to `/stream/:videoId` page open hota hai.

Backend serializer already `streamPageUrl` provide karta hai:

- `/stream/<videoId>`

Reference: [video-response.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/utils/video-response.ts#L32)

### Stream page load steps

1. Route se `videoId` milta hai
2. Frontend `fetchVideo(videoId)` call karta hai
3. Video metadata load hoti hai
4. UI status ke hisaab se alag render hota hai

Possible states:

- `PROCESSING` -> spinner + auto refresh
- `FAILED` -> error style message
- `COMPLETED` -> actual video player

Reference: [page.tsx](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/frontend/src/app/stream/[videoId]/page.tsx#L29)

### Auto refresh on player page

Agar video abhi `PROCESSING` me hai, to player page har 5 second me backend ko hit karta hai.

Reference: [page.tsx](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/frontend/src/app/stream/[videoId]/page.tsx#L48)

### Playback logic

Jab status `COMPLETED` hota hai aur `playlistUrl` available hoti hai:

- pehle browser native HLS support check hota hai
- agar native support hai to video element me direct playlist set hoti hai
- warna `hls.js` use karke playlist attach hoti hai

Ye cross-browser playback support deta hai.

Reference: [page.tsx](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/frontend/src/app/stream/[videoId]/page.tsx#L62)

---

## 10. URL generation ka flow

Backend me `serializeVideo()` response ko frontend-friendly banata hai.

Ye do important kaam karta hai:

1. `playlistUrl` ko absolute public URL me convert karta hai
2. `streamPageUrl` generate karta hai

Example:

- stored path: `/output/1773237814661/master.m3u8`
- public URL: `http://localhost:8000/output/1773237814661/master.m3u8`

Reference: [video-response.ts](C:/Users/subra/Documents/Adaptive_Video_Streaming_App/backend/src/utils/video-response.ts#L6)

---

## 11. HLS folder structure

Ek processed video ka output roughly aisa dikhta hai:

```text
output/
  1773237814661/
    master.m3u8
    1080p/
      playlist.m3u8
      segment000.ts
      segment001.ts
    720p/
      playlist.m3u8
      segment000.ts
    480p/
    360p/
    240p/
    180p/
```

Meaning:

- `master.m3u8` = top level adaptive manifest
- har `playlist.m3u8` = ek quality specific manifest
- `.ts` files = actual media chunks

---

## 12. Interview me kaise explain karna hai

Ye short answer aap directly bol sakte ho:

`Mera project ek adaptive video streaming system hai. Frontend Next.js me hai jahan user video upload karta hai, library dekh sakta hai, aur stream play kar sakta hai. Backend Express and TypeScript me hai. Upload ke time Multer raw file ko temporary store karta hai, Prisma ke through MongoDB me metadata save hota hai with PROCESSING status, phir FFmpeg video ko multiple HLS renditions me convert karta hai like 1080p se 180p tak. Har rendition ke liye playlist aur TS segments bante hain, aur ek master.m3u8 generate hoti hai. Processing complete hone par DB record COMPLETED hota hai aur playlist URL frontend ko milti hai. Stream page HLS.js use karke master playlist play karta hai, aur home page plus detail page processing status ko polling ke through auto-refresh karte rehte hain.` 

---

## 13. Strengths of this implementation

- Clear separation of frontend and backend
- Metadata and processing status database me persist hota hai
- Adaptive bitrate streaming support hai
- Library page real-time like polling behavior deta hai
- Failed uploads bhi visible rehte hain
- Static serving ke through HLS files directly accessible hain

---

## 14. Current limitations

Interview me honest rehna better hota hai. Is project me abhi ye improvements possible hain:

- Background job queue nahi hai, FFmpeg processing request lifecycle ke andar chal rahi hai
- Authentication/authorization nahi hai
- Thumbnail generation implemented nahi hai
- Progress percentage tracking nahi hai
- Retry workflow UI level par dedicated nahi hai
- Large scale production ke liye cloud object storage aur CDN useful honge

---

## 15. Short technical summary

Project ka full lifecycle:

1. User frontend par video select karta hai
2. Frontend form-data backend ko bhejta hai
3. Backend temporary file save karta hai
4. MongoDB me metadata with `PROCESSING` status store hota hai
5. FFmpeg HLS renditions and playlists generate karta hai
6. Master playlist create hoti hai
7. DB `COMPLETED` ya `FAILED` me update hota hai
8. Home page polling ke through latest status dikhati hai
9. Stream page `master.m3u8` ko HLS.js se play karti hai

Yahi project ka complete end-to-end flow hai.
