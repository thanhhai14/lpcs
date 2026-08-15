# Chiến lược quảng cáo và kiếm tiền cho LPCS

> Trạng thái: Đề xuất triển khai  
> Cập nhật: 15/08/2026  
> Phạm vi: Quảng cáo hiển thị trên website LPCS; chưa bao gồm gói thuê bao hoặc bán dữ liệu.

## 1. Mục tiêu

Thêm nguồn doanh thu quảng cáo mà không làm giảm độ tin cậy của công cụ tính khoản vay, không ảnh hưởng công thức và không biến các thao tác nhập liệu thành điểm dễ bấm nhầm.

Các nguyên tắc bắt buộc:

1. Kết quả tính toán và trải nghiệm người dùng quan trọng hơn số lượng quảng cáo.
2. Không gửi số tiền vay, giá trị dự án, dư nợ, lịch giải ngân hoặc dữ liệu người dùng nhập cho mạng quảng cáo.
3. Không đặt quảng cáo gần input, nút thêm/xóa, nút xuất Excel, nút in, nút phân trang hoặc nút mở chi tiết kỳ.
4. Không khuyến khích người dùng nhấp quảng cáo dưới bất kỳ hình thức nào.
5. Quảng cáo không xuất hiện trong bản in hoặc tệp Excel.
6. Mọi vị trí quảng cáo phải có không gian dành sẵn để tránh làm xô lệch giao diện khi quảng cáo tải muộn.

## 2. Mô hình kiếm tiền đề xuất

### Giai đoạn đầu: Google AdSense với ad unit thủ công

Nên bắt đầu bằng **responsive display ad unit đặt thủ công** thay vì bật toàn bộ Auto ads.

Lý do:

- LPCS là ứng dụng tương tác dày đặc, có nhiều input và nút thao tác. Vị trí thủ công giúp kiểm soát khoảng cách giữa quảng cáo và chức năng.
- Có thể bảo đảm quảng cáo chỉ xuất hiện sau khu vực nhập liệu chính.
- Dễ đo doanh thu và ảnh hưởng của từng vị trí.
- Dễ tắt một vị trí mà không thay đổi toàn bộ trang.

Google hỗ trợ cả Auto ads và ad unit thủ công. Auto ads có ưu điểm đơn giản nhưng tự lựa chọn vị trí dựa trên cấu trúc trang. Với LPCS, Auto ads chỉ nên được thử sau khi các vùng form, bảng lịch trả nợ và nút thao tác đã được cấu hình là vùng loại trừ.

### Giai đoạn sau

Khi có lượng truy cập ổn định, có thể xem xét:

- Auto ads dạng side rail trên màn hình rộng.
- Tài trợ trực tiếp từ ngân hàng, công ty bảo hiểm hoặc nền tảng bất động sản.
- Affiliate cho sản phẩm tài chính phù hợp, được ghi nhãn rõ ràng.
- Gói LPCS không quảng cáo hoặc tính năng nâng cao có trả phí.

Tài trợ và affiliate cần được đánh giá pháp lý, nội dung và xung đột lợi ích riêng; không nên trộn vào lần triển khai AdSense đầu tiên.

### Các mạng quảng cáo thay thế AdSense

Không có mạng nào đồng thời bảo đảm tuyệt đối ba yếu tố: duyệt rất dễ, doanh thu cao và lọc chính xác 100% nội dung nhạy cảm. Category blocking vẫn có thể bỏ sót creative bị phân loại sai, vì vậy LPCS cần thêm blocklist, quy trình báo cáo và kill switch ở phía ứng dụng.

