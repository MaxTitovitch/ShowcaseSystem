import { Column, Entity, Index, OneToMany } from "typeorm";
import { ProductAvailability } from "./ProductAvailability";
import { ProductPrice } from "./ProductPrice";
import { ProductToCategoryBinding } from "./ProductToCategoryBinding";
import { RecommendedProducts } from "./RecommendedProducts";
import {ProductAvailabilityStore} from "./ProductAvailabilityStore";
import {ProductPriceStore} from "./ProductPriceStore";

@Entity("PRODUCT")
export class Product {
  @Column({ type: 'long', name: "PICTURE_SET"})
  pictureSet: string;

  @Column("varchar2", { name: "DESCRIPTION", nullable: true, length: 4000 })
  description: string | null;

  @Column("number", { name: "WEIGHT", nullable: true, precision: 9, scale: 3 })
  weight: number | null;

  @Column("varchar2", { name: "COMPOSITION", nullable: true, length: 4000 })
  composition: string | null;

  @Column("varchar2", { name: "NAME", length: 255 })
  name: string;

  @Column("varchar2", { name: "BRAND", length: 4000 })
  brand: string;

  @Column("varchar2", { name: "SHORT_NAME", length: 255 })
  shortName: string;

  @Column("varchar2", { name: "PICTURE", nullable: true, length: 200 })
  picture: string | null;

  @Column("number", { name: "VOLUME", nullable: true, precision: 9, scale: 3 })
  volume: number | null;

  @Column("varchar2", { name: "SKU", length: 50 })
  sku: string;

  @Column("number", { name: "UNIT", precision: 8, scale: 3 })
  unit: number;

  @Column("varchar2", { name: "THUMBNAIL", nullable: true, length: 200 })
  thumbnail: string | null;

  @Column("varchar2", { name: "ORIGIN", length: 255 })
  origin: string;

  @Column("varchar2", { primary: true, name: "ARTICLE", length: 50 })
  article: string;

  @Column("varchar2", { name: "MEASURED_IN", length: 6 })
  measuredIn: string;

  @OneToMany(
    () => ProductAvailability,
    (productAvailability) => productAvailability.product
  )
  productAvailabilities: ProductAvailability[];

  @OneToMany(() => ProductPrice, (productPrice) => productPrice.product)
  productPrices: ProductPrice[];

  @OneToMany(
    () => ProductAvailabilityStore,
    (productAvailabilityStore) => productAvailabilityStore.product
  )
  productAvailabilityStores: ProductAvailabilityStore[];

  @OneToMany(() => ProductPriceStore, (productPriceStore) => productPriceStore.product)
  productPriceStores: ProductPriceStore[];

  @OneToMany(
    () => ProductToCategoryBinding,
    (productToCategoryBinding) => productToCategoryBinding.product
  )
  productToCategoryBindings: ProductToCategoryBinding[];

  @OneToMany(
    () => RecommendedProducts,
    (recommendedProducts) => recommendedProducts.product
  )
  recommendedProducts: RecommendedProducts[];
}
