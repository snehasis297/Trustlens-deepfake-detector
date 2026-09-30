# Stage 1: Multi-stage Maven build with Eclipse Temurin JDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Cache maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source and build executable JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, production JRE runtime
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create a non-root system user for security
RUN groupadd -r trustlens && useradd -r -g trustlens trustlens

# Copy fat JAR from builder
COPY --from=builder /build/target/trustlens-backend-*.jar app.jar

RUN chown -R trustlens:trustlens /app
USER trustlens

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
