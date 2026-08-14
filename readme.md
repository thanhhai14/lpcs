# Kế hoạch vay

Ứng dụng mô phỏng dòng tiền dự án và lịch trả nợ ngân hàng, được xây dựng bằng Next.js và sẵn sàng triển khai trên Vercel.

## Chức năng phiên bản đầu

- Nhập giá trị dự án và các đợt thanh toán cho chủ đầu tư.
- Phân bổ từng đợt bằng vốn tự có, vốn ngân hàng hoặc kết hợp.
- Giải ngân một hoặc nhiều lần theo ngày dự kiến.
- Hai phương thức trả nợ: gốc cố định, lãi giảm dần hoặc trả góp đều (annuity).
- Với nhiều lần giải ngân, phần gốc được lập lại theo dư nợ thực tế và số kỳ còn lại.
- Lãi suất ưu đãi và sau ưu đãi, tính theo ngày Actual/365.
- Lập kế hoạch trả trước, tính phí phạt, giảm kỳ hạn hoặc giảm khoản trả.
- Lịch trả nợ dạng bảng trên desktop và dạng list card trên mobile.

## Chạy cục bộ

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Kiểm tra

```bash
npm test
npm run lint
npm run build
```

## Triển khai Vercel

Import repository vào Vercel và giữ nguyên cấu hình Next.js mặc định. Dự án không yêu cầu biến môi trường hay dịch vụ backend trong phiên bản này.

## Tài liệu nghiệp vụ

- [Đặc tả công cụ](documents/loan-payment-calculator-spec.md)
- [Mô hình tính và dòng tiền](documents/calculation-modes-and-cashflow.md)

Kết quả tính toán chỉ mang tính tham khảo; lịch thực tế phụ thuộc điều khoản và quy ước hạch toán của ngân hàng.
