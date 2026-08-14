# Mô hình tính toán và dòng tiền dự án

## 1. Cách nhìn tổng quát

Ứng dụng cần tách dữ liệu thành bốn lớp. Việc tách lớp giúp một đợt thanh toán cho CĐT không bị hiểu nhầm là một đợt giải ngân, và một lần trả trước không bị trộn với khoản gốc định kỳ.

```text
Giá trị dự án
    ↓ chia thành
Tiến độ thanh toán CĐT
    ↓ phân bổ nguồn vốn
Vốn tự có + các đợt giải ngân ngân hàng
    ↓ tạo dư nợ theo thời gian
Lịch trả nợ định kỳ + các sự kiện trả trước
```

### Lớp 1 — Dự án

- Giá trị dự án/hợp đồng.
- Tên dự án, chủ đầu tư (tuỳ chọn).
- Ngân hàng và hạn mức vay.
- Tổng vốn tự có dự kiến và tổng vốn vay dự kiến.

### Lớp 2 — Tiến độ thanh toán cho CĐT

Một dự án có nhiều đợt thanh toán. Mỗi đợt có ngày dự kiến, số tiền/tỷ lệ và cơ cấu nguồn vốn:

| Chế độ nguồn vốn | Vốn tự có | Vốn ngân hàng |
| --- | ---: | ---: |
| Vốn tự có | 100% | 0% |
| Ngân hàng giải ngân | 0% | 100% |
| Kết hợp | Người dùng nhập | Phần còn lại hoặc người dùng nhập |

Hệ thống có thể cho nhập theo số tiền hoặc phần trăm. Giá trị lưu nội bộ luôn là số tiền để tránh sai số cộng dồn; đợt cuối được điều chỉnh phần làm tròn.

### Lớp 3 — Giải ngân ngân hàng

Mỗi giải ngân gồm ngày, số tiền và liên kết đến đợt thanh toán CĐT. Một đợt CĐT có thể được ngân hàng giải ngân một lần, nhiều lần hoặc không giải ngân.

Nếu người dùng mới lập kế hoạch, dùng ngày dự kiến. Khi có dữ liệu thực tế, ngày và số tiền thực tế phải được ưu tiên vì chúng quyết định lãi.

### Lớp 4 — Nghĩa vụ trả ngân hàng

Lịch trả nợ được tạo từ các sự kiện giải ngân, thay đổi lãi suất, trả định kỳ và trả trước. Đây là lớp duy nhất quyết định dư nợ và lãi phải trả.

## 2. Các chế độ giải ngân

### Chế độ A — Giải ngân một lần

Toàn bộ khoản vay được giải ngân vào một ngày. Chế độ này dùng được với cả gốc cố định, lãi giảm dần và annuity.

### Chế độ B — Nhiều giải ngân, một lịch trả nợ chung

Các đợt giải ngân cộng vào một dư nợ chung. Ngày đáo hạn chung không đổi.

Khi có giải ngân mới, ứng dụng tái lập phần gốc hoặc khoản trả annuity trên dư nợ thực tế và số kỳ còn lại, đồng thời giữ nguyên ngày đáo hạn. Hạn mức chưa giải ngân không tham gia tính lịch trả nợ.

### Chế độ C — Nhiều giải ngân, lịch riêng từng đợt

Mỗi lần giải ngân là một khoản vay con, có kỳ hạn và lịch trả riêng. Dòng hiển thị theo tháng là tổng của tất cả khoản vay con đang hoạt động. Khi mở chi tiết, người dùng xem được gốc/lãi theo từng đợt.

## 3. Các chế độ trả nợ gốc

| Chế độ | Gốc định kỳ | Đặc điểm |
| --- | --- | --- |
| Gốc cố định, lãi giảm dần | Gốc còn lại / số kỳ còn lại tại lúc lập lịch | Tổng tiền trả giảm dần. |
| Annuity | Tổng gốc + lãi gần bằng nhau | Cần tái tính khi lãi suất hoặc dư nợ thay đổi. |

Ân hạn gốc là một điều kiện riêng, không phải phương thức trả nợ thứ ba. Sau thời gian ân hạn, khoản vay tiếp tục theo một trong hai phương thức trên.

## 4. Máy tính lãi theo sự kiện

Mỗi kỳ thanh toán được chia nhỏ tại mọi ngày có sự kiện:

- Ngày giải ngân.
- Ngày thay đổi lãi suất.
- Ngày trả gốc định kỳ.
- Ngày trả trước.
- Ngày bắt đầu/kết thúc ân hạn.

Với mỗi đoạn không có biến động:

```text
lãi đoạn = dư nợ của đoạn × lãi suất năm × số ngày của đoạn / dayCountBase
lãi kỳ = tổng lãi các đoạn
```

`dayCountBase` là 365, 360 hoặc quy tắc 30/360 theo lựa chọn. Cột “số ngày” trong list view là số ngày của kỳ tính lãi, không nhất thiết bằng số ngày dương lịch của tháng nếu kỳ đầu/kỳ cuối là kỳ lẻ.

Quy ước biên ngày phải thống nhất toàn hệ thống. Mặc định đề xuất: tính lãi từ ngày giải ngân, không tính lãi trên phần gốc kể từ ngày phần gốc đó được thanh toán. Giao diện cần ghi rõ đây là quy ước mô phỏng.

