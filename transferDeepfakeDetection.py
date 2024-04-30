import torch
import torchvision.models as models
from torch import nn
from torchvision import datasets, transforms

# Load a pre-trained Deepfake model
model_path = 'Deepfake-Detection/ffpp_c40.pth'  
model = torch.load(model_path)
model.eval()  # Set the model to evaluation mode


# Freeze all the parameters in the network
for param in model.parameters():
    param.requires_grad = False

# Replace the top layer for deepfake detection
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, 2)  # Binary classification

# Define loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)

# Define the transformations
transform = transforms.Compose([
    # Add your desired transformations here
])

# Load the datasets
train_dataset = datasets.ImageFolder('path/to/train/dataset', transform=transform)
val_dataset = datasets.ImageFolder('path/to/val/dataset', transform=transform)

# Create the data loaders
train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = torch.utils.data.DataLoader(val_dataset, batch_size=32, shuffle=False)

def train(model, train_loader, criterion, optimizer, device):
    model.train()  # Set the model to training mode
    running_loss = 0.0

    for inputs, labels in train_loader:
        inputs, labels = inputs.to(device), labels.to(device)

        optimizer.zero_grad()

        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)

    epoch_loss = running_loss / len(train_loader.dataset)
    return epoch_loss


def validate(model, val_loader, criterion, device):
    model.eval()  # Set the model to evaluation mode
    running_loss = 0.0

    for inputs, labels in val_loader:
        inputs, labels = inputs.to(device), labels.to(device)

        outputs = model(inputs)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * inputs.size(0)

    epoch_loss = running_loss / len(val_loader.dataset)
    return epoch_loss

# Train the model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

num_epochs = 10  # Set the desired number of epochs

for epoch in range(num_epochs):
    train_loss = train(model, train_loader, criterion, optimizer, device)
    val_loss = validate(model, val_loader, criterion, device)
    print(f'Epoch {epoch+1}/{num_epochs}, Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}')