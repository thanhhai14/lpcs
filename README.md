<p align="center">
  <img src="./app/icon.svg" width="112" height="112" alt="Logo Loan Payment Calculator Spec" />
</p>

# Loan Payment Calculator Spec (LPCS)

**LPCS** là ứng dụng web lập kế hoạch vay ngân hàng theo tiến độ dự án. Công cụ kết nối ba phần thường phải tính riêng: lịch thanh toán cho chủ đầu tư, nguồn vốn của từng đợt và nghĩa vụ trả nợ ngân hàng theo tháng.

Ứng dụng chạy hoàn toàn trên trình duyệt, tự lưu dữ liệu tại thiết bị và có thể triển khai trực tiếp lên Vercel.

> Kết quả từ LPCS là số liệu dự kiến để tham khảo và lập kế hoạch. Lịch trả nợ chính thức vẫn phụ thuộc hợp đồng tín dụng, ngày hạch toán và quy tắc làm tròn của ngân hàng.

## Tính năng

### Lập tiến độ dự án

- Khai báo giá trị dự án và hạn mức ngân hàng dự kiến.
- Tạo nhiều đợt thanh toán cho chủ đầu tư bằng phần trăm hoặc số tiền cụ thể.
- Phân bổ từng đợt bằng vốn tự có, vốn ngân hàng hoặc kết hợp cả hai.
- Theo dõi hạn mức còn có thể giải ngân khi nhập vốn ngân hàng.
- Khai báo ngày thanh toán chủ đầu tư và ngày giải ngân riêng cho từng đợt.

### Tính lịch trả nợ

- Hỗ trợ giải ngân một lần hoặc nhiều lần.
- Tính lãi trên dư nợ thực tế theo ngày với quy ước `Actual/365`.
- Hỗ trợ lãi suất ưu đãi và lãi suất dự kiến sau ưu đãi.
- Hai phương thức trả nợ:
  - **Gốc cố định, lãi giảm dần:** phần gốc của mỗi khoản giải ngân được chia theo số kỳ trả gốc còn lại.
  - **Trả góp đều (Annuity):** khoản trả định kỳ được xác định theo công thức niên kim; phần gốc bằng khoản trả trừ lãi thực tế của kỳ.
- Theo dõi riêng từng lần giải ngân để khoản vay mới không làm sai phần gốc của khoản vay cũ.
- Tổng gốc định kỳ và gốc trả trước trong toàn lịch luôn khớp tổng tiền thực tế đã giải ngân.

### Quy tắc kỳ đầu và giải ngân bổ sung

- Một khoản giải ngân chưa đủ 30 ngày tại ngày trả nợ gần nhất chỉ phát sinh lãi, chưa trả gốc.
- Nếu lần giải ngân đầu chưa đủ 30 ngày, kỳ này được hiển thị là **Kỳ 0** và không làm giảm số tháng trả gốc đã nhập.
- Có thể bật **Trả gốc ngay kỳ đầu tiên** theo thỏa thuận riêng với ngân hàng. Khi bật, lịch bắt đầu từ Kỳ 1.
- Tùy chọn trả gốc kỳ đầu chỉ áp dụng cho lần giải ngân đầu; các đợt bổ sung vẫn tuân theo quy tắc 30 ngày.
- Lịch được phân trang theo 12 tháng vay. Kỳ 0 được ghép vào trang đầu nhưng không thay thế Kỳ 12.

### Trả trước hạn

- Lập nhiều lần trả trước theo ngày và số tiền dự kiến.
- Tính phí phạt trả trước độc lập với phần gốc.
- Hỗ trợ giảm khoản trả hoặc rút ngắn kỳ hạn sau khi trả trước.

### Kết quả và báo cáo

