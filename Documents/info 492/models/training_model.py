from datasets import load_dataset, DatasetDict
from transformers import AutoFeatureExtractor, AutoModelForImageClassification, TrainingArguments, Trainer
from huggingface_hub import login
import evaluate
import numpy as np
import matplotlib.pyplot as plt

# Load the dataset
dataset = load_dataset("imagefolder", data_dir="/Users/daisy./Documents/data")

# Split the dataset into training and testing
train_test_split = dataset['train'].train_test_split(test_size=0.2)
dataset = DatasetDict({
    'train': train_test_split['train'],
    'test': train_test_split['test']
})

# Load feature extractor and model
feature_extractor = AutoFeatureExtractor.from_pretrained("NehaBardeDUKE/autotrain-ai-generated-image-classification-3250490787")
model = AutoModelForImageClassification.from_pretrained("NehaBardeDUKE/autotrain-ai-generated-image-classification-3250490787")

# Preprocess the dataset
def preprocess_function(examples):
    images = [feature_extractor(image.convert("RGB"), return_tensors="pt")["pixel_values"][0] for image in examples["image"]]
    return {"pixel_values": images, "labels": examples["label"]}

dataset = dataset.map(preprocess_function, batched=True)

# Define the accuracy metric
accuracy_metric = evaluate.load("accuracy")

# Compute metrics function
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return accuracy_metric.compute(predictions=predictions, references=labels)

# Define training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    per_device_train_batch_size=32,
    per_device_eval_batch_size=32,
    num_train_epochs=10,
    learning_rate=5e-5,
    weight_decay=0.01,
    logging_dir='./logs',
    save_total_limit=2,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy"
)


# Initialize the Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    tokenizer=feature_extractor,
    compute_metrics=compute_metrics
)

# Train the model
trainer.train()

# Save the model locally
model.save_pretrained("./results")

# Log in to Hugging Face Hub
login(token="place token here")

# # Push the model to the new Hugging Face repository
model.push_to_hub("imdaisylee/test_model")

# Plot training results
train_loss = trainer.state.log_history
train_acc = [log["eval_accuracy"] for log in train_loss if "eval_accuracy" in log]
eval_loss = [log["eval_loss"] for log in train_loss if "eval_loss" in log]
epochs = range(1, len(train_acc) + 1)

# Adjust lengths if necessary
min_length = min(len(train_acc), len(eval_loss), len(epochs))
train_acc = train_acc[:min_length]
eval_loss = eval_loss[:min_length]
epochs = list(epochs)[:min_length]

plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(epochs, train_acc, 'b', label='Training accuracy')
plt.title('Training accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(epochs, eval_loss, 'r', label='Validation loss')
plt.title('Validation loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()

plt.tight_layout()
plt.show()



# Load the dataset
# dataset = load_dataset("imagefolder", data_dir="/Users/daisy./Documents/data")

# Log in to Hugging Face Hub
# login(token="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")

# # Push the model to the new Hugging Face repository
# model.push_to_hub("imdaisylee/test_model")
