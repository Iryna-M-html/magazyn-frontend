"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useTranslations } from "next-intl";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";

import {
  createProductManual,
  updateProductByBarcode,
} from "@/lib/api/clientApi";
import {
  DEFAULT_CATEGORY,
  QUANTITY_UNITS,
  QuantityUnit,
} from "@/lib/constants/products";
import { useCategoryTitles } from "@/lib/hooks/useCategoryTitles";

import styles from "./CreateProduct.module.css";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const BARCODE_PATTERN = /^\d{8,14}$/;

type FieldErrors = Partial<
  Record<"barcode" | "name" | "quantity" | "shelfPrice" | "photo", string>
>;

// «7,50» → 7.5; пустая строка → null; не число → NaN
const parseDecimal = (value: string) =>
  value.trim() === "" ? null : Number(value.trim().replace(",", "."));

export default function CreateProductClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("CreateProduct");
  const tCommon = useTranslations("Common");

  const [barcode, setBarcode] = useState(searchParams.get("barcode") ?? "");
  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<QuantityUnit>("g");
  const [shelfPrice, setShelfPrice] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isExisting, setIsExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = useCategoryTitles();

  const photoPreview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : null),
    [photo],
  );

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFieldErrors((errors) => ({ ...errors, photo: t("photoNotImage") }));
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setFieldErrors((errors) => ({ ...errors, photo: t("photoTooLarge") }));
      return;
    }

    setFieldErrors((errors) => ({ ...errors, photo: undefined }));
    setPhoto(file);
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const quantityValue = parseDecimal(quantity);
    const priceValue = parseDecimal(shelfPrice);

    if (!BARCODE_PATTERN.test(barcode.trim())) {
      errors.barcode = t("barcodeInvalid");
    }

    if (name.trim().length < 2 || name.trim().length > 150) {
      errors.name = t("nameInvalid");
    }

    if (quantityValue !== null && !(quantityValue > 0)) {
      errors.quantity = t("quantityInvalid");
    }

    if (priceValue !== null && !(priceValue >= 0)) {
      errors.shelfPrice = t("shelfPriceInvalid");
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    setFormError("");
    setIsExisting(false);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const cleanBarcode = barcode.trim();
    const quantityValue = parseDecimal(quantity);
    const priceValue = parseDecimal(shelfPrice);

    const formData = new FormData();
    formData.append("barcode", cleanBarcode);
    formData.append("name", name.trim());
    formData.append("brand", brand.trim());
    formData.append("category", category);

    if (quantityValue !== null) {
      formData.append("productQuantity", String(quantityValue));
      formData.append("productQuantityUnit", unit);
    }

    if (photo) {
      // Бэкенд ждёт файл в поле imageUrl (multer upload.single("imageUrl"))
      formData.append("imageUrl", photo);
    }

    setIsSubmitting(true);

    try {
      await createProductManual(formData);
    } catch (error) {
      setIsSubmitting(false);

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setIsExisting(true);
        setFormError(t("exists"));
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        setFormError(t("validationError"));
      } else {
        console.error("Ошибка создания товара:", error);
        setFormError(t("saveError"));
      }

      return;
    }

    // Цену ручное создание не принимает — сохраняем её отдельным запросом
    if (priceValue !== null) {
      try {
        await updateProductByBarcode(cleanBarcode, { shelfPrice: priceValue });
      } catch (error) {
        console.error("Ошибка сохранения цены:", error);
        alert(t("priceSaveFailed"));
      }
    }

    // Пришли из приёмки по фактуре — возвращаемся к ней; иначе — экран «Товар найден» → приёмка партии
    const returnTo = searchParams.get("returnTo");

    router.replace(
      returnTo?.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : `/sprzedawca?barcode=${encodeURIComponent(cleanBarcode)}`,
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label={tCommon("back")}
        >
          <ArrowLeft size={22} />
        </button>

        <div className={styles.headerText}>
          <h1 className={styles.title}>{t("title")}</h1>

          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Фото */}
        <div className={styles.photoBlock}>
          {photoPreview ? (
            <div className={styles.photoPreview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt={name || t("photo")} />

              <div className={styles.photoActions}>
                <label className={styles.photoButton}>
                  <Camera size={16} />
                  {t("changePhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    hidden
                  />
                </label>

                <button
                  type="button"
                  className={styles.photoRemove}
                  onClick={() => setPhoto(null)}
                >
                  <Trash2 size={16} />
                  {t("removePhoto")}
                </button>
              </div>
            </div>
          ) : (
            <label className={styles.photoPlaceholder}>
              <Camera size={28} />
              <span>{t("takePhoto")}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                hidden
              />
            </label>
          )}

          {fieldErrors.photo && (
            <span className={styles.fieldError}>{fieldErrors.photo}</span>
          )}
        </div>

        {/* Штрихкод */}
        <div className={styles.field}>
          <label htmlFor="product-barcode">{t("barcode")} *</label>
          <input
            id="product-barcode"
            type="text"
            inputMode="numeric"
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            aria-invalid={Boolean(fieldErrors.barcode)}
          />
          {fieldErrors.barcode && (
            <span className={styles.fieldError}>{fieldErrors.barcode}</span>
          )}
        </div>

        {/* Название */}
        <div className={styles.field}>
          <label htmlFor="product-name">{t("name")} *</label>
          <input
            id="product-name"
            type="text"
            value={name}
            placeholder={t("namePlaceholder")}
            maxLength={150}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            autoFocus
          />
          {fieldErrors.name && (
            <span className={styles.fieldError}>{fieldErrors.name}</span>
          )}
        </div>

        {/* Бренд */}
        <div className={styles.field}>
          <label htmlFor="product-brand">
            {t("brand")}{" "}
            <span className={styles.optional}>({t("optional")})</span>
          </label>
          <input
            id="product-brand"
            type="text"
            value={brand}
            placeholder={t("brandPlaceholder")}
            onChange={(event) => setBrand(event.target.value)}
          />
        </div>

        {/* Категория */}
        <div className={styles.field}>
          <label htmlFor="product-category">{t("category")}</label>
          <select
            id="product-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categoryOptions.map((title) => (
              <option key={title} value={title}>
                {title === DEFAULT_CATEGORY ? t("otherCategory") : title}
              </option>
            ))}
          </select>
        </div>

        {/* Вес / объём */}
        <div className={styles.field}>
          <label htmlFor="product-quantity">
            {t("quantity")}{" "}
            <span className={styles.optional}>({t("optional")})</span>
          </label>
          <div className={styles.inlineFields}>
            <input
              id="product-quantity"
              type="text"
              inputMode="decimal"
              value={quantity}
              placeholder={t("quantityPlaceholder")}
              onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={Boolean(fieldErrors.quantity)}
            />
            <select
              value={unit}
              aria-label={t("unit")}
              onChange={(event) =>
                setUnit(event.target.value as QuantityUnit)
              }
            >
              {QUANTITY_UNITS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          {fieldErrors.quantity && (
            <span className={styles.fieldError}>{fieldErrors.quantity}</span>
          )}
        </div>

        {/* Цена на полке */}
        <div className={styles.field}>
          <label htmlFor="product-price">
            {t("shelfPrice")}{" "}
            <span className={styles.optional}>({t("optional")})</span>
          </label>
          <input
            id="product-price"
            type="text"
            inputMode="decimal"
            value={shelfPrice}
            placeholder={t("shelfPricePlaceholder")}
            onChange={(event) => setShelfPrice(event.target.value)}
            aria-invalid={Boolean(fieldErrors.shelfPrice)}
          />
          {fieldErrors.shelfPrice && (
            <span className={styles.fieldError}>{fieldErrors.shelfPrice}</span>
          )}
        </div>

        {formError && (
          <div className={styles.formError} role="alert">
            <span>{formError}</span>

            {isExisting && (
              <button
                type="button"
                className={styles.formErrorAction}
                onClick={() =>
                  router.replace(
                    `/sprzedawca?barcode=${encodeURIComponent(barcode.trim())}`,
                  )
                }
              >
                {t("goToProduct")}
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("saving") : t("submit")}
        </button>
      </form>
    </div>
  );
}
