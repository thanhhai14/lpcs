# Đặc tả — Công cụ tính khoản trả nợ vay ngân hàng

## 1. Mục tiêu

Xây dựng ứng dụng web có thể triển khai trên Vercel, giúp người vay ước tính lịch trả nợ và số tiền phải thanh toán theo từng kỳ. Ứng dụng phải hỗ trợ:

- Khoản vay giải ngân một lần.
- Hạn mức/khoản vay giải ngân nhiều lần.
- Các cách trả nợ phổ biến: dư nợ giảm dần và trả góp đều (annuity).
- Lãi suất cố định hoặc thay đổi theo từng giai đoạn.
- Bảng lịch trả nợ minh bạch: gốc, lãi, tổng tiền trả và dư nợ còn lại.

Kết quả là **ước tính tham khảo**, không thay thế lịch trả nợ chính thức hay thông báo của ngân hàng.

Chi tiết về các chế độ tính, luồng tiền dự án và cách xử lý trả trước được mô tả tại [calculation-modes-and-cashflow.md](./calculation-modes-and-cashflow.md).

## 2. Các thông số cần chốt

Vui lòng cung cấp hoặc lựa chọn các thông tin bên dưới trước khi triển khai giao diện và máy tính.

### Thông tin khoản vay

| Thông số | Ví dụ | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| Số tiền vay / hạn mức | 1.000.000.000 VNĐ | Có | Với nhiều lần giải ngân, đây có thể là hạn mức tối đa. |
| Ngày ký / ngày bắt đầu khoản vay | 14/08/2026 | Có | Dùng để kiểm tra ngày giải ngân. |
| Kỳ hạn | 120 tháng | Có | Cần xác định kỳ hạn tính từ lần giải ngân đầu tiên, từng lần giải ngân, hay ngày kết thúc chung. |
| Kỳ trả nợ | Hàng tháng | Có | Có thể mở rộng: tuần, quý, 3/6/12 tháng. |
| Ngày trả nợ | Ngày 5 hàng tháng | Có | Cần quy ước nếu rơi vào ngày nghỉ. |
| Ân hạn gốc | 12 tháng | Tuỳ chọn | Trong thời gian này chỉ trả lãi hay vốn hoá lãi cần được chọn rõ. |
| Phí | 0,5% / 1.000.000 VNĐ | Tuỳ chọn | Phí trả trước, phí giải ngân, bảo hiểm có được hiển thị riêng hay cộng vào khoản vay. |

### Lãi suất

| Thông số | Ví dụ | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| Lãi suất ban đầu | 7,5%/năm | Có | Cần xác nhận lãi đơn theo dư nợ thực tế. |
| Thời hạn ưu đãi | 6 tháng | Tuỳ chọn | Sau thời hạn này lãi có thể đổi. |
| Lãi suất sau ưu đãi | 10,5%/năm | Tuỳ chọn | Có thể là số cố định hoặc công thức tham chiếu + biên độ. |
| Lịch thay đổi lãi | 01/03/2027: 9,8% | Tuỳ chọn | Cần cho phép nhiều mốc hiệu lực. |
| Cơ sở tính ngày | Actual/365, Actual/360, 30/360 | Có | Đây là yếu tố quyết định số lãi thực tế. |

### Giải ngân

Mỗi đợt cần có: `ngày giải ngân`, `số tiền`, và (nếu khác khoản vay chung) `kỳ hạn/đáo hạn riêng`.

Giá trị mỗi đợt thanh toán CĐT có thể được nhập bằng số tiền VNĐ hoặc tỷ lệ phần trăm giá trị dự án. Khi nhập theo phần trăm, số tiền tương ứng được tự động cập nhật nếu giá trị dự án thay đổi.

Ví dụ:

| Đợt | Ngày giải ngân | Số tiền |
| --- | --- | ---: |
| 1 | 14/08/2026 | 400.000.000 VNĐ |
| 2 | 14/11/2026 | 300.000.000 VNĐ |
| 3 | 14/02/2027 | 300.000.000 VNĐ |

### Giá trị dự án và tiến độ thanh toán cho chủ đầu tư

Người dùng nhập `giá trị dự án` và số đợt phải thanh toán cho chủ đầu tư (CĐT). Mỗi đợt gồm:

