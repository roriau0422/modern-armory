# 🏰 XMETA WoW Армори

Энэхүү project нь AzerothCore серверт зориулсан веб программ юм. Тоглогчид өөрсдийн дүрүүдийг харах, илүү дэлгэрэнгүй мэдээлэл авах боломжийг олгоно.

## ✨ Онцлог Шинж Чанарууд

### 🎮 Тоглогчийн Профайл
- Дүрийн дэлгэрэнгүй мэдээлэл (Level, class, race)
- Weapon, gear жагсаалт
- Power rating мэдээлэл (PvP рейтинг)
- Guild

### 🛡️ Weapon, Gear Систем
- Бүх weapon, gear дэлгэрэнгүй харагдац
- Level болон үнэлгээний систем
- Enchant болон gem мэдээлэл
- 3D загварчлалын дэмжлэг (Model Viewer) <-- Одоохондоо ажиллагаагүй байгаа

### 🏆 Guild Систем
- Guild гишүүдийн жагсаалт
- Guild мэдээлэл болон статистик
- Members идэвхжил болон онлайн статус
- Guild банкны мэдээлэл

### 🌐 Олон Хэлний Дэмжлэг
- **Монгол хэл** - Үндсэн интерфэйс
- **Англи хэл** - Олон улсын хэрэглэгчдэд зориулсан
- Хэл солих боломжтой

### 📱 Responsive Дизайн
- Утасны дэлгэцэнд тохируулагдсан
- Утас болон компьютерийн дэлгэцэнд оновчтой

## 🚀 Суулгах Заавар

### Шаардлагатай Зүйлс
- **Node.js** (16.0+ хувилбар)
- **MySQL/MariaDB** өгөгдлийн сан
- **AzerothCore** сервер (3.3.5a)

### 1. Project Татах
```bash
git clone https://github.com/roriau0422/modern-armory.git
cd modern-armory
```

### 2. Dependency Суулгах
```bash
npm install
```

### 3. Орчны Хувьсагч Тохируулах
`.env.template` файлыг `.env` болгон хуулж, өөрийн тохиргоогоор өөрчилнө:

```env
# Өгөгдлийн Сангийн Тохиргоо
DB_HOST=localhost
DB_PORT=3306
AUTH_DB_NAME=acore_auth
CHAR_DB_NAME=acore_characters
WORLD_DB_NAME=acore_world
WEB_DB_USER=your_web_user
WEB_DB_PASS=your_web_password

# Серверийн Тохиргоо
PORT=3000
NODE_ENV=production
SESSION_SECRET=session_secret

# Сайтын Тохиргоо
SITE_NAME="XMETA Gaming"
SITE_URL=https://wow.xmeta.mn
REALM_NAME="Archimonde"
REALM_ID=1
```

### 4. Серверийг Эхлүүлэх
```bash
# Хөгжүүлэлтийн горим
npm run dev

# Үйлдвэрлэлийн горим
npm start

# Windows дээр
start-server.bat
```

Сервер `http://localhost:3000` хаяг дээр ажиллана.

## 🛠️ Tech stack

### Backend
- **Node.js** + **Express.js** - Веб сервер
- **MySQL2** - Өгөгдлийн сантай холболт
- **Handlebars** - Template engine
- **Express-session** - Сессийн удирдлага
- **bcrypt** - Нууц үг хашлах

### Frontend
- **HTML5** + **CSS3** - Үндсэн разметк
- **JavaScript (ES6+)** - Клиентийн скрипт
- **Bootstrap** - CSS фреймворк
- **Model Viewer** - 3D загвар харуулах

### Өгөгдлийн Сан
- **AzerothCore MySQL Schema** - Үндсэн structure
- **Custom Web Tables** - Нэмэлт веб функцууд

## 📁 Project Бүтэц

```
modern-armory/
├── src/                   # Үндсэн серверийн код
│   ├── app.js             # Express програм
│   ├── models/            # Өгөгдлийн загварууд
│   ├── routes/            # API замууд
│   ├── middleware/        # Express middleware
│   └── utils/             # Туслах функцууд
├── public/                # Статик файлууд
│   ├── css/              # Стил файлууд
│   ├── js/               # Клиентийн JavaScript
│   └── data/             # Тогл өгөгдөл
├── views/                 # Handlebars templates
├── locales/              # Хэлний файлууд
│   ├── en.json           # Англи хэл
│   └── mn.json           # Монгол хэл
├── assets/               # Зураг файлууд
└── logs/                 # Лог файлууд
```

## 🔧 Тохиргоо

### Өгөгдлийн Сангийн Холболт
Програм нь AzerothCore серверийн өгөгдлийн сантай шууд холбогддог. Дараах table-үүдэд хандалтын эрх хэрэгтэй:

**Auth Database:**
- `account` - Хэрэглэгчийн бүртгэл
- `account_access` - Эрхийн түвшин

**Characters Database:**
- `characters` - Дүрийн мэдээлэл
- `character_inventory` - weapon and gear
- `guild` - Guild
- `guild_member` - Guild members

**World Database:**
- `item_template` - Эд зүйлсийн мэдээлэл
- `creature_template` - NPC мэдээлэл

### Аюулгүй Байдал
- Нууц үгийг bcrypt ашиглан хашладаг
- Session-д суурилсан нэвтрэх систем
- SQL injection-өөс хамгаалах параметержуулсан query
- XSS халдлагаас хамгаалах input sanitize


## 🙏 Талархал

- [AzerothCore](https://www.azerothcore.org/) - Үндсэн серверийн програм
- [TrinityCore](https://trinitycore.org/) - Database структур
- [WoW.tools](https://wago.tools/) - Тоглоомын өгөгдөл