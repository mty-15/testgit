from flask import Flask, request, jsonify
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import io
import base64
import re
from tensorflow import keras
from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt

app = Flask(__name__)

# 改进的图像预处理
def preprocess_image(img):
    # 转换为灰度图
    img = img.convert('L')
    # 反色处理(手写数字通常白底黑字，MNIST是黑底白字)
    img = ImageOps.invert(img)
    # 高斯模糊去噪
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    # 归一化
    img = np.array(img).astype('float32') / 255.0
    # 中心化
    img = (img - np.mean(img)) / np.std(img)
    return img.reshape(1, 28, 28, 1)

# 数据增强生成器
def create_augmenter():
    return ImageDataGenerator(
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1
    )

# 构建优化后的模型
def build_improved_model():
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
        BatchNormalization(),
        Conv2D(32, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Dropout(0.25),
        
        Conv2D(64, (3, 3), activation='relu'),
        BatchNormalization(),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Dropout(0.25),
        
        Flatten(),
        Dense(256, activation='relu'),
        BatchNormalization(),
        Dropout(0.5),
        Dense(10, activation='softmax')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

# 训练优化后的模型
def train_improved_model():
    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    x_train = x_train.reshape(-1, 28, 28, 1).astype('float32') / 255.0
    x_test = x_test.reshape(-1, 28, 28, 1).astype('float32') / 255.0
    y_train = to_categorical(y_train, 10)
    y_test = to_categorical(y_test, 10)
    
    model = build_improved_model()
    augmenter = create_augmenter()
    
    # 使用数据增强
    history = model.fit(
        augmenter.flow(x_train, y_train, batch_size=128),
        epochs=15,
        validation_data=(x_test, y_test),
        steps_per_epoch=len(x_train) // 128
    )
    
    model.save('improved_mnist_model.h5')
    return model

# 加载或训练模型
try:
    model = keras.models.load_model('improved_mnist_model.h5')
    print("加载优化后的预训练模型成功")
except:
    print("训练优化后的新模型...")
    model = train_improved_model()

@app.route('/recognize', methods=['POST'])
def recognize():
    try:
        data = request.get_json()
        image_data = re.sub('^data:image/.+;base64,', '', data['image'])
        img = Image.open(io.BytesIO(base64.b64decode(image_data)))
        
        # 使用改进的预处理
        processed_img = preprocess_image(img)
        
        prediction = model.predict(processed_img)
        digit = np.argmax(prediction)
        confidence = float(np.max(prediction))
        
        return jsonify({
            'digit': int(digit),
            'confidence': confidence
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)