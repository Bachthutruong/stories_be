# Render Deployment Fix

## Vấn đề
Render đang cố gắng chạy `node src/index.ts` thay vì file JavaScript đã compile, gây ra lỗi:
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"
```

## Giải pháp
Đã tạo file `index.js` trong thư mục gốc để làm entry point cho Render. File này sẽ:

1. Kiểm tra xem file `dist/index.js` đã tồn tại chưa
2. Nếu chưa, tự động build TypeScript
3. Chạy file JavaScript đã compile

## Cấu hình hiện tại

### package.json
- `main`: `"index.js"` - Entry point mới
- `start`: `"node index.js"` - Script start mới
- `postinstall`: `"npm run build"` - Tự động build khi install

### index.js
- Entry point chính cho Render
- Tự động build TypeScript nếu cần
- Chạy file JavaScript đã compile

## Cách deploy
1. Push code lên Git
2. Render sẽ tự động detect và deploy
3. Render sẽ chạy `npm start` (tức là `node index.js`)
4. File `index.js` sẽ đảm bảo TypeScript được compile trước khi chạy

## Test locally
```bash
npm run build
node index.js
```

## Lưu ý
- Không cần file `render.yaml` nữa
- Render sẽ sử dụng cấu hình mặc định với entry point là `index.js`
- Build process được handle tự động trong `index.js` 