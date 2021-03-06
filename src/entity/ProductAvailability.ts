import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { Product } from "./Product";
import { Region } from "./Region";


@Index("PRODUCT_AVAILABILITY_UNIQUE_ID", ["productId", "regionId"], { unique: true })
@Entity("PRODUCT_AVAILABILITY")
export class ProductAvailability {
  @PrimaryGeneratedColumn( { name: "ID" })
  id: number;

  @Column("number", { name: "AVAILABILITY", precision: 1, scale: 0 })
  availability: number;

  @Column("varchar2", {
    // primary: true,
    name: "PRODUCT_ID",
    // unique: true,
    length: 50,
  })
  productId: string;

  @Column("number", {
    // primary: true,
    name: "REGION_ID",
    // unique: true,
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
}
