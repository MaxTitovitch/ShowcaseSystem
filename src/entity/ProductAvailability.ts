import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { Region } from "./Region";
import { Store } from "./Store";

// @Index("PRODUCT_AVAILABILITY_PRODUCT_ID_IDX", ["productId"], {})
// @Index("PRODUCT_AVAILABILITY_REGION_ID_IDX", ["regionId"], {})
// @Index("PRODUCT_AVAILABILITY_STORE_ID_IDX", ["storeId"], {})
@Index("PRODUCT_AVAILABILITY_UNIQUE_ID_IDX", ["productId", "regionId", "storeId"], { unique: true })
@Entity("PRODUCT_AVAILABILITY")
export class ProductAvailability {
  @Column("number", {
    primary: true,
    name: "STORE_ID",
    // nullable: true,
    unique: true,
    precision: 10,
    scale: 0,
  })
  storeId: number | null;

  @Column("number", { name: "AVAILABILITY", precision: 1, scale: 0 })
  availability: number;

  @Column("varchar2", {
    primary: true,
    name: "PRODUCT_ID",
    unique: true,
    length: 50,
  })
  productId: string;

  @Column("number", {
    primary: true,
    name: "REGION_ID",
    unique: true,
    precision: 10,
    scale: 0,
  })
  regionId: number;

  @Column("number", {
    name: "QUANTITY",
    nullable: true,
    precision: 14,
    scale: 3,
  })
  quantity: number | null;

  @ManyToOne(() => Product, (product) => product.productAvailabilities, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "PRODUCT_ID", referencedColumnName: "article" }])
  product: Product;

  @ManyToOne(() => Region, (region) => region.productAvailabilities, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "REGION_ID", referencedColumnName: "id" }])
  region: Region;

  @ManyToOne(() => Store, (store) => store.productAvailabilities, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "STORE_ID", referencedColumnName: "id" }])
  store: Store;
}