- Tổng hợp vốn vay, lãi dự kiến, phí trả trước và tổng dòng tiền trả ngân hàng.
- Thống kê khoản trả và tiền lãi cao nhất, trung bình, thấp nhất.
- Hiển thị lại đầy đủ tiến độ thanh toán dự án và cơ cấu nguồn vốn.
- Lịch trả nợ dạng bảng trên máy tính và dạng thẻ trên thiết bị di động.
- Hỗ trợ chế độ sáng và tối, tự nhận thiết lập hệ điều hành và ghi nhớ lựa chọn trên thiết bị.
- Xem chi tiết các đoạn ngày, dư nợ và lãi suất dùng để tính từng kỳ.
- Xuất Excel gồm ba sheet: **Tổng quan**, **Tiến độ dự án** và **Lịch trả nợ**.
- In báo cáo A4 ngang có tiến độ dự án, thống kê và toàn bộ lịch trả nợ.

## Công nghệ

- [Next.js](https://nextjs.org/) với App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [`write-excel-file`](https://www.npmjs.com/package/write-excel-file) cho xuất báo cáo Excel
- Vercel Analytics

Ứng dụng hiện không yêu cầu backend, cơ sở dữ liệu hoặc biến môi trường.

Để link preview và canonical URL dùng tên miền riêng thay vì địa chỉ mặc định của Vercel, khai báo:

```bash
NEXT_PUBLIC_SITE_URL=https://ten-mien-cua-ban.vn
```

Không thêm dấu gạch chéo ở cuối URL. Nếu biến này chưa được đặt, LPCS tự dùng production URL do Vercel cung cấp.

## Chạy trên máy cá nhân

Yêu cầu Node.js 20 trở lên và npm.

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

## Các lệnh chính

| Lệnh | Chức năng |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Tạo bản build production |
| `npm start` | Chạy bản production đã build |
| `npm test` | Kiểm tra công thức và các quy tắc lịch trả nợ |
| `npm run lint` | Kiểm tra chất lượng mã nguồn |

## Cấu trúc dự án

```text
app/                    Trang, metadata, favicon và CSS toàn cục
components/             Giao diện ứng dụng LPCS
lib/loan.ts             Công thức và bộ máy tạo lịch trả nợ
lib/loan.test.ts        Kiểm thử nghiệp vụ khoản vay
lib/exportExcel.ts      Tạo workbook Excel
lib/format.ts           Định dạng ngày và tiền tệ
documents/              Đặc tả nghiệp vụ và mô hình dòng tiền
```

## Dữ liệu và quyền riêng tư

Dữ liệu người dùng nhập được lưu bằng `localStorage` trên chính trình duyệt đang sử dụng. LPCS không gửi dữ liệu khoản vay đến máy chủ trong phiên bản hiện tại. Xóa dữ liệu website của trình duyệt cũng sẽ xóa lịch sử nhập đã lưu.

## Kiểm tra trước khi triển khai

```bash
npm test
npm run lint
npm run build
```

Bộ kiểm thử bao gồm các trường hợp giải ngân một lần, nhiều lần, Kỳ 0, trả gốc kỳ đầu, quy tắc 30 ngày, trả trước và kiểm tra tổng gốc bằng tổng số tiền đã giải ngân.

## Triển khai trên Vercel

1. Đẩy repository lên GitHub.
2. Import repository vào Vercel.
3. Giữ nguyên framework preset **Next.js** và các lệnh mặc định.
4. Triển khai; dự án hiện không cần cấu hình biến môi trường.

## Tài liệu nghiệp vụ

- [Đặc tả công cụ](documents/loan-payment-calculator-spec.md)
- [Mô hình tính và dòng tiền](documents/calculation-modes-and-cashflow.md)
- [Chiến lược quảng cáo và kiếm tiền](documents/ads-monetization-plan.md)

## Giới hạn trách nhiệm

LPCS không phải hệ thống của ngân hàng và không cung cấp tư vấn tài chính. Người dùng nên đối chiếu kết quả với hợp đồng tín dụng, lịch giải ngân thực tế và thông báo chính thức từ ngân hàng trước khi đưa ra quyết định.