| Mạng | Mức độ gia nhập | Kiểm soát nội dung | Mobile web | Mức phù hợp với LPCS |
| --- | --- | --- | --- | --- |
| **Media.net** | Trung bình; từng website phải được duyệt | Hỗ trợ blocklist theo advertiser/domain và danh mục IAB | Có định dạng tối ưu cho mobile | **Ưu tiên thay thế số 1** nếu được duyệt |
| **Adsterra** | Dễ; công bố không yêu cầu traffic tối thiểu và thường duyệt nhanh | Có mainstream/non-mainstream, tùy chọn không cho phép mọi loại quảng cáo và một số exclusion; cần yêu cầu manager chặn thêm | Native Banner/Banner hoạt động trên mobile | **Phương án dễ triển khai nhất**, nhưng phải cấu hình chặt |
| **Monetag** | Tương đối dễ | Có thể yêu cầu support chặn creative cụ thể; tài liệu công khai chưa thể hiện bộ lọc category self-service mạnh như Media.net/Ezoic | In-Page Push hoạt động trên web mobile, gồm iOS | Chỉ nên là **phương án dự phòng** |
| **Ezoic** | Khó với site mới; từ 2026 thường yêu cầu 250.000 MAU hoặc vào Incubator giới hạn | Có Ad Categories, mặc định chặn một số nhóm sexual/social casino và cho phép chặn gambling | Có | Phù hợp khi LPCS đã có traffic lớn, không phải lựa chọn khởi động |
| **Journey by Mediavine** | Cần chạy Grow để đánh giá, nội dung brand-safe và lịch sử domain | Thiên về inventory thương hiệu an toàn nhưng publisher có ít quyền kiểm soát vị trí hơn | Có | Hợp với website nội dung hơn một calculator đơn trang |
| **HilltopAds** | Dễ, không yêu cầu traffic tối thiểu | Nguồn advertiser mạnh ở iGaming/dating; phải phụ thuộc cấu hình mainstream và manager | Có Banner/In-Page trên mobile | **Không khuyến nghị** cho LPCS |

#### Khuyến nghị lựa chọn

1. Nộp **AdSense** và **Media.net** sau khi hoàn thiện lớp nội dung/pháp lý.
2. Nếu cần kiếm tiền sớm trong lúc chờ duyệt, thử **Adsterra Native Banner** với một slot duy nhất.
3. Chỉ bật traffic/creative **mainstream**; giữ tùy chọn cho phép mọi loại quảng cáo hoặc `BOOST CPM` ở trạng thái tắt.
4. Gửi yêu cầu bằng văn bản cho account manager để chặn ít nhất:
   - Adult, sexual content và dating.
   - Gambling, betting, casino và social casino.
   - Rượu, thuốc lá, chất kích thích.
   - Get-rich-quick, khoản vay không minh bạch và sản phẩm tài chính có dấu hiệu lừa đảo.
5. Chỉ dùng **Native Banner** hoặc banner hiển thị tiêu chuẩn. Không dùng Popunder, Direct Link/SmartLink, Vignette, Interstitial hoặc Push subscription.
6. Kiểm tra creative thực tế từ thiết bị và IP tại Việt Nam trước khi mở toàn bộ traffic.
7. Không chạy nhiều mạng cùng lúc trong thử nghiệm đầu; đo từng mạng riêng để xác định nguồn gây lỗi, CLS hoặc creative xấu.

#### Cấu hình Adsterra an toàn hơn cho LPCS

Nếu ưu tiên “dễ duyệt”, cấu hình thử nghiệm nên là:

| Thành phần | Thiết lập |
| --- | --- |
| Website/traffic type | Mainstream |
| Ad format | Native Banner; nếu không phù hợp thì Banner |
| Allow all ad types / BOOST CPM | Tắt |
| Slot | Một vị trí trước bảng lịch trả nợ |
| Mobile | Responsive hoặc kích thước banner dành cho mobile |
| Category exclusions | Adult, dating, gambling/betting/casino và các nhóm nhạy cảm khác |
| Tần suất kiểm tra | Hằng ngày trong tuần đầu; sau đó hằng tuần |
| Xử lý sự cố | Chụp creative/URL, tắt feature flag và gửi manager block ngay |

Đây là phương án dễ gia nhập, không phải phương án có chất lượng inventory cao nhất. Nếu mạng không xác nhận được category block ở cấp tài khoản/site, không phát hành trên LPCS.

#### Mobile web và ứng dụng mobile native

