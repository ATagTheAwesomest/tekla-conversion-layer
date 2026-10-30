FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/TeklaConversionLayer/TeklaConversionLayer.csproj src/TeklaConversionLayer/
RUN dotnet restore src/TeklaConversionLayer/TeklaConversionLayer.csproj
COPY src/ src/
RUN dotnet publish src/TeklaConversionLayer/TeklaConversionLayer.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "TeklaConversionLayer.dll"]
