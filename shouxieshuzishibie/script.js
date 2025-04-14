// 获取DOM元素
const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const recognizeBtn = document.getElementById("recognizeBtn");
const clearBtn = document.getElementById("clearBtn");
const resultDiv = document.getElementById("result");
const confidenceChart = document.getElementById("confidenceChart");

// 设置画布背景为白色
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "black";

// 绘画状态变量
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// 事件监听器
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
clearBtn.addEventListener("click", clearCanvas);
recognizeBtn.addEventListener("click", recognizeDigit);

// 开始绘画
function startDrawing(e) {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

// 绘画过程
function draw(e) {
  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 15;
  ctx.lineCap = "round";
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

// 停止绘画
function stopDrawing() {
  isDrawing = false;
}

// 清除画布
function clearCanvas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  resultDiv.innerHTML = "识别结果: ";
}

// 识别数字(调用优化后的API)
function recognizeDigit() {
  const imageData = canvas.toDataURL("image/png");

  fetch("http://localhost:5000/recognize", {
    method: "POST",
    body: JSON.stringify({ image: imageData }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        resultDiv.innerHTML = `错误: ${data.error}`;
      } else {
        resultDiv.innerHTML = `
                <strong>识别结果</strong>: ${data.digit}<br>
                <strong>置信度</strong>: ${(data.confidence * 100).toFixed(2)}%
            `;
      }
    })
    .catch((error) => {
      resultDiv.innerHTML = `请求失败: ${error}`;
    });
}