- Tên/mốc thanh toán, ngày dự kiến và số tiền hoặc tỷ lệ phần trăm giá trị dự án.
- Nguồn vốn: vốn tự có, vốn ngân hàng, hoặc kết hợp cả hai.
- Nếu kết hợp: số vốn tự có và số vốn ngân hàng dự kiến của riêng đợt đó.
- Ở chế độ kết hợp, người dùng nhập phần ngân hàng giải ngân; vốn tự có được tính bằng phần còn lại. Giao diện hiển thị hạn mức vay còn khả dụng và cho phép điền nhanh số tối đa có thể phân bổ cho đợt.
- Một đợt thanh toán có thể liên kết với không có, một, hoặc nhiều đợt giải ngân ngân hàng.

Hệ thống phải kiểm tra:

```text
tổng tiền các đợt thanh toán CĐT = giá trị dự án
vốn tự có của đợt + vốn ngân hàng của đợt = số tiền thanh toán đợt
tổng vốn ngân hàng dự kiến <= hạn mức được ngân hàng cho vay
```

Ngày thanh toán CĐT không mặc định là ngày ngân hàng giải ngân. Nếu hai ngày khác nhau, lãi bắt đầu tính theo **ngày giải ngân thực tế/dự kiến**, không tính theo ngày thanh toán CĐT.

### Kế hoạch trả nợ trước hạn

Người dùng có thể nhập nhiều sự kiện trả trước, mỗi sự kiện gồm ngày dự kiến, số tiền trả trước và quy tắc phí phạt. Phí có thể là phần trăm số tiền trả trước, số tiền cố định, biểu phí theo tuổi khoản vay, hoặc kết hợp phần trăm với mức phí tối thiểu.

Sau mỗi lần trả trước, người dùng chọn một trong hai cách tái lập lịch:

- Giữ nguyên kỳ hạn và giảm số tiền phải trả các kỳ sau.
- Giữ gần nguyên khoản trả định kỳ và rút ngắn kỳ hạn.

Số tiền trả trước được trừ vào gốc sau khi xử lý nghĩa vụ đến hạn trong ngày. Phí phạt là dòng tiền riêng và không làm giảm dư nợ.

## 3. Quy tắc tính đề xuất

### 3.1. Dòng thời gian và dư nợ

Máy tính sẽ tạo một dòng thời gian gồm các sự kiện: giải ngân, đổi lãi suất, ngày đến hạn trả nợ và tất toán. Các sự kiện được sắp xếp theo ngày.

Tại mỗi thời điểm:

```text
dư nợ cuối kỳ = dư nợ đầu kỳ + giải ngân trong kỳ - gốc đã trả trong kỳ
lãi kỳ = dư nợ chịu lãi × lãi suất năm × số ngày thực tế / mẫu số ngày
```

Khi có nhiều đợt giải ngân, từng đợt chỉ bắt đầu chịu lãi từ đúng ngày giải ngân. Vì thế không thể đơn giản tính lãi trên toàn bộ hạn mức ngay từ ngày đầu.

Mỗi khoản giải ngân được theo dõi như một dư nợ con. Nếu ngày trả nợ gần nhất cách ngày giải ngân dưới 30 ngày, dư nợ con đó chỉ trả lãi tại kỳ này và chưa trả gốc. Những khoản giải ngân cũ đã đủ 30 ngày vẫn trả gốc bình thường. Từ mốc đủ 30 ngày, phần gốc của khoản mới được cộng vào dòng tổng hợp theo phương thức trả nợ đã chọn.

Nếu kỳ thanh toán đầu tiên chưa đủ 30 ngày kể từ lần giải ngân đầu, kỳ đó được hiển thị là **kỳ 0** và không làm giảm số tháng trả gốc đã nhập. Ví dụ thời hạn 120 tháng sẽ gồm kỳ 0 chỉ trả lãi, sau đó đủ các kỳ trả gốc từ 1 đến 120. Người dùng có thể bật tùy chọn **trả gốc ngay kỳ đầu tiên** theo thỏa thuận riêng với ngân hàng; khi bật, lần giải ngân đầu được trả gốc ngay và lịch bắt đầu từ kỳ 1. Tùy chọn này không bỏ quy tắc 30 ngày đối với các lần giải ngân bổ sung. Tổng gốc định kỳ và gốc trả trước trong toàn lịch phải bằng chính xác tổng số tiền thực tế đã giải ngân.

