# ── Stage 1: Build ──────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies (layer cache)
COPY src/StudentInfo.Api/StudentInfo.Api.csproj StudentInfo.Api/
RUN dotnet restore StudentInfo.Api/StudentInfo.Api.csproj

# Copy all source and publish
COPY src/StudentInfo.Api/ StudentInfo.Api/
WORKDIR /src/StudentInfo.Api
RUN dotnet publish -c Release -o /app/publish

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published output
COPY --from=build /app/publish .

# Azure App Service uses PORT env var; default to 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "StudentInfo.Api.dll"]
