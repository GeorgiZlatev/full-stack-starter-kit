# 🚀 Full-Stack Starter Kit

**Laravel Backend + Next.js Frontend с Role-Based Authentication и AI Tools Management**

## 📋 Съдържание

- [Инсталация](#инсталация)
- [Docker Setup](#docker-setup)
- [Добавяне на AI Tools](#добавяне-на-ai-tools)
- [Коментари и рейтинги](#коментари-и-рейтинги)
- [Ролева система](#ролева-система)
- [Админ панел](#админ-панел)
- [API Документация](#api-документация)
- [AI Агенти](#ai-агенти)
- [Troubleshooting](#troubleshooting)

## 🛠️ Инсталация

### Предварителни изисквания

- Docker & Docker Compose
- Node.js 18+ (за frontend development)
- PHP 8.1+ (за backend development)

### 1. Клониране на проекта

```bash
git clone <repository-url>
cd full-stack-starter-kit
```

### 2. Backend Setup (Laravel)

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
```

### 3. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker Setup

### Стартиране с Docker

```bash
# Стартиране на всички услуги
docker-compose up -d

# Проверка на статуса
docker-compose ps

# Логове
docker-compose logs -f
```

### Услуги

- **Backend**: `http://localhost:8200`
- **Frontend**: `http://localhost:3000`
- **Database**: MySQL на порт 3306
- **Redis**: Порт 6379

### Полезни команди

```bash
# Влизане в PHP контейнера
docker-compose exec php_fpm bash

# Изпълняване на Laravel команди
docker-compose exec php_fpm php artisan migrate
docker-compose exec php_fpm php artisan db:seed

# Рестартиране на услуги
docker-compose restart
```

## 🤖 Добавяне на AI Tools

### 1. Чрез Web Interface

1. Влезте в системата като потребител
2. Отидете на `/add-tool`
3. Попълнете формата:
   - **Име на тула**
   - **Описание**
   - **Линк**
   - **Категория**
   - **Рекомендувани роли**
   - **Тагове**

### 2. Чрез API

```bash
curl -X POST http://localhost:8200/api/ai-tools \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ChatGPT",
    "description": "AI-powered conversational assistant",
    "link": "https://chat.openai.com",
    "category_id": 1,
    "recommended_roles": ["backend", "frontend"],
    "tag_ids": [1, 2]
  }'
```

### 3. Админ одобрение

- Всички нови тулове изискват одобрение от админ
- Админ може да одобри/отхвърли тулове в `/admin`

## 💬 Коментари и рейтинги

### Функционалности

- **Коментари**: Потребителите могат да оставят коментари за AI tools
- **Рейтинги**: 5-звездна система за оценяване на tools
- **Модерация**: Всички коментари изискват одобрение от админ
- **Статистики**: Среден рейтинг и брой оценки за всеки tool

### Използване

1. **Добавяне на коментар**:
   - Отидете на `/tool/{id}`
   - Напишете коментар (минимум 10 символа)
   - Кликнете "Submit Comment"

2. **Рейтинг на tool**:
   - Отидете на `/tool/{id}`
   - Кликнете върху звездите (1-5)
   - Рейтингът се запазва автоматично

3. **Админ модерация**:
   - Отидете на `/admin/comments`
   - Прегледайте всички коментари
   - Одобрете или отхвърлете коментари

## 👥 Ролева система

### Роли и права

| Роля | Права |
|------|-------|
| **Owner** | Пълен достъп, админ панел, управление на потребители |
| **Admin** | Админ панел, одобряване на тулове, статистики |
| **Backend** | Добавяне на тулове, преглед на backend-свързани тулове |
| **Frontend** | Добавяне на тулове, преглед на frontend-свързани тулове |
| **PM** | Добавяне на тулове, преглед на PM-свързани тулове |
| **QA** | Добавяне на тулове, преглед на QA-свързани тулове |
| **Designer** | Добавяне на тулове, преглед на design-свързани тулове |

### Тестови акаунти

```
Email: owner@example.com
Password: password

Email: admin@example.com  
Password: password

Email: backend@example.com
Password: password

Email: frontend@example.com
Password: password

Email: pm@example.com
Password: password

Email: qa@example.com
Password: password

Email: designer@example.com
Password: password
```

## 🛡️ Админ панел

### Функционалности

- **Dashboard**: Статистики и обзор на системата
- **Tools Management**: Одобряване/отхвърляне на AI tools
- **Comments Management**: Модерация на коментари
- **Activity Logs**: Проследяване на потребителски действия
- **User Management**: Управление на потребители
- **Cache Management**: Очистване на кеш

### Достъп

1. **Влезте като админ**:
   - `owner@example.com` / `password`
   - `admin@example.com` / `password`

2. **Навигирайте до админ панела**:
   - Кликнете "Admin Panel" в навигацията
   - Или отидете на `/admin`

3. **Управлявайте системата**:
   - **Tools**: `/admin/tools` - одобряване на tools
   - **Comments**: `/admin/comments` - модерация на коментари
   - **Activity**: `/admin/activity-logs` - проследяване на действия
   - **Users**: `/admin/users` - управление на потребители

## 🔐 2FA (Two-Factor Authentication)

### Налични методи

1. **Email** - Код се изпраща на email
2. **Telegram** - Код се изпраща в Telegram
3. **Google Authenticator** - QR код за сканиране

### Настройка

1. Отидете на `/profile`
2. Кликнете "2FA Settings"
3. Изберете метод и следвайте инструкциите

## 📊 API Документация

### Основни endpoints

#### Аутентификация
```
POST /api/login
POST /api/register
POST /api/logout
GET  /api/user
```

#### AI Tools
```
GET    /api/ai-tools
POST   /api/ai-tools
GET    /api/ai-tools/{id}
PUT    /api/ai-tools/{id}
DELETE /api/ai-tools/{id}
```

#### Категории
```
GET    /api/categories
POST   /api/categories
GET    /api/categories/{id}
PUT    /api/categories/{id}
DELETE /api/categories/{id}
```

#### Тагове
```
GET    /api/tags
POST   /api/tags
GET    /api/tags/{id}
PUT    /api/tags/{id}
DELETE /api/tags/{id}
```

#### 2FA
```
GET  /api/2fa/status
POST /api/2fa/enable
POST /api/2fa/disable
POST /api/2fa/send-code
POST /api/2fa/verify
```

#### Коментари и рейтинги
```
GET    /api/ai-tools/{id}/comments
POST   /api/ai-tools/{id}/comments
PUT    /api/ai-tools/{id}/comments/{comment}
DELETE /api/ai-tools/{id}/comments/{comment}

GET    /api/ai-tools/{id}/ratings
POST   /api/ai-tools/{id}/ratings
GET    /api/ai-tools/{id}/ratings/my
DELETE /api/ai-tools/{id}/ratings
```

#### Админ
```
GET  /api/admin/dashboard
GET  /api/admin/tools
GET  /api/admin/comments
POST /api/admin/tools/{id}/approve
POST /api/admin/tools/{id}/reject
POST /api/admin/comments/{id}/approve
POST /api/admin/comments/{id}/reject
GET  /api/admin/activity-logs
GET  /api/admin/users
```

## 🚨 Troubleshooting

### Често срещани проблеми

#### 1. "Failed to load" грешки
```bash
# Проверете дали backend работи
docker-compose logs php_fpm

# Рестартирайте услугите
docker-compose restart
```

#### 2. Database connection грешки
```bash
# Проверете MySQL
docker-compose exec mysql mysql -u root -p

# Рестартирайте базата данни
docker-compose restart mysql
```

#### 3. Frontend не се зарежда
```bash
# Проверете Node.js
cd frontend
npm install
npm run dev
```

#### 4. 2FA не работи
```bash
# Проверете email конфигурацията в .env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

#### 5. Коментари не се показват
```bash
# Проверете дали коментарът е одобрен
# Отидете на /admin/comments и одобрете коментара

# Проверете базата данни
docker-compose exec mysql mysql -u root -p
SELECT * FROM tool_comments WHERE is_approved = 1;
```

#### 6. Админ панел не се зарежда
```bash
# Проверете дали сте влезли като owner или admin
# Проверете middleware в backend/routes/api.php
```

### Логове

```bash
# Laravel логове
docker-compose exec php_fpm tail -f /var/www/html/storage/logs/laravel.log

# Nginx логове
docker-compose logs nginx

# MySQL логове
docker-compose logs mysql
```

## 🔧 Development

### Полезни команди

```bash
# Laravel
php artisan migrate
php artisan db:seed
php artisan cache:clear
php artisan config:clear

# Frontend
npm run dev
npm run build
npm run lint

# Docker
docker-compose up -d
docker-compose down
docker-compose logs -f
```

### Code Style

- **Backend**: PSR-12 стандарт
- **Frontend**: ESLint + Prettier
- **Database**: Snake_case за таблици и колони
- **API**: RESTful endpoints

## 📈 Performance

### Кеширане

- **Redis** за сесии и кеш
- **Laravel Cache** за често достъпвани данни
- **Database indexes** за оптимизация

### Мониторинг

- **Laravel Telescope** за debugging
- **Activity Logs** за audit trail
- **Performance metrics** в админ панела
- **Comments moderation** за качество на съдържанието
- **Rating statistics** за популярност на tools

## 🤝 Contributing

1. Fork проекта
2. Създайте feature branch
3. Направете промените
4. Добавете тестове
5. Създайте Pull Request

## 📄 License

MIT License - вижте LICENSE файла за детайли.

---

**Създадено с ❤️ за ефективно управление на AI Tools**