Nếu trong một kỳ có đổi lãi suất hoặc giải ngân, kỳ đó được tách thành các đoạn nhỏ; lãi kỳ là tổng lãi của từng đoạn. Cách này phản ánh gần nhất cách tính theo dư nợ thực tế của ngân hàng.

### 3.2. Gốc cố định, lãi giảm dần

Sau khi hết ân hạn, gốc kế hoạch được phân bổ đều theo số kỳ còn lại:

```text
gốc kỳ = dư nợ gốc còn lại / số kỳ trả gốc còn lại
tổng thanh toán kỳ = gốc kỳ + lãi kỳ
```

Số lãi giảm dần khi dư nợ giảm. Kỳ cuối được điều chỉnh số tiền gốc để tất toán hoàn toàn, tránh sai lệch do làm tròn.

### 3.3. Trả góp đều (annuity)

Với khoản vay giải ngân một lần, lãi suất không đổi và kỳ trả đều, tiền trả định kỳ có thể tính như sau:

```text
r = lãi suất năm / số kỳ trong năm
A = P × r × (1 + r)^n / ((1 + r)^n - 1)
```

Trong đó `P` là dư nợ tại lúc lập lịch, `r` là lãi suất mỗi kỳ và `n` là số kỳ còn lại. Phần lãi mỗi kỳ được tính trên dư nợ còn lại; phần còn lại của `A` là gốc.

Nếu lãi suất đổi hoặc có giải ngân thêm, hệ thống sẽ **tái lập khoản góp từ kỳ kế tiếp** trên dư nợ hiện tại và số kỳ còn lại. Đây là quy ước cần xác nhận, vì từng ngân hàng có thể giữ nguyên số tiền góp hoặc thay đổi số tiền góp/kỳ hạn.

### 3.4. Giải ngân nhiều lần

Phiên bản đầu dùng một lịch trả nợ chung. Mỗi đợt giải ngân được cộng vào dư nợ đúng ngày thực tế; từ kỳ kế tiếp, phần gốc hoặc khoản trả annuity được tái lập trên dư nợ hiện có và số kỳ còn lại. Hạn mức chưa giải ngân không được dùng để tính gốc hoặc lãi.

### 3.5. Trả trước hạn

```text
gốc trả trước thực tế = min(số tiền dự kiến trả trước, dư nợ sau khoản gốc định kỳ)
phí phạt = max(gốc trả trước thực tế × tỷ lệ phí, phí tối thiểu)
dư nợ cuối kỳ = dư nợ đầu kỳ + giải ngân - gốc định kỳ - gốc trả trước thực tế
tổng dòng tiền kỳ = gốc định kỳ + lãi kỳ + gốc trả trước thực tế + phí phạt
```

Nếu biểu phí thay đổi theo năm vay, tỷ lệ được chọn theo ngày trả trước. Nếu ngân hàng cho phép một hạn mức trả trước miễn phí, phần vượt hạn mức mới chịu phí.

## 4. Giả định cần hiển thị rõ trong sản phẩm

- Lãi phát sinh hằng ngày trên dư nợ thực tế; tổng lãi kỳ được làm tròn đến đồng Việt Nam.
- Tiền thanh toán của kỳ được ưu tiên cấn trừ lãi trước, sau đó mới đến gốc.
- Có thể bao gồm phí trả nợ trước hạn nếu người dùng khai báo; không bao gồm lãi phạt quá hạn, lãi chậm trả hoặc các khoản phí chưa khai báo.
- Khi có sự kiện cùng ngày, quy ước đề xuất: giải ngân trước, sau đó tính dư nợ chịu lãi của ngày đó. Quy ước này phải có thể điều chỉnh nếu ngân hàng áp dụng khác.
- Lịch trả nợ là ước tính; ngân hàng có thể khác ở quy tắc ngày nghỉ, làm tròn, ngày chốt lãi và cơ chế điều chỉnh lãi suất.

## 5. Dữ liệu đầu vào dự kiến