## 5. Trả nợ trước hạn và phí phạt

### Dữ liệu người dùng nhập

- Ngày dự kiến trả trước.
- Số gốc dự kiến trả trước.
- Biểu phí: tỷ lệ phần trăm, phí cố định, mức tối thiểu, phần miễn phí hoặc biểu phí theo năm vay.
- Cách xử lý sau trả trước: giảm khoản trả hoặc giảm kỳ hạn.

### Thứ tự xử lý trong ngày

Mặc định đề xuất:

1. Tính lãi đến ngày trả trước.
2. Thu lãi và gốc định kỳ nếu cùng ngày đến hạn.
3. Trừ gốc trả trước khỏi dư nợ.
4. Tính phí trên số gốc trả trước thực tế.
5. Tái lập lịch từ kỳ kế tiếp.

```text
phần chịu phí = max(0, gốc trả trước - hạn mức miễn phí còn lại)
phí theo tỷ lệ = phần chịu phí × tỷ lệ phí
phí phải trả = max(phí theo tỷ lệ + phí cố định, phí tối thiểu)
```

Nếu số dự kiến trả trước lớn hơn dư nợ, hệ thống giới hạn ở dư nợ thực tế và đưa ra cảnh báo. Phí trả trước không được cộng vào dư nợ, trừ khi sau này có yêu cầu mô phỏng vốn hoá phí.

## 6. List view lịch trả nợ

Các cột mặc định theo thứ tự:

| Cột | Ý nghĩa |
| --- | --- |
| Ngày tháng | Ngày đến hạn của kỳ. |
| Kỳ thanh toán | Kỳ 1, Kỳ 2, ... |
| Số ngày | Tổng số ngày tính lãi của kỳ. |
| Số tiền vay còn phải trả | Dư nợ cuối kỳ sau gốc định kỳ và trả trước. |
| Gốc phải trả | Gốc theo lịch định kỳ. |
| Lãi phải trả | Tổng lãi của các đoạn trong kỳ. |
| Tổng gốc + lãi | Nghĩa vụ định kỳ, chưa gồm trả trước/phí. |
| Dự kiến trả trước | Phần gốc trả thêm do người dùng nhập. |
| Phạt trả trước | Phí phát sinh từ khoản trả trước. |
| Tổng thực trả | Gốc + lãi + trả trước + phí phạt. |

Để người dùng dễ kiểm tra, mỗi dòng có thể mở rộng để xem:

- Dư nợ đầu kỳ và cuối kỳ.
- Các đợt giải ngân phát sinh trong kỳ.
- Từng đoạn tính lãi: từ ngày, đến ngày, số ngày, dư nợ, lãi suất, tiền lãi.
- Công thức phí trả trước áp dụng.

Trên màn hình nhỏ, ba cột “ngày”, “tổng thực trả”, “dư nợ còn lại” được ưu tiên; các giá trị còn lại nằm trong phần mở rộng của dòng.

## 7. Kiểm tra hợp lệ và cảnh báo

- Tổng tiền thanh toán CĐT không được lệch giá trị dự án.
- Mỗi đợt CĐT phải có tổng nguồn vốn bằng số tiền đợt đó.
- Tổng giải ngân không vượt hạn mức vay.
- Tổng giải ngân liên kết tới một đợt không vượt phần vốn ngân hàng của đợt đó, trừ khi người dùng bật điều chỉnh chéo nguồn vốn.
- Ngày giải ngân không được sau ngày đáo hạn; ngày trả trước phải nằm trong thời gian khoản vay còn dư nợ.
- Không cho gốc định kỳ cộng trả trước vượt dư nợ khả dụng.
- Lịch lãi suất phải bao phủ toàn bộ thời gian có dư nợ.
- Với annuity và lãi suất thay đổi, giao diện phải thông báo khoản trả sau này chỉ là ước tính.
- Các chênh lệch do làm tròn được dồn vào kỳ cuối và phải được ghi nhận minh bạch.

## 8. Phạm vi đề xuất theo phiên bản

### Phiên bản đầu

- Giá trị dự án và tiến độ thanh toán CĐT.
- Nguồn vốn tự có/ngân hàng/kết hợp theo từng đợt.
- Giải ngân một hoặc nhiều lần với lịch chung.
- Hai phương thức: gốc cố định, lãi giảm dần và trả góp đều (annuity).
- Lãi suất cố định hoặc nhiều giai đoạn, tính theo ngày Actual/365.
- Trả trước theo lịch, phí phần trăm hoặc biểu phí theo năm, giảm khoản trả hoặc giảm kỳ hạn.
- List view và phần chi tiết công thức từng kỳ.

### Mở rộng sau

- Lịch riêng từng đợt giải ngân.
- Actual/360, 30/360, lịch ngày nghỉ và ngày làm việc ngân hàng.
- Gốc cuối kỳ, lịch gốc tùy chỉnh, lãi phạt quá hạn và vốn hoá lãi/phí.
- So sánh nhiều kịch bản, nhập dữ liệu thực tế, xuất CSV/PDF và lưu/chia sẻ phương án.
