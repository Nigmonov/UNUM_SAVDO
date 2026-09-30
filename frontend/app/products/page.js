'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import {
  API,
  authHeaders,
  currentStoreId,
  money,
} from '../api';

/* =========================================================
   DEFAULT FORM
========================================================= */

const EMPTY_FORM = {
  name: '',
  barcode: '',
  image: '',
  category_id: '',
  cost_price: '',
  sale_price: '',
  stock_qty: '',
  min_stock_qty: '5',
};

/*
 * 21 ta kategoriya + Barchasi + +N
 * = maksimal 3 qator
 */
const MAX_VISIBLE_CATEGORIES = 21;

/* =========================================================
   CATEGORY SVG IMAGE
========================================================= */

function makeCategoryImage(emoji, title) {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="600"
      height="360"
      viewBox="0 0 600 360"
    >
      <defs>
        <linearGradient
          id="background"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#edf8f1"
          />

          <stop
            offset="100%"
            stop-color="#d7eee0"
          />
        </linearGradient>
      </defs>

      <rect
        width="600"
        height="360"
        rx="35"
        fill="url(#background)"
      />

      <circle
        cx="300"
        cy="145"
        r="78"
        fill="#ffffff"
      />

      <text
        x="300"
        y="175"
        text-anchor="middle"
        font-size="82"
      >
        ${emoji}
      </text>

      <text
        x="300"
        y="285"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="28"
        font-weight="700"
        fill="#245238"
      >
        ${title}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    svg
  )}`;
}

/* =========================================================
   CATEGORY IMAGE MAPPING
========================================================= */

function getCategoryImage(category) {
  const name = String(category?.name || '')
    .trim()
    .toLowerCase();

  /* AVTO */

  if (
    name.includes('avto') ||
    name.includes('mashina') ||
    name.includes('avtomobil')
  ) {
    return makeCategoryImage('🚗', 'Avto');
  }

  /* BOLALAR */

  if (
    name.includes('bolalar') ||
    name.includes('bola') ||
    name.includes('o‘yinchoq') ||
    name.includes("o'yinchoq") ||
    name.includes('oyinchoq')
  ) {
    return makeCategoryImage('🧸', 'Bolalar');
  }

  /* BOSHQA */

  if (name === 'boshqa') {
    return makeCategoryImage('📦', 'Boshqa');
  }

  /* ELEKTRONIKA */

  if (
    name.includes('elektronika') ||
    name.includes('elektron')
  ) {
    return makeCategoryImage('💻', 'Elektronika');
  }

  /* GIGIYENA */

  if (
    name.includes('gigiyena') ||
    name.includes('gigi')
  ) {
    return makeCategoryImage('🧴', 'Gigiyena');
  }

  /* GO‘SHT */

  if (
    name.includes('go‘sht') ||
    name.includes("go'sht") ||
    name.includes('gosht')
  ) {
    return makeCategoryImage('🥩', 'Go‘sht');
  }

  /* ICHIMLIKLAR */

  if (
    name.includes('ichimlik') ||
    name.includes('ichimliklar')
  ) {
    return makeCategoryImage('🥤', 'Ichimliklar');
  }

  /* KANTSELYARIYA */

  if (
    name.includes('kantselyariya') ||
    name.includes('kanselyariya') ||
    name.includes('ofis')
  ) {
    return makeCategoryImage('✏️', 'Kanselyariya');
  }

  /* KIYIM */

  if (
    name.includes('kiyim-kechak') ||
    name.includes('kiyim')
  ) {
    return makeCategoryImage('👕', 'Kiyimlar');
  }

  /* KONSERVA */

  if (
    name.includes('konserva') ||
    name.includes('konserv')
  ) {
    return makeCategoryImage('🥫', 'Konserva');
  }

  /* KOSMETIKA */

  if (
    name.includes('kosmetika') ||
    name.includes('parfyum') ||
    name.includes("go'zallik") ||
    name.includes('go‘zallik')
  ) {
    return makeCategoryImage('💄', 'Kosmetika');
  }

  /* MAISHIY KIMYO */

  if (
    name.includes('maishiy kimyo') ||
    name.includes('kimyo')
  ) {
    return makeCategoryImage('🧹', 'Maishiy kimyo');
  }

  /* MAISHIY TEXNIKA */

  if (
    name.includes('maishiy texnika')
  ) {
    return makeCategoryImage('🏠', 'Maishiy texnika');
  }

  /* MAKARON VA YORMA */

  if (
    name.includes('makaron') ||
    name.includes('yorma')
  ) {
    return makeCategoryImage('🍝', 'Makaron');
  }

  /* MEVA VA SABZAVOT */

  if (
    name.includes('meva') ||
    name.includes('sabzavot')
  ) {
    return makeCategoryImage('🍎', 'Meva');
  }

  /* NON */

  if (
    name.includes('non mahsulot') ||
    name === 'non'
  ) {
    return makeCategoryImage('🍞', 'Non');
  }

  /* OYOQ KIYIM */

  if (
    name.includes('oyoq kiyim') ||
    name.includes('poyabzal')
  ) {
    return makeCategoryImage('👟', 'Oyoq kiyim');
  }

  /* OZIQ-OVQAT */

  if (
    name.includes('oziq-ovqat') ||
    name.includes('oziq ovqat')
  ) {
    return makeCategoryImage('🛒', 'Oziq-ovqat');
  }

  /* QURILISH */

  if (
    name.includes('qurilish')
  ) {
    return makeCategoryImage('🧱', 'Qurilish');
  }

  /* SHIRINLIKLAR */

  if (
    name.includes('shirinlik')
  ) {
    return makeCategoryImage('🍫', 'Shirinliklar');
  }

  /* SPORT */

  if (
    name.includes('sport')
  ) {
    return makeCategoryImage('⚽', 'Sport');
  }

  /* TELEFON */

  if (
    name.includes('telefon') ||
    name.includes('smartfon')
  ) {
    return makeCategoryImage('📱', 'Telefon');
  }

  /* NOUTBUK */

  if (
    name.includes('noutbuk') ||
    name.includes('laptop')
  ) {
    return makeCategoryImage('💻', 'Noutbuk');
  }

  /* DEFAULT */

  return makeCategoryImage('📦', 'Mahsulot');
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({ src, name }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="productImageFallback">
        📦
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className="productImage"
    />
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Products() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(
    EMPTY_FORM
  );

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  async function loadCategories() {
    try {
      const response = await fetch(
        `${API}/categories`,
        {
          headers: authHeaders(),
        }
      );

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            'Kategoriyalarni yuklab bo‘lmadi'
        );
        return;
      }

      /*
       * STRING KATEGORIYANI BUTUNLAY OLIB TASHLAYMIZ
       */

      const cleanCategories =
        Array.isArray(data)
          ? data.filter((category) => {
              const categoryName =
                String(
                  category?.name || ''
                )
                  .trim()
                  .toLowerCase();

              return (
                categoryName !== 'string'
              );
            })
          : [];

      setCategories(cleanCategories);
    } catch {
      setError(
        'Server bilan aloqa qilishda xatolik'
      );
    }
  }

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  async function loadProducts(
    searchValue = '',
    categoryValue = ''
  ) {
    const storeId =
      currentStoreId();

    if (!storeId) {
      router.push('/dashboard');
      return;
    }

    try {
      setLoading(true);

      const params =
        new URLSearchParams();

      if (
        searchValue &&
        searchValue.trim()
      ) {
        params.set(
          'q',
          searchValue.trim()
        );
      }

      if (categoryValue) {
        params.set(
          'category_id',
          String(categoryValue)
        );
      }

      const query =
        params.toString();

      const url =
        `${API}/stores/${storeId}/products` +
        (query ? `?${query}` : '');

      const response =
        await fetch(url, {
          headers: authHeaders(),
        });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            'Mahsulotlarni yuklab bo‘lmadi'
        );
        return;
      }

      setItems(
        Array.isArray(data)
          ? data
          : []
      );
    } catch {
      setError(
        'Server bilan aloqa qilishda xatolik'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadProducts('', '');
    loadCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     CATEGORY NAME
  ========================================================= */

  function getCategoryName(
    categoryId
  ) {
    if (!categoryId) {
      return 'Kategoriyasiz';
    }

    const category =
      categories.find(
        (item) =>
          Number(item.id) ===
          Number(categoryId)
      );

    return (
      category?.name ||
      'Kategoriyasiz'
    );
  }

  /* =========================================================
     CATEGORY FILTER
  ========================================================= */

  const filteredItems =
    useMemo(() => {
      if (!selectedCategory) {
        return items;
      }

      return items.filter(
        (product) =>
          Number(
            product.category_id
          ) ===
          Number(selectedCategory)
      );
    }, [
      items,
      selectedCategory,
    ]);

  /* =========================================================
     CATEGORY LIST
  ========================================================= */

  const visibleCategories =
    categories.slice(
      0,
      MAX_VISIBLE_CATEGORIES
    );

  const hiddenCount =
    Math.max(
      0,
      categories.length -
        MAX_VISIBLE_CATEGORIES
    );

  /* =========================================================
     SELECT CATEGORY
  ========================================================= */

  function selectCategory(
    categoryId
  ) {
    const value =
      categoryId
        ? String(categoryId)
        : '';

    setSelectedCategory(value);

    loadProducts(
      search,
      value
    );
  }

  /* =========================================================
     SEARCH
  ========================================================= */

  function handleSearch(value) {
    setSearch(value);

    loadProducts(
      value,
      selectedCategory
    );
  }

  /* =========================================================
     ADD MODAL
  ========================================================= */

  function openAddModal() {
    setError('');
    setEditingProduct(null);

    setForm({
      ...EMPTY_FORM,
      category_id:
        selectedCategory || '',
    });

    setModalOpen(true);
  }

  /* =========================================================
     EDIT MODAL
  ========================================================= */

  function openEditModal(
    product
  ) {
    setError('');
    setEditingProduct(product);

    setForm({
      name:
        product.name || '',

      barcode:
        product.barcode || '',

      image:
        product.image || '',

      category_id:
        product.category_id
          ? String(
              product.category_id
            )
          : '',

      cost_price:
        product.cost_price ??
        '',

      sale_price:
        product.sale_price ??
        '',

      stock_qty:
        product.stock_qty ??
        '',

      min_stock_qty:
        product.min_stock_qty ??
        5,
    });

    setModalOpen(true);
  }

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  }

  /* =========================================================
     SAVE PRODUCT
  ========================================================= */

  async function submitProduct(
    event
  ) {
    event.preventDefault();

    setError('');

    const storeId =
      currentStoreId();

    if (!storeId) {
      router.push('/dashboard');
      return;
    }

    if (!form.name.trim()) {
      setError(
        'Mahsulot nomini kiriting'
      );
      return;
    }

    if (!form.category_id) {
      setError(
        'Mahsulot kategoriyasini tanlang'
      );
      return;
    }

    const body = {
      name: form.name.trim(),

      barcode:
        form.barcode.trim()
          ? form.barcode.trim()
          : null,

      image:
        form.image.trim()
          ? form.image.trim()
          : null,

      category_id:
        Number(form.category_id),

      cost_price:
        Number(
          form.cost_price || 0
        ),

      sale_price:
        Number(
          form.sale_price || 0
        ),

      stock_qty:
        Number(
          form.stock_qty || 0
        ),

      min_stock_qty:
        Number(
          form.min_stock_qty || 0
        ),
    };

    try {
      setSaving(true);

      let response;

      if (editingProduct) {
        response = await fetch(
          `${API}/stores/${storeId}/products/${editingProduct.id}`,
          {
            method: 'PATCH',
            headers:
              authHeaders(true),
            body: JSON.stringify(
              body
            ),
          }
        );
      } else {
        response = await fetch(
          `${API}/stores/${storeId}/products`,
          {
            method: 'POST',
            headers:
              authHeaders(true),
            body: JSON.stringify(
              body
            ),
          }
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            'Mahsulot saqlanmadi'
        );
        return;
      }

      setModalOpen(false);
      setEditingProduct(null);
      setForm(EMPTY_FORM);

      await loadProducts(
        search,
        selectedCategory
      );
    } catch {
      setError(
        'Server bilan aloqa qilishda xatolik'
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  async function deleteProduct(
    product
  ) {
    const confirmed =
      window.confirm(
        `"${product.name}" mahsulotini o‘chirishni xohlaysizmi?`
      );

    if (!confirmed) {
      return;
    }

    const storeId =
      currentStoreId();

    if (!storeId) {
      router.push('/dashboard');
      return;
    }

    try {
      setError('');

      const response =
        await fetch(
          `${API}/stores/${storeId}/products/${product.id}`,
          {
            method: 'DELETE',
            headers: authHeaders(),
          }
        );

      if (
        response.status ===
        204
      ) {
        await loadProducts(
          search,
          selectedCategory
        );
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            'Mahsulotni o‘chirib bo‘lmadi'
        );
        return;
      }

      await loadProducts(
        search,
        selectedCategory
      );
    } catch {
      setError(
        'Server bilan aloqa qilishda xatolik'
      );
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <AppShell
      title="Mahsulotlar"
      subtitle={`${filteredItems.length} ta mahsulot`}
      action={
        <button
          className="btn btnAccent"
          onClick={openAddModal}
        >
          + Mahsulot qo‘shish
        </button>
      }
    >
      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="toolbar">
        <input
          className="search"
          value={search}
          onChange={(event) =>
            handleSearch(
              event.target.value
            )
          }
          placeholder="Mahsulot nomi yoki barcode bo‘yicha qidiring..."
        />

        <select
          className="categorySelect"
          value={
            selectedCategory
          }
          onChange={(event) =>
            selectCategory(
              event.target.value
            )
          }
        >
          <option value="">
            Barcha kategoriyalar
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            )
          )}
        </select>
      </div>

      {/* =====================================================
          CATEGORY TITLE
      ===================================================== */}

      <div className="categoryHeader">
        <div>
          <h3>Kategoriyalar</h3>

          <span>
            Mahsulotlarni kategoriya bo‘yicha ko‘ring
          </span>
        </div>
      </div>

      {/* =====================================================
          CATEGORY GRID
      ===================================================== */}

      {categories.length > 0 && (
        <div className="categoryGrid">
          {/* BARCHASI */}

          <button
            type="button"
            className={`categoryCard ${
              selectedCategory === ''
                ? 'categoryActive'
                : ''
            }`}
            onClick={() =>
              selectCategory('')
            }
          >
            <div className="categoryImageWrap">
              <img
                src={makeCategoryImage(
                  '🛍️',
                  'Barchasi'
                )}
                alt="Barchasi"
                className="categoryImage"
              />
            </div>

            <span className="categoryName">
              Barchasi
            </span>

            <span className="categoryCount">
              {items.length}
            </span>
          </button>

          {/* CATEGORIES */}

          {visibleCategories.map(
            (category) => {
              const count =
                items.filter(
                  (product) =>
                    Number(
                      product.category_id
                    ) ===
                    Number(
                      category.id
                    )
                ).length;

              return (
                <button
                  type="button"
                  key={category.id}
                  className={`categoryCard ${
                    selectedCategory ===
                    String(
                      category.id
                    )
                      ? 'categoryActive'
                      : ''
                  }`}
                  onClick={() =>
                    selectCategory(
                      category.id
                    )
                  }
                >
                  <div className="categoryImageWrap">
                    <img
                      src={getCategoryImage(
                        category
                      )}
                      alt={
                        category.name
                      }
                      className="categoryImage"
                    />
                  </div>

                  <span className="categoryName">
                    {category.name}
                  </span>

                  <span className="categoryCount">
                    {count}
                  </span>
                </button>
              );
            }
          )}

          {/* +N */}

          {hiddenCount > 0 && (
            <button
              type="button"
              className="categoryCard moreCategory"
              onClick={() => {
                const hiddenCategory =
                  categories[
                    MAX_VISIBLE_CATEGORIES
                  ];

                if (
                  hiddenCategory
                ) {
                  selectCategory(
                    hiddenCategory.id
                  );
                }
              }}
            >
              <div className="moreCircle">
                +{hiddenCount}
              </div>

              <span className="categoryName">
                Yana
              </span>

              <span className="categoryCount">
                kategoriya
              </span>
            </button>
          )}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="errorBox">
          {error}
        </div>
      )}

      {/* =====================================================
          PRODUCTS TABLE
      ===================================================== */}

      <div className="productsCard">
        <div className="productTableHeader">
          <span>
            Mahsulot
          </span>

          <span>
            Kategoriya
          </span>

          <span>
            Barcode
          </span>

          <span>
            Sotuv narxi
          </span>

          <span>
            Qoldiq
          </span>

          <span>
            Amallar
          </span>
        </div>

        {loading ? (
          <div className="emptyState">
            <b>
              Yuklanmoqda...
            </b>

            <span>
              Mahsulotlar serverdan olinmoqda.
            </span>
          </div>
        ) : filteredItems.length >
          0 ? (
          filteredItems.map(
            (product) => (
              <div
                key={product.id}
                className="productRow"
              >
                {/* PRODUCT */}

                <div className="productInfo">
                  <ProductImage
                    src={
                      product.image
                    }
                    name={
                      product.name
                    }
                  />

                  <div>
                    <b>
                      {product.name}
                    </b>

                    <small>
                      Tannarx:{' '}
                      {money(
                        product.cost_price
                      )}
                    </small>
                  </div>
                </div>

                {/* CATEGORY */}

                <div>
                  <span className="categoryBadge">
                    {getCategoryName(
                      product.category_id
                    )}
                  </span>
                </div>

                {/* BARCODE */}

                <span className="barcode">
                  {product.barcode ||
                    '—'}
                </span>

                {/* PRICE */}

                <b>
                  {money(
                    product.sale_price
                  )}
                </b>

                {/* STOCK */}

                <div>
                  <b
                    className={
                      product.stock_qty <=
                      product.min_stock_qty
                        ? 'stockLow'
                        : 'stockGood'
                    }
                  >
                    {
                      product.stock_qty
                    }{' '}
                    dona
                  </b>

                  <small>
                    min:{' '}
                    {
                      product.min_stock_qty
                    }
                  </small>
                </div>

                {/* ACTIONS */}

                <div className="actions">
                  <button
                    type="button"
                    className="editButton"
                    onClick={() =>
                      openEditModal(
                        product
                      )
                    }
                    title="Tahrirlash"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    className="deleteButton"
                    onClick={() =>
                      deleteProduct(
                        product
                      )
                    }
                    title="O‘chirish"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          )
        ) : (
          <div className="emptyState">
            <div className="emptyIcon">
              📦
            </div>

            <b>
              Mahsulot topilmadi
            </b>

            <span>
              Bu kategoriyada hozircha
              mahsulot mavjud emas.
            </span>
          </div>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {modalOpen && (
        <div
          className="modalOverlay"
          onMouseDown={closeModal}
        >
          <div
            className="modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modalHeader">
              <div>
                <h2>
                  {editingProduct
                    ? 'Mahsulotni tahrirlash'
                    : 'Yangi mahsulot'}
                </h2>

                <span>
                  Mahsulot ma’lumotlarini kiriting
                </span>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={
                  closeModal
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                submitProduct
              }
              className="productForm"
            >
              {/* NAME */}

              <div>
                <label>
                  Mahsulot nomi
                </label>

                <input
                  autoFocus
                  value={
                    form.name
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Masalan: Coca Cola 1.5L"
                  required
                />
              </div>

              {/* BARCODE */}

              <div>
                <label>
                  Barcode
                </label>

                <input
                  value={
                    form.barcode
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      barcode:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Barcode"
                />
              </div>

              {/* IMAGE */}

              <div>
                <label>
                  Mahsulot rasmi
                </label>

                <input
                  value={
                    form.image
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      image:
                        event.target
                          .value,
                    })
                  }
                  placeholder="https://..."
                />

                <small>
                  Rasm URL manzilini kiriting.
                </small>
              </div>

              {/* CATEGORY */}

              <div>
                <label>
                  Kategoriya
                </label>

                <select
                  value={
                    form.category_id
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category_id:
                        event.target
                          .value,
                    })
                  }
                  required
                >
                  <option value="">
                    Kategoriyani tanlang
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* PRICE */}

              <div className="formGrid">
                <div>
                  <label>
                    Kelish narxi
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.cost_price
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,
                        cost_price:
                          event.target
                            .value,
                      })
                    }
                    placeholder="8000"
                    required
                  />
                </div>

                <div>
                  <label>
                    Sotish narxi
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.sale_price
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,
                        sale_price:
                          event.target
                            .value,
                      })
                    }
                    placeholder="10000"
                    required
                  />
                </div>
              </div>

              {/* STOCK */}

              <div className="formGrid">
                <div>
                  <label>
                    Qoldiq
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.stock_qty
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,
                        stock_qty:
                          event.target
                            .value,
                      })
                    }
                    placeholder="20"
                    required
                  />
                </div>

                <div>
                  <label>
                    Minimal qoldiq
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.min_stock_qty
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,
                        min_stock_qty:
                          event.target
                            .value,
                      })
                    }
                  />
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="modalError">
                  {error}
                </div>
              )}

              {/* BUTTONS */}

              <div className="modalButtons">
                <button
                  type="button"
                  className="btn"
                  onClick={
                    closeModal
                  }
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="btn btnPrimary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saqlanmoqda...'
                    : editingProduct
                    ? 'Saqlash'
                    : 'Mahsulotni saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          PAGE CSS
      ===================================================== */}

      <style jsx>{`
        .toolbar {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .search {
          flex: 1;
          min-width: 260px;
          height: 44px;
          padding: 0 14px;
          border: 1px solid #d9e2dc;
          border-radius: 10px;
          background: #fff;
          outline: none;
          font-size: 14px;
        }

        .search:focus {
          border-color: #4aa76d;
          box-shadow:
            0 0 0 3px
            rgba(74, 167, 109, 0.1);
        }

        .categorySelect {
          height: 44px;
          min-width: 220px;
          padding: 0 14px;
          border: 1px solid #d9e2dc;
          border-radius: 10px;
          background: #fff;
          outline: none;
          cursor: pointer;
        }

        .categoryHeader {
          margin-bottom: 12px;
        }

        .categoryHeader h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 750;
        }

        .categoryHeader span {
          display: block;
          margin-top: 4px;
          color: #718078;
          font-size: 13px;
        }

        /*
         * 8 ta ustun
         * maksimal 3 qator
         */

        .categoryGrid {
          display: grid;
          grid-template-columns:
            repeat(
              8,
              minmax(0, 1fr)
            );
          gap: 10px;
          width: 100%;
          margin-bottom: 22px;
        }

        .categoryCard {
          min-width: 0;
          padding: 8px;
          border: 1px solid #e0e9e3;
          border-radius: 14px;
          background: #fff;
          cursor: pointer;
          text-align: left;
          transition: all 0.18s ease;
          overflow: hidden;
        }

        .categoryCard:hover {
          transform: translateY(-2px);
          border-color: #78bc91;
          box-shadow:
            0 8px 22px
            rgba(30, 80, 48, 0.08);
        }

        .categoryActive {
          border-color: #3ca467;
          background: #f1faf4;
          box-shadow:
            0 0 0 2px
            rgba(60, 164, 103, 0.1);
        }

        .categoryImageWrap {
          width: 100%;
          aspect-ratio: 1.55;
          overflow: hidden;
          border-radius: 10px;
          background: #edf7f0;
        }

        .categoryImage {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .categoryName {
          display: block;
          margin-top: 7px;
          color: #26372d;
          font-size: 12px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .categoryCount {
          display: block;
          margin-top: 3px;
          color: #7d8a82;
          font-size: 11px;
        }

        .moreCategory {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #f5faf7;
        }

        .moreCircle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #dcefe4;
          color: #28744a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
        }

        .errorBox {
          margin-bottom: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fff1f1;
          border: 1px solid #ffd1d1;
          color: #b42318;
          font-size: 14px;
        }

        .productsCard {
          background: #fff;
          border: 1px solid #e4ebe6;
          border-radius: 16px;
          overflow: hidden;
        }

        .productTableHeader {
          display: grid;
          grid-template-columns:
            2fr
            1.2fr
            1.25fr
            1fr
            0.9fr
            0.8fr;
          gap: 14px;
          padding: 14px 18px;
          background: #f7faf8;
          border-bottom: 1px solid #e7ece9;
          color: #65736b;
          font-size: 12px;
          font-weight: 700;
        }

        .productRow {
          display: grid;
          grid-template-columns:
            2fr
            1.2fr
            1.25fr
            1fr
            0.9fr
            0.8fr;
          gap: 14px;
          align-items: center;
          padding: 14px 18px;
          min-height: 80px;
          border-bottom: 1px solid #edf1ee;
        }

        .productRow:last-child {
          border-bottom: none;
        }

        .productInfo {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .productInfo b {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .productInfo small {
          display: block;
          margin-top: 4px;
          color: #7b877f;
          font-size: 12px;
        }

        .productImage {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid #e3ebe6;
          background: #f5f8f6;
          flex-shrink: 0;
        }

        .productImageFallback {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #edf7f0;
          font-size: 27px;
          flex-shrink: 0;
        }

        .categoryBadge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #edf7f1;
          color: #23633d;
          font-size: 12px;
          font-weight: 650;
        }

        .barcode {
          color: #536159;
          font-family: monospace;
          font-size: 13px;
        }

        .stockGood {
          color: #247344;
        }

        .stockLow {
          color: #c0392b;
        }

        .productRow small {
          display: block;
          margin-top: 3px;
          color: #7b877f;
          font-size: 11px;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .editButton,
        .deleteButton {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
        }

        .editButton {
          border: 1px solid #d9e8df;
          background: #f2faf5;
        }

        .deleteButton {
          border: 1px solid #ffd7d7;
          background: #fff3f3;
        }

        .emptyState {
          padding: 50px 20px;
          text-align: center;
        }

        .emptyState b {
          display: block;
        }

        .emptyState span {
          display: block;
          margin-top: 6px;
          color: #718078;
          font-size: 14px;
        }

        .emptyIcon {
          margin-bottom: 10px;
          font-size: 42px;
        }

        .modalOverlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(
            15,
            23,
            18,
            0.45
          );
        }

        .modal {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 18px;
          background: #fff;
          box-shadow:
            0 25px 80px
            rgba(0, 0, 0, 0.2);
        }

        .modalHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .modalHeader h2 {
          margin: 0;
          font-size: 21px;
        }

        .modalHeader span {
          display: block;
          margin-top: 6px;
          color: #718078;
          font-size: 13px;
        }

        .closeButton {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 10px;
          background: #f1f4f2;
          cursor: pointer;
          font-size: 20px;
        }

        .productForm {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .productForm label {
          display: block;
          margin-bottom: 7px;
          color: #35443b;
          font-size: 13px;
          font-weight: 700;
        }

        .productForm input,
        .productForm select {
          width: 100%;
          min-height: 44px;
          box-sizing: border-box;
          padding: 0 13px;
          border: 1px solid #d9e2dc;
          border-radius: 10px;
          background: #fff;
          outline: none;
          font-size: 14px;
        }

        .productForm input:focus,
        .productForm select:focus {
          border-color: #4aa76d;
          box-shadow:
            0 0 0 3px
            rgba(74, 167, 109, 0.1);
        }

        .productForm small {
          display: block;
          margin-top: 5px;
          color: #7b877f;
          font-size: 11px;
        }

        .formGrid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 12px;
        }

        .modalError {
          padding: 11px;
          border-radius: 9px;
          background: #fff1f1;
          color: #b42318;
          font-size: 13px;
        }

        .modalButtons {
          display: flex;
          gap: 10px;
          margin-top: 5px;
        }

        .modalButtons .btn {
          flex: 1;
        }

        @media (max-width: 1250px) {
          .categoryGrid {
            grid-template-columns:
              repeat(
                6,
                minmax(0, 1fr)
              );
          }

          .productTableHeader,
          .productRow {
            grid-template-columns:
              1.7fr
              1.1fr
              1.1fr
              1fr
              0.8fr
              0.8fr;
          }
        }

        @media (max-width: 900px) {
          .categoryGrid {
            grid-template-columns:
              repeat(
                4,
                minmax(0, 1fr)
              );
          }

          .productTableHeader {
            display: none;
          }

          .productRow {
            grid-template-columns:
              1fr 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 600px) {
          .categoryGrid {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
          }

          .productRow {
            grid-template-columns:
              1fr;
          }

          .formGrid {
            grid-template-columns:
              1fr;
          }
        }

        @media (max-width: 420px) {
          .categoryGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }
      `}</style>
    </AppShell>
  );
}