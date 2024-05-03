# Imports
import tensorflow as tf
from tensorflow import keras
import pandas as pd
import numpy as np

from matplotlib import pyplot as plt

# Prepping data
data_dir = '/Users/vickieknight/Documents/INFO492/PixelPatrol/Data'

data = tf.keras.preprocessing.image_dataset_from_directory(data_dir)

data = data.map(lambda x, y: (x/255, y))

train_size = int(len(data)* .7)
val_size = int(len(data)* .2)
test_size = int(len(data)* .1)

train = data.take(train_size)
val = data.skip(train_size).take(val_size)
test = data.skip(train_size+val_size).take(test_size)

# Model Architecture
from functools import partial

tf.random.set_seed(42) 
DefaultConv2D = partial(tf.keras.layers.Conv2D, kernel_size=3, padding="same",
                        activation="relu", kernel_initializer="he_normal")

model = tf.keras.Sequential([
    DefaultConv2D(filters=64, kernel_size=7, input_shape=[256, 256, 3]),
    tf.keras.layers.MaxPool2D(),
    DefaultConv2D(filters=128),
    DefaultConv2D(filters=128),
    tf.keras.layers.MaxPool2D(),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(units=128, activation="relu",
                          kernel_initializer="he_normal"),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(units=64, activation="relu",
                          kernel_initializer="he_normal"),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(units=1, activation="sigmoid")
])

# Compile model
model.compile(loss="binary_crossentropy", optimizer="nadam", metrics=["accuracy"])

model.summary()

logdir = '/Users/vickieknight/Documents/INFO492/PixelPatrol/logs'

tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=logdir)

hist = model.fit(train, epochs=4, validation_data=val, callbacks=[tensorboard_callback])

score = model.evaluate(test)

acc = hist.history['accuracy']
val_acc = hist.history['val_accuracy']
loss = hist.history['loss']
val_loss = hist.history['val_loss']
epochs_range = range(1, len(hist.epoch) + 1)

plt.figure(figsize=(15,5))

plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Train Set')
plt.plot(epochs_range, val_acc, label='Val Set')
plt.legend(loc="best")
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.title('Model Accuracy')

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Train Set')
plt.plot(epochs_range, val_loss, label='Val Set')
plt.legend(loc="best")
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.title('Model Loss')

plt.tight_layout()
plt.show()

batch_size = 32

# Load the dataset
data_dir = 'PixelPatrol/Data'
dataset = tf.keras.preprocessing.image_dataset_from_directory(
    data_dir,
    labels='inferred', 
    label_mode='int',
    batch_size=batch_size,
    image_size=(256, 256),
    shuffle=True
)

# Split the dataset into train, validation, and test sets
train_size = int(len(dataset) * 0.7)
val_size = int(len(dataset) * 0.2)
test_size = int(len(dataset) * 0.1)

train = dataset.take(train_size)
val = dataset.skip(train_size).take(val_size)
test = dataset.skip(train_size + val_size).take(test_size)

# Preprocess the data for the Xception model
tf.keras.backend.clear_session()

preprocess = tf.keras.applications.xception.preprocess_input

# Apply preprocessing before batching
train = train.map(lambda x, y: (preprocess(x), y))
val = val.map(lambda x, y: (preprocess(x), y))
test = test.map(lambda x, y: (preprocess(x), y))

num_epochs = 4

# Shuffle and batch the datasets, leaving the last batch incomplete
train_set = train.shuffle(buffer_size=len(train)).unbatch().batch(batch_size).repeat(num_epochs).prefetch(1)
valid_set = val.unbatch().batch(batch_size).repeat(num_epochs)
test_set = test.unbatch().batch(batch_size).repeat(num_epochs)

# Check the element specifications
print("Train set element spec:", train_set.element_spec)
print("Validation set element spec:", valid_set.element_spec)
print("Test set element spec:", test_set.element_spec)

# using xception
tf.keras.backend.clear_session()

# batch_size = 32
preprocess = tf.keras.applications.xception.preprocess_input
train_set = train.map(lambda X, y: (preprocess(tf.cast(X, tf.float32)), y))
# train_set = train_set.shuffle(1000, seed=42).batch(batch_size).prefetch(1)
valid_set = val.map(lambda X, y: (preprocess(tf.cast(X, tf.float32)), y))
test_set = test.map(lambda X, y: (preprocess(tf.cast(X, tf.float32)), y))

tf.random.set_seed(42)  # extra code – ensures reproducibility

# Define the input tensor
input_tensor = keras.Input(shape=(256, 256, 3))

# Load the DeepFake-Detection model architecture
deepfake_detection_model = keras.models.load_model('PixelPatrol/Deepfake-Detection', compile=False)
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Create a new model with the loaded architecture and the input tensor
model = keras.Model(inputs=input_tensor, outputs=deepfake_detection_model.outputs)

# Load the weights from the saved model file
model.load_weights('PixelPatrol/Deepfake-Detection')

# Instantiate the DeepFake-Detection model
base_model = model

base_model = tf.keras.applications.xception.Xception(weights="imagenet", include_top=False, input_tensor=input)
avg = tf.keras.layers.GlobalAveragePooling2D()(base_model.output)
output = tf.keras.layers.Dense(1, activation="sigmoid")(avg)
model = tf.keras.Model(inputs=base_model.input, outputs=output)

# freezing layers
for layer in base_model.layers:
    layer.trainable = False

class PrintShapeCallback(tf.keras.callbacks.Callback):
    def on_epoch_begin(self, epoch, logs=None):
        print(f"Epoch {epoch+1}: Input shape:", self.model.input_shape)

print_shape_callback = PrintShapeCallback()

optimizer = tf.keras.optimizers.SGD(learning_rate=0.1, momentum=0.9)
model.compile(loss="binary_crossentropy", optimizer=optimizer, metrics=["accuracy"])
history = model.fit(train_set, validation_data=valid_set, epochs=4, callbacks=[print_shape_callback])

# plot model performance
acc = history.history['accuracy']
val_acc = history.history['val_accuracy']
loss = history.history['loss']
val_loss = history.history['val_loss']
epochs_range = range(1, len(history.epoch) + 1)

plt.figure(figsize=(15,5))

plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Train Set')
plt.plot(epochs_range, val_acc, label='Val Set')
plt.legend(loc="best")
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.title('Model Accuracy')

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Train Set')
plt.plot(epochs_range, val_loss, label='Val Set')
plt.legend(loc="best")
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.title('Model Loss')

plt.tight_layout()
plt.show()