LPCS hiện là website Next.js responsive triển khai trên Vercel. “Hỗ trợ mobile” trong tài liệu này nghĩa là quảng cáo chạy trong Safari/Chrome trên điện thoại và tablet; hầu hết mạng trên tích hợp bằng script nên không cần backend riêng.

Nếu sau này đóng gói LPCS thành ứng dụng iOS/Android native hoặc WebView:

- Không tự động tái sử dụng ad tag dành cho website.
- Kiểm tra điều khoản WebView/app inventory của từng mạng.
- Với hệ Google, dùng giải pháp dành cho ứng dụng như AdMob thay vì AdSense for Content.
- Tạo kế hoạch consent, app store disclosure và SDK riêng.

## 3. Điều kiện trước khi đăng ký AdSense

AdSense yêu cầu chủ tài khoản đủ tuổi, sở hữu hoặc kiểm soát website, có nội dung nguyên bản và tuân thủ chính sách chương trình. Việc đáp ứng checklist không đồng nghĩa chắc chắn được duyệt.

### Website và nội dung

- Dùng tên miền riêng và xác minh quyền sở hữu.
- Website hoạt động ổn định trên HTTPS, không có trang lỗi hoặc liên kết hỏng.
- Có điều hướng rõ ràng tới trang giới thiệu, hướng dẫn, quyền riêng tư và điều khoản.
- Công khai cách LPCS tính lãi, xử lý Kỳ 0, giải ngân nhiều lần và trả trước.
- Bổ sung nội dung nguyên bản giúp người dùng hiểu kết quả, ví dụ:
  - Cách đọc lịch trả nợ.
  - Gốc cố định khác Annuity như thế nào.
  - Vì sao lãi Actual/365 thay đổi theo số ngày.
  - Ví dụ giải ngân một lần và nhiều lần.
  - Giới hạn của công cụ và cách đối chiếu với ngân hàng.
- Có sitemap, robots.txt và metadata phù hợp để công cụ tìm kiếm đọc được nội dung.

LPCS hiện có giá trị sử dụng thực tế nhưng vẫn là một trang công cụ. Vì vậy, bổ sung lớp nội dung hướng dẫn nguyên bản là bước nên làm trước khi gửi xét duyệt, thay vì tạo nhiều bài viết mỏng chỉ để tăng số trang.

### Các trang pháp lý và tin cậy

Tối thiểu nên có:

- `/about`: LPCS là gì, đơn vị/cá nhân vận hành và phạm vi công cụ.
- `/guide`: hướng dẫn sử dụng và giải thích công thức.
- `/privacy`: dữ liệu localStorage, Analytics, quảng cáo, cookie, IP và bên thứ ba.
- `/terms`: điều khoản sử dụng và giới hạn trách nhiệm.
- `/contact`: phương thức liên hệ hoặc nhận phản hồi.

Google yêu cầu publisher có chính sách quyền riêng tư mô tả rõ việc thu thập, chia sẻ và sử dụng dữ liệu do sản phẩm quảng cáo tạo ra, bao gồm cookie, web beacon, địa chỉ IP hoặc định danh khác.

## 4. Ranh giới dữ liệu tài chính

Google Publisher Policies hạn chế dùng thông tin tài chính nhạy cảm hoặc tình trạng tài chính bất lợi để cá nhân hóa quảng cáo. LPCS phải áp dụng ranh giới kỹ thuật chặt hơn mức tối thiểu:

### Không được gửi ra ngoài

- Giá trị dự án.
- Hạn mức vay và số tiền giải ngân.
- Dư nợ, số gốc, số lãi hoặc phí.
- Ngày giải ngân, ngày trả nợ hoặc kế hoạch trả trước.
- Tên ngân hàng do người dùng nhập.
- Phương thức trả nợ gắn với một phiên/người dùng cụ thể.
- Toàn bộ state đang lưu trong localStorage.

### Không được thực hiện

- Đưa dữ liệu khoản vay vào URL hoặc query string.
- Dùng dữ liệu input làm custom targeting, custom dimension hoặc audience.
- Gửi toàn bộ biểu mẫu trong analytics event.
- Ghi log nội dung khoản vay ở server, error tracker hoặc công cụ session replay.
- Tạo nội dung quảng cáo giả dạng kết quả tư vấn vay.

