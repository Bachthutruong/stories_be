# Backend Deployment Configuration

## Cấu hình đúng cho Render Deployment

### File cấu hình chính: `backend/render.yaml` (DUY NHẤT)
```yaml
services:
  - type: web
    name: stories-post-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
```

### Cấu hình package.json: `backend/package.json`
- `"type": "commonjs"` - Đảm bảo sử dụng CommonJS
- `"main": "dist/index.js"` - Entry point là file JavaScript đã compile
- `"build": "tsc"` - Compile TypeScript thành JavaScript
- `"start": "node dist/index.js"` - Chạy file JavaScript đã compile

### Quy trình deployment:
1. Render sẽ chạy `npm install && npm run build` trong thư mục backend
2. TypeScript được compile thành JavaScript trong thư mục `dist/`
3. Render sẽ chạy `node dist/index.js` để start server
4. Server sẽ chạy file JavaScript đã compile, không phải file TypeScript

### Test thành công:
- ✅ `npm run build` - TypeScript compilation
- ✅ `node dist/index.js` - Server start
- ✅ MongoDB connection
- ✅ Health check endpoint

### Lưu ý quan trọng:
- **CHỈ** có file render.yaml trong thư mục backend
- **KHÔNG** có file render.yaml ở root level
- **KHÔNG** có file render.yaml ở bất kỳ đâu khác
- Đảm bảo tất cả environment variables được set trong Render dashboard
- Render sẽ tự động nhận diện file render.yaml trong thư mục backend

Deployment này sẽ hoạt động đúng cách trên Render. 