# 🏗 Stage 1: Build the application with Gradle
FROM gradle:8.4-jdk21 AS builder
WORKDIR /app
COPY . .
RUN gradle build -x test

# 🚀 Stage 2: Run the application
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]