### Analytics được phép ở mức tổng hợp

Có thể đo các sự kiện không chứa giá trị tài chính, ví dụ:

- `calculator_started`
- `schedule_generated`
- `excel_exported`
- `report_printed`
- `repayment_method_selected` với giá trị chung `equal_principal` hoặc `annuity`

Không gửi ID đợt, ngày, số tiền hoặc snapshot biểu mẫu kèm sự kiện.

## 5. Vị trí quảng cáo đề xuất

### Slot A — Trước lịch trả nợ

Vị trí: sau khối **Biên độ trả nợ hàng tháng**, trước `schedule-shell`.

Định dạng:

- Desktop: responsive horizontal.
- Mobile: responsive rectangle/full-width.
- Nhãn tách biệt: `Quảng cáo`.
- Có padding trên và dưới; không dính sát header của bảng.

Đây là vị trí khởi động tốt nhất vì người dùng đã hoàn thành nhập liệu và đọc tóm tắt, nhưng chưa thao tác với từng dòng lịch trả nợ.

### Slot B — Sau toàn bộ kết quả

Vị trí: sau disclaimer của phần kết quả, trước footer website.

Đặc điểm:

- Ít nguy cơ click nhầm.
- Không cản trở luồng tính toán.
- Viewability có thể thấp hơn Slot A.

### Slot C — Side rail, chỉ thử nghiệm sau

Chỉ dùng trên màn hình đủ rộng và không làm giảm chiều rộng bảng. Ưu tiên side rail của Auto ads sau khi đã đánh giá Slot A/B.

### Vị trí không được sử dụng

- Trong hero hoặc chen giữa tiêu đề và form đầu tiên.
- Bên trong `form-grid`, `installment-list` hoặc `prepayment-items`.
- Giữa label và input.
- Gần nút thêm/xóa đợt, trả trước, Excel hoặc in.
- Xen giữa các dòng của `schedule-table`.
- Gần nút Trang trước/Trang sau hoặc vùng mở chi tiết kỳ.
- Trong modal, popup tự mở hoặc cửa sổ không có điều hướng.
- Bản in và workbook Excel.

### Số lượng khởi động

Khởi động với **một slot duy nhất (Slot A)**. Chỉ bật Slot B sau khi có dữ liệu về trải nghiệm và hiệu suất. Không đặt mục tiêu số lượng quảng cáo cố định; mật độ phải được quyết định dựa trên nội dung, màn hình và hành vi thực tế.

## 6. Kiến trúc kỹ thuật đề xuất cho Next.js

### Cấu trúc tệp

```text
components/ads/AdSenseScript.tsx   Nạp script quảng cáo sau consent
components/ads/AdSlot.tsx          Ad unit responsive dùng lại được
lib/ads.ts                         Cấu hình client ID, slot ID và feature flag
app/privacy/page.tsx               Chính sách quyền riêng tư
app/terms/page.tsx                 Điều khoản sử dụng
public/ads.txt                      Danh sách publisher được phép bán inventory
```

### Biến môi trường

```text
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADSENSE_SLOT_RESULTS=xxxxxxxxxx
NEXT_PUBLIC_ADS_ENABLED=false
```

Các giá trị `NEXT_PUBLIC_*` sẽ xuất hiện ở phía trình duyệt; đây không phải secret. Không hard-code publisher ID thử nghiệm vào nhiều component.

### Nạp script

- Dùng `next/script` với chiến lược `afterInteractive` hoặc `lazyOnload`.
- Khi áp dụng consent chế độ cơ bản, chỉ nạp ad script sau khi có tín hiệu đồng ý phù hợp.
- Không nạp quảng cáo trong development và automated test.
- Component phải chống gọi `(adsbygoogle).push()` lặp lại khi React Strict Mode render lại.
- Lỗi hoặc ad blocker không được làm hỏng máy tính khoản vay.

### Không gian quảng cáo

