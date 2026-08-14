# Kế hoạch vay

Ứng dụng lập kế hoạch dòng tiền dự án và tính toán lịch trả nợ ngân hàng, được xây dựng bằng Next.js và sẵn sàng triển khai trên Vercel.

## Chức năng phiên bản đầu

- Nhập giá trị dự án và các đợt thanh toán cho chủ đầu tư.
- Phân bổ từng đợt bằng vốn tự có, vốn ngân hàng hoặc kết hợp.
- Giải ngân một hoặc nhiều lần theo ngày dự kiến.
- Hai phương thức trả nợ: gốc cố định, lãi giảm dần hoặc trả góp đều (annuity).
- Với nhiều lần giải ngân, phần gốc được lập lại theo dư nợ thực tế và số kỳ còn lại.
- Mỗi khoản giải ngân chỉ bắt đầu trả gốc tại kỳ thanh toán cách ngày giải ngân ít nhất 30 ngày; các khoản cũ vẫn trả theo lịch riêng.
- Nếu kỳ đầu chưa đủ 30 ngày, kỳ này được đánh số 0 và nằm ngoài số tháng trả gốc; lịch sau đó vẫn chạy đủ thời hạn vay đã nhập.
- Có thể bật “Trả gốc ngay kỳ đầu tiên” cho trường hợp ngân hàng có thỏa thuận riêng; khi đó lịch bắt đầu từ kỳ 1 và lần giải ngân đầu được trả gốc ngay. Các đợt giải ngân bổ sung vẫn tuân theo quy tắc 30 ngày.
- Lãi suất ưu đãi và sau ưu đãi, tính theo ngày Actual/365.
- Lập kế hoạch trả trước, tính phí phạt, giảm kỳ hạn hoặc giảm khoản trả.
- Lịch trả nợ dạng bảng trên desktop và dạng list card trên mobile.
- Xuất toàn bộ lịch trả nợ thành tệp Excel hai sheet và in báo cáo A4 ngang.
- Tự động lưu dữ liệu nhập trên trình duyệt để khôi phục sau khi tải lại trang.

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
