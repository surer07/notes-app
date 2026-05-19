# Use an official, lightweight Python runtime
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definitions first to leverage Docker layer caching
COPY requirements.txt .

# Install your required Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your server code into the container
COPY . .

# Expose the port your Flask app runs on
EXPOSE 5000

# Run the application
CMD ["python", "server.py"]