Container phải có kích thước tối thiểu theo breakpoint trước khi script tải. Mục tiêu là tránh CLS do ad unit xuất hiện muộn.

Đề xuất ban đầu để thử nghiệm:

```css
.ad-slot {
  min-height: 250px;
}

@media (max-width: 760px) {
  .ad-slot {
    min-height: 120px;
  }
}

@media print {
  .ad-slot {
    display: none !important;
  }
}
```

Kích thước cuối cùng cần được điều chỉnh theo ad unit thực tế và dữ liệu CLS. Không xóa container ngay khi quảng cáo chưa fill nếu hành động đó tạo ra layout shift.

### ads.txt

Sau khi có publisher ID, tạo `public/ads.txt` để Vercel phục vụ tại:

```text
https://<domain>/ads.txt
```

Nội dung phải lấy trực tiếp từ tài khoản AdSense, ví dụ định dạng:

```text
google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0
```

Không commit publisher ID giả hoặc ID của tài khoản khác.

## 7. Consent, cookie và quyền riêng tư

### Người dùng tại EEA, Anh và Thụy Sĩ

Khi phục vụ quảng cáo cá nhân hóa tại các khu vực này, Google yêu cầu publisher dùng CMP được Google chứng nhận và tích hợp IAB TCF. Có thể dùng Google CMP trong mục **Privacy & messaging** hoặc một CMP được chứng nhận khác.

Luồng cần hỗ trợ:

1. Hiển thị thông tin về mục đích và đối tác xử lý dữ liệu.
2. Cho phép đồng ý, từ chối và quản lý lựa chọn.
3. Cho phép người dùng mở lại phần cài đặt để thay đổi/rút lại lựa chọn.
4. Không nạp tag cần consent trên chính trang chính sách quyền riêng tư trước khi có consent phù hợp.

### Người dùng tại Việt Nam

Trước khi phát hành quảng cáo, cần rà soát nghĩa vụ theo **Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân** và các quy định quảng cáo đang áp dụng. Tài liệu này là kế hoạch sản phẩm, không thay thế tư vấn pháp lý.

Chính sách quyền riêng tư phải phân biệt rõ:

- Dữ liệu LPCS lưu cục bộ bằng localStorage.
- Dữ liệu Vercel Analytics xử lý.
- Cookie, IP hoặc định danh mà Google và đối tác quảng cáo có thể xử lý.
- Mục đích, thời hạn, quyền lựa chọn và cách liên hệ của người dùng.

## 8. Chính sách lưu lượng và click

Tuyệt đối không:

- Tự nhấp quảng cáo trên website của mình.
- Yêu cầu bạn bè, người dùng hoặc nhân viên nhấp quảng cáo.
- Viết nội dung như “ủng hộ LPCS bằng cách bấm quảng cáo”.
- Mua bot, traffic exchange, pop-under hoặc nguồn traffic không xác định.
- Tự động refresh ad unit để tăng impression.
- Làm quảng cáo giống nút tải Excel, nút in hoặc một kết quả tính toán.

Trong quá trình phát triển, chỉ hiển thị placeholder nội bộ; không tương tác với quảng cáo thật để kiểm tra liên kết.

## 9. Hiệu suất và trải nghiệm

### Chỉ số bảo vệ trải nghiệm

- CLS ở mức tốt: mục tiêu không quá `0.1` tại phân vị 75% lượt truy cập.
- Không để script quảng cáo làm chậm phản hồi input hoặc tạo lịch trả nợ.
- Không thay đổi kết quả tính toán khi ad blocker chặn script.
- Không làm giảm khả năng sử dụng bảng trên mobile.
- Không tự phát âm thanh, popup hoặc chiếm toàn màn hình trong giai đoạn đầu.

### Kỹ thuật

- Reserve space cho ad slot.
- Lazy-load slot nằm dưới viewport.
- Nạp script không đồng bộ.
- Theo dõi Core Web Vitals trước và sau khi bật quảng cáo.
- Dùng Error Boundary hoặc xử lý lỗi cục bộ quanh ad component.
- Loại quảng cáo khỏi print CSS và không đưa vào dữ liệu export.

