
        const { jsPDF } = window.jspdf;

        window.addEventListener('load', function() {
            // Khởi tạo biểu đồ
            const options = {
        series: [0, 0], // Sẽ được cập nhật bằng dữ liệu thực
        colors: ["#1C64F2", "#E02424"], // Xanh cho Gốc, Đỏ cho Lãi
        chart: {
            height: 360, // Thu nhỏ chiều cao tổng thể một chút
            type: "donut",
            fontFamily: "Inter, sans-serif" // Sử dụng phông chữ chuẩn Flowbite
        },
        labels: ["Tiền gốc", "Tiền lãi"],
        stroke: { colors: ["transparent"] }, // Làm cho các viền trong suốt
        legend: {
            position: "bottom", // Chuyển chú thích xuống dưới
            offsetY: 0,
            fontSize: '12px', // Thu nhỏ kích thước phông chú thích
            markers: { radius: 12 } // Làm cho các dấu tròn đẹp hơn
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "75%", // *** TĂNG KÍCH THƯỚC LỖ TRUNG TÂM (trước đây có thể là 65-70%) ***
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: "10px", // *** THU NHỎ PHÔNG CHỮ NHÃN (ví dụ: 'Tổng trả') ***
                            offsetY: 15 // *** ĐIỀU CHỈNH VỊ TRÍ NHÃN LÊN TRÊN MỘT CHÚT ***
                        },
                        value: {
                            show: true,
                            fontSize: "12px", // *** THU NHỎ PHÔNG CHỮ GIÁ TRỊ (con số tiền) ***
                            fontWeight: 700,
                            color: "#111827", // Màu chữ đậm của Flowbite
                            offsetY: -20, // *** ĐIỀU CHỈNH VỊ TRÍ CON SỐ LÊN TRÊN ***
                            formatter: function (val) {
                                // Sử dụng hàm định dạng tiền tệ có sẵn (sẽ được định nghĩa sau)
                                return formatCurrency(val);
                            }
                        },
                        total: {
                            show: true,
                            label: "Tổng trả",
                            fontSize: "13px",
                            color: "#6B7280", // Màu chữ xám của Flowbite
                            formatter: function (w) {
                                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                return formatCurrency(sum);
                            }
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false }, // Ẩn các nhãn dữ liệu trên các phần của biểu đồ
        responsive: [{ // Cấu hình cho màn hình nhỏ
            breakpoint: 480,
            options: {
                chart: { height: 360 },
                legend: { position: "bottom" }
            }
        }]
    };

            const chart = new ApexCharts(document.querySelector("#donut-chart"), options);
            chart.render();

            // Các phần tử DOM
            const inputAmount = document.getElementById('loan-amount');
            const inputRate = document.getElementById('annual-interest');
            const inputYears = document.getElementById('loan-years');

            function formatCurrency(value) {
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
            }

            function calculateLoan() {
                const P = parseFloat(inputAmount.value) || 0; // Tiền gốc
                const annualR = (parseFloat(inputRate.value) || 0) / 100; // Lãi năm
                const monthlyR = annualR / 12; // Lãi tháng
                const n = (parseFloat(inputYears.value) || 0) * 12; // Tổng số tháng

                let monthlyPayment = 0;
                let totalInterest = 0;

                if (monthlyR > 0) {
                    // Công thức Amortization: M = P * [r(1+r)^n] / [(1+r)^n - 1]
                    monthlyPayment = P * (monthlyR * Math.pow(1 + monthlyR, n)) / (Math.pow(1 + monthlyR, n) - 1);
                } else {
                    monthlyPayment = P / n;
                }

                const totalPayment = monthlyPayment * n;
                totalInterest = totalPayment - P;

                // Cập nhật giao diện
                document.getElementById('monthly-payment').innerText = formatCurrency(monthlyPayment);
                document.getElementById('total-payment').innerText = formatCurrency(totalPayment);
                document.getElementById('total-interest').innerText = formatCurrency(totalInterest);

                // Cập nhật biểu đồ
                chart.updateSeries([P, totalInterest]);
            }

            // Lắng nghe sự kiện
            [inputAmount, inputRate, inputYears].forEach(el => el.addEventListener('input', calculateLoan));

            // Tính toán lần đầu
            calculateLoan();

            // Xử lý xuất PDF
            document.getElementById('download-pdf').addEventListener('click', function() {
                const btn = this;
                btn.innerText = "Đang xử lý...";
                
                const element = document.getElementById('export-area');
                html2canvas(element, { scale: 2 }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    
                    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
                    pdf.save("Bang-tinh-lai-suat.pdf");
                    
                    btn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="C4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Tải xuống PDF';
                });
            });
        });