```ts
type Disbursement = {
  id: string;
  projectInstallmentId?: string;
  date: string;       // YYYY-MM-DD
  amount: number;     // VNĐ
  termMonths?: number;
};

type ProjectInstallment = {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  ownCapitalAmount: number;
  bankCapitalAmount: number;
};

type Prepayment = {
  date: string;
  amount: number;
  recalculateMode: 'reduce_payment' | 'reduce_term';
};

type PrepaymentFeeTier = {
  fromMonth: number;
  toMonth?: number;
  rate: number;
  minimumFee?: number;
  freeAllowance?: number;
};

type RatePeriod = {
  effectiveDate: string;
  annualRate: number; // phần trăm, ví dụ 7.5
};

type LoanInput = {
  projectValue: number;
  projectInstallments: ProjectInstallment[];
  bankName?: string;
  facilityAmount?: number;
  disbursements: Disbursement[];
  repaymentModel: 'equal_principal' | 'annuity';
  termMonths: number;
  paymentDay: number;
  principalGraceMonths: number;
  payPrincipalFirstPeriod: boolean;
  dayCountConvention: 'actual_365' | 'actual_360' | 'thirty_360';
  rates: RatePeriod[];
  prepayments: Prepayment[];
  prepaymentFeeTiers: PrepaymentFeeTier[];
};
```

## 6. Kết quả giao diện cần hiển thị

1. Tổng số tiền giải ngân, tổng gốc, tổng lãi ước tính và tổng tiền phải trả.
2. Khoản thanh toán dự kiến của kỳ tiếp theo.
3. Biểu đồ dư nợ theo thời gian (nếu cần trong phiên bản đầu).
4. List view lịch trả nợ với các cột mặc định:
   - Ngày tháng.
   - Kỳ thanh toán.
   - Số ngày tính lãi trong kỳ.
   - Số tiền vay còn phải trả (dư nợ cuối kỳ).
   - Số tiền gốc phải trả.
   - Lãi phải trả.
   - Tổng gốc + lãi định kỳ.
   - Số tiền dự kiến trả trước.
   - Phí phạt trả trước.
   - Tổng dòng tiền thực trả trong kỳ.
5. Chi tiết mở rộng của từng dòng hiển thị dư nợ đầu kỳ, các lần giải ngân trong kỳ, mức lãi suất và các đoạn ngày dùng để tính lãi.
6. Bảng các giả định và cảnh báo khi dữ liệu chưa đủ/không hợp lệ.
7. Khả năng tải lịch trả nợ CSV/PDF là hạng mục mở rộng.

## 7. Tiêu chí nghiệm thu phiên bản đầu

- Người dùng có thể nhập khoản giải ngân một lần và nhận lịch trả nợ hàng tháng.
- Người dùng có thể thêm, sửa, xoá nhiều đợt giải ngân; tổng giải ngân không vượt hạn mức nếu có khai báo.
- Người dùng có thể tạo tiến độ thanh toán CĐT và phân bổ vốn tự có/vốn ngân hàng cho từng đợt.
- Tổng nguồn vốn của từng đợt luôn khớp số tiền phải thanh toán; tổng tiến độ luôn khớp giá trị dự án.
- Số lãi chỉ phát sinh sau ngày của mỗi đợt giải ngân.
- Thay đổi lãi suất giữa kỳ cho ra lãi được phân đoạn đúng theo ngày hiệu lực.
- Trả trước làm giảm đúng dư nợ; phí phạt được hiển thị riêng và không làm giảm gốc.
- Tổng gốc trong toàn bộ lịch bằng tổng gốc đã giải ngân, sau sai số làm tròn không quá 1 VNĐ.
- Lịch có thể hiển thị tốt trên điện thoại và máy tính, sẵn sàng triển khai trên Vercel.

## 8. Thông tin cần bạn phản hồi

1. Loại khoản vay mục tiêu đầu tiên (mua nhà, xây sửa nhà, kinh doanh, hoặc khác).
2. Các trường đầu vào bắt buộc và công thức/lịch lãi suất ngân hàng thực tế bạn muốn mô phỏng.
3. Các điều khoản ân hạn gốc cụ thể cần mô phỏng ngoài số tháng ân hạn.
4. Hai phương thức trả nợ áp dụng: gốc cố định, lãi giảm dần và trả góp đều (annuity).
5. Quy ước lãi (Actual/365, Actual/360, 30/360), ngày trả nợ, ân hạn, phí và xử lý khi rơi vào ngày nghỉ.
6. Yêu cầu thương hiệu/giao diện hoặc ví dụ website tham khảo.