## 10. Chỉ số kinh doanh

Theo dõi theo tuần và theo thiết bị:

| Nhóm | Chỉ số |
| --- | --- |
| Doanh thu | Estimated earnings, Page RPM, Impression RPM |
| Inventory | Ad requests, matched requests, impressions |
| Chất lượng | Active View viewability, invalid traffic deduction |
| Sản phẩm | Tỷ lệ tạo được lịch, tỷ lệ xuất Excel/in, thời gian hoàn thành form |
| Hiệu suất | CLS, LCP, INP, lỗi JavaScript |

Công thức dự báo đơn giản:

```text
doanh thu tháng dự kiến = pageview tháng / 1.000 × Page RPM
```

Không dùng CTR làm mục tiêu thiết kế. CTR tăng bất thường có thể là dấu hiệu click nhầm hoặc traffic không hợp lệ.

Mẫu dự báo cần điền sau khi có dữ liệu:

| Kịch bản | Pageview/tháng | Page RPM | Doanh thu dự kiến |
| --- | ---: | ---: | ---: |
| Thấp | — | — | — |
| Cơ sở | — | — | — |
| Tăng trưởng | — | — | — |

Không nên tự đặt RPM giả định trước khi biết quốc gia người dùng, nguồn traffic, thiết bị và tỷ lệ fill.

## 11. Lộ trình triển khai

### Giai đoạn 0 — Chuẩn bị nội dung và pháp lý

- [ ] Hoàn thiện About, Guide, Privacy, Terms và Contact.
- [ ] Công khai công thức, ví dụ và giới hạn của LPCS.
- [ ] Thêm footer và điều hướng tới các trang trên.
- [ ] Thiết lập sitemap, robots.txt, canonical URL và Search Console.
- [ ] Kiểm tra responsive, accessibility và liên kết hỏng.
- [ ] Rà soát Nghị định 13/2023/NĐ-CP và quy định quảng cáo áp dụng.

### Giai đoạn 1 — Đăng ký và xác minh

- [ ] Dùng tên miền production riêng.
- [ ] Đăng ký hoặc liên kết tài khoản AdSense.
- [ ] Xác minh website bằng script hoặc meta tag do AdSense cung cấp.
- [ ] Gửi website xét duyệt.
- [ ] Không hiển thị ad slot production trước khi có mã hợp lệ và cấu hình hoàn chỉnh.

### Giai đoạn 2 — Hạ tầng quảng cáo

- [ ] Thêm feature flag và biến môi trường.
- [ ] Thêm CMP/consent flow.
- [ ] Tạo Privacy settings/revoke consent link.
- [ ] Thêm `AdSenseScript` và `AdSlot`.
- [ ] Tạo `ads.txt` từ dữ liệu trong tài khoản.
- [ ] Thiết lập CSP nếu dự án bật Content Security Policy.
- [ ] Bảo đảm quảng cáo bị ẩn khi in.

### Giai đoạn 3 — Ra mắt có kiểm soát

- [ ] Chỉ bật Slot A.
- [ ] Theo dõi lỗi, CLS, viewability và tỷ lệ hoàn thành lịch trong ít nhất hai tuần.
- [ ] Kiểm tra báo cáo Policy center và invalid traffic.
- [ ] So sánh mobile/desktop trước khi bật thêm vị trí.

### Giai đoạn 4 — Tối ưu

- [ ] Thử Slot B nếu Slot A không ảnh hưởng trải nghiệm.
- [ ] Thử nghiệm ad load hoặc Auto ads trên một phần traffic.
- [ ] Cấu hình excluded areas quanh toàn bộ vùng tương tác.
- [ ] Tắt vị trí có viewability thấp, CLS cao hoặc ảnh hưởng conversion.
- [ ] Đánh giá gói không quảng cáo khi có người dùng quay lại ổn định.

## 12. Tiêu chí nghiệm thu kỹ thuật

