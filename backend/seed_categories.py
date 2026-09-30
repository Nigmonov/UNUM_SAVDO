from app.database import SessionLocal
from app.models.category import Category


categories = [
    ("Oziq-ovqat", "oziq-ovqat"),
    ("Ichimliklar", "ichimliklar"),
    ("Shirinliklar", "shirinliklar"),
    ("Sut mahsulotlari", "sut-mahsulotlari"),
    ("Go‘sht mahsulotlari", "gosht-mahsulotlari"),
    ("Non mahsulotlari", "non-mahsulotlari"),
    ("Meva va sabzavotlar", "meva-sabzavotlar"),
    ("Makaron va yorma", "makaron-yorma"),
    ("Konserva mahsulotlari", "konserva-mahsulotlari"),
    ("Maishiy kimyo", "maishiy-kimyo"),
    ("Gigiyena", "gigiyena"),
    ("Kosmetika", "kosmetika"),
    ("Kiyim-kechak", "kiyim-kechak"),
    ("Oyoq kiyim", "oyoq-kiyim"),
    ("Elektronika", "elektronika"),
    ("Telefon va aksessuarlar", "telefon-aksessuarlar"),
    ("Maishiy texnika", "maishiy-texnika"),
    ("Bolalar mahsulotlari", "bolalar-mahsulotlari"),
    ("Uy-ro‘zg‘or buyumlari", "uy-rozgor-buyumlari"),
    ("Avto mahsulotlar", "avto-mahsulotlar"),
    ("Kantselyariya", "kantselyariya"),
    ("Sport mahsulotlari", "sport-mahsulotlari"),
    ("Qurilish mollari", "qurilish-mollari"),
    ("Boshqa", "boshqa"),
]


def seed_categories():
    db = SessionLocal()

    try:
        for name, slug in categories:
            existing = (
                db.query(Category)
                .filter(Category.slug == slug)
                .first()
            )

            if existing:
                print(f"⏭ Mavjud: {name}")
                continue

            category = Category(
                name=name,
                slug=slug,
                parent_id=None,
                image=None,
            )

            db.add(category)

            print(f" Qo‘shildi: {name}")

        db.commit()

        print("\n🎉 Kategoriyalar tayyor!")

    except Exception as e:
        db.rollback()
        print(" Xatolik:", e)

    finally:
        db.close()


if __name__ == "__main__":
    seed_categories()