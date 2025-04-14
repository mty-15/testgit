from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
import io
import base64
import re
from tensorflow import keras
from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.utils import to_categorical
import matplotlib.pyplot as plt

app = Flask(__name__)

# 加载并预处理MNIST数据
def load_data():
    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    x_train = x_train.reshape(-1, 28, 28, 1).astype('float32') / 255.0
    x_test = x_test.reshape(-1, 28, 28, 1).astype('float32') / 255.0
    y_train = to_categorical(y_train, 10)
    y_test = to_categorical(y_test, 10)
    return x_train, y_train, x_test, y_test

# 构建LeNet-5模型
def build_model():
    model = Sequential([
        Conv2D(6, (5, 5), activation='relu', input_shape=(28, 28, 1)),
        MaxPooling2D((2, 2)),
        Conv2D(16, (5, 5), activation='relu'),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(120, activation='relu'),
        Dense(84, activation='relu'),
        Dense(10, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

# 训练模型
def train_model():
    x_train, y_train, x_test, y_test = load_data()
    model = build_model()
    history = model.fit(x_train, y_train, epochs=10, batch_size=128, validation_split=0.2)
    model.save('mnist_model.h5')
    return model

# 加载或训练模型
try:
    model = keras.models.load_model('mnist_model.h5')
    print("加载预训练模型成功")
except:
    print("训练新模型...")
    model = train_model()

@app.route('/recognize', methods=['POST'])
def recognize():
    try:
        data = request.get_json()
        image_data = re.sub('^data:image/.+;base64,', '', data['image'])
        img = Image.open(io.BytesIO(base64.b64decode(image_data))).convert('L')
        img = img.resize((28, 28))
        img_array = np.array(img).reshape(1, 28, 28, 1).astype('float32') / 255.0
        
        prediction = model.predict(img_array)
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