- Không có dữ liệu tài chính nào xuất hiện trong request quảng cáo hoặc analytics.
- Khi tắt `NEXT_PUBLIC_ADS_ENABLED`, không tải script hoặc tạo ad request.
- Khi ad blocker hoạt động, calculator, Excel và print vẫn dùng được.
- Ad slot không xuất hiện trong print preview và Excel.
- Không có quảng cáo gần vùng thao tác có nguy cơ click nhầm.
- Consent được lưu và có thể thay đổi theo yêu cầu áp dụng.
- `ads.txt` truy cập được từ root domain và chứa đúng publisher ID.
- Không có lỗi hydration hoặc gọi ad slot lặp lại khi điều hướng/render lại.
- Core Web Vitals được đo trước và sau khi bật quảng cáo.
- Test, lint và production build tiếp tục thành công.

## 13. Quyết định cần chốt trước khi viết code

| Quyết định | Khuyến nghị mặc định |
| --- | --- |
| Mạng quảng cáo | AdSense; Media.net là phương án thay thế ưu tiên |
| Cách đặt quảng cáo | Manual responsive ad unit |
| Vị trí đầu tiên | Sau thống kê, trước bảng lịch trả nợ |
| Số slot ban đầu | 1 |
| Auto ads | Tắt ở lần phát hành đầu |
| Overlay/anchor/vignette | Tắt ở lần phát hành đầu |
| Consent | Google CMP hoặc CMP được Google chứng nhận |
| Dữ liệu input dùng cho targeting | Không |
| Hiển thị trong print/Excel | Không |
| Feature flag | Bắt buộc |

## 14. Nguồn chính thức tham khảo

- [Eligibility requirements for AdSense](https://support.google.com/adsense/answer/9724?hl=en)
- [Make sure your site's pages are ready for AdSense](https://support.google.com/adsense/answer/7299563?hl=en-EN)
- [Google Publisher Policies](https://support.google.com/publisherpolicies/answer/10502938?hl=en)
- [Ad placement policies](https://support.google.com/adsense/answer/1346295?hl=en)
- [Invalid traffic and policy violations](https://support.google.com/adsense/answer/2660562?hl=en)
- [Set up ads on your site](https://support.google.com/adsense/answer/7037624?hl=en-EN)
- [About Auto ads](https://support.google.com/adsense/answer/9261805?hl=en)
- [Consent requirements for EEA, UK and Switzerland](https://support.google.com/adsense/answer/13554020?hl=en)
- [Connect your site to AdSense and ads.txt](https://support.google.com/adsense/answer/7584263?hl=en)
- [Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls?hl=en)
- [Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân](https://vanban.chinhphu.vn/default.aspx?docid=207759&pageid=27160)
- [Media.net OpenBidder: ad formats và category blocklists](https://openbidding.media.net/help-center)
- [Media.net: mobile ads và lọc advertiser/topic](https://g-contextualads-origin.media.net/features.php)
- [Adsterra publisher requirements và ad formats](https://adsterra.com/blog/set-up-publishers-dashboard/)
- [Adsterra Native Banner và exclusion](https://adsterra.com/blog/turn-a-profit-with-native-banners/)
- [Monetag In-Page Push trên mobile web](https://help.monetag.com/en/articles/6959534-in-page-push-notifications-ipp)
- [Monetag xử lý creative không phù hợp](https://help.monetag.com/en/articles/6726731-is-there-any-guarantee-i-will-not-get-malware-or-viruses-through-your-ads)
- [Ezoic requirements](https://support.ezoic.com/kb/article/getting-started-ezoics-requirements%3Fid%3Dgetting-started-ezoics-requirements%26lang%3Den-US)
- [Ezoic Ad Categories](https://support.ezoic.com/kb/article/understanding-ad-categories)
- [Journey by Mediavine onboarding](https://www.journeymv.com/getting-started-with-journey-by-mediavine/)
- [HilltopAds traffic và formats](https://hilltopads.com/publishers-help/en/articles/10851783-what-traffic-can-i-monetize-with-hilltopads)

Các chính sách và yêu cầu nền tảng có thể thay đổi. Cần rà soát lại các liên kết trên ngay trước khi triển khai production hoặc gửi website xét duyệt lại.
