UNUM SAVDO - TOZA LOYIHA
========================

PAPKA TUZILISHI:
UNUM_SAVDO_CLEAN/
  backend/
  frontend/
  INSTALL_UNUM.bat
  START_UNUM.bat

BIRINCHI MARTA:
1) Eski chalkash loyihani ishlatmang.
2) Shu UNUM_SAVDO_CLEAN papkani alohida joyga copy qiling.
3) INSTALL_UNUM.bat ni bir marta ishga tushiring.
4) Keyin START_UNUM.bat ni ishga tushiring.
5) Brauzer: http://localhost:3000
6) API docs: http://127.0.0.1:8000/docs

DATABASE:
- Paket hozir darhol ishlashi uchun SQLite bilan sozlangan.
- Fayl backend/unum_savdo.db sifatida yaratiladi.
- PostgreSQLga qaytmoqchi bo'lsangiz backend/.env dagi DATABASE_URL ni almashtiring.

TELEGRAM LOGIN:
- Serverda Telegram bot ishlamaydi.
- Real Telegram Web Login uchun backend/.env ichiga TELEGRAM_CLIENT_ID va TELEGRAM_CLIENT_SECRET yoziladi.
- Hozir lokal test uchun "Lokal test rejimida kirish" tugmasi bor.
- Productionda DEV_MODE=false va frontend/.env.local ichida NEXT_PUBLIC_DEV_MODE=false qiling.

MUHIM:
- .next papkasini copy qilmang.
- node_modules papkasini copy qilmang.
- START_UNUM.bat backend va frontendni bittada ishga tushiradi.
