#!/bin/bash
# ========================================
# Project Core — Deploy Script
# ========================================
# Использование:
#   ./deploy.sh                  # деплой из текущей папки
#   ./deploy.sh /path/to/project # деплой из указанной папки
#
# Что делает:
#   1. Pull из git (если есть remote)
#   2. Собирает frontend
#   3. Собирает backend
#   4. Перезапускает через Docker Compose
#   5. НЕ трогает MongoDB данные и uploads
#
# Безопасность:
#   - Не удаляет MongoDB volume
#   - Не удаляет uploads папку
#   - Проверяет .env перед перезаписью
# ========================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="${1:-$(pwd)}"
cd "$PROJECT_DIR"

echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Project Core — Deploy            ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"

# 1. Проверка .env
echo -e "\n${CYAN}[1/6] Проверка .env...${NC}"
if [ ! -f ".env" ]; then
    if [ -f "backend/.env" ]; then
        cp backend/.env .env
        echo -e "  ${GREEN}✔ .env скопирован из backend/.env${NC}"
    else
        echo -e "  ${RED}✘ .env не найден! Создайте .env из .env.example${NC}"
        exit 1
    fi
fi

# 2. Git pull (если есть remote)
echo -e "\n${CYAN}[2/6] Обновление из git...${NC}"
if git remote -v >/dev/null 2>&1; then
    git fetch origin
    git reset --hard origin/main
    echo -e "  ${GREEN}✔ Код обновлён из git${NC}"
else
    echo -e "  ${YELLOW}⚠ Git remote не настроен, пропускаю pull${NC}"
fi

# 3. Установка зависимостей frontend
echo -e "\n${CYAN}[3/6] Установка зависимостей frontend...${NC}"
npm ci --only=production
echo -e "  ${GREEN}✔ Зависимости frontend установлены${NC}"

# 4. Сборка frontend
echo -e "\n${CYAN}[4/6] Сборка frontend...${NC}"
npx ng build --configuration=production
echo -e "  ${GREEN}✔ Frontend собран${NC}"

# 5. Установка зависимостей backend
echo -e "\n${CYAN}[5/6] Установка зависимостей backend...${NC}"
cd backend
npm ci --only=production
echo -e "  ${GREEN}✔ Зависимости backend установлены${NC}"

cd "$PROJECT_DIR"

# 6. Запуск через Docker Compose
echo -e "\n${CYAN}[6/6] Запуск через Docker Compose...${NC}"

# Проверяем, запущен ли уже проект
if docker compose ps >/dev/null 2>&1; then
    echo -e "  ${YELLOW}⚠ Проект уже запущен. Перезапускаю...${NC}"
    docker compose down
fi

# Запускаем с пересборкой образов
docker compose up --build -d
echo -e "  ${GREEN}✔ Docker Compose запущен${NC}"

# Ждём готовности
echo -e "  ${YELLOW}⏳ Ожидание готовности backend...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
        echo -e "  ${GREEN}✔ Backend готов${NC}"
        break
    fi
    sleep 2
done

echo -e "\n${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       Деплой завершён!              ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════╣${NC}"
echo -e "${GREEN}║ Сайт: http://localhost:3000           ║${NC}"
echo -e "${GREEN}║ API:  http://localhost:3000/api       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "Data: MongoDB volume защищён от перезаписи"
echo -e "Uploads: папка uploads защищена от перезаписи"
