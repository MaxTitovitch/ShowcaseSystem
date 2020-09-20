import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { Region } from "./Region";
import { Store } from "./Store";

// @Index("PRODUCT_PRICE_PRODUCT_ID_IDX", ["productId"], {})
// @Index("PRODUCT_PRICE_PROMOTION_ID_IDX", ["promotionId"], {})
// @Index("PRODUCT_PRICE_REGION_ID_IDX", ["regionId"], {})
// @Index("PRODUCT_PRICE_STORE_ID_IDX", ["storeId"], {})
@Index("PRODUCT_PRICE_UNIQUE_ID_IDX", ["productId", "regionId", "storeId"], { unique: true })
@Entity("PRODUCT_PRICE")
export class ProductPrice {
  @Column("number", { name: "PRICE", precision: 10, scale: 2 })
  price: number;

  @Column("varchar2", {
    primary: true,
    name: "PRODUCT_ID",
    unique: true,
    length: 50,
  })
  productId: string;

  @Column("number", {
    primary: true,
    name: "STORE_ID",
    // nullable: true,
    precision: 10,
    scale: 0,
  })
  storeId: number | null;

  @Column("varchar2", { name: "PROMOTION_ID", nullable: true, length: 50 })
  promotionId: string | null;

  @Column("number", {
    primary: true,
    name: "REGION_ID",
    unique: true,
    precision: 10,
    scale: 0,
  })
  regionId: number;

  @Column("number", {
    name: "DISCOUNT_PRICE",
    nullable: true,
    precision: 10,
    scale: 2,
  })
  discountPrice: number | null;

  @ManyToOne(() => Product, (product) => product.productPrices, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "PRODUCT_ID", referencedColumnName: "article" }])
  product: Product;

  @ManyToOne(() => Region, (region) => region.productPrices, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "REGION_ID", referencedColumnName: "id" }])
  region: Region;

  @ManyToOne(() => Store, (store) => store.productPrices, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "STORE_ID", referencedColumnName: "id" }])
  store: Store;
}
