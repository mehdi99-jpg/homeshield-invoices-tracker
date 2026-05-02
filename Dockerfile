# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the application and skip tests for faster deployment
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Expose the port Spring Boot runs on (default 8080)
EXPOSE 8080
# Run the application with the dev profile to use H2 and DataSeeder
ENTRYPOINT ["java", "-Dspring.profiles.active=dev", "-jar", "app.jar"]
