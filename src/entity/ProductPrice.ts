import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { Product } from "./Product";
import { Region } from "./Region";


@Index("PRODUCT_PRICE_UNIQUE_ID", ["productId", "regionId"], { unique: true })
@Entity("PRODUCT_PRICE")
export class ProductPrice {
  @PrimaryGeneratedColumn( { name: "ID" })
  id: number;

  @Column("number", { name: "PRICE", precision: 10, scale: 2 })
  price: number;

  @Column("varchar2", {
    // primary: true,
    name: "PRODUCT_ID",
    // unique: true,
    length: 50,
  })
  productId: string;


  @Column("varchar2", { name: "PROMOTION_ID", nullable: true, length: 50 })
  promotionId: string | null;

  @Column("number", {
    // primary: true,
    name: "REGION_ID",
    // unique: true,
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
}
