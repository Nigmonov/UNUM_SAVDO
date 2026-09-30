from sqlalchemy import inspect, text

from app.database import engine


print("DATABASE:", engine.url)


def add_category_column():
    inspector = inspect(engine)

    print("TABLES:", inspector.get_table_names())

    columns = inspector.get_columns("products")
    print("PRODUCT COLUMNS:")

    for column in columns:
        print("-", column["name"])

    column_names = [column["name"] for column in columns]

    if "category_id" in column_names:
        print("category_id already exists.")
        return

    with engine.begin() as connection:
        connection.execute(
            text("""
                ALTER TABLE products
                ADD COLUMN category_id INTEGER
                REFERENCES categories(id)
                ON DELETE SET NULL
            """)
        )

    print("category_id added successfully.")


if __name__ == "__main__":
    add_category_column()